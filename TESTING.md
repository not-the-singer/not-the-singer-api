# Edge Runtime API Migration - Testing Guide

## Changes Implemented ✅

### 1. TokenManager Simplified
- **Before**: Used filesystem operations to store/load tokens from JSON file
- **After**: Uses only environment variables (`SOUNDCLOUD_REFRESH_TOKEN`, `SOUNDCLOUD_CLIENT_ID`, `SOUNDCLOUD_CLIENT_SECRET`)
- **Benefits**: Edge Runtime compatible, no filesystem dependencies

### 2. Consistent CORS Headers
- **Location**: `api/lib/cors.js`
- **Configuration**: 
  ```javascript
  export const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://not-the-singer.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  ```

### 3. Edge Runtime Conversion
All API routes now use:
```javascript
import { NextResponse } from 'next/server'
export const runtime = 'edge'
```

### 4. Error Handling with CORS
All error responses maintain CORS headers:
```javascript
return NextResponse.json(
  { error: error.message },
  { status: 500, headers: corsHeaders }
);
```

## Testing Checklist

### 🧪 CORS Headers Testing
**Test from https://not-the-singer.com:**

1. **OPTIONS Requests**:
   ```bash
   curl -X OPTIONS https://your-api.vercel.app/api/soundcloud \
     -H "Origin: https://not-the-singer.com" \
     -v
   ```
   Expected: 200 OK with CORS headers

2. **GET Requests**:
   ```bash
   curl https://your-api.vercel.app/api/spotify \
     -H "Origin: https://not-the-singer.com" \
     -v
   ```
   Expected: CORS headers in response

3. **Error Responses**:
   ```bash
   curl https://your-api.vercel.app/api/songlink \
     -H "Origin: https://not-the-singer.com" \
     -v
   ```
   Expected: 400 error with CORS headers (missing spotifyUrl param)

### 🔄 Token Refresh Testing
**Test SoundCloud token refresh:**

1. **Environment Variables Required**:
   - `SOUNDCLOUD_CLIENT_ID`
   - `SOUNDCLOUD_CLIENT_SECRET`  
   - `SOUNDCLOUD_REFRESH_TOKEN`

2. **Direct Refresh**:
   ```bash
   curl -X POST https://your-api.vercel.app/api/soundcloud/refresh \
     -H "Origin: https://not-the-singer.com"
   ```
   Expected: Token refreshed successfully

3. **Automatic Refresh (via main endpoint)**:
   ```bash
   curl https://your-api.vercel.app/api/soundcloud \
     -H "Origin: https://not-the-singer.com"
   ```
   Expected: Fresh token used for SoundCloud API call

### 🚀 Edge Runtime Testing
**Verify Edge Runtime functionality:**

1. **Response Speed**: Should be faster than Node.js runtime
2. **Cold Start**: Minimal cold start time
3. **Memory Usage**: Lower memory footprint
4. **Global Availability**: Runs at edge locations

## API Endpoints

### 1. `/api/soundcloud` 
- **Method**: GET
- **Purpose**: Fetch user tracks from SoundCloud
- **Token**: Auto-refreshed using env vars

### 2. `/api/spotify`
- **Method**: GET  
- **Purpose**: Fetch artist albums from Spotify
- **Auth**: Client credentials flow

### 3. `/api/songlink`
- **Method**: GET
- **Query**: `?spotifyUrl=...`
- **Purpose**: Get multi-platform links

### 4. `/api/soundcloud/refresh`
- **Method**: POST
- **Purpose**: Manually refresh SoundCloud token

### 5. `/api/soundcloud/auth` & `/api/soundcloud/callback`
- **Purpose**: OAuth flow for getting initial refresh token

## Deployment Notes

1. **Vercel Configuration**: Updated for Edge Runtime support
2. **Environment Variables**: All required env vars must be set
3. **No Filesystem**: No data directory or file storage needed
4. **CORS**: Locked to https://not-the-singer.com origin