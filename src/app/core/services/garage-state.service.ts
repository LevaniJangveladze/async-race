import { Injectable, computed, inject, signal } from '@angular/core';
import {
  CAR_BRANDS,
  CAR_MODELS,
  CARS_PER_PAGE,
  HEX_COLOR_MAX,
  HEX_LENGTH,
  HEX_RADIX,
  RANDOM_CARS_BATCH,
} from '../constants/api.constants';
import { Car, NewCar } from '../models/car.model';
import { ApiService } from './api.service';

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function randomColor(): string {
  const value = Math.floor(Math.random() * HEX_COLOR_MAX);
  return `#${value.toString(HEX_RADIX).padStart(HEX_LENGTH, '0')}`;
}

function randomCar(): NewCar {
  return {
    name: `${pickRandom(CAR_BRANDS)} ${pickRandom(CAR_MODELS)}`,
    color: randomColor(),
  };
}

@Injectable({ providedIn: 'root' })
export class GarageStateService {
  private readonly api = inject(ApiService);

  private readonly carsSignal = signal<Car[]>([]);

  private readonly totalCountSignal = signal(0);

  private readonly pageSignal = signal(1);

  private readonly selectedCarSignal = signal<Car | null>(null);

  public readonly cars = this.carsSignal.asReadonly();

  public readonly totalCount = this.totalCountSignal.asReadonly();

  public readonly page = this.pageSignal.asReadonly();

  public readonly selectedCar = this.selectedCarSignal.asReadonly();

  public readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCountSignal() / CARS_PER_PAGE)),
  );

  public async load(): Promise<void> {
    const result = await this.api.getCars(this.pageSignal(), CARS_PER_PAGE);
    this.carsSignal.set(result.items);
    this.totalCountSignal.set(result.totalCount);
  }

  public async goToPage(page: number): Promise<void> {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.pageSignal.set(page);
    await this.load();
  }

  public selectCar(car: Car | null): void {
    this.selectedCarSignal.set(car);
  }

  public async createCar(car: NewCar): Promise<void> {
    await this.api.createCar(car);
    await this.load();
  }

  public async updateCar(id: number, car: NewCar): Promise<void> {
    await this.api.updateCar(id, car);
    this.selectedCarSignal.set(null);
    await this.load();
  }

  public async deleteCar(id: number): Promise<void> {
    await this.api.deleteCar(id);
    await this.api.deleteWinner(id);
    await this.load();
    if (this.carsSignal().length === 0 && this.pageSignal() > 1) {
      await this.goToPage(this.pageSignal() - 1);
    }
  }

  public async generateRandomCars(): Promise<void> {
    const requests = Array.from({ length: RANDOM_CARS_BATCH }, () =>
      this.api.createCar(randomCar()),
    );
    await Promise.all(requests);
    await this.load();
  }
}
