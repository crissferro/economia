const login = async () => {
  const user = document.querySelector(`[name='username']`).value;
  const password = document.querySelector(`[name='password']`).value;

  // Realizar la solicitud al servidor para hacer login
  const resp = await fetch('login/login', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user, password })
  });

  // Manejo de errores según el estado de la respuesta
  if (resp.status === 404) {
    alert("Usuario no encontrado");
    return;
  } else if (resp.status === 401) {
    alert("Password incorrecto");
    return;
  }

  // Si todo va bien, se recibe el token
  const data = await resp.json();

  // Verificar si el token fue recibido correctamente
  if (data.token) {
    localStorage.setItem("jwt-token", data.token);  // Almacenar el token en localStorage
    window.location.href = "/dashboard";             // Redirigir al dashboard
  } else {
    console.error("No se recibió un token válido");
  }
};
