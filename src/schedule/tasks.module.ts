import { CacheModule, Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { SolanaModule } from '../solana/solana.module';

@Module({
  imports: [CacheModule.register(), SolanaModule],
  providers: [TasksService],
})
export class TasksModule {}
