import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RequestsModule } from './requests/requests.module';
import { WorkerModule } from './worker/worker.module';
import { MockModule } from './mock/mock.module';

@Module({
  imports: [PrismaModule, RequestsModule, WorkerModule, MockModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
