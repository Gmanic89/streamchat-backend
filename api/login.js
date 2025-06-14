const { StreamChat } = require('stream-chat');

const serverClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
);

// Almacén temporal (compartido)
const users = new Map();

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    const user = users.get(username);

    if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Usuario o contraseña incorrectos' });
    }

    const token = serverClient.createToken(username);
    res.status(200).json({ username, token });
};
