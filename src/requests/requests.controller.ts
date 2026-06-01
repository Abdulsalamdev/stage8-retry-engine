import { Controller, Get, Param, Query, Post, Body } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { CreateRequestDto } from './dto/create-request.dto';

@Controller('requests')
export class RequestsController {
  constructor(private readonly service: RequestsService) {}

  @Post()
  create(@Body() dto: CreateRequestDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.service.getById(id);
  }

  @Get()
  getByStatus(@Query('status') status: string) {
    return this.service.getByStatus(status);
  }
}
