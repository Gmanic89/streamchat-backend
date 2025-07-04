const { StreamChat } = require('stream-chat');

const serverClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
);

// Base de datos sincronizada con register.js
const users = new Map();

// IMPORTANTE: Estos usuarios deben coincidir EXACTAMENTE con register.js
// Incluir todos los usuarios que ya fueron registrados
users.set('admin', { 
    username: 'admin', 
    password: 'admin123', 
    createdAt: new Date(),
    role: 'admin'
});

users.set('abi', { 
    username: 'abi', 
    password: 'AQUI_LA_CONTRASEÑA_QUE_USASTE_PARA_ABI', 
    createdAt: new Date(),
    role: 'user'
});

users.set('mate', { 
    username: 'mate', 
    password: 'AQUI_LA_CONTRASEÑA_QUE_USASTE_PARA_MATE', 
    createdAt: new Date(),
    role: 'user'
});

users.set('mate2', { 
    username: 'mate2', 
    password: 'AQUI_LA_CONTRASEÑA_QUE_USASTE_PARA_MATE2', 
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
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Username y password son requeridos' 
            });
        }

        // VALIDACIÓN REAL DE CREDENCIALES
        const user = users.get(username.toLowerCase());
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                error: 'Usuario no encontrado. Regístrate primero.' 
            });
        }

        if (user.password !== password) {
            return res.status(401).json({ 
                success: false,
                error: 'Contraseña incorrecta' 
            });
        }

        // Si llegamos aquí, las credenciales son válidas
        console.log(`✅ Login exitoso para usuario: ${username}`);

        // Actualizar usuario en Stream Chat
        await serverClient.upsertUser({
            id: username,
            name: username,
            last_login: new Date().toISOString(),
            role: user.role || 'user'
        });

        // Generar token válido
        const token = serverClient.createToken(username);

        res.status(200).json({ 
            success: true,
            username: user.username, 
            token,
            message: 'Login exitoso',
            role: user.role || 'user'
        });

    } catch (error) {
        console.error('❌ Error en login:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
};