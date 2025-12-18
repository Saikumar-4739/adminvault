import { GeolocationPosition, GeolocationError } from '../types/geolocation.types';

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
        // Check if geolocation is supported
        if (!navigator.geolocation) {
            console.warn('Geolocation is not supported by this browser');
            return null;
        }

        console.log('📍 Requesting geolocation with', timeout / 1000, 'second timeout...');

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('✅ Geolocation success:', {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy
                    });

                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: position.timestamp
                    });
                },
                (error) => {
                    this.handleGeolocationError(error);
                    resolve(null); // Gracefully return null on error
                },
                {
                    enableHighAccuracy: false, // Disabled for faster response on desktop
                    timeout: timeout,
                    maximumAge: 300000 // Accept cached position up to 5 minutes old
                }
            );
        });
    }

    /**
     * Handle geolocation errors
     */
    private handleGeolocationError(error: GeolocationPositionError): void {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                console.info('User denied location permission');
                break;
            case error.POSITION_UNAVAILABLE:
                console.warn('Location information unavailable');
                break;
            case error.TIMEOUT:
                console.warn('Location request timed out');
                break;
            default:
                console.error('Unknown geolocation error:', error.message);
        }
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
            console.warn('Unable to check geolocation permission:', error);
            return null;
        }
    }
}

// Export singleton instance
export const geolocationService = new GeolocationService();
