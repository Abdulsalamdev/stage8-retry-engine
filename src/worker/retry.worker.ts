import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import axios from 'axios';

@Injectable()
export class RetryWorker implements OnModuleInit {
  private readonly logger = new Logger(RetryWorker.name);

  constructor(private prisma: PrismaService) {}

  onModuleInit() {
    this.start();
  }

  start() {
    setInterval(() => this.processJobs(), 500);
  }

  async processJobs() {
    const now = new Date();

    const jobs = await this.prisma.prisma.request.findMany({
      where: {
        status: {
          in: ['PENDING', 'RETRYING'],
        },
        nextRetryAt: {
          lte: now,
        },
      },
      take: 5,
    });

    for (const job of jobs) {
      await this.executeJob(job);
    }
  }

  async executeJob(job: any) {
    const attemptNumber = job.attemptCount + 1;

    this.logger.log(
      `Processing Request ${job.id} | Attempt ${attemptNumber}`,
    );

    let success = false;
    let statusCode: number | null = null;
    let errorMessage = '';

    try {
      const res = await axios({
        url: job.url,
        method: job.method,
        data: job.body ? JSON.parse(job.body) : undefined,
        timeout: 5000,
        validateStatus: () => true,
      });

      statusCode = res.status;

      if (res.status >= 200 && res.status < 300) {
        success = true;
      } else {
        errorMessage = `HTTP ${res.status}`;
      }
    } catch (err: any) {
      errorMessage = err.message || 'Network error';
      statusCode = null;
    }

    await this.prisma.prisma.attempt.create({
      data: {
        requestId: job.id,
        attemptNumber,
        statusCode,
        error: errorMessage,
        delayUsed: 0,
      },
    });

    // SUCCESS
    if (success) {
      this.logger.log(
        `SUCCESS | ${job.id} | Attempt ${attemptNumber}`,
      );

      await this.prisma.prisma.request.update({
        where: { id: job.id },
        data: {
          status: 'COMPLETED',
          result: 'SUCCESS',
          attemptCount: attemptNumber,
        },
      });

      return;
    }

    // 4xx
    if (statusCode && statusCode >= 400 && statusCode < 500) {
      this.logger.warn(
        `TERMINAL FAILURE (4xx) | ${job.id} | Status ${statusCode}`,
      );

      await this.prisma.prisma.request.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          lastError: errorMessage,
          attemptCount: attemptNumber,
        },
      });

      return;
    }

    const maxRetries = job.maxRetries ?? 5;
    const base = job.backoffMs ?? 1000;

    // DEAD LETTER
    if (attemptNumber >= maxRetries) {
      this.logger.error(
        `DEAD LETTER | ${job.id} | Max retries reached`,
      );

      await this.prisma.prisma.request.update({
        where: { id: job.id },
        data: {
          status: 'FAILED',
          lastError: 'Max retries reached',
          attemptCount: attemptNumber,
        },
      });

      return;
    }

    // EXPONENTIAL BACKOFF + JITTER
    const exponential = base * Math.pow(2, attemptNumber - 1);

    const jitterMultiplier =
      0.8 + Math.random() * 0.4;

    const retryDelay =
      exponential * jitterMultiplier;

    this.logger.warn(
      `RETRYING | ${job.id} | Attempt ${attemptNumber} | Delay ${Math.round(
        retryDelay,
      )}ms`,
    );

    await this.prisma.prisma.request.update({
      where: { id: job.id },
      data: {
        status: 'RETRYING',
        attemptCount: attemptNumber,
        nextRetryAt: new Date(Date.now() + retryDelay),
        lastError: errorMessage,
      },
    });
  }
}