import * as crypto from "node:crypto";
import { promises as fs } from "node:fs";
import * as path from "node:path";
import * as grpc from "@grpc/grpc-js";
import { connect, Gateway, Identity, Signer, signers } from "@hyperledger/fabric-gateway";
import { fabricConfig } from "../config/fabric";

const EVALUATE_TIMEOUT_MS = 3000;
// submitTransaction pasa por tres fases con timeouts propios (a diferencia de
// evaluateTransaction, que es un solo round-trip al peer): endosar, mandar al
// orderer, y esperar el commit. Este último es el más largo a propósito: 
// tiene que esperar a que el orderer corte el bloque (~2s de BatchTimeout por
// default) y el peer lo valide, no un simple round-trip de red.
// 5s alcanza con la red ya arriba, pero justo después de un network-up.sh el
// primer invoke puede tardar más (el peer todavía está levantando el
// contenedor del chaincode): si un submit falla con un deadline excedido
// muy pronto después de levantar todo, no es necesariamente un bug del
// chaincode, puede ser este cold-start. Subir el número si se observa en la
// práctica, no antes (no agregar retries especulativos sin haberlo visto).
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

// Se llama una vez al arrancar (mismo patrón que connectMongo en
// repositories/mongoClient.ts) y de nuevo, perezosamente, desde
// queryChaincode() si la primera vez falló. Nota: esto arma el cliente y lee
// la identidad de disco, pero no hace ningún round-trip de red todavía, el
// primer contacto real con el peer ocurre en el evaluateTransaction de
// queryChaincode(). Por eso un fallo acá (identidad ausente, TLS cert
// faltante) es siempre un problema de configuración local, no de la red.
export async function connectFabric(): Promise<void> {
  grpcClient = await newGrpcConnection();
  const identity = await newIdentity();
  const signer = await newSigner();
  // evaluateOptions fija un deadline por defecto para toda evaluateTransaction
  // hecha con este gateway: sin esto, un peer colgado (partición de red,
  // sobrecarga) deja la request de Express esperando indefinidamente, mismo
  // problema que ya se resolvió para Mongo (ver serverSelectionTimeoutMS en
  // repositories/mongoClient.ts).
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
    // Reconexión perezosa: si connectFabric() falló al arrancar (por ejemplo,
    // el backend arrancó antes de que network-up.sh terminara de generar las
    // credenciales), una request posterior no debería quedar fallando para
    // siempre solo porque nadie reinició el contenedor.
    await connectFabric();
  }
  const network = gateway!.getNetwork(fabricConfig.channelName);
  return network.getContract(fabricConfig.chaincodeName);
}

// Solo evaluateTransaction (query de solo lectura): la Fabric Gateway API
// habla con un único peer, que resuelve el endorsement y reenvía al orderer
// por su cuenta cuando hace falta (submitTransaction), el cliente nunca
// necesita una conexión aparte al orderer.
export async function queryChaincode(fcn: string, ...args: string[]): Promise<string> {
  const contract = await getContract();
  const resultBytes = await contract.evaluateTransaction(fcn, ...args);
  return Buffer.from(resultBytes).toString("utf8");
}

// A diferencia de queryChaincode, esto sí escribe al ledger: endosa en el
// peer, manda al orderer, y espera el commit real antes de resolver (no
// devuelve apenas el peer simula la transacción, eso es justo lo que
// `peer chaincode invoke` de la CLI NO espera por defecto, y lo que causó la
// condición de carrera documentada en docker/deploy-cc.sh; submitTransaction
// del SDK no tiene ese problema, ya espera el estado de commit).
export async function submitChaincodeTransaction(
  fcn: string,
  ...args: string[]
): Promise<string> {
  const contract = await getContract();
  const resultBytes = await contract.submitTransaction(fcn, ...args);
  return Buffer.from(resultBytes).toString("utf8");
}
