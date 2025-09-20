class Auth {
    static API_URL = 'http://localhost:3000/api';

    static async login(email, password) {
        try {
            console.log('🔄 Intentando login con:', email);
            
            const response = await fetch(`${this.API_URL}/users/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('📨 Respuesta del servidor:', data);

            if (!response.ok) {
                const errorMessage = data.message || data.error || 'Error al iniciar sesión';
                throw new Error(errorMessage);
            }

            // 🔹 CAMBIO: Soporte para token y user en raíz o dentro de data
            const token = data.token || data.data?.token;
            const user = data.user || data.data?.user;

            if (token) {
                // Guardar el token en localStorage
                localStorage.setItem('token', token);
                
                // Guardar información del usuario si viene en la respuesta
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }
                
                console.log('✅ Login exitoso');
                window.location.href = '/dashboard';
            } else {
                throw new Error('No se recibió token de autenticación');
            }

            return data;
        } catch (error) {
            console.error('❌ Error de login:', error);
            throw error;
        }
    }

    static async register(username, email, password) {
        try {
            console.log('🔄 Intentando registro con:', { username, email });
            
            const response = await fetch(`${this.API_URL}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();
            console.log('📨 Respuesta del registro:', data);

            if (!response.ok) {
                const errorMessage = data.message || data.error || 'Error en el registro';
                throw new Error(errorMessage);
            }

            return {
                status: 'success',
                data: data
            };
        } catch (error) {
            console.error('❌ Error de registro:', error);
            throw error;
        }
    }

    static async logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    static getToken() {
        return localStorage.getItem('token');
    }

    static isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;
        
        try {
            // Verificar si el token no está expirado (opcional)
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            
            if (payload.exp && payload.exp < currentTime) {
                this.clearSession();
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error verificando token:', error);
            this.clearSession();
            return false;
        }
    }

    static clearSession() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    static async getCurrentUser() {
        try {
            const token = this.getToken();
            if (!token) return null;

            // Primero intentar obtener usuario del localStorage
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    return JSON.parse(storedUser);
                } catch (e) {
                    console.error('Error parsing stored user:', e);
                }
            }

            // Si no está en localStorage, hacer petición al servidor
            const response = await fetch(`${this.API_URL}/users/me`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    this.clearSession();
                    return null;
                }
                throw new Error('Error al obtener usuario');
            }

            const data = await response.json();
            const user = data.data || data.user || data;
            
            // Guardar en localStorage para futuras consultas
            localStorage.setItem('user', JSON.stringify(user));
            
            return user;
        } catch (error) {
            console.error('Error al obtener usuario actual:', error);
            this.clearSession();
            return null;
        }
    }

    static async updateProfile(userData) {
        try {
            const token = this.getToken();
            if (!token) throw new Error('No autenticado');

            const response = await fetch(`${this.API_URL}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al actualizar perfil');
            }

            // Actualizar usuario en localStorage si el update fue exitoso
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            throw error;
        }
    }

    // Método para verificar si una ruta requiere autenticación
    static requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = '/login';
            return false;
        }
        return true;
    }

    // Método para hacer peticiones autenticadas
    static async authenticatedFetch(url, options = {}) {
        const token = this.getToken();
        if (!token) {
            throw new Error('No hay token de autenticación');
        }

        const defaultHeaders = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        const config = {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        };

        const response = await fetch(url, config);

        if (response.status === 401) {
            this.clearSession();
            window.location.href = '/login';
            throw new Error('Sesión expirada');
        }

        return response;
    }
}