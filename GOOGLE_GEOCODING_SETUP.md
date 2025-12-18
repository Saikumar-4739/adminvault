# Google Geocoding API Setup

## Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Geocoding API**:
   - Navigate to "APIs & Services" → "Library"
   - Search for "Geocoding API"
   - Click "Enable"
4. Create API Key:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key

## Configure Backend

Add to your `.env` file:

```env
GOOGLE_GEOCODING_API_KEY=your_api_key_here
```

## API Usage & Pricing

- **Free Tier**: $200 credit per month
- **Cost**: $5 per 1000 requests (after free tier)
- **Free Requests**: ~40,000 per month

## Example Response

**Request:**
```
GET https://maps.googleapis.com/maps/api/geocode/json?latlng=17.4485,78.3908&key=YOUR_KEY
```

**Response:**
```json
{
  "results": [
    {
      "formatted_address": "Madhapur, Hyderabad, Telangana 500081, India",
      "address_components": [
        { "long_name": "Hyderabad", "types": ["locality"] },
        { "long_name": "Rangareddy", "types": ["administrative_area_level_2"] },
        { "long_name": "Telangana", "types": ["administrative_area_level_1"] },
        { "long_name": "India", "types": ["country"] }
      ]
    }
  ]
}
```

## How It Works

1. User grants location permission
2. Frontend sends GPS coordinates (17.4485, 78.3908)
3. Backend calls Google Geocoding API
4. Gets: City (Hyderabad), District (Rangareddy), Region (Telangana)
5. Stores in database

## Fallback Strategy

```
Frontend GPS → Google Geocoding API → Database
     ↓ (if fails)
IP Address → IP-API → Database
```
