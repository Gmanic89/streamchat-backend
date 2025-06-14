const { StreamChat } = require('stream-chat');

const serverClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
);

// Simulación de una base de datos simple (esto se reinicia en cada deploy)
// En producción deberías usar una base de datos real
const users = new Map();

module.exports = async (req, res) => {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username y password son requeridos' });
        }

        // Verificar si el usuario ya existe
        if (users.has(username)) {
            return res.status(400).json({ error: 'Usuario ya existe' });
        }

        // Crear usuario en Stream Chat
        await serverClient.upsertUser({
            id: username,
            name: username,
        });

        // Guardar usuario localmente (temporal)
        users.set(username, { username, password, createdAt: new Date() });

        // Crear token
        const token = serverClient.createToken(username);

        res.status(201).json({ 
            success: true,
            username, 
            token,
            message: 'Usuario registrado exitosamente'
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
};