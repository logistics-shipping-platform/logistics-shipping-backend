export class Parcel {

  private readonly VOLUMETRIC_DIVISOR = 2500;

  private chargeableWeight?: number;
  private price?: number;

  constructor(
    private readonly weight: number,
    private readonly length: number,
    private readonly width: number,
    private readonly height: number,
  ) { }

  setPrice(price: number): void {
    this.price = price;
  }

  getPrice(): number {
    return this.price ?? 0;
  }

  getChargeableWeight(): number {
    return this.chargeableWeight ?? 0;
  }

  setChargeableWeight(chargeableWeight: number): void {
    this.chargeableWeight = chargeableWeight;
  }

  getWeight(): number {
    return this.weight;
  }

  getLength(): number {
    return this.length;
  }

  getWidth(): number {
    return this.width;
  }
  
  getHeight(): number {
    return this.height;
  }

  /**
   * Calcula el peso real y el peso volumétrico.
   * El peso volumétrico se calcula utilizando la fórmula:
   * peso volumétrico = (length * width * height) / 2500
   * El peso real es el máximo entre el peso real y el peso volumétrico.
   * @param parcel El paquete que tiene las dimensiones y el peso.
   * @returns El peso facturable.
   */
  calculateChargeableWeight(parcel: Parcel): number {
    const volumetricValue = Math.ceil((parcel.length * parcel.width * parcel.height) / this.VOLUMETRIC_DIVISOR);
    return Math.max(parcel.weight, volumetricValue);
  }


}
