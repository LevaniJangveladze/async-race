import { Component, OnInit, inject } from '@angular/core';
import { MAX_CAR_NAME_LENGTH, PERCENT } from '../../core/constants/api.constants';
import { Car } from '../../core/models/car.model';
import { CarRaceStatus } from '../../core/models/race.model';
import { GarageStateService } from '../../core/services/garage-state.service';
import { RaceStateService } from '../../core/services/race-state.service';

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

  protected readonly race = inject(RaceStateService);

  protected readonly maxNameLength = MAX_CAR_NAME_LENGTH;

  public async ngOnInit(): Promise<void> {
    await this.state.load();
  }

  protected onCreateName(event: Event): void {
    this.state.setCreateName(inputValue(event));
  }

  protected onCreateColor(event: Event): void {
    this.state.setCreateColor(inputValue(event));
  }

  protected onEditName(event: Event): void {
    this.state.setEditName(inputValue(event));
  }

  protected onEditColor(event: Event): void {
    this.state.setEditColor(inputValue(event));
  }

  protected canCreate(): boolean {
    return isValidName(this.state.createName());
  }

  protected canEdit(): boolean {
    return this.state.selectedCar() !== null && isValidName(this.state.editName());
  }

  protected statusOf(id: number): CarRaceStatus {
    return this.race.stateFor(id).status;
  }

  protected progressOf(id: number): number {
    return this.race.stateFor(id).progress * PERCENT;
  }

  protected canStart(id: number): boolean {
    return this.statusOf(id) === 'idle';
  }

  protected canStop(id: number): boolean {
    return this.statusOf(id) !== 'idle';
  }

  protected async startCar(id: number): Promise<void> {
    await this.race.startCar(id);
  }

  protected async stopCar(id: number): Promise<void> {
    await this.race.stopCar(id);
  }

  protected async submitCreate(): Promise<void> {
    if (!this.canCreate()) {
      return;
    }
    await this.state.createCar({
      name: this.state.createName().trim(),
      color: this.state.createColor(),
    });
  }

  protected selectCar(car: Car): void {
    this.state.selectCar(car);
  }

  protected async submitEdit(): Promise<void> {
    const selected = this.state.selectedCar();
    if (selected === null || !this.canEdit()) {
      return;
    }
    await this.state.updateCar(selected.id, {
      name: this.state.editName().trim(),
      color: this.state.editColor(),
    });
  }

  protected async removeCar(id: number): Promise<void> {
    await this.state.deleteCar(id);
  }

  protected async generate(): Promise<void> {
    await this.state.generateRandomCars();
  }

  protected winnerName(): string {
    const winner = this.race.winner();
    if (winner === null) {
      return '';
    }
    return this.state.cars().find((car) => car.id === winner.id)?.name ?? '';
  }

  protected async startRace(): Promise<void> {
    await this.race.startRace(this.state.cars().map((car) => car.id));
  }

  protected async resetRace(): Promise<void> {
    await this.race.resetRace(this.state.cars().map((car) => car.id));
  }

  protected async previousPage(): Promise<void> {
    this.race.clearWinner();
    await this.state.goToPage(this.state.page() - 1);
  }

  protected async nextPage(): Promise<void> {
    this.race.clearWinner();
    await this.state.goToPage(this.state.page() + 1);
  }
}
