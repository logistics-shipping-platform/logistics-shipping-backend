export class ParcelQuoteDTO {
    public readonly originId: string;
    public readonly destinationId: string;
    public readonly weight: number;
    public readonly length: number;
    public readonly height: number;
    public readonly width: number;

    constructor(data: any) {
        const { originId, destinationId, weight, length, height, width } = data;

        this.originId = originId?.trim();
        this.destinationId = destinationId?.trim();
        this.weight = weight;
        this.length = length;
        this.height = height;
        this.width = width;

        if (typeof originId !== 'string' || originId.trim() === '') {
            throw new Error('originId inválido');
        }

        if (typeof destinationId !== 'string' || destinationId.trim() === '') {
            throw new Error('destinationId inválido');
        }

        if (typeof weight !== 'number' || weight <= 0) {
            throw new Error('weight inválido');
        }

        if (typeof length !== 'number' || length <= 0) {
            throw new Error('length inválido');
        }

        if (typeof height !== 'number' || height <= 0) {
            throw new Error('height inválido');
        }
        if (typeof width !== 'number' || width <= 0) {
            throw new Error('width inválido');
        }
    }

}