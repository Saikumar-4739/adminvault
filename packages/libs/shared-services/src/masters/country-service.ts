import axios from 'axios';

export interface CountryCode {
    code: string;
    country: string;
    flag: string;
}

export class CountryService {
    private readonly API_URL = 'https://restcountries.com/v3.1/all?fields=name,flags,idd,cca2';

    async getAllCountryCodes(): Promise<CountryCode[]> {
        try {
            const response = await axios.get(this.API_URL);
            const countries = response.data;

            const mappedCountries: CountryCode[] = countries
                .filter((c: any) => c.idd && c.idd.root)
                .map((c: any) => {
                    const root = c.idd.root || '';
                    const suffix = c.idd.suffixes ? c.idd.suffixes[0] : '';
                    return {
                        code: `${root}${suffix}`,
                        country: c.name.common,
                        flag: c.flags.emoji || '🌐'
                    };
                })
                .sort((a: any, b: any) => a.country.localeCompare(b.country));

            return mappedCountries;
        } catch (error) {
            console.error('Failed to fetch country codes:', error);
            // Return empty array or throw error
            return [];
        }
    }
}
