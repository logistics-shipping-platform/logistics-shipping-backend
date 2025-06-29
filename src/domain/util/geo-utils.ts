
/**
* Calcula la distancia entre dos puntos geográficos.
* @param {number} lat1 - Latitud del primer punto.
* @param {number} lon1 - Longitud del primer punto.
* @param {number} lat2 - Latitud del segundo punto.
* @param {number} lon2 - Longitud del segundo punto.
* @returns {number} - Distancia en kilómetros.
*/
export function getDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}