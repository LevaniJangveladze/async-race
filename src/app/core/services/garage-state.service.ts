import { Injectable, computed, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { CARS_PER_PAGE } from '../constants/api.constants';
import { Car } from '../models/car.model';

@Injectable({ providedIn: 'root' })
export class GarageStateService {
  private readonly api = inject(ApiService);

  private readonly carsSignal = signal<Car[]>([]);

  private readonly totalCountSignal = signal(0);

  private readonly pageSignal = signal(1);

  public readonly cars = this.carsSignal.asReadonly();

  public readonly totalCount = this.totalCountSignal.asReadonly();

  public readonly page = this.pageSignal.asReadonly();

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
}
