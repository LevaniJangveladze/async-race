export type CarRaceStatus = 'idle' | 'driving' | 'broken' | 'finished';

export interface CarRaceState {
  status: CarRaceStatus;
  progress: number;
  time: number;
}

export interface RaceWinner {
  id: number;
  time: number;
}
