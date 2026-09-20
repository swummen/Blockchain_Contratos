package main

import (
	"log"

	"github.com/contratos/chaincode/contract"
	"github.com/hyperledger/fabric-contract-api-go/v2/contractapi"
)

func main() {
	contractsChaincode, err := contractapi.NewChaincode(&contract.ContractsContract{})
	if err != nil {
		log.Panicf("Error creating contracts chaincode: %v", err)
	}

	if err := contractsChaincode.Start(); err != nil {
		log.Panicf("Error starting contracts chaincode: %v", err)
	}
}
