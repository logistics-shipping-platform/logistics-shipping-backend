import { City } from "../../model/city";

export interface CityRepositoryPort {
  getCityById(id: string): Promise<City | null>;
}