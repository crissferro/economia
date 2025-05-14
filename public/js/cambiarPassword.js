// Nos aseguramos de que apiBaseUrl esté definido desde login.js
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('form-password').addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value;
        const passwordActual = document.getElementById('passwordActual').value;
        const passwordNueva = document.getElementById('passwordNueva').value;

        try {
            const resp = await fetch(`${apiBaseUrl}/login/cambiar-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, passwordActual, passwordNueva }),
                credentials: 'include'
            });

            const mensaje = await resp.text();
            alert(mensaje);

            if (resp.ok) {
                // Si fue exitoso, redirigimos al login
                window.location.href = "/login.html";
            }

        } catch (err) {
            alert('❌ Error: ' + err.message);
        }
    });
});
