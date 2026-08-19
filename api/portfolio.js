export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey, userKey, endpoint } = req.body;

  if (!apiKey || !userKey) {
    return res.status(400).json({ error: 'API key and user key required' });
  }

  try {
    const crypto = require('crypto');
    const requestId = crypto.randomUUID ? crypto.randomUUID() : require('uuid').v4();

    const response = await fetch(
      `https://public-api.etoro.com/api/v1${endpoint}`,
      {
        method: 'GET',
        headers: {
          'x-api-key': apiKey,
          'x-user-key': userKey,
          'x-request-id': requestId,
          'Accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({
        error: `eToro API error: ${response.status} ${response.statusText}`
      });
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
