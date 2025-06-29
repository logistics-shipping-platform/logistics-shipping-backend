export class City {
    constructor(
        private readonly id: string,
        private readonly name: string,
        private readonly latitude?: number,
        private readonly longitude?: number
    ) { }

    getId(): string {
        return this.id;
    }
    getName(): string {
        return this.name;
    }
    getLatitude(): number {
        return this.latitude || 0;
    }
    getLongitude(): number {
        return this.longitude || 0;
    }
}