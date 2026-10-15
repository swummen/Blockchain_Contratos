# Decodifica los bloques indicados (números) del canal contratoschannel: TxID, función,
# endosantes y código de validación. Corre dentro de hyperledger/fabric-tools (ver evidencia-fabric.sh).
set -e
for N in "$@"; do
  peer channel fetch $N /tmp/b$N.block -c contratoschannel 2>/dev/null
  configtxlator proto_decode --type common.Block --input /tmp/b$N.block > /tmp/b$N.json
  J=/tmp/b$N.json
  TX=$(jq -r '.data.data[0].payload.header.channel_header.tx_id' $J)
  FN=$(jq -r '.data.data[0].payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.input.args[0]' $J | base64 -d)
  CC=$(jq -r '.data.data[0].payload.data.actions[0].payload.chaincode_proposal_payload.input.chaincode_spec.chaincode_id.name' $J)
  END=$(jq -r '.data.data[0].payload.data.actions[0].payload.action.endorsements[].endorser' $J | while read e; do echo "$e" | base64 -d | grep -ao 'Org[12]MSP' | head -1; done | paste -sd+ -)
  VAL=$(jq -r '.metadata.metadata[2]' $J | base64 -d | od -An -tu1 | tr -d ' ')
  PREV=$(jq -r '.header.previous_hash' $J | base64 -d | od -An -tx1 | tr -d ' \n' | cut -c1-16)
  echo "Bloque nº $N · TxID $TX"
  echo "    chaincode=$CC · función=$FN · endosado por: $END · código de validación=$VAL (0 = VALID) · hash del bloque anterior=${PREV}…"
done
