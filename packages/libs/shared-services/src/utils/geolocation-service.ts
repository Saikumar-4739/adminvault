import { GeolocationPosition } from '../types/geolocation.types';

/**
 * Geolocation Service
 * Provides browser-based GPS location capture with permission handling
 */
export class GeolocationService {
    /**
     * Get current position from browser Geolocation API
     * @param timeout - Timeout in milliseconds (default: 30000)
     * @returns Promise with latitude/longitude or null if unavailable/denied
     */
    async getCurrentPosition(timeout: number = 30000): Promise<GeolocationPosition | null> {
        if (!navigator.geolocation) {
            return null;
        }

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    });
                },
                (error) => {
                    this.handleGeolocationError(error);
                    resolve(null);
                },
                {
                    enableHighAccuracy: false,
                    timeout: timeout,
                    maximumAge: 300000
                }
            );
        });
    }

    /**
     * Handle geolocation errors
     */
    private handleGeolocationError(error: GeolocationPositionError): void {
        // Silently handle errors
    }

    /**
     * Check if geolocation permission is granted
     * Note: This uses the Permissions API which may not be supported in all browsers
     */
    async checkPermission(): Promise<PermissionState | null> {
        if (!navigator.permissions) {
            return null;
        }

        try {
            const result = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
            return result.state;
        } catch (error) {
            return null;
        }
    }
}

// Export singleton instance
export const geolocationService = new GeolocationService();
