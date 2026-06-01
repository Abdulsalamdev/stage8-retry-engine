import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService implements OnModuleInit {
  public prisma = new PrismaClient();

  async onModuleInit() {
    await this.prisma.$connect();
  }
}