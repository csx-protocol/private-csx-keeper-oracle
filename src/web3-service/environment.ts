/* eslint-disable prettier/prettier */

import { config } from 'dotenv';
config();

export const environment = {
  database : {
    host: process.env.DBHOST,
    port: process.env.DBPORT,
    username: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DBNAME,
  },
  wallet: {
    key: process.env.WALLETKEY,
    rpcUrl: process.env.PROVIDER,
  },
  contractFactory: {
    address: '0xcCd04FB4A854e4aDB63Be5de4D3332bEF9BC1A07',
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_keepers",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_users",
            "type": "address"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "enum TradeStatus",
            "name": "",
            "type": "uint8"
          },
          {
            "indexed": false,
            "internalType": "string",
            "name": "data",
            "type": "string"
          }
        ],
        "name": "TradeContractStatusChange",
        "type": "event"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "name": "assetIdFromUserAddrssToTradeAddrss",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_assetId",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "sellerAddrss",
            "type": "address"
          }
        ],
        "name": "hasAlreadyListedItem",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "contractAddress",
            "type": "address"
          }
        ],
        "name": "isThisTradeContract",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      },
      {
        "inputs": [],
        "name": "keepersContract",
        "outputs": [
          {
            "internalType": "contract IKeepers",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      },
      {
        "inputs": [
          {
            "internalType": "enum TradeStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "data",
            "type": "string"
          }
        ],
        "name": "onStatusChange",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_assetId",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "sellerAddrss",
            "type": "address"
          }
        ],
        "name": "removeAssetIdUsed",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "totalContracts",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      },
      {
        "inputs": [],
        "name": "usersContract",
        "outputs": [
          {
            "internalType": "contract IUsers",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_itemMarketName",
            "type": "string"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "partner",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "token",
                "type": "string"
              }
            ],
            "internalType": "struct TradeUrl",
            "name": "_tradeUrl",
            "type": "tuple"
          },
          {
            "internalType": "string",
            "name": "_assetId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_inspectLink",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_itemImageUrl",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "_weiPrice",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "string",
                "name": "value",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "min",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "max",
                "type": "string"
              }
            ],
            "internalType": "struct FloatInfo",
            "name": "_float",
            "type": "tuple"
          },
          {
            "components": [
              {
                "internalType": "string",
                "name": "name",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "material",
                "type": "string"
              },
              {
                "internalType": "uint8",
                "name": "slot",
                "type": "uint8"
              },
              {
                "internalType": "string",
                "name": "imageLink",
                "type": "string"
              }
            ],
            "internalType": "struct Sticker[]",
            "name": "_stickers",
            "type": "tuple[]"
          },
          {
            "internalType": "string",
            "name": "_weaponType",
            "type": "string"
          }
        ],
        "name": "createListingContract",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "index",
            "type": "uint256"
          }
        ],
        "name": "getTradeDetailsByIndex",
        "outputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "contractAddress",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "seller",
                "type": "address"
              },
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "partner",
                    "type": "uint256"
                  },
                  {
                    "internalType": "string",
                    "name": "token",
                    "type": "string"
                  }
                ],
                "internalType": "struct TradeUrl",
                "name": "sellerTradeUrl",
                "type": "tuple"
              },
              {
                "internalType": "address",
                "name": "buyer",
                "type": "address"
              },
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "partner",
                    "type": "uint256"
                  },
                  {
                    "internalType": "string",
                    "name": "token",
                    "type": "string"
                  }
                ],
                "internalType": "struct TradeUrl",
                "name": "buyerTradeUrl",
                "type": "tuple"
              },
              {
                "internalType": "string",
                "name": "itemMarketName",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "inspectLink",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "itemImageUrl",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "weiPrice",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "averageSellerDeliveryTime",
                "type": "uint256"
              },
              {
                "components": [
                  {
                    "internalType": "string",
                    "name": "value",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "min",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "max",
                    "type": "string"
                  }
                ],
                "internalType": "struct FloatInfo",
                "name": "float",
                "type": "tuple"
              },
              {
                "internalType": "enum TradeStatus",
                "name": "status",
                "type": "uint8"
              },
              {
                "components": [
                  {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "material",
                    "type": "string"
                  },
                  {
                    "internalType": "uint8",
                    "name": "slot",
                    "type": "uint8"
                  },
                  {
                    "internalType": "string",
                    "name": "imageLink",
                    "type": "string"
                  }
                ],
                "internalType": "struct Sticker[]",
                "name": "stickers",
                "type": "tuple[]"
              },
              {
                "internalType": "string",
                "name": "weaponType",
                "type": "string"
              }
            ],
            "internalType": "struct TradeInfo",
            "name": "result",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "tradeAddrs",
            "type": "address"
          }
        ],
        "name": "getTradeDetailsByAddress",
        "outputs": [
          {
            "components": [
              {
                "internalType": "address",
                "name": "contractAddress",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "seller",
                "type": "address"
              },
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "partner",
                    "type": "uint256"
                  },
                  {
                    "internalType": "string",
                    "name": "token",
                    "type": "string"
                  }
                ],
                "internalType": "struct TradeUrl",
                "name": "sellerTradeUrl",
                "type": "tuple"
              },
              {
                "internalType": "address",
                "name": "buyer",
                "type": "address"
              },
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "partner",
                    "type": "uint256"
                  },
                  {
                    "internalType": "string",
                    "name": "token",
                    "type": "string"
                  }
                ],
                "internalType": "struct TradeUrl",
                "name": "buyerTradeUrl",
                "type": "tuple"
              },
              {
                "internalType": "string",
                "name": "itemMarketName",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "inspectLink",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "itemImageUrl",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "weiPrice",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "averageSellerDeliveryTime",
                "type": "uint256"
              },
              {
                "components": [
                  {
                    "internalType": "string",
                    "name": "value",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "min",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "max",
                    "type": "string"
                  }
                ],
                "internalType": "struct FloatInfo",
                "name": "float",
                "type": "tuple"
              },
              {
                "internalType": "enum TradeStatus",
                "name": "status",
                "type": "uint8"
              },
              {
                "components": [
                  {
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                  },
                  {
                    "internalType": "string",
                    "name": "material",
                    "type": "string"
                  },
                  {
                    "internalType": "uint8",
                    "name": "slot",
                    "type": "uint8"
                  },
                  {
                    "internalType": "string",
                    "name": "imageLink",
                    "type": "string"
                  }
                ],
                "internalType": "struct Sticker[]",
                "name": "stickers",
                "type": "tuple[]"
              },
              {
                "internalType": "string",
                "name": "weaponType",
                "type": "string"
              }
            ],
            "internalType": "struct TradeInfo",
            "name": "result",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      },
      {
        "inputs": [
          {
            "internalType": "enum TradeStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "indexFrom",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "maxResults",
            "type": "uint256"
          }
        ],
        "name": "getTradeIndexesByStatus",
        "outputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "index",
                "type": "uint256"
              },
              {
                "internalType": "uint256",
                "name": "weiPrice",
                "type": "uint256"
              },
              {
                "internalType": "enum PriceType",
                "name": "priceType",
                "type": "uint8"
              },
              {
                "internalType": "string",
                "name": "weaponType",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "itemMarketName",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "nextIndex",
                "type": "uint256"
              }
            ],
            "internalType": "struct TradeIndex[]",
            "name": "",
            "type": "tuple[]"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      },
      {
        "inputs": [
          {
            "internalType": "enum TradeStatus",
            "name": "status",
            "type": "uint8"
          }
        ],
        "name": "getTradeCountByStatus",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function",
        "constant": true
      }
    ],
  },
  tradeContract: {
    abi: [
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_factory",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_keepers",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_users",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_seller",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_weiPrice",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "_itemMarketName",
            "type": "string"
          },
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "partner",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "token",
                "type": "string"
              }
            ],
            "internalType": "struct TradeUrl",
            "name": "_sellerTradeUrl",
            "type": "tuple"
          },
          {
            "internalType": "string",
            "name": "_sellerAssetId",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_inspectLink",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "_itemImageUrl",
            "type": "string"
          },
          {
            "components": [
              {
                "internalType": "string",
                "name": "value",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "min",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "max",
                "type": "string"
              }
            ],
            "internalType": "struct FloatInfo",
            "name": "_float",
            "type": "tuple"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "buyer",
        "outputs": [
          {
            "internalType": "address payable",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "buyerCommittedTimestamp",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "buyerDeposited",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "buyerTradeUrl",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "partner",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "token",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "disputeComplaint",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "disputedStatus",
        "outputs": [
          {
            "internalType": "enum TradeStatus",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "disputeer",
        "outputs": [
          {
            "internalType": "address",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "factoryContract",
        "outputs": [
          {
            "internalType": "contract ITradeFactory",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "float",
        "outputs": [
          {
            "internalType": "string",
            "name": "value",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "min",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "max",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "hasInit",
        "outputs": [
          {
            "internalType": "bool",
            "name": "",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "inspectLink",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "itemImageUrl",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "itemMarketName",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "itemSellerAssetId",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "keepersContract",
        "outputs": [
          {
            "internalType": "contract IKeepers",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "seller",
        "outputs": [
          {
            "internalType": "address payable",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "sellerTradeUrl",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "partner",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "token",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "status",
        "outputs": [
          {
            "internalType": "enum TradeStatus",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "name": "stickers",
        "outputs": [
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "material",
            "type": "string"
          },
          {
            "internalType": "uint8",
            "name": "slot",
            "type": "uint8"
          },
          {
            "internalType": "string",
            "name": "imageLink",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "usersContract",
        "outputs": [
          {
            "internalType": "contract IUsers",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "weaponType",
        "outputs": [
          {
            "internalType": "string",
            "name": "",
            "type": "string"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "weiPrice",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "string",
                "name": "name",
                "type": "string"
              },
              {
                "internalType": "string",
                "name": "material",
                "type": "string"
              },
              {
                "internalType": "uint8",
                "name": "slot",
                "type": "uint8"
              },
              {
                "internalType": "string",
                "name": "imageLink",
                "type": "string"
              }
            ],
            "internalType": "struct Sticker[]",
            "name": "_stickers",
            "type": "tuple[]"
          },
          {
            "internalType": "string",
            "name": "_weaponType",
            "type": "string"
          }
        ],
        "name": "initExtraInfo",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "stickerLength",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "sellerCancel",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "components": [
              {
                "internalType": "uint256",
                "name": "partner",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "token",
                "type": "string"
              }
            ],
            "internalType": "struct TradeUrl",
            "name": "_buyerTradeUrl",
            "type": "tuple"
          }
        ],
        "name": "commitBuy",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bool",
            "name": "isTradeMade",
            "type": "bool"
          }
        ],
        "name": "keeperNodeConfirmsTrade",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "acceptTradeOffer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "confirmReceived",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "string",
            "name": "_complaint",
            "type": "string"
          }
        ],
        "name": "openDispute",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          {
            "internalType": "bool",
            "name": "isFavourOfBuyer",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "giveWarningToSeller",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "giveWarningToBuyer",
            "type": "bool"
          },
          {
            "internalType": "bool",
            "name": "isWithValue",
            "type": "bool"
          }
        ],
        "name": "resolveDispute",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
  },
};
