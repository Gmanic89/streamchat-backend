const { StreamChat } = require('stream-chat');

const serverClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
);

// Base de datos con admin predefinido
const users = new Map();

// Usuario admin predefinido
users.set('admin', { 
    username: 'admin', 
    password: 'admin123', 
    createdAt: new Date(),
    role: 'admin'
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
                error: 'Usuario no encontrado' 
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