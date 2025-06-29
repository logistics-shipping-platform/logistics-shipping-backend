import { ParcelBaseDTO } from "./ParcelBaseDTO";

export class CreateShipmentDTO extends ParcelBaseDTO {
    public readonly price: number;
    public readonly userId: string;


    constructor(data: any) {
        super(data);
        const { price, userId } = data;

        this.price = price;
        this.userId = userId;

        if (typeof userId !== 'string' || userId.trim().length === 0) {
            throw new Error('userId inválido');
        }

        if (typeof price !== 'number' || price <= 0) {
            throw new Error('price inválido');
        }
    }

}