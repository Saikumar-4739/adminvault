# Location Capture Not Working - Quick Fix Guide

## Problem Checklist

### 1. ✅ Check if Google API Key is Set

**Check backend console logs for:**
```
Google Geocoding API key not configured
```

**Fix:**
1. Create `.env` file in `packages/backend/` directory
2. Add: `GOOGLE_GEOCODING_API_KEY=your_api_key_here`
3. Get API key from: https://console.cloud.google.com/
4. Restart backend server

---

### 2. ✅ Check if Frontend is Sending GPS

**Check backend console logs for:**
```
=== LOGIN SESSION DEBUG ===
Request has GPS: true/false
GPS Coordinates: { lat: ..., lng: ... }
```

**If `Request has GPS: false`:**
- Frontend geolocation failed
- Check browser console for permission errors
- Make sure you're using HTTPS (required for geolocation)

---

### 3. ✅ Check if Google API is Working

**Check backend console logs for:**
```
Calling Google Geocoding API...
✅ Google Geocoding successful: { country: ..., city: ..., district: ... }
```

**If you see error:**
- API key invalid or not enabled
- API quota exceeded
- Network issue

---

### 4. ✅ Check if IP is Localhost

**Check backend console logs for:**
```
IP Address: ::1
❌ IP-based location failed (likely localhost)
```

**This is NORMAL for localhost!**
- IP-based location won't work on localhost
- GPS coordinates should still be captured
- Deploy to staging to test IP-based location

---

## Quick Test Steps

### Step 1: Add Google API Key

```bash
# In packages/backend/.env
GOOGLE_GEOCODING_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 2: Restart Backend

```bash
npm run dev:backend
```

### Step 3: Test Login

1. Open frontend
2. Open browser console (F12)
3. Login
4. Check for geolocation permission prompt
5. Grant permission

### Step 4: Check Backend Logs

Look for:
```
=== LOGIN SESSION DEBUG ===
Request has GPS: true
GPS Coordinates: { lat: 17.4485, lng: 78.3908 }
Calling Google Geocoding API...
✅ Google Geocoding successful: { country: 'India', city: 'Hyderabad', district: 'Rangareddy' }
Location data stored: { country: 'India', region: 'Telangana', city: 'Hyderabad', district: 'Rangareddy' }
=== SESSION SAVED SUCCESSFULLY ===
```

---

## Common Issues

### Issue 1: "Google Geocoding API key not configured"

**Solution:**
```bash
# Create .env file
cd packages/backend
echo "GOOGLE_GEOCODING_API_KEY=your_key_here" > .env
```

### Issue 2: Frontend not sending GPS

**Check browser console for:**
```
ℹ️ Location capture skipped: User denied location permission
```

**Solution:** Grant location permission in browser settings

### Issue 3: Google API returns error

**Check response.data in logs:**
```json
{
  "status": "REQUEST_DENIED",
  "error_message": "API key not valid"
}
```

**Solution:** 
1. Verify API key is correct
2. Enable Geocoding API in Google Cloud Console
3. Check API key restrictions

---

## Expected Console Output

### ✅ Success (with GPS):
```
=== LOGIN SESSION DEBUG ===
Request has GPS: true
GPS Coordinates: { lat: 17.4485, lng: 78.3908 }
IP Address: ::1
✅ Using frontend GPS coordinates
Calling Google Geocoding API...
{
  results: [...],
  status: 'OK'
}
✅ Google Geocoding successful: {
  country: 'India',
  region: 'Telangana',
  city: 'Hyderabad',
  district: 'Rangareddy',
  formattedAddress: 'Madhapur, Hyderabad, Telangana 500081, India'
}
Storing GPS coordinates: { lat: 17.4485, lng: 78.3908 }
Location data stored: {
  country: 'India',
  region: 'Telangana',
  city: 'Hyderabad',
  district: 'Rangareddy'
}
=== SESSION SAVED SUCCESSFULLY ===
```

### ⚠️ Without GPS (IP-based):
```
=== LOGIN SESSION DEBUG ===
Request has GPS: false
GPS Coordinates: { lat: undefined, lng: undefined }
IP Address: ::1
⚠️ No GPS coordinates from frontend, using IP-based location
❌ IP-based location failed (likely localhost)
⚠️ No location data available
=== SESSION SAVED SUCCESSFULLY ===
```

---

## Next Steps

1. **Add Google API Key** to `.env` file
2. **Restart backend** server
3. **Test login** and check console logs
4. **Share console output** if still not working
