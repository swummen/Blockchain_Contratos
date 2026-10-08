package contract_test

import (
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/contratos/chaincode/contract"
	"github.com/contratos/chaincode/contract/mocks"
	"github.com/hyperledger/fabric-chaincode-go/v2/shim"
	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
	"github.com/hyperledger/fabric-protos-go-apiv2/ledger/queryresult"
	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/types/known/timestamppb"
)

//go:generate counterfeiter -o mocks/transaction.go -fake-name TransactionContext . transactionContext
type transactionContext interface { //nolint:unused
	contractapi.TransactionContextInterface
}

//go:generate counterfeiter -o mocks/chaincodestub.go -fake-name ChaincodeStub . chaincodeStub
type chaincodeStub interface { //nolint:unused
	shim.ChaincodeStubInterface
}

//go:generate counterfeiter -o mocks/statequeryiterator.go -fake-name StateQueryIterator . stateQueryIterator
type stateQueryIterator interface { //nolint:unused
	shim.StateQueryIteratorInterface
}

const validHash = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"

func newContext() (*contract.ContractsContract, *mocks.ChaincodeStub, *mocks.TransactionContext) {
	stub := &mocks.ChaincodeStub{}
	ctx := &mocks.TransactionContext{}
	ctx.GetStubReturns(stub)
	stub.GetTxIDReturns("tx1")
	stub.GetTxTimestampReturns(timestamppb.New(time.Date(2026, 9, 20, 12, 0, 0, 0, time.UTC)), nil)
	stub.CreateCompositeKeyReturns("event\x00doc1\x00tx1\x00", nil)
	return &contract.ContractsContract{}, stub, ctx
}

func TestRegisterDocument_Success(t *testing.T) {
	c, stub, ctx := newContext()

	evt, err := c.RegisterDocument(ctx, "doc1", validHash, "U001")

	require.NoError(t, err)
	require.Equal(t, "doc1", evt.DocumentID)
	require.Equal(t, "registro", evt.Action)
	require.Equal(t, "U001", evt.User)
	require.Equal(t, "tx1", evt.TxID)
	require.Equal(t, "2026-09-20T12:00:00Z", evt.Timestamp)
	require.Empty(t, evt.Result)

	require.Equal(t, 2, stub.PutStateCallCount())
	docKey, docValue := stub.PutStateArgsForCall(0)
	require.Equal(t, "doc1", docKey)
	require.Contains(t, string(docValue), `"Sha256Hex":"`+validHash+`"`)
	require.Contains(t, string(docValue), `"Status":"Pendiente"`)

	eventKey, eventValue := stub.PutStateArgsForCall(1)
	require.Equal(t, "event\x00doc1\x00tx1\x00", eventKey)
	require.Contains(t, string(eventValue), `"Action":"registro"`)

	// D5: la clave compuesta del evento tiene que quedar armada con
	// (documentID, txID) — es lo que un futuro GetStateByPartialCompositeKey
	// por documentID (Sprint 3/4) va a necesitar para recuperar el historial.
	objType, attrs := stub.CreateCompositeKeyArgsForCall(0)
	require.Equal(t, "event", objType)
	require.Equal(t, []string{"doc1", "tx1"}, attrs)
}

func TestRegisterDocument_AlreadyExists(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateReturns([]byte(`{"DocumentID":"doc1"}`), nil)

	_, err := c.RegisterDocument(ctx, "doc1", validHash, "U001")

	require.EqualError(t, err, "document doc1 already registered")
	require.Equal(t, 0, stub.PutStateCallCount())
}

func TestRegisterDocument_InvalidHash(t *testing.T) {
	c, _, ctx := newContext()

	_, err := c.RegisterDocument(ctx, "doc1", "no-es-un-hash", "U001")

	require.ErrorContains(t, err, "invalid fingerprint")
}

func TestRegisterDocument_MissingDocumentID(t *testing.T) {
	c, _, ctx := newContext()

	_, err := c.RegisterDocument(ctx, "", validHash, "U001")

	require.EqualError(t, err, "documentID is required")
}

func TestRegisterDocument_MissingUser(t *testing.T) {
	c, _, ctx := newContext()

	_, err := c.RegisterDocument(ctx, "doc1", validHash, "")

	require.EqualError(t, err, "user is required")
}

func TestRegisterDocument_GetStateFails(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateReturns(nil, errors.New("world state unavailable"))

	_, err := c.RegisterDocument(ctx, "doc1", validHash, "U001")

	require.EqualError(t, err, "failed to read from world state: world state unavailable")
}

func TestRegisterDocument_PutStateFails(t *testing.T) {
	c, stub, ctx := newContext()
	stub.PutStateReturns(errors.New("disk full"))

	_, err := c.RegisterDocument(ctx, "doc1", validHash, "U001")

	require.EqualError(t, err, "failed to put document to world state: disk full")
}

func TestRegisterDocument_PutEventStateFails(t *testing.T) {
	c, stub, ctx := newContext()
	// La primera llamada a PutState (el documento) tiene éxito; falla recién
	// la segunda (el evento) — rama distinta a TestRegisterDocument_PutStateFails.
	stub.PutStateReturnsOnCall(1, errors.New("disk full"))

	_, err := c.RegisterDocument(ctx, "doc1", validHash, "U001")

	require.EqualError(t, err, "failed to put event to world state: disk full")
}

func TestRegisterDocument_GetTxTimestampFails(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetTxTimestampReturns(nil, errors.New("clock unavailable"))

	_, err := c.RegisterDocument(ctx, "doc1", validHash, "U001")

	require.EqualError(t, err, "failed to read tx timestamp: clock unavailable")
	require.Equal(t, 0, stub.PutStateCallCount())
}

func TestRegisterDocument_CreateCompositeKeyFails(t *testing.T) {
	c, stub, ctx := newContext()
	stub.CreateCompositeKeyReturns("", errors.New("bad key"))

	_, err := c.RegisterDocument(ctx, "doc1", validHash, "U001")

	require.EqualError(t, err, "failed to build event composite key: bad key")
	// El documento ya se guardó (primer PutState) antes de armar la clave del
	// evento; solo el segundo PutState (el evento) nunca llega a ejecutarse.
	require.Equal(t, 1, stub.PutStateCallCount())
}

func existingDocJSON(status string) []byte {
	return []byte(`{"DocumentID":"doc1","Sha256Hex":"` + validHash + `","Status":"` + status + `"}`)
}

func TestGetDocument_Success(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateReturns(existingDocJSON("Pendiente"), nil)

	doc, err := c.GetDocument(ctx, "doc1")

	require.NoError(t, err)
	require.Equal(t, "doc1", doc.DocumentID)
	require.Equal(t, validHash, doc.Sha256Hex)
	require.Equal(t, "Pendiente", doc.Status)
}

func TestGetDocument_NotFound(t *testing.T) {
	c, _, ctx := newContext()

	_, err := c.GetDocument(ctx, "doc1")

	require.EqualError(t, err, "document doc1 not found")
}

func TestGetDocument_MissingDocumentID(t *testing.T) {
	c, _, ctx := newContext()

	_, err := c.GetDocument(ctx, "")

	require.EqualError(t, err, "documentID is required")
}

func TestGetDocument_GetStateFails(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateReturns(nil, errors.New("world state unavailable"))

	_, err := c.GetDocument(ctx, "doc1")

	require.EqualError(t, err, "failed to read from world state: world state unavailable")
}

func TestGetDocument_UnmarshalFails(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateReturns([]byte("not json"), nil)

	_, err := c.GetDocument(ctx, "doc1")

	require.ErrorContains(t, err, "failed to unmarshal document")
}

func TestRecordVerification_Success_Confirmada(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateReturns(existingDocJSON("Pendiente"), nil)

	evt, err := c.RecordVerification(ctx, "doc1", "confirmada", "U003")

	require.NoError(t, err)
	require.Equal(t, "doc1", evt.DocumentID)
	require.Equal(t, "verificacion", evt.Action)
	require.Equal(t, "confirmada", evt.Result)
	require.Equal(t, "U003", evt.User)
	require.Equal(t, "tx1", evt.TxID)

	require.Equal(t, 2, stub.PutStateCallCount())
	docKey, docValue := stub.PutStateArgsForCall(0)
	require.Equal(t, "doc1", docKey)
	// El hash no cambia; solo el Status — RF-34: nada más lo puede tocar.
	require.Contains(t, string(docValue), `"Sha256Hex":"`+validHash+`"`)
	require.Contains(t, string(docValue), `"Status":"Verificado"`)

	_, eventValue := stub.PutStateArgsForCall(1)
	require.Contains(t, string(eventValue), `"Action":"verificacion"`)
	require.Contains(t, string(eventValue), `"Result":"confirmada"`)
}

func TestRecordVerification_Success_Comprometida(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateReturns(existingDocJSON("Pendiente"), nil)

	evt, err := c.RecordVerification(ctx, "doc1", "comprometida", "U003")

	require.NoError(t, err)
	require.Equal(t, "comprometida", evt.Result)

	_, docValue := stub.PutStateArgsForCall(0)
	require.Contains(t, string(docValue), `"Status":"Alterado"`)
}

func TestRecordVerification_DocumentNotFound(t *testing.T) {
	c, stub, ctx := newContext()

	_, err := c.RecordVerification(ctx, "doc1", "confirmada", "U003")

	require.EqualError(t, err, "document doc1 not found")
	require.Equal(t, 0, stub.PutStateCallCount())
}

func TestRecordVerification_InvalidResult(t *testing.T) {
	c, stub, ctx := newContext()

	_, err := c.RecordVerification(ctx, "doc1", "quizas", "U003")

	require.EqualError(t, err, `result must be "confirmada" or "comprometida", got "quizas"`)
	// Falla antes de leer el documento — ni falta que hace.
	require.Equal(t, 0, stub.GetStateCallCount())
}

func TestRecordVerification_MissingDocumentID(t *testing.T) {
	c, _, ctx := newContext()

	_, err := c.RecordVerification(ctx, "", "confirmada", "U003")

	require.EqualError(t, err, "documentID is required")
}

func TestRecordVerification_MissingUser(t *testing.T) {
	c, _, ctx := newContext()

	_, err := c.RecordVerification(ctx, "doc1", "confirmada", "")

	require.EqualError(t, err, "user is required")
}

func TestRecordVerification_GetStateFails(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateReturns(nil, errors.New("world state unavailable"))

	_, err := c.RecordVerification(ctx, "doc1", "confirmada", "U003")

	require.EqualError(t, err, "failed to read from world state: world state unavailable")
}

func TestRecordVerification_PutStateFails(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateReturns(existingDocJSON("Pendiente"), nil)
	stub.PutStateReturns(errors.New("disk full"))

	_, err := c.RecordVerification(ctx, "doc1", "confirmada", "U003")

	require.EqualError(t, err, "failed to put document to world state: disk full")
}

func TestRecordVerification_PutEventStateFails(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateReturns(existingDocJSON("Pendiente"), nil)
	stub.PutStateReturnsOnCall(1, errors.New("disk full"))

	_, err := c.RecordVerification(ctx, "doc1", "confirmada", "U003")

	require.EqualError(t, err, "failed to put event to world state: disk full")
}

func TestRecordVerification_GetTxTimestampFails(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateReturns(existingDocJSON("Pendiente"), nil)
	stub.GetTxTimestampReturns(nil, errors.New("clock unavailable"))

	_, err := c.RecordVerification(ctx, "doc1", "confirmada", "U003")

	require.EqualError(t, err, "failed to read tx timestamp: clock unavailable")
	require.Equal(t, 0, stub.PutStateCallCount())
}

func TestRecordVerification_CreateCompositeKeyFails(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateReturns(existingDocJSON("Pendiente"), nil)
	stub.CreateCompositeKeyReturns("", errors.New("bad key"))

	_, err := c.RecordVerification(ctx, "doc1", "confirmada", "U003")

	require.EqualError(t, err, "failed to build event composite key: bad key")
	require.Equal(t, 1, stub.PutStateCallCount())
}

func eventKV(evt contract.Event) *queryresult.KV {
	value, err := json.Marshal(evt)
	if err != nil {
		panic(err)
	}
	return &queryresult.KV{Value: value}
}

// newIterator builds a mocks.StateQueryIterator that yields the given events
// in order and reports Close() was called exactly once (asserted by the
// caller via CloseCallCount()).
func newIterator(events ...contract.Event) *mocks.StateQueryIterator {
	iter := &mocks.StateQueryIterator{}
	for i, evt := range events {
		iter.HasNextReturnsOnCall(i, true)
		iter.NextReturnsOnCall(i, eventKV(evt), nil)
	}
	iter.HasNextReturnsOnCall(len(events), false)
	return iter
}

func TestGetDocumentEvents_Success(t *testing.T) {
	c, stub, ctx := newContext()
	registro := contract.Event{Action: "registro", DocumentID: "doc1", TxID: "tx1", User: "U001"}
	verificacion := contract.Event{Action: "verificacion", DocumentID: "doc1", Result: "confirmada", TxID: "tx2", User: "U003"}
	iter := newIterator(registro, verificacion)
	stub.GetStateByPartialCompositeKeyReturns(iter, nil)

	events, err := c.GetDocumentEvents(ctx, "doc1")

	require.NoError(t, err)
	require.Len(t, events, 2)
	require.Equal(t, "registro", events[0].Action)
	require.Equal(t, "verificacion", events[1].Action)
	require.Equal(t, "confirmada", events[1].Result)
	objType, attrs := stub.GetStateByPartialCompositeKeyArgsForCall(0)
	require.Equal(t, "event", objType)
	require.Equal(t, []string{"doc1"}, attrs)
	require.Equal(t, 1, iter.CloseCallCount())
}

func TestGetDocumentEvents_Empty(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateByPartialCompositeKeyReturns(newIterator(), nil)

	events, err := c.GetDocumentEvents(ctx, "doc1")

	require.NoError(t, err)
	require.Empty(t, events)
}

func TestGetDocumentEvents_MissingDocumentID(t *testing.T) {
	c, stub, ctx := newContext()

	_, err := c.GetDocumentEvents(ctx, "")

	require.EqualError(t, err, "documentID is required")
	require.Equal(t, 0, stub.GetStateByPartialCompositeKeyCallCount())
}

func TestGetDocumentEvents_QueryFails(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateByPartialCompositeKeyReturns(nil, errors.New("world state unavailable"))

	_, err := c.GetDocumentEvents(ctx, "doc1")

	require.EqualError(t, err, "failed to query events: world state unavailable")
}

func TestGetDocumentEvents_IteratorNextFails(t *testing.T) {
	c, stub, ctx := newContext()
	iter := &mocks.StateQueryIterator{}
	iter.HasNextReturnsOnCall(0, true)
	iter.NextReturnsOnCall(0, nil, errors.New("iterator broke"))
	stub.GetStateByPartialCompositeKeyReturns(iter, nil)

	_, err := c.GetDocumentEvents(ctx, "doc1")

	require.EqualError(t, err, "failed to iterate events: iterator broke")
	require.Equal(t, 1, iter.CloseCallCount())
}

func TestGetDocumentEvents_UnmarshalFails(t *testing.T) {
	c, stub, ctx := newContext()
	iter := &mocks.StateQueryIterator{}
	iter.HasNextReturnsOnCall(0, true)
	iter.NextReturnsOnCall(0, &queryresult.KV{Value: []byte("not json")}, nil)
	stub.GetStateByPartialCompositeKeyReturns(iter, nil)

	_, err := c.GetDocumentEvents(ctx, "doc1")

	require.ErrorContains(t, err, "failed to unmarshal event")
	require.Equal(t, 1, iter.CloseCallCount())
}

func TestGetAllEvents_Success(t *testing.T) {
	c, stub, ctx := newContext()
	evt1 := contract.Event{Action: "registro", DocumentID: "doc1", TxID: "tx1", User: "U001"}
	evt2 := contract.Event{Action: "registro", DocumentID: "doc2", TxID: "tx2", User: "U001"}
	stub.GetStateByPartialCompositeKeyReturns(newIterator(evt1, evt2), nil)

	events, err := c.GetAllEvents(ctx)

	require.NoError(t, err)
	require.Len(t, events, 2)
	require.Equal(t, "doc1", events[0].DocumentID)
	require.Equal(t, "doc2", events[1].DocumentID)
	// Clave parcial SIN atributos — a diferencia de GetDocumentEvents, que la
	// pasa con [documentID].
	objType, attrs := stub.GetStateByPartialCompositeKeyArgsForCall(0)
	require.Equal(t, "event", objType)
	require.Equal(t, []string{}, attrs)
}

func TestGetAllEvents_QueryFails(t *testing.T) {
	c, stub, ctx := newContext()
	stub.GetStateByPartialCompositeKeyReturns(nil, errors.New("world state unavailable"))

	_, err := c.GetAllEvents(ctx)

	require.EqualError(t, err, "failed to query events: world state unavailable")
}
