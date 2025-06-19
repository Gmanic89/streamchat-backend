const { StreamChat } = require('stream-chat');

const serverClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
);

// IMPORTANTE: En producción, esta "base de datos" debe ser compartida 
// entre login.js y register.js usando una DB real (MongoDB, PostgreSQL, etc.)
// Para desarrollo, asegúrate de tener la misma estructura en ambos archivos

// Base de datos temporal en memoria
const users = new Map();

// Usuarios predefinidos (deben coincidir con login.js)
users.set('admin', { 
    username: 'admin', 
    password: 'admin123', 
    createdAt: new Date(),
    role: 'admin'
});

users.set('abi', { 
    username: 'abi', 
    password: 'abi123', 
    createdAt: new Date(),
    role: 'user'
});

module.exports = async (req, res) => {
    // Habilitar CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false,
            error: 'Método no permitido' 
        });
    }

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Username y password son requeridos' 
            });
        }

        // Validar longitud mínima
        if (password.length < 3) {
            return res.status(400).json({ 
                success: false,
                error: 'La contraseña debe tener al menos 3 caracteres' 
            });
        }

        // Verificar si el usuario ya existe
        if (users.has(username.toLowerCase())) {
            return res.status(400).json({ 
                success: false,
                error: 'Usuario ya existe' 
            });
        }

        console.log(`📝 Registrando nuevo usuario: ${username}`);

        // Crear usuario en Stream Chat
        await serverClient.upsertUser({
            id: username,
            name: username,
            created_at: new Date().toISOString()
        });

        // Guardar usuario en nuestra "base de datos"
        users.set(username.toLowerCase(), { 
            username, 
            password, 
            createdAt: new Date(),
            role: 'user'  // Los nuevos usuarios son 'user' por defecto
        });

        // Crear token
        const token = serverClient.createToken(username);

        console.log(`✅ Usuario registrado exitosamente: ${username}`);

        res.status(201).json({ 
            success: true,
            username, 
            token,
            message: 'Usuario registrado exitosamente',
            role: 'user'
        });

    } catch (error) {
        console.error('❌ Error en registro:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
};