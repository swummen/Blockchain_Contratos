import * as crypto from "node:crypto";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as grpc from "@grpc/grpc-js";
import { connect, Gateway, Identity, Signer, signers } from "@hyperledger/fabric-gateway";
import { fabricConfig } from "../config/fabric";

const EVALUATE_TIMEOUT_MS = 3000;
// Una escritura tiene tres fases: endoso, envío al orderer y confirmación.
// La confirmación espera el corte del bloque (BatchTimeout de 2 s), por eso es
// la más larga. Justo después de levantar la red, el primer envío puede
// exceder estos plazos mientras el peer arranca el contenedor del chaincode.
const ENDORSE_TIMEOUT_MS = 5000;
const SUBMIT_TIMEOUT_MS = 5000;
const COMMIT_TIMEOUT_MS = 15000;

let gateway: Gateway | undefined;
let grpcClient: grpc.Client | undefined;

async function newIdentity(): Promise<Identity> {
  const certPath = path.join(
    fabricConfig.cryptoPath,
    "users",
    fabricConfig.identityUser,
    "msp",
    "signcerts",
    "cert.pem",
  );
  const credentials = await fs.readFile(certPath);
  return { mspId: fabricConfig.mspId, credentials };
}

async function newSigner(): Promise<Signer> {
  const keyDir = path.join(
    fabricConfig.cryptoPath,
    "users",
    fabricConfig.identityUser,
    "msp",
    "keystore",
  );
  const files = await fs.readdir(keyDir);
  if (files.length !== 1) {
    throw new Error(
      `Se esperaba exactamente 1 archivo de llave privada en ${keyDir}, se encontraron ${files.length}`,
    );
  }
  const privateKeyPem = await fs.readFile(path.join(keyDir, files[0]));
  const privateKey = crypto.createPrivateKey(privateKeyPem);
  return signers.newPrivateKeySigner(privateKey);
}

async function newGrpcConnection(): Promise<grpc.Client> {
  const tlsCertPath = path.join(
    fabricConfig.cryptoPath,
    "peers",
    fabricConfig.peerHostAlias,
    "tls",
    "ca.crt",
  );
  const tlsRootCert = await fs.readFile(tlsCertPath);
  const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
  return new grpc.Client(fabricConfig.peerEndpoint, tlsCredentials);
}

// Prepara el cliente con la identidad leída de disco. No contacta al peer
// todavía: si falla es por configuración local (certificados), no por la red.
export async function connectFabric(): Promise<void> {
  grpcClient = await newGrpcConnection();
  const identity = await newIdentity();
  const signer = await newSigner();
  // Sin plazos, un peer colgado dejaría la petición HTTP esperando para siempre.
  gateway = connect({
    client: grpcClient,
    identity,
    signer,
    evaluateOptions: () => ({ deadline: Date.now() + EVALUATE_TIMEOUT_MS }),
    endorseOptions: () => ({ deadline: Date.now() + ENDORSE_TIMEOUT_MS }),
    submitOptions: () => ({ deadline: Date.now() + SUBMIT_TIMEOUT_MS }),
    commitStatusOptions: () => ({ deadline: Date.now() + COMMIT_TIMEOUT_MS }),
  });
}

async function getContract() {
  if (!gateway) {
    // Reconexión si al arrancar la red todavía no estaba lista.
    await connectFabric();
  }
  const network = gateway!.getNetwork(fabricConfig.channelName);
  return network.getContract(fabricConfig.chaincodeName);
}

// Consulta de solo lectura: no genera bloque ni pasa por el orderer.
export async function queryChaincode(fcn: string, ...args: string[]): Promise<string> {
  const contract = await getContract();
  const resultBytes = await contract.evaluateTransaction(fcn, ...args);
  return Buffer.from(resultBytes).toString("utf8");
}

// Escribe en el ledger y resuelve solo cuando el bloque quedó confirmado.
export async function submitChaincodeTransaction(
  fcn: string,
  ...args: string[]
): Promise<string> {
  const contract = await getContract();
  const resultBytes = await contract.submitTransaction(fcn, ...args);
  return Buffer.from(resultBytes).toString("utf8");
}
