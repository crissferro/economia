/*vercel: https://solocaps.vercel.app/ */
/* local:  http://localhost:8080/ */

document.querySelector('body').onload = async () => {
    const token = localStorage.getItem('jwt-token');
    console.log('Token from localStorage:', token); // Verifico el token

    // Cargar listado de productos
    try {
        const res = await fetch(`https://solocaps.vercel.app/listado`, {
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
                <form method="POST" action="/listado?_metodo=DELETE" class="list-item">
                    <h5>${registro.nombre}</h5>
                    <h5>${registro.descripcion}</h5>
                    <h5>${registro.precio}</h5>
                    <h5>${registro.tipoProducto}</h5>
                    <h5>${registro.proveedor}</h5>
                    <input type="hidden" name="idEliminar" value="${registro.id}">
                    <div id="acciones" class="acciones">
                        <h5><a href="/modificar/${registro.id}" class="btn">Modificar</a></h5>
                        <h5><input type="submit" value="Eliminar" class="btn"></h5>
                    </div>
                </form>`;
        });

        // Cargar tipos de productos y proveedores
        await Promise.all([cargarTiposProducto(token), cargarProveedores(token)]);
    } catch (error) {
        console.error('Error al cargar listado de productos:', error);
    }

    async function cargarTiposProducto(token) {
        try {
            const res = await fetch(`https://solocaps.vercel.app/tiposProducto`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error(`Error fetching tiposProducto: ${res.statusText}`);
            }

            const tiposProducto = await res.json();
            console.log('Tipos de Producto:', tiposProducto); // Verifico los datos obtenidos

            let selectTipoProducto = document.querySelector('#selecttipoProducto');
            let selectTipoProductoForm = document.querySelector('#selecttipoProductoForm');
            if (selectTipoProducto && selectTipoProductoForm) {
                selectTipoProducto.innerHTML = '<option value="">Seleccione un tipo de producto</option>';
                selectTipoProductoForm.innerHTML = '<option value="">Seleccione un tipo de producto</option>';

                tiposProducto.forEach(tipo => {
                    let option = document.createElement('option');
                    option.value = tipo.id;
                    option.textContent = tipo.nombre;
                    selectTipoProducto.appendChild(option);
                    selectTipoProductoForm.appendChild(option.cloneNode(true)); // Clonar la opción para el segundo select
                });
            } else {
                console.error('Elemento selectTipoProducto no encontrado en el DOM');
            }
        } catch (error) {
            console.error('Error al cargar tipos de producto:', error);
        }
    }

    async function cargarProveedores(token) {
        try {
            const res = await fetch(`https://solocaps.vercel.app/proveedores`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error(`Error fetching proveedores: ${res.statusText}`);
            }

            const proveedores = await res.json();
            console.log('Proveedores:', proveedores); // Verifico los datos obtenidos

            let selectProveedores = document.querySelector('#proveedores');
            let selectProveedoresForm = document.querySelector('#proveedoresForm');
            if (selectProveedores && selectProveedoresForm) {
                selectProveedores.innerHTML = '<option value="">Seleccione una marca</option>';
                selectProveedoresForm.innerHTML = '<option value="">Seleccione una marca</option>';

                proveedores.forEach(proveedor => {
                    let option = document.createElement('option');
                    option.value = proveedor.id;
                    option.textContent = proveedor.alias;
                    selectProveedores.appendChild(option);
                    selectProveedoresForm.appendChild(option.cloneNode(true)); // Clonar la opción para el segundo select
                });
            } else {
                console.error('Elemento selectProveedores no encontrado en el DOM');
            }
        } catch (error) {
            console.error('Error al cargar proveedores:', error);
        }

    }
};