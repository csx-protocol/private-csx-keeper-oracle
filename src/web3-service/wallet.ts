/* eslint-disable prettier/prettier */
import Web3 from 'web3';
import HDWalletProvider from '@truffle/hdwallet-provider';

export class Wallet {
  private privateKey: string;
  private rpcUrl: string;
  private localKeyProvider: HDWalletProvider;
  private myPAccount: any;
  public web3: Web3;
  public web3signer: Web3;
  public myAccount: any;

  constructor(_privateKey: string, _rpcUrl: string) {
    this.privateKey = _privateKey;
    this.rpcUrl = _rpcUrl;
    //-> Provider & Account
    // Create web3.js middleware that signs transactions locally
    this.localKeyProvider = new HDWalletProvider({
      privateKeys: [this.privateKey],
      providerOrUrl: this.rpcUrl,
      pollingInterval: 64000, // Default 4000 milliseconds
    });

    this.web3signer = new Web3(this.localKeyProvider); //Doesnt work with subscriptions logs!

    this.web3 = new Web3(new Web3.providers.WebsocketProvider(this.rpcUrl));

    // set the transaction confirmations blocks
    this.web3.eth.transactionConfirmationBlocks = 2;

    this.myPAccount = this.web3.eth.accounts.privateKeyToAccount(
      this.privateKey,
    );

    this.myAccount = this.myPAccount.address;
  }

  async connectContract(_address: string, _abi: any): Promise<any> {
    return new this.web3signer.eth.Contract(_abi as any, _address);
  }

  toBN(_wei: string) {
    return Web3.utils.toBN(_wei);
  }

  stopWalletProviderEngine() {
    this.localKeyProvider.engine.stop();
  }

  isAddress(address: string) {
    return Web3.utils.isAddress(address);
  }
}
