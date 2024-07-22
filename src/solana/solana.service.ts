import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Addresses } from 'src/typeorm';
import { EntityManager, Repository } from 'typeorm';
// @ts-ignore
import Web3 from 'web3';
import { Gauge } from 'prom-client';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { HttpService } from '@nestjs/axios';

import * as SPLToken from '@solana/spl-token';
import {
  Keypair,
  NONCE_ACCOUNT_LENGTH,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';

const bs58 = require('bs58');
const { derivePath, getPublicKey } = require('ed25519-hd-key');
const BigNumber = require('bignumber.js');

@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  entityManager: EntityManager;
  web3: Web3;
  ctcContract: any;
  sccContract: any;
  crossDomainMessengerContract: any;
  bvmEigenDataLayrChain: any;
  constructor(
    private configService: ConfigService,
    @InjectRepository(Addresses)
    private readonly addresses: Repository<Addresses>,
    private readonly httpService: HttpService,
  ) {}

  async createSolAddress(seedHex: string, addressIndex: string) {
    const { key } = derivePath("m/44'/501'/0'/" + addressIndex + "'", seedHex);
    const publicKey = getPublicKey(new Uint8Array(key), false).toString('hex');
    const buffer = Buffer.from(
      getPublicKey(new Uint8Array(key), false).toString('hex'),
      'hex',
    );
    const address = bs58.encode(buffer);
    const hdWallet = {
      privateKey: key.toString('hex') + publicKey,
      publicKey,
      address,
    };
    return JSON.stringify(hdWallet);
  }

  async signSolTransaction(params) {
    const {
      from,
      amount,
      nonceAccount,
      to,
      mintAddress,
      nonce,
      decimal,
      privateKey,
    } = params;
    const fromAccount = Keypair.fromSecretKey(
      new Uint8Array(Buffer.from(privateKey, 'hex')),
      { skipValidation: true },
    );
    const calcAmount = new BigNumber(amount)
      .times(new BigNumber(10).pow(decimal))
      .toString();
    if (calcAmount.indexOf('.') !== -1) throw new Error('decimal 无效');
    const tx = new Transaction();
    const toPubkey = new PublicKey(to);
    const fromPubkey = new PublicKey(from);
    tx.recentBlockhash = nonce;
    if (mintAddress) {
      const mint = new PublicKey(mintAddress);
      const fromTokenAccount = await SPLToken.Token.getAssociatedTokenAddress(
        SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        SPLToken.TOKEN_PROGRAM_ID,
        mint,
        fromPubkey,
      );
      const toTokenAccount = await SPLToken.Token.getAssociatedTokenAddress(
        SPLToken.ASSOCIATED_TOKEN_PROGRAM_ID,
        SPLToken.TOKEN_PROGRAM_ID,
        mint,
        toPubkey,
      );
      tx.add(
        SystemProgram.nonceAdvance({
          noncePubkey: new PublicKey(nonceAccount),
          authorizedPubkey: fromAccount.publicKey,
        }),
        SPLToken.Token.createTransferInstruction(
          SPLToken.TOKEN_PROGRAM_ID,
          fromTokenAccount,
          toTokenAccount,
          fromPubkey,
          [fromAccount],
          calcAmount,
        ),
      );
    } else {
      tx.add(
        SystemProgram.nonceAdvance({
          noncePubkey: new PublicKey(nonceAccount),
          authorizedPubkey: fromAccount.publicKey,
        }),
        SystemProgram.transfer({
          fromPubkey: fromAccount.publicKey,
          toPubkey: new PublicKey(to),
          lamports: calcAmount,
        }),
      );
    }
    tx.sign(fromAccount);
    return tx.serialize().toString('base64');
  }

  async prepareAccount(params) {
    const {
      authorAddress,
      from,
      recentBlockhash,
      minBalanceForRentExemption,
      privs,
    } = params;

    const authorPrivateKey = privs?.find(
      (ele) => ele.address === authorAddress,
    )?.key;
    if (!authorPrivateKey) throw new Error('authorPrivateKey 为空');
    const nonceAcctPrivateKey = privs?.find((ele) => ele.address === from)?.key;
    if (!nonceAcctPrivateKey) throw new Error('nonceAcctPrivateKey 为空');

    const author = Keypair.fromSecretKey(
      new Uint8Array(Buffer.from(authorPrivateKey, 'hex')),
    );
    const nonceAccount = Keypair.fromSecretKey(
      new Uint8Array(Buffer.from(nonceAcctPrivateKey, 'hex')),
    );

    const tx = new Transaction();
    tx.add(
      SystemProgram.createAccount({
        fromPubkey: author.publicKey,
        newAccountPubkey: nonceAccount.publicKey,
        lamports: minBalanceForRentExemption,
        space: NONCE_ACCOUNT_LENGTH,
        programId: SystemProgram.programId,
      }),

      SystemProgram.nonceInitialize({
        noncePubkey: nonceAccount.publicKey,
        authorizedPubkey: author.publicKey,
      }),
    );
    tx.recentBlockhash = recentBlockhash;

    tx.sign(author, nonceAccount);
    return tx.serialize().toString('base64');
  }

  async verifySolAddress(params: any) {
    const { address } = params;
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  }

  async importSolAddress(params: any) {
    const { privateKey } = params;
    const keyPairs = Keypair.fromSecretKey(Buffer.from(privateKey, 'hex'));
    return bs58.encode(keyPairs.publicKey);
  }
}
