
// Función para determinar la URL base de la API según el entorno
function getApiBaseUrl() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Si estamos en desarrollo local
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `http://${hostname}:${port}`;
    }
    
    // Si estamos en el servidor docker local
    if (hostname === '192.168.1.222') {
        return `http://${hostname}:${port}`;
    }
    
    // Si estamos en el dominio
    if (hostname === 'crissferro.net.ar') {
        return `http://${hostname}:${port}`;
    }
    
    // Por defecto, usar la misma URL base que el navegador
    //return window.location.origin;
    return `${window.location.protocol}//${hostname}${port ? ':'+port : ''}`;
}

// URL base para las peticiones API
const apiBaseUrl = getApiBaseUrl();
console.log('🔗 API Base URL:', apiBaseUrl);


const login = async () => {
    const username = document.querySelector(`[name='username']`).value;
    const password = document.querySelector(`[name='password']`).value;
    
    try {
        // Usar ruta relativa en lugar de URL absoluta
        const resp = await fetch(`/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, password }),
            credentials: 'include'
        });
        
        console.log('📩 Respuesta recibida:', resp.status);
        
        if (!resp.ok) {
            if (resp.status === 404) {
                throw new Error("Usuario no encontrado");
            } else if (resp.status === 401) {
                throw new Error("Password incorrecto");
            } else {
                throw new Error(`Error del servidor: ${resp.status}`);
            }
        }
        
        const data = await resp.json();
        console.log('✅ Login exitoso');
        
        localStorage.setItem("jwt-token", data.token);
        window.location.href = "/dashboard.html";
    } catch (error) {
        console.error('❌ Error durante el login:', error);
        alert(error.message || error);
    }
};

// Exportar la función para poder usarla en los eventos del DOM
window.login = login;