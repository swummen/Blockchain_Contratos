import * as crypto from "node:crypto";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as grpc from "@grpc/grpc-js";
import { connect, Gateway, Identity, Signer, signers } from "@hyperledger/fabric-gateway";
import { fabricConfig } from "../config/fabric";

const EVALUATE_TIMEOUT_MS = 3000;

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

// Se llama una vez al arrancar (mismo patrón que connectMongo en
// repositories/mongoClient.ts) y de nuevo, perezosamente, desde
// queryChaincode() si la primera vez falló. Nota: esto arma el cliente y lee
// la identidad de disco, pero no hace ningún round-trip de red todavía — el
// primer contacto real con el peer ocurre en el evaluateTransaction de
// queryChaincode(). Por eso un fallo acá (identidad ausente, TLS cert
// faltante) es siempre un problema de configuración local, no de la red.
export async function connectFabric(): Promise<void> {
  grpcClient = await newGrpcConnection();
  const identity = await newIdentity();
  const signer = await newSigner();
  // evaluateOptions fija un deadline por defecto para toda evaluateTransaction
  // hecha con este gateway: sin esto, un peer colgado (partición de red,
  // sobrecarga) deja la request de Express esperando indefinidamente — mismo
  // problema que ya se resolvió para Mongo (ver serverSelectionTimeoutMS en
  // repositories/mongoClient.ts).
  gateway = connect({
    client: grpcClient,
    identity,
    signer,
    evaluateOptions: () => ({ deadline: Date.now() + EVALUATE_TIMEOUT_MS }),
  });
}

// Solo evaluateTransaction (query de solo lectura): la Fabric Gateway API
// habla con un único peer, que resuelve el endorsement y reenvía al orderer
// por su cuenta cuando hace falta (submitTransaction) — el cliente nunca
// necesita una conexión aparte al orderer.
export async function queryChaincode(fcn: string, ...args: string[]): Promise<string> {
  if (!gateway) {
    // Reconexión perezosa: si connectFabric() falló al arrancar (por ejemplo,
    // el backend arrancó antes de que network-up.sh terminara de generar las
    // credenciales), un /fabric/ping posterior no debería quedar en 503 para
    // siempre solo porque nadie reinició el contenedor.
    await connectFabric();
  }
  const network = gateway!.getNetwork(fabricConfig.channelName);
  const contract = network.getContract(fabricConfig.chaincodeName);
  const resultBytes = await contract.evaluateTransaction(fcn, ...args);
  return Buffer.from(resultBytes).toString("utf8");
}
