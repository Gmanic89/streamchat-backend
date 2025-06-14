// api/index.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { StreamChat } = require('stream-chat');
const { createServer } = require('@vercel/node');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;
const serverClient = StreamChat.getInstance(apiKey, apiSecret);

// Almacén temporal de usuarios
const users = new Map();

// Registro de usuario
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (users.has(username)) {
    return res.status(400).json({ error: 'Usuario ya existe' });
  }

  users.set(username, { username, password });
  const token = serverClient.createToken(username);
  res.json({ username, token });
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = users.get(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
  }

  const token = serverClient.createToken(username);
  res.json({ username, token });
});

// Ping de prueba
app.get('/', (req, res) => {
  res.send('Backend para Stream Chat funcionando');
});

// 👇 Esta línea convierte tu Express app en una función serverless
module.exports = createServer(app);
