// Único test directo de gateway.ts (T3): protege el contrato de errores que
// T4 ya depende de que se cumpla — que submitChaincodeTransaction no envuelva
// ni descarte el error original del SDK (GatewayError.details, donde vive el
// motivo real de un rechazo del chaincode). queryChaincode nunca tuvo tests
// unitarios propios (solo verificación real contra la red, Sprint 1); acá se
// agrega el mínimo necesario para no perder esta garantía si alguien más
// adelante envuelve submitTransaction en un try/catch "para loguear".
jest.mock("node:fs", () => ({
  promises: {
    readFile: jest.fn().mockResolvedValue(Buffer.from("dummy")),
    readdir: jest.fn().mockResolvedValue(["key.pem"]),
  },
}));

jest.mock("node:crypto", () => ({
  createPrivateKey: jest.fn().mockReturnValue({}),
}));

jest.mock("@grpc/grpc-js", () => ({
  credentials: { createSsl: jest.fn().mockReturnValue({}) },
  Client: jest.fn().mockImplementation(() => ({})),
}));

const mockSubmitTransaction = jest.fn();
const mockContract = { submitTransaction: mockSubmitTransaction };
const mockNetwork = { getContract: jest.fn(() => mockContract) };
const mockGateway = { getNetwork: jest.fn(() => mockNetwork) };

jest.mock("@hyperledger/fabric-gateway", () => ({
  connect: jest.fn(() => mockGateway),
  signers: { newPrivateKeySigner: jest.fn(() => jest.fn()) },
}));

import { connectFabric, submitChaincodeTransaction } from "../src/fabric/gateway";

beforeEach(async () => {
  jest.clearAllMocks();
  await connectFabric();
});

describe("submitChaincodeTransaction", () => {
  it("devuelve el resultado decodificado en éxito", async () => {
    mockSubmitTransaction.mockResolvedValue(Buffer.from('{"ok":true}'));

    const result = await submitChaincodeTransaction("RegisterDocument", "doc1", "hash", "user");

    expect(result).toBe('{"ok":true}');
    expect(mockSubmitTransaction).toHaveBeenCalledWith(
      "RegisterDocument",
      "doc1",
      "hash",
      "user",
    );
  });

  it("propaga el error original (con .details) sin envolverlo ni descartarlo", async () => {
    const gatewayError = Object.assign(new Error("failed to endorse transaction"), {
      details: [
        { address: "peer0.org1:7051", message: "document doc1 already registered", mspId: "Org1MSP" },
      ],
    });
    mockSubmitTransaction.mockRejectedValue(gatewayError);

    await expect(
      submitChaincodeTransaction("RegisterDocument", "doc1", "hash", "user"),
    ).rejects.toBe(gatewayError);
  });
});
