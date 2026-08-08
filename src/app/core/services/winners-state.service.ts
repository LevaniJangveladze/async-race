import { Injectable, computed, inject, signal } from '@angular/core';
import { WINNERS_PER_PAGE } from '../constants/api.constants';
import { SortOrder, WinnerSortField, WinnerView } from '../models/winner.model';
import { ApiService } from './api.service';

@Injectable({ providedIn: 'root' })
export class WinnersStateService {
  private readonly api = inject(ApiService);

  private readonly winnersSignal = signal<WinnerView[]>([]);

  private readonly totalCountSignal = signal(0);

  private readonly pageSignal = signal(1);

  private readonly sortSignal = signal<WinnerSortField>('id');

  private readonly orderSignal = signal<SortOrder>('ASC');

  public readonly winners = this.winnersSignal.asReadonly();

  public readonly totalCount = this.totalCountSignal.asReadonly();

  public readonly page = this.pageSignal.asReadonly();

  public readonly sort = this.sortSignal.asReadonly();

  public readonly order = this.orderSignal.asReadonly();

  public readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalCountSignal() / WINNERS_PER_PAGE)),
  );

  public async load(): Promise<void> {
    const result = await this.api.getWinners(
      this.pageSignal(),
      WINNERS_PER_PAGE,
      this.sortSignal(),
      this.orderSignal(),
    );
    const views = await Promise.all(
      result.items.map(async (winner) => {
        const car = await this.api.getCar(winner.id);
        return {
          id: winner.id,
          wins: winner.wins,
          time: winner.time,
          name: car.name,
          color: car.color,
        };
      }),
    );
    this.winnersSignal.set(views);
    this.totalCountSignal.set(result.totalCount);
  }

  public async goToPage(page: number): Promise<void> {
    if (page < 1 || page > this.totalPages()) {
      return;
    }
    this.pageSignal.set(page);
    await this.load();
  }

  public async changeSort(field: WinnerSortField): Promise<void> {
    if (this.sortSignal() === field) {
      this.orderSignal.set(this.orderSignal() === 'ASC' ? 'DESC' : 'ASC');
    } else {
      this.sortSignal.set(field);
      this.orderSignal.set('ASC');
    }
    this.pageSignal.set(1);
    await this.load();
  }
}
