document.addEventListener('DOMContentLoaded', () => {
    getRubros(); // Cargar rubros al cargar la página

    // Evento para agregar un nuevo rubro
    document.getElementById('agregarRubro').addEventListener('click', async () => {
        const nombreRubro = document.getElementById('nombreRubro').value.trim();
        const token = localStorage.getItem('jwt-token');

        if (!nombreRubro) {
            alert('El nombre del rubro no puede estar vacío');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/rubros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nombre: nombreRubro })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al agregar rubro');
            }

            alert('Rubro agregado con éxito');
            document.getElementById('nombreRubro').value = '';
            getRubros(); // Actualizar la lista después de agregar
        } catch (error) {
            console.error('Error al agregar rubro:', error);
            alert(error.message);
        }
    });

    // Función para cargar rubros en la lista
    async function getRubros() {
        const token = localStorage.getItem('jwt-token');
        try {
            const response = await fetch('http://localhost:8080/rubros', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener rubros');
            }

            const rubros = await response.json();
            const listaRubros = document.getElementById('listaRubros');
            listaRubros.innerHTML = ''; // Limpiar lista antes de agregar nuevos elementos

            listaRubros.innerHTML = `
                <div class="list-header">
                    <h4>Nombre</h4>
                    <h4>Acciones</h4>
                </div>
            `;

            rubros.forEach(rubro => {
                const listItem = document.createElement('div');
                listItem.classList.add('list-item');

                listItem.innerHTML = `
                    <h5>${rubro.nombre}</h5>
                    <div class="acciones">
                        <div>
                        <button class="btn modificar" data-id="${rubro.id}" data-nombre="${rubro.nombre}"><i class="fas fa-edit"></i></button>
                        </div>
                        <div>
                        <button class="btn eliminar" data-id="${rubro.id}"><i class="fas fa-trash"></i></button>
                        </div>
                        
                    </div>
                `;

                listaRubros.appendChild(listItem);
            });

            // Agregar eventos a los botones de Modificar y Eliminar
            document.querySelectorAll('.modificar').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    const id = event.target.dataset.id;
                    const nombre = event.target.dataset.nombre;
                    modificarRubro(id, nombre);
                });
            });

            document.querySelectorAll('.eliminar').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    const rubroId = event.target.dataset.id;
                    eliminarRubro(rubroId);
                });
            });

        } catch (error) {
            console.error('Error al cargar rubros:', error);
        }
    }

    // Función para modificar un rubro
    function modificarRubro(id, nombreActual) {
        const nuevoNombre = prompt("Ingrese el nuevo nombre del rubro:", nombreActual);
        if (!nuevoNombre || nuevoNombre.trim() === '') {
            alert('El nombre del rubro no puede estar vacío');
            return;
        }

        const token = localStorage.getItem('jwt-token');

        fetch(`http://localhost:8080/rubros/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombre: nuevoNombre })
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.error || 'Error al modificar el rubro'); });
                }
                alert('Rubro modificado con éxito');
                getRubros(); // Recargar lista
            })
            .catch(error => {
                console.error('Error al modificar rubro:', error);
                alert(error.message);
            });
    }

    // Función para eliminar un rubro
    function eliminarRubro(id) {
        if (!confirm("¿Seguro que deseas eliminar este rubro?")) return;

        const token = localStorage.getItem('jwt-token');

        fetch(`http://localhost:8080/rubros/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.error || 'Error al eliminar el rubro'); });
                }
                alert('Rubro eliminado con éxito');
                getRubros(); // Recargar lista
            })
            .catch(error => {
                console.error('Error al eliminar rubro:', error);
                alert(error.message);
            });
    }
});