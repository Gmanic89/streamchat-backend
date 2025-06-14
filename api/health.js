// api/index.js
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
      return res.status(200).end();
  }

  res.status(200).json({ 
      message: 'Backend para Stream Chat funcionando correctamente',
      timestamp: new Date().toISOString(),
      endpoints: {
          register: '/api/register',
          login: '/api/login'
      }
  });
};