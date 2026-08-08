import { Injectable, inject, signal } from '@angular/core';
import { MS_IN_SECOND, TIME_PRECISION } from '../constants/api.constants';
import { CarRaceState, RaceWinner } from '../models/race.model';
import { ApiService } from './api.service';

const IDLE_STATE: CarRaceState = { status: 'idle', progress: 0, time: 0 };

@Injectable({ providedIn: 'root' })
export class RaceStateService {
  private readonly api = inject(ApiService);

  private readonly statesSignal = signal<Record<number, CarRaceState>>({});

  private readonly raceActiveSignal = signal(false);

  private readonly winnerSignal = signal<RaceWinner | null>(null);

  private readonly frames = new Map<number, number>();

  private readonly runs = new Map<number, number>();

  public readonly states = this.statesSignal.asReadonly();

  public readonly raceActive = this.raceActiveSignal.asReadonly();

  public readonly winner = this.winnerSignal.asReadonly();

  public stateFor(id: number): CarRaceState {
    return this.statesSignal()[id] ?? IDLE_STATE;
  }

  private patch(id: number, changes: Partial<CarRaceState>): void {
    this.statesSignal.update((all) => ({
      ...all,
      [id]: { ...(all[id] ?? IDLE_STATE), ...changes },
    }));
  }

  private nextRun(id: number): number {
    const next = (this.runs.get(id) ?? 0) + 1;
    this.runs.set(id, next);
    return next;
  }

  private isCurrent(id: number, run: number): boolean {
    return this.runs.get(id) === run;
  }

  private animate(id: number, durationMs: number, run: number): void {
    this.stopAnimation(id);
    const startedAt = performance.now();
    const step = (now: number): void => {
      if (!this.isCurrent(id, run)) {
        return;
      }
      const progress = Math.min(1, (now - startedAt) / durationMs);
      if (progress > this.stateFor(id).progress) {
        this.patch(id, { progress });
      }
      if (progress < 1) {
        this.frames.set(id, requestAnimationFrame(step));
      }
    };
    this.frames.set(id, requestAnimationFrame(step));
  }

  private stopAnimation(id: number): void {
    const frame = this.frames.get(id);
    if (frame !== undefined) {
      cancelAnimationFrame(frame);
      this.frames.delete(id);
    }
  }

  private async saveWinner(id: number, time: number): Promise<void> {
    const existing = await this.api.getWinner(id);
    if (existing === null) {
      await this.api.createWinner({ id, wins: 1, time });
      return;
    }
    await this.api.updateWinner(id, existing.wins + 1, Math.min(existing.time, time));
  }

  public async startCar(id: number): Promise<boolean> {
    if (this.stateFor(id).status === 'driving') {
      return false;
    }
    const run = this.nextRun(id);
    this.patch(id, { status: 'driving', progress: 0, time: 0 });
    try {
      const { velocity, distance } = await this.api.startEngine(id);
      if (!this.isCurrent(id, run)) {
        return false;
      }
      const durationMs = distance / velocity;
      this.animate(id, durationMs, run);

      const result = await this.api.drive(id);
      if (!this.isCurrent(id, run)) {
        return false;
      }
      this.stopAnimation(id);

      if (!result.success) {
        this.patch(id, { status: 'broken' });
        return false;
      }
      const seconds = Number((durationMs / MS_IN_SECOND).toFixed(TIME_PRECISION));
      this.patch(id, { status: 'finished', progress: 1, time: seconds });
      return true;
    } catch {
      if (this.isCurrent(id, run)) {
        this.stopAnimation(id);
        this.patch(id, { status: 'broken' });
      }
      return false;
    }
  }

  public async stopCar(id: number): Promise<void> {
    this.nextRun(id);
    this.stopAnimation(id);
    await this.api.stopEngine(id);
    this.patch(id, { status: 'idle', progress: 0, time: 0 });
  }

  public async startRace(ids: number[]): Promise<void> {
    this.raceActiveSignal.set(true);
    this.winnerSignal.set(null);

    const attempts = ids.map(async (id) => {
      const finished = await this.startCar(id);
      if (!finished) {
        throw new Error(`Car ${id} broke down`);
      }
      return { id, time: this.stateFor(id).time };
    });

    try {
      const first = await Promise.any(attempts);
      this.winnerSignal.set(first);
      await this.saveWinner(first.id, first.time);
    } catch {
      this.winnerSignal.set(null);
    }

    await Promise.allSettled(attempts);
    this.raceActiveSignal.set(false);
  }

  public async resetRace(ids: number[]): Promise<void> {
    this.winnerSignal.set(null);
    await Promise.all(ids.map((id) => this.stopCar(id)));
  }
}
