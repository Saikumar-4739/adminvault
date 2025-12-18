# Location Capture Testing Guide

## Testing on Staging Server

### Prerequisites
- ✅ Backend deployed to staging with public IP
- ✅ Frontend deployed and accessible
- ✅ Database migration applied (district column added)

### Database Migration

Before testing, ensure the `district` column exists:

```sql
-- Check if column exists
SHOW COLUMNS FROM user_login_sessions LIKE 'district';

-- If not exists, add it
ALTER TABLE user_login_sessions 
ADD COLUMN district VARCHAR(100) NULL 
COMMENT 'District/County name'
AFTER city;
```

---

## Test Scenarios

### Test 1: Login with Location Permission Granted ✅

**Steps:**
1. Open staging frontend in browser
2. Click Login
3. Browser prompts: "Allow location access?" → Click **Allow**
4. Enter credentials and login

**Expected Results:**
```sql
SELECT 
    ip_address,
    country,
    region,
    city,
    district,
    latitude,
    longitude,
    device_type,
    browser,
    is_suspicious
FROM user_login_sessions 
WHERE user_id = YOUR_USER_ID
ORDER BY login_timestamp DESC 
LIMIT 1;
```

**Should show:**
- ✅ `ip_address`: Your real public IP (not ::1)
- ✅ `country`: Your country (from IP API)
- ✅ `region`: Your state/region (from IP API)
- ✅ `city`: Your city (from IP API)
- ✅ `district`: Your district (from IP API)
- ✅ `latitude`: **Exact GPS** from browser (e.g., 17.421234)
- ✅ `longitude`: **Exact GPS** from browser (e.g., 78.448567)
- ✅ `device_type`, `browser`: Captured correctly

---

### Test 2: Login with Location Permission Denied ❌

**Steps:**
1. Clear browser location permission for the site
2. Click Login
3. Browser prompts: "Allow location access?" → Click **Block**
4. Enter credentials and login

**Expected Results:**
- ✅ Login should **still succeed** (location is optional)
- ✅ `ip_address`: Your real public IP
- ✅ `country`, `region`, `city`, `district`: From IP API
- ✅ `latitude`, `longitude`: From IP API (approximate, not exact GPS)

---

### Test 3: Compare Accuracy

**GPS vs IP-based location:**

| Data Source | Latitude/Longitude Accuracy | City/District |
|-------------|----------------------------|---------------|
| **Frontend GPS** | ±10-50 meters (exact) | From IP API |
| **IP-based only** | ±5-50 km (approximate) | From IP API |

**To verify:**
```sql
-- Check if GPS coordinates are more precise (more decimal places)
SELECT 
    latitude,
    longitude,
    CASE 
        WHEN latitude IS NOT NULL AND LENGTH(CAST(latitude AS CHAR)) > 10 
        THEN 'Frontend GPS (Exact)'
        ELSE 'IP-based (Approximate)'
    END as location_source
FROM user_login_sessions
WHERE user_id = YOUR_USER_ID
ORDER BY login_timestamp DESC;
```

---

### Test 4: Failed Login Tracking

**Steps:**
1. Attempt login with wrong password
2. Check database

**Expected Results:**
```sql
SELECT * FROM user_login_sessions 
WHERE session_token LIKE 'failed_%' 
ORDER BY login_timestamp DESC 
LIMIT 1;
```

Should capture:
- ✅ IP address and location data
- ✅ `is_active = 0`
- ✅ `failed_attempts = 1`
- ✅ `logout_timestamp` set immediately

---

## Browser Console Verification

Open browser DevTools (F12) → Console tab during login:

### If Permission Granted:
```
Location capture skipped: (nothing - success)
```

### If Permission Denied:
```
ℹ️ Location capture skipped: User denied location permission
```

### If Browser Doesn't Support:
```
⚠️ Geolocation is not supported by this browser
```

---

## API Response Verification

Check the login API response in Network tab:

**Request Payload:**
```json
{
  "email": "user@example.com",
  "password": "********",
  "latitude": 17.421234,    // ← Should be present if permission granted
  "longitude": 78.448567    // ← Should be present if permission granted
}
```

**Response:**
```json
{
  "status": true,
  "code": 0,
  "message": "User Logged In Successfully",
  "userInfo": { ... },
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

## Troubleshooting

### Issue: All location fields are NULL

**Possible causes:**
1. Still testing on localhost (IP = ::1 or 127.0.0.1)
2. IP geolocation API is down
3. Database migration not applied

**Solution:**
- Verify you're on staging with public IP
- Check backend logs for IP-API errors
- Run database migration

---

### Issue: Browser doesn't ask for permission

**Possible causes:**
1. Permission already granted/denied (cached)
2. Site not using HTTPS (required for geolocation)
3. Browser doesn't support geolocation

**Solution:**
- Clear site permissions in browser settings
- Ensure staging uses HTTPS
- Test in Chrome/Firefox/Edge

---

### Issue: GPS coordinates not captured

**Possible causes:**
1. User denied permission
2. Geolocation timeout (10 seconds)
3. GPS unavailable (desktop without GPS)

**Solution:**
- Check browser console for errors
- Test on mobile device (better GPS)
- Increase timeout in geolocation-service.ts

---

## Success Criteria

✅ **All tests pass when:**
1. Login succeeds with and without location permission
2. Exact GPS coordinates stored when permission granted
3. IP-based location stored when permission denied
4. District field populated from IP API
5. Failed logins also capture location data
6. No errors in browser console or backend logs

---

## Post-Testing

After successful testing:

1. **Document Results**: Note any issues or unexpected behavior
2. **Monitor Production**: Watch for geolocation API rate limits
3. **Privacy Notice**: Consider adding explanation on login page
4. **Analytics**: Track permission grant/deny rates

---

## Quick SQL Queries

```sql
-- View all login sessions with location
SELECT 
    id,
    user_id,
    login_timestamp,
    ip_address,
    city,
    district,
    ROUND(latitude, 6) as lat,
    ROUND(longitude, 6) as lng,
    is_suspicious
FROM user_login_sessions
ORDER BY login_timestamp DESC
LIMIT 10;

-- Count sessions by location source
SELECT 
    CASE 
        WHEN latitude IS NOT NULL AND ABS(latitude) > 0.1 THEN 'Has GPS'
        ELSE 'IP-based only'
    END as location_type,
    COUNT(*) as count
FROM user_login_sessions
GROUP BY location_type;

-- Find suspicious logins
SELECT * FROM user_login_sessions
WHERE is_suspicious = 1
ORDER BY login_timestamp DESC;
```
