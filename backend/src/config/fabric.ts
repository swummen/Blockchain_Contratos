export const fabricConfig = {
  mspId: process.env.FABRIC_MSP_ID ?? "Org1MSP",
  // Nombre DNS del contenedor dentro de la red fabric_test, nunca localhost
  // (RNF-20 / HU-021 CA-02: el backend es el único que le habla a Fabric).
  peerEndpoint: process.env.FABRIC_PEER_ENDPOINT ?? "peer0.org1.example.com:7051",
  peerHostAlias: process.env.FABRIC_PEER_HOST_ALIAS ?? "peer0.org1.example.com",
  // Raíz montada de docker/fabric-samples/test-network/organizations (ver
  // docker/compose.app.yml). Se regenera en cada network-up.sh; ninguna
  // identidad sobrevive a un ciclo down/up.
  cryptoPath: process.env.FABRIC_CRYPTO_PATH ?? "/crypto/peerOrganizations/org1.example.com",
  identityUser: process.env.FABRIC_IDENTITY_USER ?? "Admin@org1.example.com",
  channelName: process.env.FABRIC_CHANNEL_NAME ?? "contratoschannel",
  // Sprint 2 (T3): el chaincode real del proyecto reemplaza al placeholder
  // de Sprint 0 (`basic`, asset-transfer-basic, ya retirado de la red).
  chaincodeName: process.env.FABRIC_CHAINCODE_NAME ?? "contracts",
};
