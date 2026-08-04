export const API_BASE_URL = 'http://127.0.0.1:3000';

export const ENDPOINTS = {
  garage: '/garage',
  winners: '/winners',
  engine: '/engine',
} as const;

export const CARS_PER_PAGE = 7;
export const WINNERS_PER_PAGE = 10;
export const RANDOM_CARS_BATCH = 100;
export const TOTAL_COUNT_HEADER = 'X-Total-Count';
