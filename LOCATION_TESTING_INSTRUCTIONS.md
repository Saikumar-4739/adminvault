# 🔍 Location Capture - Testing Instructions

## ⚠️ Current Issue

Your login is **failing with invalid password**. That's why you're not seeing the location capture debug logs!

**Evidence from logs:**
```
session_token: "failed_1766065670139"  ← This means login FAILED
```

---

## ✅ Step-by-Step Testing

### Step 1: Use Correct Password

**Try logging in with:**
- Email: `admin@gmail.com`
- Password: **[Use the correct password for this account]**

### Step 2: Watch Backend Console

After **successful** login, you should see:

```
🔐 === LOGIN ATTEMPT ===
Email: admin@gmail.com
Has GPS: true
GPS Coordinates: { lat: 17.4485, lng: 78.3908 }
✅ Authentication successful for user: admin@gmail.com
Creating login session...

=== LOGIN SESSION DEBUG ===
Request has GPS: true
GPS Coordinates: { lat: 17.4485, lng: 78.3908 }
IP Address: ::1
✅ Using frontend GPS coordinates
Calling Google Geocoding API...
Google Geocoding API key not configured  ← YOU'LL SEE THIS
⚠️ No GPS coordinates from frontend, using IP-based location
❌ IP-based location failed (likely localhost)
⚠️ No location data available
=== SESSION SAVED SUCCESSFULLY ===

✅ Login successful!
```

---

## 🔑 Add Google API Key

### Step 1: Create `.env` file

```bash
cd packages/backend
# Create .env file (copy from .env.example)
```

### Step 2: Add API Key

In `packages/backend/.env`:
```env
GOOGLE_GEOCODING_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 3: Get API Key

1. Go to https://console.cloud.google.com/
2. Create/select project
3. Enable "Geocoding API"
4. Create API Key
5. Copy and paste into `.env`

### Step 4: Restart Backend

```bash
npm run dev:backend
```

---

## 📊 Expected Results

### Without Google API Key (Current):
```
=== LOGIN SESSION DEBUG ===
Request has GPS: true
GPS Coordinates: { lat: 17.4485, lng: 78.3908 }
⚠️ Google Geocoding API key not configured
❌ IP-based location failed (likely localhost)
Storing GPS coordinates: { lat: 17.4485, lng: 78.3908 }
⚠️ No location data available  ← No city/district
=== SESSION SAVED SUCCESSFULLY ===
```

**Database:**
```
latitude: 17.4485 ✅
longitude: 78.3908 ✅
city: NULL ❌
district: NULL ❌
```

### With Google API Key:
```
=== LOGIN SESSION DEBUG ===
Request has GPS: true
GPS Coordinates: { lat: 17.4485, lng: 78.3908 }
✅ Using frontend GPS coordinates
Calling Google Geocoding API...
✅ Google Geocoding successful: {
  country: 'India',
  city: 'Hyderabad',
  district: 'Rangareddy'
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

**Database:**
```
latitude: 17.4485 ✅
longitude: 78.3908 ✅
city: Hyderabad ✅
district: Rangareddy ✅
country: India ✅
region: Telangana ✅
```

---

## 🎯 Quick Summary

**Current Status:**
1. ❌ Login failing (wrong password)
2. ❌ Google API key not configured
3. ✅ Code is ready and working

**To Fix:**
1. ✅ Use correct password to login
2. ✅ Add Google API key to `.env`
3. ✅ Restart backend
4. ✅ Test login again

**Then you'll see:**
- GPS coordinates captured ✅
- Google API called ✅
- City & District stored ✅
