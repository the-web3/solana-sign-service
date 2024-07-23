import { SolanaService } from './solana.service';
import { Controller, Get, Post, Body, Query } from '@nestjs/common';

@Controller('/')
export class SolanaController {
  constructor(private readonly solanaService: SolanaService) {}

  @Post('generateAddress')
  async generateAddress(@Body() param) {
    const address_num = param['address_num'];
    const addressList = await this.solanaService.createSolAddress(address_num);
    return {
      code: 2000,
      msg: 'batch address genereate success',
      addressList: addressList,
    };
  }

  @Post('verifyAddress')
  async verifyAddress(@Body() param) {
    const address = param['address'];
    const params = {
      address: address,
    };
    const isAddress = await this.solanaService.verifySolAddress(params);
    if (isAddress) {
      return {
        code: 2000,
        msg: 'verify address success',
        success: true,
      };
    } else {
      return {
        code: 4000,
        msg: 'verify address fail',
        success: false,
      };
    }
  }

  @Post('signTransaction')
  async signTransaction(@Body() param) {
    const from = param['from'];
    const amount = param['amount'];
    const nonceAccount = param['nonceAccount'];
    const to = param['to'];
    const mintAddress = param['mintAddress'];
    const nonce = param['nonce'];
    const decimal = param['decimal'];
    const privateKey = param['privateKey'];
    const params = {
      from: from,
      nonceAccount: nonceAccount,
      amount: amount,
      to: to,
      nonce: nonce,
      decimal: decimal,
      privateKey: privateKey,
      mintAddress: mintAddress,
    };
    const txHex = await this.solanaService.signSolTransaction(params);
    return {
      code: 2000,
      msg: 'sign transaction success',
      raw_tx: txHex,
    };
  }

  @Post('prepareAccount')
  async prepareAccount(@Body() param) {
    const authorAddress = param['authorAddress'];
    const from = param['from'];
    const recentBlockhash = param['recentBlockhash'];
    const minBalanceForRentExemption = param['minBalanceForRentExemption'];
    const privs = param['privs'];
    const params = {
      authorAddress: authorAddress,
      from: from,
      recentBlockhash: recentBlockhash,
      minBalanceForRentExemption: minBalanceForRentExemption,
      privs: privs,
    };
    const txHex = await this.solanaService.prepareAccount(params);
    return {
      code: 2000,
      msg: 'prepare account success',
      raw_tx: txHex,
    };
  }
}
