import { City } from "../../model/city";

export interface GetCitiesPort {
  execute(): Promise<City[]>;
}