/*export const cargarRubros = async () => {
    const token = getToken();
    const listaRubrosDiv = document.getElementById('listaRubros');
    const nombreRubroInput = document.getElementById('nombreRubro');
    const agregarRubroButton = document.getElementById('agregarRubro');
    //variables para el form de edicion
    const editarRubroForm = document.getElementById('editarRubroForm');
    const editarNombreRubroInput = document.getElementById('editarNombreRubro');
    const guardarRubroButton = document.getElementById('guardarRubro');
    const cancelarEditarRubroButton = document.getElementById('cancelarEditarRubro');
    let rubroAEditar = null;


    document.querySelector('body').onload = async () => {
        const token = localStorage.getItem('jwt-token');
        console.log('Token from localStorage:', token);


        try {
            // Cargar rubros
            const responseRubros = await fetch('/api/rubros', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const rubros = await responseRubros.json();

            listaRubrosDiv.innerHTML = '';
            rubros.forEach(rubro => {
                const rubroElement = document.createElement('div');
                rubroElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <p id="rubro-${rubro.id}" class="mb-0">${rubro.nombre}</p>
                <div>
                    <button class="btn btn-sm btn-warning editarRubro" data-id="${rubro.id}">Editar</button>
                    <button class="btn btn-sm btn-danger eliminarRubro" data-id="${rubro.id}">Eliminar</button>
                </div>
             </div>
            `;
                listaRubrosDiv.appendChild(rubroElement);
            });

            // Agregar rubro
            if (agregarRubroButton) {
                agregarRubroButton.addEventListener('click', async () => {
                    const nombreRubro = nombreRubroInput.value.trim();
                    // Validar que el nombre no esté vacío
                    if (nombreRubro === '') {
                        alert('El nombre del rubro no puede estar vacío');
                        return;
                    }

                    const response = await fetch('/api/rubros', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ nombre: nombreRubro })
                    });

                    //Limpiar el input.
                    nombreRubroInput.value = '';
                    if (response.ok) {
                        cargarRubros();
                    } else {
                        const data = await response.json();
                        alert(`Error: ${data.error}`);
                    }
                });
            }

            // Delegación de eventos para Editar y Eliminar rubros
            listaRubrosDiv.addEventListener('click', async (event) => {
                const target = event.target;
                const rubroId = target.dataset.id;

                if (target.classList.contains('editarRubro')) {
                    // Obtener los datos del concepto seleccionado
                    rubroAEditar = rubros.find(rubro => rubro.id == rubroId);
                    // Mostrar el formulario y ocultar el parrafo
                    editarRubroForm.style.display = 'block';
                    document.getElementById(`rubro-${rubroId}`).style.display = 'none';
                    // Completar el formulario con los datos del concepto
                    editarNombreRubroInput.value = rubroAEditar.nombre;
                    // Logica para guardar
                    guardarRubroButton.addEventListener('click', async () => {
                        const nuevoNombre = editarNombreRubroInput.value;

                        try {
                            const response = await fetch(`/api/rubros/${rubroId}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ nombre: nuevoNombre })
                            });

                            if (response.ok) {
                                // Ocultar el formulario
                                editarRubroForm.style.display = 'none';
                                // Mostrar el parrafo
                                document.getElementById(`rubro-${rubroId}`).style.display = 'block';
                                cargarRubros();
                            } else {
                                const data = await response.json();
                                alert(data.error);
                            }
                        } catch (error) {
                            console.error('Error:', error);
                        }
                    });
                    // Logica para cancelar
                    cancelarEditarRubroButton.addEventListener('click', () => {
                        editarRubroForm.style.display = 'none';
                        document.getElementById(`rubro-${rubroId}`).style.display = 'block';
                    });
                } else if (target.classList.contains('eliminarRubro')) {
                    // Lógica para eliminar rubro
                    try {
                        const response = await fetch(`/api/rubros/${rubroId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (response.ok) {
                            cargarRubros();
                        } else {
                            const data = await response.json();
                            alert(data.error);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }
}
*/

// codigo nuevo //

document.querySelector('body').onload = async () => {
    const token = localStorage.getItem('jwt-token');
    console.log('Token from localStorage:', token); // Verifico el token

    // Cargar listado de rubros
    try {
        const res = await fetch(`http://localhost:8080/rubros`, {
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
        let listaHTML = document.querySelector(`#listaRubros`);
        listaHTML.innerHTML = `
            <div class="list-header">
                <h4>Id</h4>
                <h4>Nombre</h4>
            </div>
        `;
        datos.forEach(registro => {
            listaHTML.innerHTML += `
                <form method="POST" action="/listado?_metodo=DELETE" class="list-item">
                    <h5>${registro.id}</h5>
                    <h5>${registro.nombre}</h5>
                    <input type="hidden" name="idEliminar" value="${registro.id}">
                    <div id="acciones" class="acciones">
                        <h5><a href="/modificar/${registro.id}" class="btn">Modificar</a></h5>
                        <h5><input type="submit" value="Eliminar" class="btn"></h5>
                    </div>
                </form>`;
        });
    } catch (error) {
        console.error('Error al cargar listado de productos:', error);
    }
    /*
    
            // Obtener elementos del DOM
            const listaRubros = document.getElementById("lista-rubros");
            const btnAgregarRubro = document.getElementById("btn-agregar-rubro");
            const inputNombreRubro = document.getElementById("nombre-rubro");
    
            // Función para cargar rubros desde la API
            /*function cargarRubros() {
                fetch("http://localhost:8080/rubros", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                    .then(response => {
                        if (response.status === 403) {
                            throw new Error("Acceso denegado. Token inválido o expirado.");
                        }
                        return response.json();
                    })
                    .then(data => {
                        listaRubros.innerHTML = ""; // Limpiar lista antes de agregar nuevos
                        data.forEach(rubro => {
                            const li = document.createElement("li");
                            li.textContent = rubro.nombre;
                            listaRubros.appendChild(li);
                        });
                    })
                    .catch(error => {
                        console.error("Error al cargar los rubros:", error);
                    });
            }
    
            // Función para agregar un nuevo rubro
            function agregarRubro() {
                const nombre = inputNombreRubro.value.trim();
                if (nombre === "") {
                    alert("El nombre del rubro no puede estar vacío.");
                    return;
                }
    
                fetch("http://localhost:8080/rubros", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ nombre })
                })
                    .then(response => {
                        if (response.status === 403) {
                            throw new Error("Acceso denegado. Token inválido o expirado.");
                        }
                        if (!response.ok) {
                            throw new Error("Error al agregar el rubro.");
                        }
                        return response.json();
                    })
                    .then(() => {
                        inputNombreRubro.value = ""; // Limpiar input
                        cargarRubros(); // Actualizar lista de rubros
                    })
                    .catch(error => {
                        console.error("Error al agregar rubro:", error);
                    });
            }
    
            // Asociar evento al botón si existe en el DOM
            if (btnAgregarRubro) {
                btnAgregarRubro.addEventListener("click", agregarRubro);
            } else {
                console.error("El botón 'btn-agregar-rubro' no se encontró en el DOM.");
            }
    
            // Cargar rubros al iniciar
            cargarRubros();
        } catch (error) {
            console.error('Error:', error);
        }
    
        */
}
