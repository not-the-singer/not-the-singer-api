# Edge Runtime Migration and CORS Fixes

This document describes the changes made to migrate the API from Node.js runtime to Vercel Edge Runtime and fix CORS header issues.

## Issues Fixed

1. **SoundCloud endpoints returning 500 errors** - Fixed by migrating TokenManager from filesystem to KV storage
2. **CORS headers not maintained in error responses** - Fixed by creating consistent CORS utility functions
3. **Edge Runtime compatibility** - Migrated from Node.js runtime to Edge Runtime for better performance
4. **Import/export inconsistencies** - Standardized on ES modules throughout

## Key Changes

### 1. Edge Runtime Migration (`vercel.json`)

**Before:**
```json
{
  "version": 2,
  "builds": [{ "src": "api/**/*.js", "use": "@vercel/node" }],
  "functions": { "api/**/*.js": { "memory": 1024, "maxDuration": 10 } }
}
```

**After:**
```json
{
  "version": 2,
  "functions": { "api/**/*.js": { "runtime": "edge" } }
}
```

### 2. CORS Utility Functions (`api/utils/cors.js`)

Created centralized CORS management with functions:
- `setCorsHeaders(response)` - Adds CORS headers to any Response object
- `createCorsResponse(body, status, headers)` - Creates Response with CORS headers
- `createErrorResponse(error, status)` - Creates error Response with CORS headers
- `handleOptions()` - Handles OPTIONS preflight requests

### 3. TokenManager Refactor (`api/soundcloud/token-manager.js`)

**Before (Node.js filesystem):**
```javascript
const fs = require('fs').promises;
// ... filesystem operations
await fs.writeFile(this.tokenPath, JSON.stringify(tokens, null, 2));
```

**After (KV storage with fallback):**
```javascript
import { kv } from '@vercel/kv';
// ... KV operations with environment variable fallback
await kv.set(this.tokenKey, tokens);
```

### 4. API Endpoint Updates

All endpoints now:
- Use Edge Runtime compatible syntax
- Return `Response` objects instead of using `res` parameter
- Include consistent CORS headers in all responses (success and error)
- Use `btoa()` instead of `Buffer.from()` for base64 encoding

**Example transformation:**
```javascript
// Before (Node.js runtime)
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://not-the-singer.com');
  // ... logic
  res.status(500).json({ error: 'Failed' });
}

// After (Edge runtime)
export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return handleOptions();
  }
  // ... logic
  return createErrorResponse('Failed', 500);
}
```

## Environment Variables Required

The following environment variables are needed for full functionality:

### SoundCloud API
- `SOUNDCLOUD_CLIENT_ID` - SoundCloud app client ID
- `SOUNDCLOUD_CLIENT_SECRET` - SoundCloud app client secret  
- `SOUNDCLOUD_REFRESH_TOKEN` - Long-lived refresh token (obtained via auth flow)

### Spotify API
- `SPOTIFY_CLIENT_ID` - Spotify app client ID
- `SPOTIFY_CLIENT_SECRET` - Spotify app client secret

### Vercel KV (Optional)
- `KV_REST_API_URL` - KV store URL (automatically set by Vercel)
- `KV_REST_API_TOKEN` - KV store token (automatically set by Vercel)

## Token Management

The TokenManager now uses Vercel KV for persistent storage with automatic fallback to environment variables. This ensures:

1. **Production**: Uses KV storage for token persistence across function invocations
2. **Development**: Falls back to environment variables when KV is not available
3. **Edge Runtime**: No filesystem dependencies, fully compatible

## Testing

Run the included test scripts to verify functionality:

```bash
# Test core functionality
node /tmp/test-api.js

# Test endpoint behavior
node /tmp/test-endpoints.js
```

## Benefits

1. **Performance**: Edge Runtime provides faster cold starts and better geographic distribution
2. **Reliability**: CORS headers are now guaranteed in all responses
3. **Scalability**: KV storage works across all Edge Runtime regions
4. **Consistency**: Standardized error handling and response formats
5. **Maintainability**: Centralized CORS logic reduces code duplication

## Migration Notes

- All APIs now use ES modules (`import`/`export`) consistently
- Response objects are used instead of `res` parameter for Edge Runtime compatibility
- No breaking changes to API contracts - all endpoints work the same externally
- CORS preflight requests are properly handled across all endpoints