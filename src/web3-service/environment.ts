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
    address: '0x624C46055c583078c05B2B948c87B0ae3a7b6E57',
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
        "inputs": [],
        "name": "AssetIDAlreadyExists",
        "type": "error"
      },
      {
        "inputs": [
          {
            "internalType": "address",
            "name": "_address",
            "type": "address"
          }
        ],
        "name": "InvalidAddress",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "InvalidPriceType",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NoTradeCreated",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NotCouncil",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NotTradeContract",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "UserBanned",
        "type": "error"
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
        "name": "changeContracts",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
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
        "name": "changeContractsForTrade",
        "outputs": [],
        "stateMutability": "nonpayable",
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
            "internalType": "enum TradeStatus",
            "name": "prevStatus",
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
        "inputs": [
          {
            "internalType": "enum TradeStatus",
            "name": "",
            "type": "uint8"
          }
        ],
        "name": "tradeCountByStatus",
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
            "name": "_skinInfo",
            "type": "tuple"
          }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
      },
      {
        "inputs": [],
        "name": "DividendDepositFailed",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NotCommitted",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NotFactory",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NotForSale",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NotGroup",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NotKeeperNode",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NotKeeperOrNode",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NotParty",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "NotSeller",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "StatusNotBuyerCommitted",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "StatusNotDisputeReady",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "StatusNotSellerCommitted",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "TimeNotElapsed",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "TradeIDNotRemoved",
        "type": "error"
      },
      {
        "inputs": [],
        "name": "buyer",
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
        "name": "buyerCancel",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "buyerCommitTimestamp",
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
        "name": "buyerConfirmReceived",
        "outputs": [],
        "stateMutability": "nonpayable",
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
          },
          {
            "internalType": "bytes32",
            "name": "_affLink",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "_buyerAddress",
            "type": "address"
          }
        ],
        "name": "commitBuy",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "depositedValue",
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
        "name": "finalityResult",
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
        "inputs": [
          {
            "internalType": "bytes32",
            "name": "_affLink",
            "type": "bytes32"
          }
        ],
        "name": "getNetValue",
        "outputs": [
          {
            "internalType": "uint256",
            "name": "buyerNetPrice",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "sellerNetProceeds",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "affiliatorNetReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenHoldersNetReward",
            "type": "uint256"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "getStatusCount",
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
          },
          {
            "internalType": "address",
            "name": "_paymentToken",
            "type": "address"
          },
          {
            "internalType": "enum PriceType",
            "name": "_priceType",
            "type": "uint8"
          },
          {
            "internalType": "address",
            "name": "_referralRegistryContract",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "_sCSXToken",
            "type": "address"
          }
        ],
        "name": "initExtraInfo",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "inputs": [
          {
            "internalType": "bool",
            "name": "isTradeMade",
            "type": "bool"
          },
          {
            "internalType": "string",
            "name": "message",
            "type": "string"
          }
        ],
        "name": "keeperNodeConfirmsTrade",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "inputs": [],
        "name": "paymentToken",
        "outputs": [
          {
            "internalType": "contract IERC20",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "priceType",
        "outputs": [
          {
            "internalType": "enum PriceType",
            "name": "",
            "type": "uint8"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "referralCode",
        "outputs": [
          {
            "internalType": "bytes32",
            "name": "",
            "type": "bytes32"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "referralRegistryContract",
        "outputs": [
          {
            "internalType": "contract IReferralRegistry",
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
      },
      {
        "inputs": [],
        "name": "sCSXToken",
        "outputs": [
          {
            "internalType": "contract IStakedCSX",
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
        "name": "sellerAcceptedTimestamp",
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
        "inputs": [],
        "name": "sellerConfirmsTrade",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "inputs": [
          {
            "internalType": "bool",
            "name": "_sellerCommited",
            "type": "bool"
          }
        ],
        "name": "sellerTradeVeridict",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "skinInfo",
        "outputs": [
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
        "name": "statusHistory",
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
      }
    ],
  },
};
