export interface Car {
  id: number;
  name: string;
  color: string;
}

export type NewCar = Omit<Car, 'id'>;
