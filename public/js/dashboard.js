// public/js/dashboard.js
//Funcion para hacer peticiones a las rutas
document.querySelector('body').onload = async () => {
    const token = localStorage.getItem('jwt-token');
    console.log('Token from localStorage:', token); // Verifico el token

    // Cargar listado de productos
    try {
        const res = await fetch(`http://127.0.0.1:8080/dashboard`, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            window.location.href = "/login.html";
            throw new Error("Problemas en login");
        }

        const datos = await res.json();
        let listaHTML = document.querySelector(`#listado`);
        listaHTML.innerHTML = `
            <div class="list-header">
                <h4>Nombre</h4>
                <h4>Descripción</h4>
                <h4>Precio</h4>
                <h4>Tipo Producto</h4>
                <h4>Marca</h4>
                <h4>Acciones</h4>
            </div>
        `;

   datos.forEach(registro => {
        listaHTML.innerHTML += `
            <div class="list-item">
                <h5>${registro.descripcion}</h5>
                <h5>${registro.monto}</h5>
                <h5>${registro.fecha}</h5>
                <h5>${registro.pagado ? 'Sí' : 'No'}</h5>
                <h5>${registro.concepto}</h5>
                <h5>${registro.rubro}</h5>
            </div>
        `;
    });
  } catch (error) {
    console.error('Error al cargar movimientos:', error);
  }
}
