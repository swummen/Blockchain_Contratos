// Package contract anchors each document's SHA-256 fingerprint and its
// traceability events. It never receives the document itself (RNF-04).
package contract

import (
	"encoding/json"
	"fmt"
	"regexp"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
)

// ContractsContract provides functions for registering documents on the ledger.
type ContractsContract struct {
	contractapi.Contract
}

// Document is stored under documentID. Fields stay in alphabetical order so
// every endorsing peer marshals identical JSON.
type Document struct {
	DocumentID string `json:"DocumentID"`
	Sha256Hex  string `json:"Sha256Hex"`
	Status     string `json:"Status"`
}

// Event is one immutable traceability entry, one per action (RNF-26/27).
type Event struct {
	Action     string `json:"Action"`
	DocumentID string `json:"DocumentID"`
	// contractapi treats every exported field as required unless tagged
	// optional; omitempty is not enough. Result is empty on every "registro".
	Result    string `json:"Result,omitempty" metadata:",optional"`
	Timestamp string `json:"Timestamp"`
	TxID      string `json:"TxID"`
	User      string `json:"User"`
}

const eventKeyType = "event"

var sha256HexPattern = regexp.MustCompile(`^[a-fA-F0-9]{64}$`)

// validVerificationResults maps each allowed Event.Result value to the
// Document.Status it produces (RF-34: nothing else is allowed to change it).
var validVerificationResults = map[string]string{
	"confirmada":   "Verificado",
	"comprometida": "Alterado",
}

func validateHash(sha256Hex string) error {
	if !sha256HexPattern.MatchString(sha256Hex) {
		return fmt.Errorf("sha256Hex must be a 64-character hex string, got %q", sha256Hex)
	}
	return nil
}

func (c *ContractsContract) documentExists(
	ctx contractapi.TransactionContextInterface,
	documentID string,
) (bool, error) {
	docJSON, err := ctx.GetStub().GetState(documentID)
	if err != nil {
		return false, fmt.Errorf("failed to read from world state: %w", err)
	}
	return docJSON != nil, nil
}

// getDocument reads and unmarshals the Document record, or returns an error if
// documentID was never registered.
func (c *ContractsContract) getDocument(
	ctx contractapi.TransactionContextInterface,
	documentID string,
) (*Document, error) {
	docJSON, err := ctx.GetStub().GetState(documentID)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %w", err)
	}
	if docJSON == nil {
		return nil, fmt.Errorf("document %s not found", documentID)
	}
	var doc Document
	if err := json.Unmarshal(docJSON, &doc); err != nil {
		return nil, fmt.Errorf("failed to unmarshal document: %w", err)
	}
	return &doc, nil
}

// putEvent writes the document and the event. Each event gets its own
// composite key (event, documentID, txID), so a partial-key query returns a
// document's full history. LevelDB has no rich queries, hence composite keys.
func (c *ContractsContract) putEvent(
	ctx contractapi.TransactionContextInterface,
	doc Document,
	evt Event,
) error {
	if doc.DocumentID != evt.DocumentID {
		return fmt.Errorf("doc.DocumentID (%s) does not match evt.DocumentID (%s)", doc.DocumentID, evt.DocumentID)
	}

	stub := ctx.GetStub()

	docJSON, err := json.Marshal(doc)
	if err != nil {
		return err
	}
	if err := stub.PutState(doc.DocumentID, docJSON); err != nil {
		return fmt.Errorf("failed to put document to world state: %w", err)
	}

	eventKey, err := stub.CreateCompositeKey(eventKeyType, []string{doc.DocumentID, evt.TxID})
	if err != nil {
		return fmt.Errorf("failed to build event composite key: %w", err)
	}
	eventJSON, err := json.Marshal(evt)
	if err != nil {
		return err
	}
	if err := stub.PutState(eventKey, eventJSON); err != nil {
		return fmt.Errorf("failed to put event to world state: %w", err)
	}

	return nil
}

// RegisterDocument anchors a document's SHA-256 fingerprint and a "registro" event.
// It never receives or stores the PDF itself (RF-16 RN-01, RNF-04).
func (c *ContractsContract) RegisterDocument(
	ctx contractapi.TransactionContextInterface,
	documentID string,
	sha256Hex string,
	user string,
) (*Event, error) {
	if documentID == "" {
		return nil, fmt.Errorf("documentID is required")
	}
	if user == "" {
		return nil, fmt.Errorf("user is required")
	}
	if err := validateHash(sha256Hex); err != nil {
		return nil, fmt.Errorf("invalid fingerprint: %w", err)
	}

	exists, err := c.documentExists(ctx, documentID)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, fmt.Errorf("document %s already registered", documentID)
	}

	txID := ctx.GetStub().GetTxID()
	evt := Event{DocumentID: documentID, Action: "registro", User: user, TxID: txID}

	// Timestamp from the stub, never time.Now(): every endorsing peer has to
	// reach the same deterministic result for the same transaction.
	ts, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return nil, fmt.Errorf("failed to read tx timestamp: %w", err)
	}
	evt.Timestamp = ts.AsTime().UTC().Format(time.RFC3339)

	doc := Document{DocumentID: documentID, Sha256Hex: sha256Hex, Status: "Pendiente"}
	if err := c.putEvent(ctx, doc, evt); err != nil {
		return nil, err
	}

	return &evt, nil
}

// GetDocument returns the record anchored by RegisterDocument (read-only).
func (c *ContractsContract) GetDocument(
	ctx contractapi.TransactionContextInterface,
	documentID string,
) (*Document, error) {
	if documentID == "" {
		return nil, fmt.Errorf("documentID is required")
	}
	return c.getDocument(ctx, documentID)
}

// RecordVerification records the result of a comparison the backend already
// made and updates Document.Status. It is the only way to change the status (RF-34).
func (c *ContractsContract) RecordVerification(
	ctx contractapi.TransactionContextInterface,
	documentID string,
	result string,
	user string,
) (*Event, error) {
	if documentID == "" {
		return nil, fmt.Errorf("documentID is required")
	}
	if user == "" {
		return nil, fmt.Errorf("user is required")
	}
	newStatus, ok := validVerificationResults[result]
	if !ok {
		return nil, fmt.Errorf(`result must be "confirmada" or "comprometida", got %q`, result)
	}

	doc, err := c.getDocument(ctx, documentID)
	if err != nil {
		return nil, err
	}

	txID := ctx.GetStub().GetTxID()
	evt := Event{
		DocumentID: documentID,
		Action:     "verificacion",
		Result:     result,
		User:       user,
		TxID:       txID,
	}

	ts, err := ctx.GetStub().GetTxTimestamp()
	if err != nil {
		return nil, fmt.Errorf("failed to read tx timestamp: %w", err)
	}
	evt.Timestamp = ts.AsTime().UTC().Format(time.RFC3339)

	doc.Status = newStatus
	if err := c.putEvent(ctx, *doc, evt); err != nil {
		return nil, err
	}

	return &evt, nil
}

// getEventsByPartialKey accepts only []string{documentID} or []string{}.
// []string{""} matches nothing (not "everything"), and a second element would
// be read as a TxID. Results are not in chronological order; the backend sorts.
func (c *ContractsContract) getEventsByPartialKey(
	ctx contractapi.TransactionContextInterface,
	keys []string,
) ([]*Event, error) {
	iterator, err := ctx.GetStub().GetStateByPartialCompositeKey(eventKeyType, keys)
	if err != nil {
		return nil, fmt.Errorf("failed to query events: %w", err)
	}
	defer iterator.Close()

	events := []*Event{}
	for iterator.HasNext() {
		kv, err := iterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to iterate events: %w", err)
		}
		var evt Event
		if err := json.Unmarshal(kv.Value, &evt); err != nil {
			return nil, fmt.Errorf("failed to unmarshal event: %w", err)
		}
		events = append(events, &evt)
	}
	return events, nil
}

// GetDocumentEvents returns every traceability event for one document (RF-21/22).
func (c *ContractsContract) GetDocumentEvents(
	ctx contractapi.TransactionContextInterface,
	documentID string,
) ([]*Event, error) {
	if documentID == "" {
		return nil, fmt.Errorf("documentID is required")
	}
	return c.getEventsByPartialKey(ctx, []string{documentID})
}

// GetAllEvents returns every traceability event for every document (RF-39/40, RF-50/51).
func (c *ContractsContract) GetAllEvents(
	ctx contractapi.TransactionContextInterface,
) ([]*Event, error) {
	return c.getEventsByPartialKey(ctx, []string{})
}
