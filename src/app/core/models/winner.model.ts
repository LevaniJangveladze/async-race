export interface Winner {
  id: number;
  wins: number;
  time: number;
}

export interface WinnerView extends Winner {
  name: string;
  color: string;
}

export type WinnerSortField = 'id' | 'wins' | 'time';
export type SortOrder = 'ASC' | 'DESC';
