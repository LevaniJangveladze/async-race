import { Component, OnInit, inject } from '@angular/core';
import { GarageStateService } from '../../core/services/garage-state.service';

@Component({
  selector: 'app-garage',
  imports: [],
  templateUrl: './garage.html',
  styleUrl: './garage.scss',
})
export class Garage implements OnInit {
  protected readonly state = inject(GarageStateService);

  public async ngOnInit(): Promise<void> {
    await this.state.load();
  }

  protected async previousPage(): Promise<void> {
    await this.state.goToPage(this.state.page() - 1);
  }

  protected async nextPage(): Promise<void> {
    await this.state.goToPage(this.state.page() + 1);
  }
}
