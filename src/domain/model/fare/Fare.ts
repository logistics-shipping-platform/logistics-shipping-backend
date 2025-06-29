import { FareType } from "./FareType";

export class Fare {
  constructor(
    private readonly id: string,
    private readonly type: FareType,
    private readonly fromValue: number,
    private readonly toValue: number | null,
    private readonly price: number
  ) {}

  getId(): string {
    return this.id;
  }

  getType(): FareType {
    return this.type;
  }

  getFromValue(): number {
    return this.fromValue;
  }

  getToValue(): number | null {
    return this.toValue;
  }

  getPrice(): number {
    return this.price;
  }
}
