import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { CreateRaceDto } from './dto/create-race.dto.js';
import { UpdateRaceDto } from './dto/update-race.dto.js';
import { Race } from './entities/race.entity.js';

@Injectable()
export class RacesService {
  private readonly races: Race[] = [
    {
      id: 'race-1',
      name: 'Round 2 - Monza Sprint',
      trackId: 'trk-1',
      date: '2026-11-07',
      time: '19:00',
      plannedDuration: 60,
      status: 'Scheduled',
      startTime: null,
      endTime: null,
      actualDuration: null,
    },
    {
      id: 'race-2',
      name: 'Round 3 - Spa Endurance',
      trackId: 'trk-2',
      date: '2026-11-21',
      time: '20:00',
      plannedDuration: 120,
      status: 'Scheduled',
      startTime: null,
      endTime: null,
      actualDuration: null,
    },
    {
      id: 'race-3',
      name: 'Round 1 - Suzuka Opening',
      trackId: 'trk-3',
      date: '2026-10-10',
      time: '19:30',
      plannedDuration: 90,
      status: 'Finished',
      startTime: '2026-10-10T12:30:00.000Z',
      endTime: '2026-10-10T14:03:00.000Z',
      actualDuration: '01:33',
    },
  ];

  create(createRaceDto: CreateRaceDto) {
    const name = createRaceDto.name.trim();
    this.ensureNameIsUnique(name);

    const race = Object.assign(new Race(), {
      id: randomUUID(),
      name,
      trackId: createRaceDto.trackId,
      date: createRaceDto.date,
      time: createRaceDto.time,
      plannedDuration: createRaceDto.plannedDuration,
      status: createRaceDto.status ?? 'Scheduled',
      startTime: createRaceDto.startTime ?? null,
      endTime: createRaceDto.endTime ?? null,
      actualDuration: createRaceDto.actualDuration ?? null,
    });
    this.races.push(race);
    return race;
  }

  findAll() {
    return this.races;
  }

  findOne(id: string) {
    return this.getRaceOrThrow(id);
  }

  update(id: string, updateRaceDto: UpdateRaceDto) {
    const race = this.getRaceOrThrow(id);
    const name = updateRaceDto.name?.trim();

    if (name) {
      this.ensureNameIsUnique(name, id);
    }

    Object.assign(race, updateRaceDto, name ? { name } : {});
    return race;
  }

  remove(id: string) {
    const index = this.races.findIndex((race) => race.id === id);
    if (index === -1) {
      throw new NotFoundException(`Race dengan id "${id}" tidak ditemukan.`);
    }
    const [removed] = this.races.splice(index, 1);
    return removed;
  }

  private getRaceOrThrow(id: string) {
    const race = this.races.find((item) => item.id === id);
    if (!race) {
      throw new NotFoundException(`Race dengan id "${id}" tidak ditemukan.`);
    }
    return race;
  }

  private ensureNameIsUnique(name: string, ignoreId?: string) {
    const duplicate = this.races.some(
      (race) => race.id !== ignoreId && race.name.toLowerCase() === name.toLowerCase(),
    );
    if (duplicate) {
      throw new ConflictException(`Nama race "${name}" sudah digunakan.`);
    }
  }
}
