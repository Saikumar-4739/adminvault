/**
 * Geolocation position result
 */
export interface GeolocationPosition {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp?: number;
}

/**
 * Geolocation error types
 */
export interface GeolocationError {
    code: number;
    message: string;
}
