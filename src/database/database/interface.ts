/* eslint-disable prettier/prettier */
export enum TradeStatus {
    ForSale = '0',
    SellerCancelled = '1',
    BuyerCommitted = '2',
    BuyerCancelled = '3',
    SellerCommitted = '4',
    SellerCancelledAfterBuyerCommitted = '5',
    Completed = '6',
    Disputed = '7',
    Resolved = '8',
    Clawbacked = '9',
  }