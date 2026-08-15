import { IsInt, IsNotEmpty, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class SmartSearchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  query: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}
