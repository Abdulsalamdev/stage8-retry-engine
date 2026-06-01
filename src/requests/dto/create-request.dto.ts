import { IsOptional, IsString, IsInt } from 'class-validator';

export class CreateRequestDto {
  @IsString()
  url!: string;

  @IsString()
  method!: string;

  @IsOptional()
  body?: string;

  @IsOptional()
  @IsInt()
  maxRetries?: number;

  @IsOptional()
  @IsInt()
  backoffMs?: number;
}