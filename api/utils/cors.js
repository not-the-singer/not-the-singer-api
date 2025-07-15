/**
 * CORS utility functions for consistent header management
 * Ensures CORS headers are applied to all responses (success and error)
 */

export function setCorsHeaders(response) {
  response.headers.set('Access-Control-Allow-Origin', 'https://not-the-singer.com');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export function createCorsResponse(body, status = 200, headers = {}) {
  const response = new Response(
    typeof body === 'string' ? body : JSON.stringify(body),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    }
  );
  return setCorsHeaders(response);
}

export function createErrorResponse(error, status = 500) {
  const errorBody = {
    error: typeof error === 'string' ? error : error.message || 'An error occurred',
    ...(error.details && { details: error.details })
  };
  return createCorsResponse(errorBody, status);
}

export function handleOptions() {
  return createCorsResponse('', 200);
}