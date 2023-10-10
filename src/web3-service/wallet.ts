/* eslint-disable prettier/prettier */
import { Alchemy, Network, Wallet } from 'alchemy-sdk';
import { ParamType, ethers } from 'ethers';

export class WalletBase {
  alchemy: Alchemy;
  wallet: Wallet;

  private readonly apiKey: string;
  constructor(_privateKey: string, _apiKey: string) {
    this.apiKey = _apiKey;
    const settings = {
      apiKey: _apiKey,
      network: Network.ARB_GOERLI,
    };
    this.alchemy = new Alchemy(settings);
    this.wallet = new Wallet(_privateKey, this.alchemy);
  }

  connectContract(address: string, abi: any) {
    const provider = new ethers.AlchemyProvider('arbitrum-goerli', this.apiKey);    
    return new ethers.Contract(address, abi, provider);
  }

  toBN(value: string) {
    return BigInt(value);
  }

  isAddress(address: string) {
    return ethers.isAddress(address);
  }

  decodeLog(types: ReadonlyArray<string | ParamType>, data: ethers.BytesLike) {
    return ethers.AbiCoder.defaultAbiCoder().decode(types, data);
  }
}
