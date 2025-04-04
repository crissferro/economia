const login = async () => {
    const username = document.querySelector(`[name='username']`).value;
    const password = document.querySelector(`[name='password']`).value;

    const resp = await fetch('login/login', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    if (resp.status === 404) {
        throw ("Usuario no encontrado");
    } else if (resp.status === 401) {
        throw ("Password incorrecto");
    }

    const data = await resp.json();

    localStorage.setItem("jwt-token", data.token);
    window.location.href = "/dashboard.html";
};