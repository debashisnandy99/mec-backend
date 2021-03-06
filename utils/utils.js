const rimraf = require("rimraf");
const ipfsClient = require('ipfs-http-client');
const User = require("../models/user");

const Web3 = require('web3');


exports.getDocuments = async (department) => {
  if (department == "adhaar") {
    return await User.find({
      avStatus: 'pending',
    }).select({
      adhaar: 1,
      name: 1,
      dob: 1,
      fathersName: 1,
      mothersName: 1,
      address: 1,
      phone: 1,
      photo: 1
    });
  } else if (department == "pan") {
    return await User.find({
      pvStatus: 'pending',
    }).select({
      adhaar: 1,
      name: 1,
      dob: 1,
      fathersName: 1,
      mothersName: 1,
      address: 1,
      phone: 1,
      photo: 1
    });
  }

  return await User.find({
    pvStatus: 'verified',
    avStatus: 'verified',
  });
};

exports.startVerification = (department, userId, status, res, next) => {

  if (department == "adhaar") {
    User.updateOne({
      _id: userId
    }, {
      avStatus: status ? 'verified' : 'fail'
    }, function (err, raw) {
      if (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      } else {
        res.status(200).json({
          message: "Verified successfully.",
        });
      }
    });
  } else if (department == "pan") {
    User.updateOne({
      _id: userId
    }, {
      pvStatus: status ? 'verified' : 'fail'
    }, function (err, raw) {
      if (err) {
        if (!err.statusCode) {
          err.statusCode = 500;
        }
        next(err);
      } else {
        res.status(200).json({
          message: "Verified successfully.",
        });
      }
    });


  } else {

    addToIpfs(userId, res, next);


  }


}

const addToIpfs = async (uid, res, next) => {

  const user = await User.findOne({
    _id: uid,
  }).select({
    email: 1
  });
  console.log(user.email);

  const ipfs = ipfsClient('http://ipfs:5001');
  const {
    globSource
  } = ipfsClient;

  ipfs.add(globSource('./images/' + user.email, {
      recursive: true
    })).then(file => {
      console.log(file.cid);
      rimraf('./images/' + user.email, function () {

        res.status(200).json({
          message: "Verifier",
        });
      });
      web3 = new Web3(new Web3.providers.HttpProvider("http://ganache:8545"));
      web3.eth.defaultAccount = web3.eth.accounts[0];
      var TruffleContract = web3.eth.contract({
        "contractName": "FileHash",
        "abi": [{
            "constant": false,
            "inputs": [{
              "internalType": "string",
              "name": "_x",
              "type": "string"
            }],
            "name": "setFileHash",
            "outputs": [],
            "payable": false,
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "constant": true,
            "inputs": [],
            "name": "getFileHash",
            "outputs": [{
              "internalType": "string",
              "name": "",
              "type": "string"
            }],
            "payable": false,
            "stateMutability": "view",
            "type": "function"
          }
        ],
        "metadata": "{\"compiler\":{\"version\":\"0.5.16+commit.9c3226ce\"},\"language\":\"Solidity\",\"output\":{\"abi\":[{\"constant\":true,\"inputs\":[],\"name\":\"getFileHash\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"string\",\"name\":\"_x\",\"type\":\"string\"}],\"name\":\"setFileHash\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"}],\"devdoc\":{\"methods\":{}},\"userdoc\":{\"methods\":{}}},\"settings\":{\"compilationTarget\":{\"/E/clientsaslab/blockchain/smart contract/contracts/FileHash.sol\":\"FileHash\"},\"evmVersion\":\"istanbul\",\"libraries\":{},\"optimizer\":{\"enabled\":false,\"runs\":200},\"remappings\":[]},\"sources\":{\"/E/clientsaslab/blockchain/smart contract/contracts/FileHash.sol\":{\"keccak256\":\"0xbe09f58fc81ac7d7d37a729ddf5707faf5156fc6359694edc13fff9655a92190\",\"urls\":[\"bzz-raw://836edf04039baf9b0c131b4a583d9f206370ac6ffbead8044a8fd1aef761697f\",\"dweb:/ipfs/Qmb1xKc1FPmjCJpbxWah1YseXXMs3VzJkduqcubYLjoV5V\"]}},\"version\":1}",
        "bytecode": "0x608060405234801561001057600080fd5b5061030f806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c80638493f71f1461003b578063aaf6c740146100be575b600080fd5b610043610179565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610083578082015181840152602081019050610068565b50505050905090810190601f1680156100b05780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b610177600480360360208110156100d457600080fd5b81019080803590602001906401000000008111156100f157600080fd5b82018360208201111561010357600080fd5b8035906020019184600183028401116401000000008311171561012557600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050919291929050505061021b565b005b606060008054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156102115780601f106101e657610100808354040283529160200191610211565b820191906000526020600020905b8154815290600101906020018083116101f457829003601f168201915b5050505050905090565b8060009080519060200190610231929190610235565b5050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061027657805160ff19168380011785556102a4565b828001600101855582156102a4579182015b828111156102a3578251825591602001919060010190610288565b5b5090506102b191906102b5565b5090565b6102d791905b808211156102d35760008160009055506001016102bb565b5090565b9056fea265627a7a723158201e24149f33c0c0b613743c51f18470fa30e8f38730bacabd4b10b47c3fd3037d64736f6c63430005100032",
        "deployedBytecode": "0x608060405234801561001057600080fd5b50600436106100365760003560e01c80638493f71f1461003b578063aaf6c740146100be575b600080fd5b610043610179565b6040518080602001828103825283818151815260200191508051906020019080838360005b83811015610083578082015181840152602081019050610068565b50505050905090810190601f1680156100b05780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b610177600480360360208110156100d457600080fd5b81019080803590602001906401000000008111156100f157600080fd5b82018360208201111561010357600080fd5b8035906020019184600183028401116401000000008311171561012557600080fd5b91908080601f016020809104026020016040519081016040528093929190818152602001838380828437600081840152601f19601f82011690508083019250505050505050919291929050505061021b565b005b606060008054600181600116156101000203166002900480601f0160208091040260200160405190810160405280929190818152602001828054600181600116156101000203166002900480156102115780601f106101e657610100808354040283529160200191610211565b820191906000526020600020905b8154815290600101906020018083116101f457829003601f168201915b5050505050905090565b8060009080519060200190610231929190610235565b5050565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f1061027657805160ff19168380011785556102a4565b828001600101855582156102a4579182015b828111156102a3578251825591602001919060010190610288565b5b5090506102b191906102b5565b5090565b6102d791905b808211156102d35760008160009055506001016102bb565b5090565b9056fea265627a7a723158201e24149f33c0c0b613743c51f18470fa30e8f38730bacabd4b10b47c3fd3037d64736f6c63430005100032",
        "sourceMap": "69:231:0:-;;;;8:9:-1;5:2;;;30:1;27;20:12;5:2;69:231:0;;;;;;;",
        "deployedSourceMap": "69:231:0:-;;;;8:9:-1;5:2;;;30:1;27;20:12;5:2;69:231:0;;;;;;;;;;;;;;;;;;;;;;;;204:93;;;:::i;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;23:1:-1;8:100;33:3;30:1;27:10;8:100;;;99:1;94:3;90:11;84:18;80:1;75:3;71:11;64:39;52:2;49:1;45:10;40:15;;8:100;;;12:14;204:93:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;118:78;;;;;;13:2:-1;8:3;5:11;2:2;;;29:1;26;19:12;2:2;118:78:0;;;;;;;;;;21:11:-1;8;5:28;2:2;;;46:1;43;36:12;2:2;118:78:0;;35:9:-1;28:4;12:14;8:25;5:40;2:2;;;58:1;55;48:12;2:2;118:78:0;;;;;;100:9:-1;95:1;81:12;77:20;67:8;63:35;60:50;39:11;25:12;22:29;11:107;8:2;;;131:1;128;121:12;8:2;118:78:0;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;30:3:-1;22:6;14;1:33;99:1;93:3;85:6;81:16;74:27;137:4;133:9;126:4;121:3;117:14;113:30;106:37;;169:3;161:6;157:16;147:26;;118:78:0;;;;;;;;;;;;;;;:::i;:::-;;204:93;248:13;281:8;274:15;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;204:93;:::o;118:78::-;186:2;175:8;:13;;;;;;;;;;;;:::i;:::-;;118:78;:::o;69:231::-;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;:::i;:::-;;;:::o;:::-;;;;;;;;;;;;;;;;;;;;;;;;;;;:::o",
        "source": "// SPDX-License-Identifier: MIT\r\npragma solidity >=0.4.22 <0.9.0;\r\n\r\ncontract FileHash {\r\n    string fileHash;\r\n\r\n    function setFileHash(string memory _x) public {\r\n        fileHash = _x;\r\n    }\r\n\r\n    function getFileHash() public view returns (string memory) {\r\n        return fileHash;\r\n    }\r\n}",
        "sourcePath": "E:/clientsaslab/blockchain/smart contract/contracts/FileHash.sol",
        "ast": {
          "absolutePath": "/E/clientsaslab/blockchain/smart contract/contracts/FileHash.sol",
          "exportedSymbols": {
            "FileHash": [
              22
            ]
          },
          "id": 23,
          "nodeType": "SourceUnit",
          "nodes": [{
              "id": 1,
              "literals": [
                "solidity",
                ">=",
                "0.4",
                ".22",
                "<",
                "0.9",
                ".0"
              ],
              "nodeType": "PragmaDirective",
              "src": "33:32:0"
            },
            {
              "baseContracts": [],
              "contractDependencies": [],
              "contractKind": "contract",
              "documentation": null,
              "fullyImplemented": true,
              "id": 22,
              "linearizedBaseContracts": [
                22
              ],
              "name": "FileHash",
              "nodeType": "ContractDefinition",
              "nodes": [{
                  "constant": false,
                  "id": 3,
                  "name": "fileHash",
                  "nodeType": "VariableDeclaration",
                  "scope": 22,
                  "src": "94:15:0",
                  "stateVariable": true,
                  "storageLocation": "default",
                  "typeDescriptions": {
                    "typeIdentifier": "t_string_storage",
                    "typeString": "string"
                  },
                  "typeName": {
                    "id": 2,
                    "name": "string",
                    "nodeType": "ElementaryTypeName",
                    "src": "94:6:0",
                    "typeDescriptions": {
                      "typeIdentifier": "t_string_storage_ptr",
                      "typeString": "string"
                    }
                  },
                  "value": null,
                  "visibility": "internal"
                },
                {
                  "body": {
                    "id": 12,
                    "nodeType": "Block",
                    "src": "164:32:0",
                    "statements": [{
                      "expression": {
                        "argumentTypes": null,
                        "id": 10,
                        "isConstant": false,
                        "isLValue": false,
                        "isPure": false,
                        "lValueRequested": false,
                        "leftHandSide": {
                          "argumentTypes": null,
                          "id": 8,
                          "name": "fileHash",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 3,
                          "src": "175:8:0",
                          "typeDescriptions": {
                            "typeIdentifier": "t_string_storage",
                            "typeString": "string storage ref"
                          }
                        },
                        "nodeType": "Assignment",
                        "operator": "=",
                        "rightHandSide": {
                          "argumentTypes": null,
                          "id": 9,
                          "name": "_x",
                          "nodeType": "Identifier",
                          "overloadedDeclarations": [],
                          "referencedDeclaration": 5,
                          "src": "186:2:0",
                          "typeDescriptions": {
                            "typeIdentifier": "t_string_memory_ptr",
                            "typeString": "string memory"
                          }
                        },
                        "src": "175:13:0",
                        "typeDescriptions": {
                          "typeIdentifier": "t_string_storage",
                          "typeString": "string storage ref"
                        }
                      },
                      "id": 11,
                      "nodeType": "ExpressionStatement",
                      "src": "175:13:0"
                    }]
                  },
                  "documentation": null,
                  "id": 13,
                  "implemented": true,
                  "kind": "function",
                  "modifiers": [],
                  "name": "setFileHash",
                  "nodeType": "FunctionDefinition",
                  "parameters": {
                    "id": 6,
                    "nodeType": "ParameterList",
                    "parameters": [{
                      "constant": false,
                      "id": 5,
                      "name": "_x",
                      "nodeType": "VariableDeclaration",
                      "scope": 13,
                      "src": "139:16:0",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_string_memory_ptr",
                        "typeString": "string"
                      },
                      "typeName": {
                        "id": 4,
                        "name": "string",
                        "nodeType": "ElementaryTypeName",
                        "src": "139:6:0",
                        "typeDescriptions": {
                          "typeIdentifier": "t_string_storage_ptr",
                          "typeString": "string"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }],
                    "src": "138:18:0"
                  },
                  "returnParameters": {
                    "id": 7,
                    "nodeType": "ParameterList",
                    "parameters": [],
                    "src": "164:0:0"
                  },
                  "scope": 22,
                  "src": "118:78:0",
                  "stateMutability": "nonpayable",
                  "superFunction": null,
                  "visibility": "public"
                },
                {
                  "body": {
                    "id": 20,
                    "nodeType": "Block",
                    "src": "263:34:0",
                    "statements": [{
                      "expression": {
                        "argumentTypes": null,
                        "id": 18,
                        "name": "fileHash",
                        "nodeType": "Identifier",
                        "overloadedDeclarations": [],
                        "referencedDeclaration": 3,
                        "src": "281:8:0",
                        "typeDescriptions": {
                          "typeIdentifier": "t_string_storage",
                          "typeString": "string storage ref"
                        }
                      },
                      "functionReturnParameters": 17,
                      "id": 19,
                      "nodeType": "Return",
                      "src": "274:15:0"
                    }]
                  },
                  "documentation": null,
                  "id": 21,
                  "implemented": true,
                  "kind": "function",
                  "modifiers": [],
                  "name": "getFileHash",
                  "nodeType": "FunctionDefinition",
                  "parameters": {
                    "id": 14,
                    "nodeType": "ParameterList",
                    "parameters": [],
                    "src": "224:2:0"
                  },
                  "returnParameters": {
                    "id": 17,
                    "nodeType": "ParameterList",
                    "parameters": [{
                      "constant": false,
                      "id": 16,
                      "name": "",
                      "nodeType": "VariableDeclaration",
                      "scope": 21,
                      "src": "248:13:0",
                      "stateVariable": false,
                      "storageLocation": "memory",
                      "typeDescriptions": {
                        "typeIdentifier": "t_string_memory_ptr",
                        "typeString": "string"
                      },
                      "typeName": {
                        "id": 15,
                        "name": "string",
                        "nodeType": "ElementaryTypeName",
                        "src": "248:6:0",
                        "typeDescriptions": {
                          "typeIdentifier": "t_string_storage_ptr",
                          "typeString": "string"
                        }
                      },
                      "value": null,
                      "visibility": "internal"
                    }],
                    "src": "247:15:0"
                  },
                  "scope": 22,
                  "src": "204:93:0",
                  "stateMutability": "view",
                  "superFunction": null,
                  "visibility": "public"
                }
              ],
              "scope": 23,
              "src": "69:231:0"
            }
          ],
          "src": "33:267:0"
        },
        "legacyAST": {
          "attributes": {
            "absolutePath": "/E/clientsaslab/blockchain/smart contract/contracts/FileHash.sol",
            "exportedSymbols": {
              "FileHash": [
                22
              ]
            }
          },
          "children": [{
              "attributes": {
                "literals": [
                  "solidity",
                  ">=",
                  "0.4",
                  ".22",
                  "<",
                  "0.9",
                  ".0"
                ]
              },
              "id": 1,
              "name": "PragmaDirective",
              "src": "33:32:0"
            },
            {
              "attributes": {
                "baseContracts": [
                  null
                ],
                "contractDependencies": [
                  null
                ],
                "contractKind": "contract",
                "documentation": null,
                "fullyImplemented": true,
                "linearizedBaseContracts": [
                  22
                ],
                "name": "FileHash",
                "scope": 23
              },
              "children": [{
                  "attributes": {
                    "constant": false,
                    "name": "fileHash",
                    "scope": 22,
                    "stateVariable": true,
                    "storageLocation": "default",
                    "type": "string",
                    "value": null,
                    "visibility": "internal"
                  },
                  "children": [{
                    "attributes": {
                      "name": "string",
                      "type": "string"
                    },
                    "id": 2,
                    "name": "ElementaryTypeName",
                    "src": "94:6:0"
                  }],
                  "id": 3,
                  "name": "VariableDeclaration",
                  "src": "94:15:0"
                },
                {
                  "attributes": {
                    "documentation": null,
                    "implemented": true,
                    "isConstructor": false,
                    "kind": "function",
                    "modifiers": [
                      null
                    ],
                    "name": "setFileHash",
                    "scope": 22,
                    "stateMutability": "nonpayable",
                    "superFunction": null,
                    "visibility": "public"
                  },
                  "children": [{
                      "children": [{
                        "attributes": {
                          "constant": false,
                          "name": "_x",
                          "scope": 13,
                          "stateVariable": false,
                          "storageLocation": "memory",
                          "type": "string",
                          "value": null,
                          "visibility": "internal"
                        },
                        "children": [{
                          "attributes": {
                            "name": "string",
                            "type": "string"
                          },
                          "id": 4,
                          "name": "ElementaryTypeName",
                          "src": "139:6:0"
                        }],
                        "id": 5,
                        "name": "VariableDeclaration",
                        "src": "139:16:0"
                      }],
                      "id": 6,
                      "name": "ParameterList",
                      "src": "138:18:0"
                    },
                    {
                      "attributes": {
                        "parameters": [
                          null
                        ]
                      },
                      "children": [],
                      "id": 7,
                      "name": "ParameterList",
                      "src": "164:0:0"
                    },
                    {
                      "children": [{
                        "children": [{
                          "attributes": {
                            "argumentTypes": null,
                            "isConstant": false,
                            "isLValue": false,
                            "isPure": false,
                            "lValueRequested": false,
                            "operator": "=",
                            "type": "string storage ref"
                          },
                          "children": [{
                              "attributes": {
                                "argumentTypes": null,
                                "overloadedDeclarations": [
                                  null
                                ],
                                "referencedDeclaration": 3,
                                "type": "string storage ref",
                                "value": "fileHash"
                              },
                              "id": 8,
                              "name": "Identifier",
                              "src": "175:8:0"
                            },
                            {
                              "attributes": {
                                "argumentTypes": null,
                                "overloadedDeclarations": [
                                  null
                                ],
                                "referencedDeclaration": 5,
                                "type": "string memory",
                                "value": "_x"
                              },
                              "id": 9,
                              "name": "Identifier",
                              "src": "186:2:0"
                            }
                          ],
                          "id": 10,
                          "name": "Assignment",
                          "src": "175:13:0"
                        }],
                        "id": 11,
                        "name": "ExpressionStatement",
                        "src": "175:13:0"
                      }],
                      "id": 12,
                      "name": "Block",
                      "src": "164:32:0"
                    }
                  ],
                  "id": 13,
                  "name": "FunctionDefinition",
                  "src": "118:78:0"
                },
                {
                  "attributes": {
                    "documentation": null,
                    "implemented": true,
                    "isConstructor": false,
                    "kind": "function",
                    "modifiers": [
                      null
                    ],
                    "name": "getFileHash",
                    "scope": 22,
                    "stateMutability": "view",
                    "superFunction": null,
                    "visibility": "public"
                  },
                  "children": [{
                      "attributes": {
                        "parameters": [
                          null
                        ]
                      },
                      "children": [],
                      "id": 14,
                      "name": "ParameterList",
                      "src": "224:2:0"
                    },
                    {
                      "children": [{
                        "attributes": {
                          "constant": false,
                          "name": "",
                          "scope": 21,
                          "stateVariable": false,
                          "storageLocation": "memory",
                          "type": "string",
                          "value": null,
                          "visibility": "internal"
                        },
                        "children": [{
                          "attributes": {
                            "name": "string",
                            "type": "string"
                          },
                          "id": 15,
                          "name": "ElementaryTypeName",
                          "src": "248:6:0"
                        }],
                        "id": 16,
                        "name": "VariableDeclaration",
                        "src": "248:13:0"
                      }],
                      "id": 17,
                      "name": "ParameterList",
                      "src": "247:15:0"
                    },
                    {
                      "children": [{
                        "attributes": {
                          "functionReturnParameters": 17
                        },
                        "children": [{
                          "attributes": {
                            "argumentTypes": null,
                            "overloadedDeclarations": [
                              null
                            ],
                            "referencedDeclaration": 3,
                            "type": "string storage ref",
                            "value": "fileHash"
                          },
                          "id": 18,
                          "name": "Identifier",
                          "src": "281:8:0"
                        }],
                        "id": 19,
                        "name": "Return",
                        "src": "274:15:0"
                      }],
                      "id": 20,
                      "name": "Block",
                      "src": "263:34:0"
                    }
                  ],
                  "id": 21,
                  "name": "FunctionDefinition",
                  "src": "204:93:0"
                }
              ],
              "id": 22,
              "name": "ContractDefinition",
              "src": "69:231:0"
            }
          ],
          "id": 23,
          "name": "SourceUnit",
          "src": "33:267:0"
        },
        "compiler": {
          "name": "solc",
          "version": "0.5.16+commit.9c3226ce.Emscripten.clang"
        },
        "networks": {},
        "schemaVersion": "3.3.4",
        "updatedAt": "2021-03-06T00:50:45.697Z",
        "devdoc": {
          "methods": {}
        },
        "userdoc": {
          "methods": {}
        }
      });

      var fileHash = TruffleContract.at('CONTRACT ADDRESS HERE');
      fileHash.methods.setFileHash(file.cid).call({
        from: web3.eth.accounts[0].toString()
      }).on('transactionHash', function (hash) {
        console.log(hash);
      });

    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });

}