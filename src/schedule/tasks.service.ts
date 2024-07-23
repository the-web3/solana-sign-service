import { Injectable, Logger, Inject, CACHE_MANAGER } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { Interval, SchedulerRegistry } from '@nestjs/schedule';
import { SolanaService } from '../solana/solana.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TasksService {
  constructor(
    private configService: ConfigService,
    private readonly l1IngestionService: SolanaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private schedulerRegistry: SchedulerRegistry,
  ) {}
  private readonly logger = new Logger(TasksService.name);
  @Interval(10000)
  async generateAddress() {
    this.logger.log('generateAddressgenerateAddress');
  }
}
