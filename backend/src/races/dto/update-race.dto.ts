import { PartialType } from '@nestjs/mapped-types';
import { CreateRaceDto } from './create-race.dto.js';

export class UpdateRaceDto extends PartialType(CreateRaceDto) {}
