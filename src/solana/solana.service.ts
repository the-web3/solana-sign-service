import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Addresses } from 'src/typeorm';
import { EntityManager, getConnection, getManager, Repository } from 'typeorm';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
import { timestamp } from 'rxjs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const bs58 = require('bs58');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { derivePath, getPublicKey } = require('ed25519-hd-key');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const BigNumber = require('bignumber.js');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bip39 = require('bip39');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v4: uuidv4 } = require('uuid');


@Injectable()
export class SolanaService {
  private readonly logger = new Logger(SolanaService.name);
  constructor(
    private configService: ConfigService,
    @InjectRepository(Addresses)
    private readonly addresses: Repository<Addresses>,
    private readonly httpService: HttpService,
  ) {}

  async createSolAddress(addressNum: number) {
    const mnemonic = bip39.generateMnemonic();
    const seedHex = bip39.mnemonicToSeedSync(mnemonic);
    const AddressList = [];
    const AddressListInsertData: any[] = [];
    for (let addressIndex = 0; addressIndex <= addressNum; addressIndex++) {
      const { key } = derivePath(
        "m/44'/501'/0'/" + addressIndex + "'",
        seedHex,
      );
      const publicKey = getPublicKey(new Uint8Array(key), false).toString(
        'hex',
      );
      const buffer = Buffer.from(
        getPublicKey(new Uint8Array(key), false).toString('hex'),
        'hex',
      );
      const address = bs58.encode(buffer);
      this.logger.log('create address success', address);
      AddressList.push({
        private_key: key.toString('hex') + publicKey,
        publicKey,
        address,
      });
      let addressType = 0;
      if (addressIndex == 1) {
        addressType = 1;
      }
      if (addressIndex == 2) {
        addressType = 2;
      }
      AddressListInsertData.push({
        guid: uuidv4(),
        user_uid: uuidv4(),
        address: address,
        address_type: addressType,
        private_key: key.toString('hex') + publicKey,
        public_key: publicKey,
        timestamp: Math.floor(Date.now() / 1000),
      });
    }
    const dataSource = getConnection();
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      await queryRunner.startTransaction();
      await queryRunner.manager
        .createQueryBuilder()
        .insert()
        .into(Addresses)
        .values(AddressListInsertData)
        .execute()
        .catch((e) => {
          console.log({
            type: 'ERROR',
            time: new Date().getTime(),
            msg: `insert batch address failed ${e?.message}`,
          });
          throw Error(e.message);
        });
      this.logger.log('commit tx success');
      await queryRunner.commitTransaction();
    } catch (error) {
      this.logger.log('execute rollback tx');
      await queryRunner.rollbackTransaction();
    } finally {
      this.logger.log('execute tx release');
      await queryRunner.release();
    }
    return AddressList;
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
