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
    address: '0x5aF07A8AfD7b14eab9B9c89fc524CBa68B2CbA36',
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
          },
          {
            "internalType": "address",
            "name": "_tradeFactoryBaseStorage",
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
            "name": "_tradeFactoryBaseStorage",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "_baseFee",
            "type": "uint256"
          },
          {
            "components": [
              {
                "internalType": "address",
                "name": "weth",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "usdc",
                "type": "address"
              },
              {
                "internalType": "address",
                "name": "usdt",
                "type": "address"
              }
            ],
            "internalType": "struct PaymentTokens",
            "name": "_paymentTokens",
            "type": "tuple"
          },
          {
            "internalType": "address",
            "name": "_referralRegistryAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_sCSXTokenAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_buyAssistoor",
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
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "sellerAddress",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "address",
            "name": "buyerAddress",
            "type": "address"
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
        "type": "function"
      },
      {
        "inputs": [],
        "name": "baseFee",
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
        "name": "buyAssistoor",
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
        "inputs": [
          {
            "internalType": "uint256",
            "name": "_baseFee",
            "type": "uint256"
          }
        ],
        "name": "changeBaseFee",
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
        "name": "hasAlreadyListedItem",
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
          },
          {
            "internalType": "address",
            "name": "sellerAddress",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "buyerAddress",
            "type": "address"
          }
        ],
        "name": "onStatusChange",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "paymentTokens",
        "outputs": [
          {
            "internalType": "address",
            "name": "weth",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "usdc",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "usdt",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "referralRegistryAddress",
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
        "name": "sCSXTokenAddress",
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
        "name": "totalContracts",
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
        "inputs": [
          {
            "components": [
              {
                "internalType": "string",
                "name": "itemMarketName",
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
                "name": "tradeUrl",
                "type": "tuple"
              },
              {
                "internalType": "string",
                "name": "assetId",
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
                "components": [
                  {
                    "internalType": "string",
                    "name": "floatValues",
                    "type": "string"
                  },
                  {
                    "internalType": "uint256",
                    "name": "paintSeed",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "paintIndex",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct SkinInfo",
                "name": "skinInfo",
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
                "name": "stickers",
                "type": "tuple[]"
              },
              {
                "internalType": "string",
                "name": "weaponType",
                "type": "string"
              },
              {
                "internalType": "enum PriceType",
                "name": "priceType",
                "type": "uint8"
              }
            ],
            "internalType": "struct ListingParams",
            "name": "params",
            "type": "tuple"
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
                    "name": "floatValues",
                    "type": "string"
                  },
                  {
                    "internalType": "uint256",
                    "name": "paintSeed",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "paintIndex",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct SkinInfo",
                "name": "skinInfo",
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
              },
              {
                "internalType": "enum PriceType",
                "name": "priceType",
                "type": "uint8"
              },
              {
                "internalType": "string",
                "name": "assetId",
                "type": "string"
              }
            ],
            "internalType": "struct TradeInfo",
            "name": "result",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
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
                    "name": "floatValues",
                    "type": "string"
                  },
                  {
                    "internalType": "uint256",
                    "name": "paintSeed",
                    "type": "uint256"
                  },
                  {
                    "internalType": "uint256",
                    "name": "paintIndex",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct SkinInfo",
                "name": "skinInfo",
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
              },
              {
                "internalType": "enum PriceType",
                "name": "priceType",
                "type": "uint8"
              },
              {
                "internalType": "string",
                "name": "assetId",
                "type": "string"
              }
            ],
            "internalType": "struct TradeInfo",
            "name": "result",
            "type": "tuple"
          }
        ],
        "stateMutability": "view",
        "type": "function"
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
        "type": "function"
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
        "type": "function"
      }
    ],
  },
};
