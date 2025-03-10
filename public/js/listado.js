// public/js/listado.js
/*vercel: https://solocaps.vercel.app/ */
/* local:  http://localhost:8080/ */
//Funcion para hacer peticiones a las rutas
async function fetchData(url, token){
    try{
      const res = await fetch(url, {
          method: 'GET',
          headers: {
              'Authorization': `Bearer ${token}`
          }
      });
      if (!res.ok) {
        throw new Error("Problemas en login");
      }
      return await res.json();
    }catch(e){
      console.error("Error en peticion", e);
      if (e.message === "Problemas en login") {
        window.location.href = "/login.html";
      }
      return [];
    }
  }

  async function init(){
    const token = localStorage.getItem('jwt-token');
    console.log('Token from localStorage:', token); // Verifico el token

    // Cargar listado de productos
    try {
        const datos = await fetchData("http://localhost:8080/listado", token) //cambiar la url si es necesario
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
        //cambiar las url si es necesario
        await Promise.all([cargarTiposProducto(token, "http://localhost:8080/tiposProducto"), cargarProveedores(token, "http://localhost:8080/proveedores")]);
    } catch (error) {
        console.error('Error al cargar listado de productos:', error);
    }

    async function cargarTiposProducto(token, url) {
        try {
            const tiposProducto = await fetchData(url, token);
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

    async function cargarProveedores(token, url) {
        try {
            const proveedores = await fetchData(url, token);
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
  }
  document.addEventListener('DOMContentLoaded', init);
