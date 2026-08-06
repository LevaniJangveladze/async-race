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

export const HTTP_STATUS = {
  notFound: 404,
  serverError: 500,
} as const;

export const HTTP_METHOD = {
  post: 'POST',
  put: 'PUT',
  patch: 'PATCH',
  delete: 'DELETE',
} as const;

export const CAR_BRANDS = [
  'Tesla',
  'Ford',
  'BMW',
  'Audi',
  'Toyota',
  'Mazda',
  'Volvo',
  'Honda',
  'Nissan',
  'Porsche',
];

export const CAR_MODELS = [
  'Model S',
  'Mustang',
  'X5',
  'A4',
  'Corolla',
  'RX-7',
  'XC90',
  'Civic',
  'GT-R',
  '911',
];

export const HEX_COLOR_MAX = 0xffffff;
export const HEX_RADIX = 16;
export const HEX_LENGTH = 6;
export const MAX_CAR_NAME_LENGTH = 30;
export const DEFAULT_CAR_COLOR = '#0088ff';
