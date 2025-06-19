const { StreamChat } = require('stream-chat');

const serverClient = StreamChat.getInstance(
    process.env.STREAM_API_KEY,
    process.env.STREAM_API_SECRET
);

// Base de datos en memoria COMPARTIDA para login Y register
const users = new Map();

// Solo admin predefinido para empezar
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
        return res.status(405).json({ 
            success: false,
            error: 'Método no permitido' 
        });
    }

    try {
        const { username, password, action } = req.body;

        if (!username || !password) {
            return res.status(400).json({ 
                success: false,
                error: 'Username y password son requeridos' 
            });
        }

        if (!action || (action !== 'login' && action !== 'register')) {
            return res.status(400).json({ 
                success: false,
                error: 'Action debe ser "login" o "register"' 
            });
        }

        // ===== REGISTRO =====
        if (action === 'register') {
            console.log(`📝 Procesando REGISTRO para: ${username}`);

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

            // Crear nuevo usuario en memoria
            const newUser = {
                username: username,
                password: password,
                role: username.toLowerCase() === 'admin' ? 'admin' : 'user',
                createdAt: new Date()
            };

            users.set(username.toLowerCase(), newUser);
            console.log(`✅ Usuario registrado en memoria: ${username}`);
            console.log(`📊 Total usuarios en memoria: ${users.size}`);

            // Crear usuario en Stream Chat
            await serverClient.upsertUser({
                id: username,
                name: username,
                created_at: new Date().toISOString(),
                role: newUser.role
            });

            // Crear token
            const token = serverClient.createToken(username);

            return res.status(201).json({ 
                success: true,
                username: username, 
                token,
                message: 'Usuario registrado exitosamente',
                role: newUser.role
            });
        }

        // ===== LOGIN =====
        if (action === 'login') {
            console.log(`🔐 Procesando LOGIN para: ${username}`);
            console.log(`📊 Usuarios disponibles: ${Array.from(users.keys()).join(', ')}`);

            // Buscar usuario en memoria
            const user = users.get(username.toLowerCase());
            
            if (!user) {
                console.log(`❌ Usuario no encontrado: ${username}`);
                return res.status(401).json({ 
                    success: false,
                    error: 'Usuario no encontrado. Regístrate primero.' 
                });
            }

            if (user.password !== password) {
                console.log(`❌ Contraseña incorrecta para: ${username}`);
                return res.status(401).json({ 
                    success: false,
                    error: 'Contraseña incorrecta' 
                });
            }

            console.log(`✅ Login exitoso para: ${username}`);

            // Actualizar usuario en Stream Chat
            await serverClient.upsertUser({
                id: username,
                name: username,
                last_login: new Date().toISOString(),
                role: user.role || 'user'
            });

            // Generar token válido
            const token = serverClient.createToken(username);

            return res.status(200).json({ 
                success: true,
                username: user.username, 
                token,
                message: 'Login exitoso',
                role: user.role || 'user'
            });
        }

    } catch (error) {
        console.error('❌ Error en autenticación:', error);
        res.status(500).json({ 
            success: false,
            error: 'Error interno del servidor',
            details: error.message 
        });
    }
};