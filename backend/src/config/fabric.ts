export const fabricConfig = {
  mspId: process.env.FABRIC_MSP_ID ?? "Org1MSP",
  // Nombre del contenedor en la red fabric_test: dentro de Docker, localhost es
  // el propio backend.
  peerEndpoint: process.env.FABRIC_PEER_ENDPOINT ?? "peer0.org1.example.com:7051",
  peerHostAlias: process.env.FABRIC_PEER_HOST_ALIAS ?? "peer0.org1.example.com",
  // Montado desde docker/compose.app.yml. Se regenera en cada network-up.sh.
  cryptoPath: process.env.FABRIC_CRYPTO_PATH ?? "/crypto/peerOrganizations/org1.example.com",
  identityUser: process.env.FABRIC_IDENTITY_USER ?? "Admin@org1.example.com",
  channelName: process.env.FABRIC_CHANNEL_NAME ?? "contratoschannel",
  chaincodeName: process.env.FABRIC_CHAINCODE_NAME ?? "contracts",
};
