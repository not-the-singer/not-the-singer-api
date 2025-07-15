# Edge Runtime API Migration - Testing Guide

## Changes Implemented ✅

### 1. Merge Conflict Resolution
- **Problem**: Conflict between PR #6 (Edge Runtime) and PR #7 (Node.js runtime) in vercel.json
- **Solution**: Combined both approaches - Node.js as default with individual Edge Runtime overrides
- **Result**: Seamless deployment with optimal performance for each endpoint

### 2. TokenManager Simplified
- **Before**: Used filesystem operations to store/load tokens from JSON file
- **After**: Uses only environment variables (`SOUNDCLOUD_REFRESH_TOKEN`, `SOUNDCLOUD_CLIENT_ID`, `SOUNDCLOUD_CLIENT_SECRET`)
- **Benefits**: Edge Runtime compatible, no filesystem dependencies

### 3. Consistent CORS Headers
- **Location**: `api/lib/cors.js`
- **Configuration**: 
  ```javascript
  export const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://not-the-singer.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
  ```

### 4. Edge Runtime Conversion
All API routes now use:
```javascript
import { NextResponse } from 'next/server'
export const runtime = 'edge'
```

### 5. Error Handling with CORS
All error responses maintain CORS headers:
```javascript
return NextResponse.json(
  { error: error.message },
  { status: 500, headers: corsHeaders }
);
```

### 6. vercel.json Configuration
```json
{
  "version": 2,
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    }
  ],
  "functions": {
    "api/**/*.js": {
      "runtime": "nodejs18.x",
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

**Key Features**:
- Removed unnecessary "builds" section
- Keeps Node.js 18.x as default runtime (from PR #7)
- Individual files override with Edge Runtime (from PR #6)
- Memory and timeout configurations preserved

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

### 🔧 Runtime Configuration Testing
**Verify mixed runtime deployment:**

1. **Individual Override**: Each API file specifies `export const runtime = 'edge'`
2. **Default Fallback**: vercel.json provides Node.js 18.x as default
3. **No Conflicts**: Both configurations work together seamlessly

## API Endpoints

### 1. `/api/soundcloud` 
- **Method**: GET
- **Runtime**: Edge
- **Purpose**: Fetch user tracks from SoundCloud
- **Token**: Auto-refreshed using env vars

### 2. `/api/spotify`
- **Method**: GET
- **Runtime**: Edge
- **Purpose**: Fetch artist albums from Spotify
- **Auth**: Client credentials flow

### 3. `/api/songlink`
- **Method**: GET
- **Runtime**: Edge
- **Query**: `?spotifyUrl=...`
- **Purpose**: Get multi-platform links

### 4. `/api/soundcloud/refresh`
- **Method**: POST
- **Runtime**: Edge
- **Purpose**: Manually refresh SoundCloud token

### 5. `/api/soundcloud/auth` & `/api/soundcloud/callback`
- **Runtime**: Edge
- **Purpose**: OAuth flow for getting initial refresh token

## Deployment Notes

1. **Vercel Configuration**: Supports both Node.js default and Edge Runtime overrides
2. **Environment Variables**: All required env vars must be set
3. **No Filesystem**: No data directory or file storage needed
4. **CORS**: Locked to https://not-the-singer.com origin
5. **Performance**: Edge Runtime provides faster responses and global distribution

## Validation

Run the local validation script:
```bash
node test/validate-edge-runtime.js
```

This confirms:
- ✅ CORS headers configuration
- ✅ URL parameter parsing for Edge Runtime
- ✅ Module syntax and imports work correctly

## Merge Conflict Resolution Summary

**Problem**: PR #6 (Edge Runtime) and PR #7 (Node.js runtime) had conflicting vercel.json configurations.

**Solution Applied**:
1. **Kept** Node.js runtime specification from PR #7 as the default
2. **Removed** unnecessary builds section from vercel.json (as in PR #6)  
3. **Added** Edge Runtime exports to individual API files (from PR #6)
4. **Maintained** memory and timeout configurations

**Result**: Best of both worlds - deployment stability with Edge Runtime performance.