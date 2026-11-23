import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import type { RaceStatus } from '../entities/race.entity.js';

export class CreateRaceDto {
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @Matches(/\S/)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/\S/)
  trackId!: string;

  @IsDateString()
  date!: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  time!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1440)
  plannedDuration!: number;

  @IsOptional()
  @IsIn(['Scheduled', 'In Progress', 'Finished', 'Cancelled'])
  status?: RaceStatus;

  @IsOptional()
  @IsDateString()
  startTime?: string | null;

  @IsOptional()
  @IsDateString()
  endTime?: string | null;

  @IsOptional()
  @IsString()
  @Matches(/^\d{2}:\d{2}$/)
  actualDuration?: string | null;
}
