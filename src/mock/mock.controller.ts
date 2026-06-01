import {
  Controller,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Controller('mock')
export class MockController {
  private failCount = 0;

  @Post('fail-3-times')
  failThreeTimes() {
    this.failCount++;

    if (this.failCount <= 3) {
      throw new HttpException(
        'Mock failure',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return {
      success: true,
    };
  }

  @Post('always-400')
  always400() {
    throw new HttpException(
      'Bad Request',
      HttpStatus.BAD_REQUEST,
    );
  }

  @Post('always-500')
  always500() {
    throw new HttpException(
      'Server Error',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}