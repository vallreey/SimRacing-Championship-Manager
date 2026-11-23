export type RaceStatus = 'Scheduled' | 'In Progress' | 'Finished' | 'Cancelled';

export class Race {
  id!: string;
  name!: string;
  trackId!: string;
  date!: string;
  time!: string;
  plannedDuration!: number;
  status!: RaceStatus;
  startTime: string | null = null;
  endTime: string | null = null;
  actualDuration: string | null = null;
}
