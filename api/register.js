const { StreamChat } = require('stream-chat');

const serverClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
);

// Almacén temporal (se reinicia en cada despliegue)
const users = new Map();

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    if (users.has(username)) {
        return res.status(400).json({ error: 'Usuario ya existe' });
    }

    users.set(username, { username, password });

    const token = serverClient.createToken(username);
    res.status(200).json({ username, token });
};