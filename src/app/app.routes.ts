import { Routes } from '@angular/router';
import { Garage } from './features/garage/garage';
import { Winners } from './features/winners/winners';

export const routes: Routes = [
  { path: '', redirectTo: 'garage', pathMatch: 'full' },
  { path: 'garage', component: Garage },
  { path: 'winners', component: Winners },
];
