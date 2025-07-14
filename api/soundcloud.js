export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://not-the-singer.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Your access token (in production, this would be stored securely)
    const accessToken = 'eyJraWQiOiIwZTY0ODM1NC1hYjQ1LTQ3ZDYtYjQ2YS05ZGZkZmEyNzc2ZDkiLCJ0eXAiOiJhdCtKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJzb3VuZGNsb3VkOnVzZXJzOjU3NDg3MTI0NCIsImF1ZCI6Imh0dHBzOi8vc291bmRjbG91ZC5jb20iLCJzY29wZSI6IiIsImlzcyI6Imh0dHBzOi8vc2VjdXJlLnNvdW5kY2xvdWQuY29tIiwiY2FpIjoiMzE4NDI4IiwiZXhwIjoxNzUyNDk4NDgyLCJpYXQiOjE3NTI0OTQ4ODIsImp0aSI6ImQ3ZTJmMjU0LWZlMDUtNDg4Yy04OGZhLTczMWFhN2FmNTRkMSIsImNsaWVudF9pZCI6InZFeDQ4Nkd4YnFBVTJnMGp0cVltM1ZybzRMZmMzQXR5Iiwic2lkIjoiMDFLMDREQkZYWkhYWFdCTThHRTBXWUFWVlcifQ.rHfX1rLh9BV8f2iEFCjnXjdl3n93BwJsKWFE4tSp0iPDRYAy5t_9Szs9X4wpcO2wC8-wA73O4iYcNmAeW50-BxU2ZBupy8jug7FZYEaEi4cbMgWGRZWM5ub9TyJcAKK0nPIGy9uvP97YTRGculBT2C2oc3MJ5h9qhvcOlB5FoJWGN_MH70fyL9iVSIyfbPNMG5XNQao4W738QCCRWad-KZyCfoRYThzF2KeHtKfWwmjvfTbeGGuQqcen6z6cp-DtglPrG9t1nv7zxY3bgHpdlzKW1dadA1GBJmAycmNEKcWWkunjYryLHLuA1qj6bJ5PljdAwz4fNweZ1xH1gy0lZg';
    
    const response = await fetch('https://api.soundcloud.com/me/tracks?limit=50', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`SoundCloud API returned ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('SoundCloud API error:', error);
    res.status(500).json({ error: 'Failed to fetch from SoundCloud', details: error.message });
  }
}
