import { Component, OnInit, inject, signal } from '@angular/core';
import { DEFAULT_CAR_COLOR, MAX_CAR_NAME_LENGTH } from '../../core/constants/api.constants';
import { Car } from '../../core/models/car.model';
import { GarageStateService } from '../../core/services/garage-state.service';

function inputValue(event: Event): string {
  return (event.target as HTMLInputElement).value;
}

function isValidName(name: string): boolean {
  return name.trim().length > 0 && name.trim().length <= MAX_CAR_NAME_LENGTH;
}

@Component({
  selector: 'app-garage',
  imports: [],
  templateUrl: './garage.html',
  styleUrl: './garage.scss',
})
export class Garage implements OnInit {
  protected readonly state = inject(GarageStateService);

  protected readonly createName = signal('');

  protected readonly createColor = signal(DEFAULT_CAR_COLOR);

  protected readonly editName = signal('');

  protected readonly editColor = signal(DEFAULT_CAR_COLOR);

  protected readonly maxNameLength = MAX_CAR_NAME_LENGTH;

  public async ngOnInit(): Promise<void> {
    await this.state.load();
  }

  protected onCreateName(event: Event): void {
    this.createName.set(inputValue(event));
  }

  protected onCreateColor(event: Event): void {
    this.createColor.set(inputValue(event));
  }

  protected onEditName(event: Event): void {
    this.editName.set(inputValue(event));
  }

  protected onEditColor(event: Event): void {
    this.editColor.set(inputValue(event));
  }

  protected canCreate(): boolean {
    return isValidName(this.createName());
  }

  protected canEdit(): boolean {
    return this.state.selectedCar() !== null && isValidName(this.editName());
  }

  protected async submitCreate(): Promise<void> {
    if (!this.canCreate()) {
      return;
    }
    await this.state.createCar({ name: this.createName().trim(), color: this.createColor() });
    this.createName.set('');
  }

  protected selectCar(car: Car): void {
    this.state.selectCar(car);
    this.editName.set(car.name);
    this.editColor.set(car.color);
  }

  protected async submitEdit(): Promise<void> {
    const selected = this.state.selectedCar();
    if (selected === null || !this.canEdit()) {
      return;
    }
    await this.state.updateCar(selected.id, {
      name: this.editName().trim(),
      color: this.editColor(),
    });
    this.editName.set('');
  }

  protected async removeCar(id: number): Promise<void> {
    await this.state.deleteCar(id);
  }

  protected async generate(): Promise<void> {
    await this.state.generateRandomCars();
  }

  protected async previousPage(): Promise<void> {
    await this.state.goToPage(this.state.page() - 1);
  }

  protected async nextPage(): Promise<void> {
    await this.state.goToPage(this.state.page() + 1);
  }
}
