// Package contract implements the on-chain logic for the Contratos project:
// anchoring a document's SHA-256 fingerprint and its traceability events in
// Hyperledger Fabric. It never receives or stores the document's contents
// (RNF-04) — only the fingerprint the backend already computed off-chain.
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

// Document is the fingerprint record kept in the world state under the key
// documentID. Fields in alphabetic order (deterministic JSON marshal across
// endorsing peers — same convention as fabric-samples/asset-transfer-basic).
type Document struct {
	DocumentID string `json:"DocumentID"`
	Sha256Hex  string `json:"Sha256Hex"`
	Status     string `json:"Status"`
}

// Event is one immutable traceability entry — never overwritten, one per
// action (RNF-26/27).
type Event struct {
	Action     string `json:"Action"`
	DocumentID string `json:"DocumentID"`
	Result     string `json:"Result,omitempty"`
	Timestamp  string `json:"Timestamp"`
	TxID       string `json:"TxID"`
	User       string `json:"User"`
}

const eventKeyType = "event"

var sha256HexPattern = regexp.MustCompile(`^[a-fA-F0-9]{64}$`)

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

// putEvent writes the document record (first event only, since later events don't
// change the fingerprint) and the event itself under its own composite key — a
// key that's never reused, so GetStateByPartialCompositeKey(eventKeyType,
// []string{documentID}) always returns the full chronological history. LevelDB
// (the peer state DB fixed in Sprint 0) doesn't support rich/CouchDB queries, so
// traceability is resolved with composite-key ranges instead of a secondary index.
func (c *ContractsContract) putEvent(
	ctx contractapi.TransactionContextInterface,
	documentID string,
	sha256Hex string,
	evt Event,
) error {
	stub := ctx.GetStub()

	doc := Document{DocumentID: documentID, Sha256Hex: sha256Hex, Status: "Pendiente"}
	docJSON, err := json.Marshal(doc)
	if err != nil {
		return err
	}
	if err := stub.PutState(documentID, docJSON); err != nil {
		return fmt.Errorf("failed to put document to world state: %w", err)
	}

	eventKey, err := stub.CreateCompositeKey(eventKeyType, []string{documentID, evt.TxID})
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

	if err := c.putEvent(ctx, documentID, sha256Hex, evt); err != nil {
		return nil, err
	}

	return &evt, nil
}
