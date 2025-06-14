// api/login.js
const { StreamChat } = require('stream-chat');

const serverClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
);

// IMPORTANTE: En funciones serverless, cada función tiene su propio contexto
// Por eso necesitamos una solución diferente para persistir usuarios
// Por ahora, creamos el token sin validar contraseña (solo para pruebas)

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

        // TEMPORAL: Sin validación de contraseña
        // Simplemente creamos/actualizamos el usuario y generamos token
        // En una app real, validarías contra una base de datos
        await serverClient.upsertUser({
            id: username,
            name: username,
            last_login: new Date().toISOString()
        });

        const token = serverClient.createToken(username);

        res.status(200).json({ 
            success: true,
            username, 
            token,
            message: 'Login exitoso'
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ 
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
};