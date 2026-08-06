import { Injectable } from '@angular/core';
import {
  API_BASE_URL,
  ENDPOINTS,
  HTTP_METHOD,
  HTTP_STATUS,
  TOTAL_COUNT_HEADER,
} from '../constants/api.constants';
import { Car, NewCar } from '../models/car.model';
import { DriveResult, EngineStatus } from '../models/engine.model';
import { Paginated } from '../models/paginated.model';
import { SortOrder, Winner, WinnerSortField } from '../models/winner.model';

function jsonInit(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

async function parse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }
  return (await response.json()) as T;
}

async function fetchPage<T>(url: string): Promise<Paginated<T>> {
  const response = await fetch(url);
  const items = await parse<T[]>(response);
  const header = response.headers.get(TOTAL_COUNT_HEADER);
  return { items, totalCount: header ? Number(header) : items.length };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = API_BASE_URL;

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
    }
    return url.toString();
  }

  public async getCars(page: number, limit: number): Promise<Paginated<Car>> {
    const url = this.buildUrl(ENDPOINTS.garage, {
      _page: String(page),
      _limit: String(limit),
    });
    return fetchPage<Car>(url);
  }

  public async getCar(id: number): Promise<Car> {
    const response = await fetch(this.buildUrl(`${ENDPOINTS.garage}/${id}`));
    return parse<Car>(response);
  }

  public async createCar(car: NewCar): Promise<Car> {
    const response = await fetch(this.buildUrl(ENDPOINTS.garage), jsonInit(HTTP_METHOD.post, car));
    return parse<Car>(response);
  }

  public async updateCar(id: number, car: NewCar): Promise<Car> {
    const response = await fetch(
      this.buildUrl(`${ENDPOINTS.garage}/${id}`),
      jsonInit(HTTP_METHOD.put, car),
    );
    return parse<Car>(response);
  }

  public async deleteCar(id: number): Promise<void> {
    await fetch(this.buildUrl(`${ENDPOINTS.garage}/${id}`), {
      method: HTTP_METHOD.delete,
    });
  }

  public async getWinners(
    page: number,
    limit: number,
    sort: WinnerSortField,
    order: SortOrder,
  ): Promise<Paginated<Winner>> {
    const url = this.buildUrl(ENDPOINTS.winners, {
      _page: String(page),
      _limit: String(limit),
      _sort: sort,
      _order: order,
    });
    return fetchPage<Winner>(url);
  }

  public async getWinner(id: number): Promise<Winner | null> {
    const response = await fetch(this.buildUrl(`${ENDPOINTS.winners}/${id}`));
    if (response.status === HTTP_STATUS.notFound) {
      return null;
    }
    return parse<Winner>(response);
  }

  public async createWinner(winner: Winner): Promise<Winner> {
    const response = await fetch(
      this.buildUrl(ENDPOINTS.winners),
      jsonInit(HTTP_METHOD.post, winner),
    );
    return parse<Winner>(response);
  }

  public async updateWinner(id: number, wins: number, time: number): Promise<Winner> {
    const response = await fetch(
      this.buildUrl(`${ENDPOINTS.winners}/${id}`),
      jsonInit(HTTP_METHOD.put, { wins, time }),
    );
    return parse<Winner>(response);
  }

  public async deleteWinner(id: number): Promise<void> {
    await fetch(this.buildUrl(`${ENDPOINTS.winners}/${id}`), {
      method: HTTP_METHOD.delete,
    });
  }

  public async startEngine(id: number): Promise<EngineStatus> {
    const url = this.buildUrl(ENDPOINTS.engine, {
      id: String(id),
      status: 'started',
    });
    const response = await fetch(url, { method: HTTP_METHOD.patch });
    return parse<EngineStatus>(response);
  }

  public async stopEngine(id: number): Promise<EngineStatus> {
    const url = this.buildUrl(ENDPOINTS.engine, {
      id: String(id),
      status: 'stopped',
    });
    const response = await fetch(url, { method: HTTP_METHOD.patch });
    return parse<EngineStatus>(response);
  }

  public async drive(id: number): Promise<DriveResult> {
    const url = this.buildUrl(ENDPOINTS.engine, {
      id: String(id),
      status: 'drive',
    });
    const response = await fetch(url, { method: HTTP_METHOD.patch });
    if (response.status === HTTP_STATUS.serverError) {
      return { success: false };
    }
    return parse<DriveResult>(response);
  }
}
