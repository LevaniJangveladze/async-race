import { Component, OnInit, inject } from '@angular/core';
import { WinnerSortField } from '../../core/models/winner.model';
import { WinnersStateService } from '../../core/services/winners-state.service';

@Component({
  selector: 'app-winners',
  imports: [],
  templateUrl: './winners.html',
  styleUrl: './winners.scss',
})
export class Winners implements OnInit {
  protected readonly state = inject(WinnersStateService);

  public async ngOnInit(): Promise<void> {
    await this.state.load();
  }

  protected arrowFor(field: WinnerSortField): string {
    if (this.state.sort() !== field) {
      return '';
    }
    return this.state.order() === 'ASC' ? ' ▲' : ' ▼';
  }

  protected async sortBy(field: WinnerSortField): Promise<void> {
    await this.state.changeSort(field);
  }

  protected async previousPage(): Promise<void> {
    await this.state.goToPage(this.state.page() - 1);
  }

  protected async nextPage(): Promise<void> {
    await this.state.goToPage(this.state.page() + 1);
  }
}
