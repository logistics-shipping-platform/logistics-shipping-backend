export class GetShipmentByUserIdPaginatedDTO {
    public readonly userId: string;
    public readonly page: number;
    public readonly count: number;

    constructor(data: any) {
        const { userId, page, count } = data;

        this.userId = userId?.trim();
        this.page = Number(page);
        this.count = Number(count);

        if (typeof userId !== 'string' || userId.trim() === '') {
            throw new Error('userId inválido');
        }

        if (typeof this.page !== 'number' || this.page < 0 || isNaN(this.page)) {
            throw new Error('page inválido');
        }

        if (typeof this.count !== 'number' || this.count < 1 || isNaN(this.count)) {
            throw new Error('count inválido');
        }
    }
}
