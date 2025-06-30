export class ShipmentResponseDTO {
  public id: string;
  public originId: string;
  public destinationId: string;
  public weight: number;
  public length: number;
  public width: number;
  public height: number;
  public chargeableWeight: number;
  public price: number;
  public state: string;
  public createdAt: string;

  constructor(data: Partial<ShipmentResponseDTO>) {
    this.id = data.id || '';
    this.originId = data.originId || '';
    this.destinationId = data.destinationId || '';
    this.weight = data.weight || 0;
    this.length = data.length || 0;
    this.width = data.width || 0;
    this.height = data.height || 0;
    this.chargeableWeight = data.chargeableWeight || 0;
    this.price = data.price || 0;
    this.state = data.state || '';
    this.createdAt = data.createdAt || '';
  }
}