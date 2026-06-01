import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/create-request.dto';

@Injectable()
export class RequestsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateRequestDto) {
    const request = await this.prisma.prisma.request.create({
      data: {
        url: dto.url,
        method: dto.method.toUpperCase(),
        body: dto.body ? JSON.stringify(dto.body) : null,

        status: 'PENDING',
        attemptCount: 0,

        maxRetries: dto.maxRetries ?? 5,
        backoffMs: dto.backoffMs ?? 1000,

        nextRetryAt: new Date(),
      },
    });

    return {
      id: request.id,
      status: request.status,
    };
  }

  async getById(id: string) {
    const request = await this.prisma.prisma.request.findUnique({
      where: { id },
      include: {
        attempts: {
          orderBy: { attemptNumber: 'asc' },
        },
      },
    });

    if (!request) {
      return { message: 'Not found' };
    }

    return request;
  }

  async getByStatus(status: string) {
    return this.prisma.prisma.request.findMany({
      where: { status: status?.toUpperCase() },
      orderBy: { createdAt: 'desc' },
    });
  }
}
