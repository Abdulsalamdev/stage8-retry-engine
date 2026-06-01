import { Module } from '@nestjs/common';
import { RetryWorker } from './retry.worker';

@Module({
  providers: [RetryWorker],
})
export class WorkerModule {}