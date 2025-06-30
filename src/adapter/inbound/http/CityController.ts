import { Request, Response } from 'express';
import { GetAllCitiesUseCase } from '../../../application/usecase';

export class CityController {
    constructor(private getAllCitiesUC: GetAllCitiesUseCase) { }

    /**
     * Obtiene todas las ciudades.
     * @param req - Contiene la información de la solicitud.
     * @param res - Respuesta que contiene la lista de ciudades.
     * @returns {Promise<void>}
     */
    getAllCities = async (req: Request, res: Response) => {
        try {
            //Se obtienen todas las ciudades
            const cities  = await this.getAllCitiesUC.execute();

            //Se proyectan los datos que se desean enviar y se genera la respuesta
            const citiesProjected = cities.map(city => ({ id: city.getId(), name: city.getName() }));
            res.status(200).json({ cities: citiesProjected });
        } catch (err: any) {
            res.status(500).json({ error: "Error al obtener las ciudades" });
        }
    }
}