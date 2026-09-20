package contract_test

import (
	"errors"
	"testing"
	"time"

	"github.com/contratos/chaincode/contract"
	"github.com/contratos/chaincode/contract/mocks"
	"github.com/hyperledger/fabric-chaincode-go/v2/shim"
	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
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
