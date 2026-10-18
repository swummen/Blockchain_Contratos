# Construir la red y el chaincode

> Fuente: <https://hyperledger-fabric.readthedocs.io/es/latest/tutorials.html>
> Descargado con markitdown. Traducción ES incompleta: parte del texto está en inglés.

Las tres páginas que enseñan a **construir el blockchain** y **desarrollar/desplegar el chaincode**:

- [Using the Fabric test network](tutorials/test_network.md): levantar la red de prueba (peers, orderer, CAs), crear un canal, arrancar un chaincode, interactuar y bajar la red.
- [Deploying a smart contract to a channel](tutorials/deploy_chaincode.md): ciclo de vida del chaincode: empaquetar (Go/JS/TS), instalar, aprobar la definición, hacer commit al canal, invocar y actualizar.
- [Chaincode for Developers](tutorials/chaincode4ade.md): cómo escribir un chaincode: la Shim API, ejemplo completo «Simple Asset Chaincode» en Go, control de acceso y dependencias externas.
