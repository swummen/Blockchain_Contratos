# Metrics Reference
## Orderer Metrics
### Prometheus
The following orderer metrics are exported for consumption by Prometheus.
| Name | Type | Description | Labels | |
| ------------------------------------------------ | --------- | -------------------------------------------------------------------------------- | ---------- | |
| blockcutter\_block\_fill\_duration | histogram | The time from first transaction enqueing to the block being cut in seconds. | channel | |
| broadcast\_enqueue\_duration | histogram | The time to enqueue a transaction in seconds. | channel | |
| type | | | | |
| status | | | | |
| broadcast\_processed\_count | counter | The number of transactions processed. | channel | |
| type | | | | |
| status | | | | |
| broadcast\_validate\_duration | histogram | The time to validate a transaction in seconds. | channel | |
| type | | | | |
| status | | | | |
| cluster\_comm\_egress\_queue\_capacity | gauge | Capacity of the egress queue. | host | |
| msg\_type | | | | |
| channel | | | | |
| cluster\_comm\_egress\_queue\_length | gauge | Length of the egress queue. | host | |
| msg\_type | | | | |
| channel | | | | |
| cluster\_comm\_egress\_queue\_workers | gauge | Count of egress queue workers. | channel | |
| cluster\_comm\_egress\_stream\_count | gauge | Count of streams to other nodes. | channel | |
| cluster\_comm\_egress\_tls\_connection\_count | gauge | Count of TLS connections to other nodes. | | |
| cluster\_comm\_ingress\_stream\_count | gauge | Count of streams from other nodes. | | |
| cluster\_comm\_msg\_dropped\_count | counter | Count of messages dropped. | host | |
| channel | | | | |
| cluster\_comm\_msg\_send\_time | histogram | The time it takes to send a message in seconds. | host | |
| channel | | | | |
| consensus\_etcdraft\_active\_nodes | gauge | Number of active nodes in this channel. | channel | |
| consensus\_etcdraft\_cluster\_size | gauge | Number of nodes in this channel. | channel | |
| consensus\_etcdraft\_committed\_block\_number | gauge | The block number of the latest block committed. | channel | |
| consensus\_etcdraft\_config\_proposals\_received | counter | The total number of proposals received for config type transactions. | channel | |
| consensus\_etcdraft\_data\_persist\_duration | histogram | The time taken for etcd/raft data to be persisted in storage (in seconds). | channel | |
| consensus\_etcdraft\_is\_leader | gauge | The leadership status of the current node: 1 if it is the leader else 0. | channel | |
| consensus\_etcdraft\_leader\_changes | counter | The number of leader changes since process start. | channel | |
| consensus\_etcdraft\_normal\_proposals\_received | counter | The total number of proposals received for normal type transactions. | channel | |
| consensus\_etcdraft\_proposal\_failures | counter | The number of proposal failures. | channel | |
| consensus\_etcdraft\_snapshot\_block\_number | gauge | The block number of the latest snapshot. | channel | |
| consensus\_kafka\_batch\_size | gauge | The mean batch size in bytes sent to topics. | topic | |
| consensus\_kafka\_compression\_ratio | gauge | The mean compression ratio (as percentage) for topics. | topic | |
| consensus\_kafka\_incoming\_byte\_rate | gauge | Bytes/second read off brokers. | broker\_id | |
| consensus\_kafka\_last\_offset\_persisted | gauge | The offset specified in the block metadata of the most recently committed block. | channel | |
| consensus\_kafka\_outgoing\_byte\_rate | gauge | Bytes/second written to brokers. | broker\_id | |
| consensus\_kafka\_record\_send\_rate | gauge | The number of records per second sent to topics. | topic | |
| consensus\_kafka\_records\_per\_request | gauge | The mean number of records sent per request to topics. | topic | |
| consensus\_kafka\_request\_latency | gauge | The mean request latency in ms to brokers. | broker\_id | |
| consensus\_kafka\_request\_rate | gauge | Requests/second sent to brokers. | broker\_id | |
| consensus\_kafka\_request\_size | gauge | The mean request size in bytes to brokers. | broker\_id | |
| consensus\_kafka\_response\_rate | gauge | Requests/second sent to brokers. | broker\_id | |
| consensus\_kafka\_response\_size | gauge | The mean response size in bytes from brokers. | broker\_id | |
| deliver\_blocks\_sent | counter | The number of blocks sent by the deliver service. | channel | |
| filtered | | | | |
| data\_type | | | | |
| deliver\_requests\_completed | counter | The number of deliver requests that have been completed. | channel | |
| filtered | | | | |
| data\_type | | | | |
| success | | | | |
| deliver\_requests\_received | counter | The number of deliver requests that have been received. | channel | |
| filtered | | | | |
| data\_type | | | | |
| deliver\_streams\_closed | counter | The number of GRPC streams that have been closed for the deliver service. | | |
| deliver\_streams\_opened | counter | The number of GRPC streams that have been opened for the deliver service. | | |
| fabric\_version | gauge | The active version of Fabric. | version | |
| grpc\_comm\_conn\_closed | counter | gRPC connections closed. Open minus closed is the active number of connections. | | |
| grpc\_comm\_conn\_opened | counter | gRPC connections opened. Open minus closed is the active number of connections. | | |
| grpc\_server\_stream\_messages\_received | counter | The number of stream messages received. | service | |
| method | | | | |
| grpc\_server\_stream\_messages\_sent | counter | The number of stream messages sent. | service | |
| method | | | | |
| grpc\_server\_stream\_request\_duration | histogram | The time to complete a stream request. | service | |
| method | | | | |
| code | | | | |
| grpc\_server\_stream\_requests\_completed | counter | The number of stream requests completed. | service | |
| method | | | | |
| code | | | | |
| grpc\_server\_stream\_requests\_received | counter | The number of stream requests received. | service | |
| method | | | | |
| grpc\_server\_unary\_request\_duration | histogram | The time to complete a unary request. | service | |
| method | | | | |
| code | | | | |
| grpc\_server\_unary\_requests\_completed | counter | The number of unary requests completed. | service | |
| method | | | | |
| code | | | | |
| grpc\_server\_unary\_requests\_received | counter | The number of unary requests received. | service | |
| method | | | | |
| ledger\_blockchain\_height | gauge | Height of the chain in blocks. | channel | |
| ledger\_blockstorage\_commit\_time | histogram | Time taken in seconds for committing the block to storage. | channel | |
| logging\_entries\_checked | counter | Number of log entries checked against the active logging level | level | |
| logging\_entries\_written | counter | Number of log entries that are written | level | |
### StatsD
The following orderer metrics are emitted for consumption by StatsD. The `%{variable_name}` nomenclature represents segments that vary based on context.
For example, `%{channel}` will be replaced with the name of the channel associated with the metric.
| Bucket | Type | Description |
| --------------------------------------------------------------------------- | --------- | -------------------------------------------------------------------------------- |
| blockcutter.block\_fill\_duration.%{channel} | histogram | The time from first transaction enqueing to the block being cut in seconds. |
| broadcast.enqueue\_duration.%{channel}.%{type}.%{status} | histogram | The time to enqueue a transaction in seconds. |
| broadcast.processed\_count.%{channel}.%{type}.%{status} | counter | The number of transactions processed. |
| broadcast.validate\_duration.%{channel}.%{type}.%{status} | histogram | The time to validate a transaction in seconds. |
| cluster.comm.egress\_queue\_capacity.%{host}.%{msg\_type}.%{channel} | gauge | Capacity of the egress queue. |
| cluster.comm.egress\_queue\_length.%{host}.%{msg\_type}.%{channel} | gauge | Length of the egress queue. |
| cluster.comm.egress\_queue\_workers.%{channel} | gauge | Count of egress queue workers. |
| cluster.comm.egress\_stream\_count.%{channel} | gauge | Count of streams to other nodes. |
| cluster.comm.egress\_tls\_connection\_count | gauge | Count of TLS connections to other nodes. |
| cluster.comm.ingress\_stream\_count | gauge | Count of streams from other nodes. |
| cluster.comm.msg\_dropped\_count.%{host}.%{channel} | counter | Count of messages dropped. |
| cluster.comm.msg\_send\_time.%{host}.%{channel} | histogram | The time it takes to send a message in seconds. |
| consensus.etcdraft.active\_nodes.%{channel} | gauge | Number of active nodes in this channel. |
| consensus.etcdraft.cluster\_size.%{channel} | gauge | Number of nodes in this channel. |
| consensus.etcdraft.committed\_block\_number.%{channel} | gauge | The block number of the latest block committed. |
| consensus.etcdraft.config\_proposals\_received.%{channel} | counter | The total number of proposals received for config type transactions. |
| consensus.etcdraft.data\_persist\_duration.%{channel} | histogram | The time taken for etcd/raft data to be persisted in storage (in seconds). |
| consensus.etcdraft.is\_leader.%{channel} | gauge | The leadership status of the current node: 1 if it is the leader else 0. |
| consensus.etcdraft.leader\_changes.%{channel} | counter | The number of leader changes since process start. |
| consensus.etcdraft.normal\_proposals\_received.%{channel} | counter | The total number of proposals received for normal type transactions. |
| consensus.etcdraft.proposal\_failures.%{channel} | counter | The number of proposal failures. |
| consensus.etcdraft.snapshot\_block\_number.%{channel} | gauge | The block number of the latest snapshot. |
| consensus.kafka.batch\_size.%{topic} | gauge | The mean batch size in bytes sent to topics. |
| consensus.kafka.compression\_ratio.%{topic} | gauge | The mean compression ratio (as percentage) for topics. |
| consensus.kafka.incoming\_byte\_rate.%{broker\_id} | gauge | Bytes/second read off brokers. |
| consensus.kafka.last\_offset\_persisted.%{channel} | gauge | The offset specified in the block metadata of the most recently committed block. |
| consensus.kafka.outgoing\_byte\_rate.%{broker\_id} | gauge | Bytes/second written to brokers. |
| consensus.kafka.record\_send\_rate.%{topic} | gauge | The number of records per second sent to topics. |
| consensus.kafka.records\_per\_request.%{topic} | gauge | The mean number of records sent per request to topics. |
| consensus.kafka.request\_latency.%{broker\_id} | gauge | The mean request latency in ms to brokers. |
| consensus.kafka.request\_rate.%{broker\_id} | gauge | Requests/second sent to brokers. |
| consensus.kafka.request\_size.%{broker\_id} | gauge | The mean request size in bytes to brokers. |
| consensus.kafka.response\_rate.%{broker\_id} | gauge | Requests/second sent to brokers. |
| consensus.kafka.response\_size.%{broker\_id} | gauge | The mean response size in bytes from brokers. |
| deliver.blocks\_sent.%{channel}.%{filtered}.%{data\_type} | counter | The number of blocks sent by the deliver service. |
| deliver.requests\_completed.%{channel}.%{filtered}.%{data\_type}.%{success} | counter | The number of deliver requests that have been completed. |
| deliver.requests\_received.%{channel}.%{filtered}.%{data\_type} | counter | The number of deliver requests that have been received. |
| deliver.streams\_closed | counter | The number of GRPC streams that have been closed for the deliver service. |
| deliver.streams\_opened | counter | The number of GRPC streams that have been opened for the deliver service. |
| fabric\_version.%{version} | gauge | The active version of Fabric. |
| grpc.comm.conn\_closed | counter | gRPC connections closed. Open minus closed is the active number of connections. |
| grpc.comm.conn\_opened | counter | gRPC connections opened. Open minus closed is the active number of connections. |
| grpc.server.stream\_messages\_received.%{service}.%{method} | counter | The number of stream messages received. |
| grpc.server.stream\_messages\_sent.%{service}.%{method} | counter | The number of stream messages sent. |
| grpc.server.stream\_request\_duration.%{service}.%{method}.%{code} | histogram | The time to complete a stream request. |
| grpc.server.stream\_requests\_completed.%{service}.%{method}.%{code} | counter | The number of stream requests completed. |
| grpc.server.stream\_requests\_received.%{service}.%{method} | counter | The number of stream requests received. |
| grpc.server.unary\_request\_duration.%{service}.%{method}.%{code} | histogram | The time to complete a unary request. |
| grpc.server.unary\_requests\_completed.%{service}.%{method}.%{code} | counter | The number of unary requests completed. |
| grpc.server.unary\_requests\_received.%{service}.%{method} | counter | The number of unary requests received. |
| ledger.blockchain\_height.%{channel} | gauge | Height of the chain in blocks. |
| ledger.blockstorage\_commit\_time.%{channel} | histogram | Time taken in seconds for committing the block to storage. |
| logging.entries\_checked.%{level} | counter | Number of log entries checked against the active logging level |
| logging.entries\_written.%{level} | counter | Number of log entries that are written |
## Peer Metrics
### Prometheus
The following peer metrics are exported for consumption by Prometheus.
| Name | Type | Description | Labels | |
| ------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------ | --------- | |
| chaincode\_execute\_timeouts | counter | The number of chaincode executions (Init or Invoke) that have timed out. | chaincode | |
| chaincode\_launch\_duration | histogram | The time to launch a chaincode. | chaincode | |
| success | | | | |
| chaincode\_launch\_failures | counter | The number of chaincode launches that have failed. | chaincode | |
| chaincode\_launch\_timeouts | counter | The number of chaincode launches that have timed out. | chaincode | |
| chaincode\_shim\_request\_duration | histogram | The time to complete chaincode shim requests. | type | |
| channel | | | | |
| chaincode | | | | |
| success | | | | |
| chaincode\_shim\_requests\_completed | counter | The number of chaincode shim requests completed. | type | |
| channel | | | | |
| chaincode | | | | |
| success | | | | |
| chaincode\_shim\_requests\_received | counter | The number of chaincode shim requests received. | type | |
| channel | | | | |
| chaincode | | | | |
| couchdb\_processing\_time | histogram | Time taken in seconds for the function to complete request to CouchDB | database | |
| function\_name | | | | |
| result | | | | |
| deliver\_blocks\_sent | counter | The number of blocks sent by the deliver service. | channel | |
| filtered | | | | |
| data\_type | | | | |
| deliver\_requests\_completed | counter | The number of deliver requests that have been completed. | channel | |
| filtered | | | | |
| data\_type | | | | |
| success | | | | |
| deliver\_requests\_received | counter | The number of deliver requests that have been received. | channel | |
| filtered | | | | |
| data\_type | | | | |
| deliver\_streams\_closed | counter | The number of GRPC streams that have been closed for the deliver service. | | |
| deliver\_streams\_opened | counter | The number of GRPC streams that have been opened for the deliver service. | | |
| dockercontroller\_chaincode\_container\_build\_duration | histogram | The time to build a chaincode image in seconds. | chaincode | |
| success | | | | |
| endorser\_chaincode\_instantiation\_failures | counter | The number of chaincode instantiations or upgrade that have failed. | channel | |
| chaincode | | | | |
| endorser\_duplicate\_transaction\_failures | counter | The number of failed proposals due to duplicate transaction ID. | channel | |
| chaincode | | | | |
| endorser\_endorsement\_failures | counter | The number of failed endorsements. | channel | |
| chaincode | | | | |
| chaincodeerror | | | | |
| endorser\_proposal\_acl\_failures | counter | The number of proposals that failed ACL checks. | channel | |
| chaincode | | | | |
| endorser\_proposal\_duration | histogram | The time to complete a proposal. | channel | |
| chaincode | | | | |
| success | | | | |
| endorser\_proposal\_simulation\_failures | counter | The number of failed proposal simulations | channel | |
| chaincode | | | | |
| endorser\_proposal\_validation\_failures | counter | The number of proposals that have failed initial validation. | | |
| endorser\_proposals\_received | counter | The number of proposals received. | | |
| endorser\_successful\_proposals | counter | The number of successful proposals. | | |
| fabric\_version | gauge | The active version of Fabric. | version | |
| gossip\_comm\_messages\_received | counter | Number of messages received | | |
| gossip\_comm\_messages\_sent | counter | Number of messages sent | | |
| gossip\_comm\_overflow\_count | counter | Number of outgoing queue buffer overflows | | |
| gossip\_leader\_election\_leader | gauge | Peer is leader (1) or follower (0) | channel | |
| gossip\_membership\_total\_peers\_known | gauge | Total known peers | channel | |
| gossip\_payload\_buffer\_size | gauge | Size of the payload buffer | channel | |
| gossip\_privdata\_commit\_block\_duration | histogram | Time it takes to commit private data and the corresponding block (in seconds) | channel | |
| gossip\_privdata\_fetch\_duration | histogram | Time it takes to fetch missing private data from peers (in seconds) | channel | |
| gossip\_privdata\_list\_missing\_duration | histogram | Time it takes to list the missing private data (in seconds) | channel | |
| gossip\_privdata\_pull\_duration | histogram | Time it takes to pull a missing private data element (in seconds) | channel | |
| gossip\_privdata\_purge\_duration | histogram | Time it takes to purge private data (in seconds) | channel | |
| gossip\_privdata\_reconciliation\_duration | histogram | Time it takes for reconciliation to complete (in seconds) | channel | |
| gossip\_privdata\_retrieve\_duration | histogram | Time it takes to retrieve missing private data elements from the ledger (in seconds) | channel | |
| gossip\_privdata\_send\_duration | histogram | Time it takes to send a missing private data element (in seconds) | channel | |
| gossip\_privdata\_validation\_duration | histogram | Time it takes to validate a block (in seconds) | channel | |
| gossip\_state\_commit\_duration | histogram | Time it takes to commit a block in seconds | channel | |
| gossip\_state\_height | gauge | Current ledger height | channel | |
| grpc\_comm\_conn\_closed | counter | gRPC connections closed. Open minus closed is the active number of connections. | | |
| grpc\_comm\_conn\_opened | counter | gRPC connections opened. Open minus closed is the active number of connections. | | |
| grpc\_server\_stream\_messages\_received | counter | The number of stream messages received. | service | |
| method | | | | |
| grpc\_server\_stream\_messages\_sent | counter | The number of stream messages sent. | service | |
| method | | | | |
| grpc\_server\_stream\_request\_duration | histogram | The time to complete a stream request. | service | |
| method | | | | |
| code | | | | |
| grpc\_server\_stream\_requests\_completed | counter | The number of stream requests completed. | service | |
| method | | | | |
| code | | | | |
| grpc\_server\_stream\_requests\_received | counter | The number of stream requests received. | service | |
| method | | | | |
| grpc\_server\_unary\_request\_duration | histogram | The time to complete a unary request. | service | |
| method | | | | |
| code | | | | |
| grpc\_server\_unary\_requests\_completed | counter | The number of unary requests completed. | service | |
| method | | | | |
| code | | | | |
| grpc\_server\_unary\_requests\_received | counter | The number of unary requests received. | service | |
| method | | | | |
| ledger\_block\_processing\_time | histogram | Time taken in seconds for ledger block processing. | channel | |
| ledger\_blockchain\_height | gauge | Height of the chain in blocks. | channel | |
| ledger\_blockstorage\_and\_pvtdata\_commit\_time | histogram | Time taken in seconds for committing the block and private data to storage. | channel | |
| ledger\_blockstorage\_commit\_time | histogram | Time taken in seconds for committing the block to storage. | channel | |
| ledger\_statedb\_commit\_time | histogram | Time taken in seconds for committing block changes to state db. | channel | |
| ledger\_transaction\_count | counter | Number of transactions processed. | channel | |
| transaction\_type | | | | |
| chaincode | | | | |
| validation\_code | | | | |
| logging\_entries\_checked | counter | Number of log entries checked against the active logging level | level | |
| logging\_entries\_written | counter | Number of log entries that are written | level | |
### StatsD
The following peer metrics are emitted for consumption by StatsD. The `%{variable_name}` nomenclature represents segments that vary based on context.
For example, `%{channel}` will be replaced with the name of the channel associated with the metric.
| Bucket | Type | Description |
| ------------------------------------------------------------------------------------------ | --------- | ------------------------------------------------------------------------------------ |
| chaincode.execute\_timeouts.%{chaincode} | counter | The number of chaincode executions (Init or Invoke) that have timed out. |
| chaincode.launch\_duration.%{chaincode}.%{success} | histogram | The time to launch a chaincode. |
| chaincode.launch\_failures.%{chaincode} | counter | The number of chaincode launches that have failed. |
| chaincode.launch\_timeouts.%{chaincode} | counter | The number of chaincode launches that have timed out. |
| chaincode.shim\_request\_duration.%{type}.%{channel}.%{chaincode}.%{success} | histogram | The time to complete chaincode shim requests. |
| chaincode.shim\_requests\_completed.%{type}.%{channel}.%{chaincode}.%{success} | counter | The number of chaincode shim requests completed. |
| chaincode.shim\_requests\_received.%{type}.%{channel}.%{chaincode} | counter | The number of chaincode shim requests received. |
| couchdb.processing\_time.%{database}.%{function\_name}.%{result} | histogram | Time taken in seconds for the function to complete request to CouchDB |
| deliver.blocks\_sent.%{channel}.%{filtered}.%{data\_type} | counter | The number of blocks sent by the deliver service. |
| deliver.requests\_completed.%{channel}.%{filtered}.%{data\_type}.%{success} | counter | The number of deliver requests that have been completed. |
| deliver.requests\_received.%{channel}.%{filtered}.%{data\_type} | counter | The number of deliver requests that have been received. |
| deliver.streams\_closed | counter | The number of GRPC streams that have been closed for the deliver service. |
| deliver.streams\_opened | counter | The number of GRPC streams that have been opened for the deliver service. |
| dockercontroller.chaincode\_container\_build\_duration.%{chaincode}.%{success} | histogram | The time to build a chaincode image in seconds. |
| endorser.chaincode\_instantiation\_failures.%{channel}.%{chaincode} | counter | The number of chaincode instantiations or upgrade that have failed. |
| endorser.duplicate\_transaction\_failures.%{channel}.%{chaincode} | counter | The number of failed proposals due to duplicate transaction ID. |
| endorser.endorsement\_failures.%{channel}.%{chaincode}.%{chaincodeerror} | counter | The number of failed endorsements. |
| endorser.proposal\_acl\_failures.%{channel}.%{chaincode} | counter | The number of proposals that failed ACL checks. |
| endorser.proposal\_duration.%{channel}.%{chaincode}.%{success} | histogram | The time to complete a proposal. |
| endorser.proposal\_simulation\_failures.%{channel}.%{chaincode} | counter | The number of failed proposal simulations |
| endorser.proposal\_validation\_failures | counter | The number of proposals that have failed initial validation. |
| endorser.proposals\_received | counter | The number of proposals received. |
| endorser.successful\_proposals | counter | The number of successful proposals. |
| fabric\_version.%{version} | gauge | The active version of Fabric. |
| gossip.comm.messages\_received | counter | Number of messages received |
| gossip.comm.messages\_sent | counter | Number of messages sent |
| gossip.comm.overflow\_count | counter | Number of outgoing queue buffer overflows |
| gossip.leader\_election.leader.%{channel} | gauge | Peer is leader (1) or follower (0) |
| gossip.membership.total\_peers\_known.%{channel} | gauge | Total known peers |
| gossip.payload\_buffer.size.%{channel} | gauge | Size of the payload buffer |
| gossip.privdata.commit\_block\_duration.%{channel} | histogram | Time it takes to commit private data and the corresponding block (in seconds) |
| gossip.privdata.fetch\_duration.%{channel} | histogram | Time it takes to fetch missing private data from peers (in seconds) |
| gossip.privdata.list\_missing\_duration.%{channel} | histogram | Time it takes to list the missing private data (in seconds) |
| gossip.privdata.pull\_duration.%{channel} | histogram | Time it takes to pull a missing private data element (in seconds) |
| gossip.privdata.purge\_duration.%{channel} | histogram | Time it takes to purge private data (in seconds) |
| gossip.privdata.reconciliation\_duration.%{channel} | histogram | Time it takes for reconciliation to complete (in seconds) |
| gossip.privdata.retrieve\_duration.%{channel} | histogram | Time it takes to retrieve missing private data elements from the ledger (in seconds) |
| gossip.privdata.send\_duration.%{channel} | histogram | Time it takes to send a missing private data element (in seconds) |
| gossip.privdata.validation\_duration.%{channel} | histogram | Time it takes to validate a block (in seconds) |
| gossip.state.commit\_duration.%{channel} | histogram | Time it takes to commit a block in seconds |
| gossip.state.height.%{channel} | gauge | Current ledger height |
| grpc.comm.conn\_closed | counter | gRPC connections closed. Open minus closed is the active number of connections. |
| grpc.comm.conn\_opened | counter | gRPC connections opened. Open minus closed is the active number of connections. |
| grpc.server.stream\_messages\_received.%{service}.%{method} | counter | The number of stream messages received. |
| grpc.server.stream\_messages\_sent.%{service}.%{method} | counter | The number of stream messages sent. |
| grpc.server.stream\_request\_duration.%{service}.%{method}.%{code} | histogram | The time to complete a stream request. |
| grpc.server.stream\_requests\_completed.%{service}.%{method}.%{code} | counter | The number of stream requests completed. |
| grpc.server.stream\_requests\_received.%{service}.%{method} | counter | The number of stream requests received. |
| grpc.server.unary\_request\_duration.%{service}.%{method}.%{code} | histogram | The time to complete a unary request. |
| grpc.server.unary\_requests\_completed.%{service}.%{method}.%{code} | counter | The number of unary requests completed. |
| grpc.server.unary\_requests\_received.%{service}.%{method} | counter | The number of unary requests received. |
| ledger.block\_processing\_time.%{channel} | histogram | Time taken in seconds for ledger block processing. |
| ledger.blockchain\_height.%{channel} | gauge | Height of the chain in blocks. |
| ledger.blockstorage\_and\_pvtdata\_commit\_time.%{channel} | histogram | Time taken in seconds for committing the block and private data to storage. |
| ledger.blockstorage\_commit\_time.%{channel} | histogram | Time taken in seconds for committing the block to storage. |
| ledger.statedb\_commit\_time.%{channel} | histogram | Time taken in seconds for committing block changes to state db. |
| ledger.transaction\_count.%{channel}.%{transaction\_type}.%{chaincode}.%{validation\_code} | counter | Number of transactions processed. |
| logging.entries\_checked.%{level} | counter | Number of log entries checked against the active logging level |
| logging.entries\_written.%{level} | counter | Number of log entries that are written |