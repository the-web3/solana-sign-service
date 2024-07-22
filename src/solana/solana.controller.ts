import { SolanaService } from './solana.service';
import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { isValidAddress, publicToAddress } from 'ethereumjs-util';

@Controller('/')
export class SolanaController {
  constructor(private readonly l1IngestionService: SolanaService) {}

  @Get('generateAddress')
  generateAddress() {
    return {
      code: 200,
    };
  }
  @Post('signTransaction')
  getL2ToL1Relation() {
    return {
      code: 200,
    };
  }
}
