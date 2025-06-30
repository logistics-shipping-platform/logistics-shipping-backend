
export interface GetCitiesPort {
  execute(): Promise<{ id: string, name: string }[]>;
}