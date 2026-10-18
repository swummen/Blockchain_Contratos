// submitChaincodeTransaction debe propagar el error original del SDK: los
// servicios leen el motivo del rechazo en GatewayError.details.
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
