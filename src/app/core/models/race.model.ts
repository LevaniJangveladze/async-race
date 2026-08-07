export type CarRaceStatus = 'idle' | 'driving' | 'broken' | 'finished';

export interface CarRaceState {
  status: CarRaceStatus;
  progress: number;
  time: number;
}
