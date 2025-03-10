const login = async () => {
  const username = document.querySelector(`[name='username']`).value;
  const password = document.querySelector(`[name='password']`).value;

  const resp = await fetch('/login/login', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
  });

  if (resp.status === 404) {
      alert("Usuario no encontrado");
      return;
  } else if (resp.status === 401) {
      alert("Password incorrecto");
      return;
  }

  const data = await resp.json();

  if (data.token) {
      localStorage.setItem("jwt-token", data.token);
      window.location.href = "/dashboard";
  } else {
      console.error("No se recibió un token válido");
  }
};