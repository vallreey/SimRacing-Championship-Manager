import { ConflictException, NotFoundException } from '@nestjs/common';
import { beforeEach, describe, expect, it } from 'vitest';
import { CreateRaceDto } from './dto/create-race.dto.js';
import { RacesService } from './races.service.js';

describe('RacesService', () => {
  let service: RacesService;
  const newRace: CreateRaceDto = {
    name: 'Round 4 - Sentul Night',
    trackId: 'trk-4',
    date: '2026-12-05',
    time: '19:30',
    plannedDuration: 75,
  };

  beforeEach(() => {
    service = new RacesService();
  });

  it('creates, retrieves, updates, and removes a race', () => {
    const created = service.create(newRace);
    expect(service.findOne(created.id).name).toBe(newRace.name);
    expect(service.findAll()).toContainEqual(created);

    const updated = service.update(created.id, { plannedDuration: 90 });
    expect(updated.plannedDuration).toBe(90);

    service.remove(created.id);
    expect(service.findAll()).not.toContainEqual(updated);
    expect(() => service.findOne(created.id)).toThrow(NotFoundException);
  });

  it('rejects duplicate names and unknown race IDs', () => {
    expect(() =>
      service.create({
        name: 'round 2 - MONZA SPRINT',
        trackId: 'trk-1',
        date: '2026-12-06',
        time: '19:00',
        plannedDuration: 60,
      }),
    ).toThrow(ConflictException);
    expect(() => service.update('missing-id', { name: 'Changed name' })).toThrow(
      NotFoundException,
    );
    expect(() => service.remove('missing-id')).toThrow(NotFoundException);
  });
});
