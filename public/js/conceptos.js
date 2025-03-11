document.getElementById('agregarConcepto').addEventListener('click', async () => {
    const nombreConcepto = document.getElementById('nombreConcepto').value.trim();
    const token = localStorage.getItem('jwt-token');

    if (!nombreConcepto) {
        alert('El nombre del concepto no puede estar vacío');
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/conceptos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombre: nombreConcepto })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al agregar Concepto');
        }

        alert('Concepto agregado con éxito');
        document.getElementById('nombreConcepto').value = '';
        cargarConceptos(); // Actualiza la lista después de agregar
    } catch (error) {
        console.error('Error al agregar concepto:', error);
        alert(error.message);
    }
});

// Función para cargar conceptos en la lista con botones de acción
async function cargarConceptos() {
    try {
        const response = await fetch('http://localhost:8080/conceptos', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener conceptos');
        }

        const conceptos = await response.json();
        const listaConceptos = document.getElementById('listaConceptos');
        listaConceptos.innerHTML = ''; // Limpiar lista antes de agregar nuevos elementos

        listaConceptos.innerHTML = `
            <div class="list-header">
                <h4>Id</h4>
                <h4>Nombre</h4>
                <h4>Acciones</h4>
            </div>
        `;

        conceptos.forEach(concepto => {
            const listItem = document.createElement('div');
            listItem.classList.add('list-item');

            listItem.innerHTML = `
                <h5>${concepto.id}</h5>
                <h5>${concepto.nombre}</h5>
                <div class="acciones">
                    <button class="btn modificar" data-id="${concepto.id}" data-nombre="${concepto.nombre}">Modificar</button>
                    <button class="btn eliminar" data-id="${concepto.id}">Eliminar</button>
                </div>
            `;

            listaConceptos.appendChild(listItem);
        });

        // Agregar eventos a los botones de Modificar y Eliminar
        document.querySelectorAll('.modificar').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const conceptoId = event.target.dataset.id;
                const conceptoNombre = event.target.dataset.nombre;
                modificarConcepto(conceptoId, conceptoNombre);
            });
        });

        document.querySelectorAll('.eliminar').forEach(btn => {
            btn.addEventListener('click', (event) => {
                const conceptoId = event.target.dataset.id;
                eliminarConcepto(conceptoId);
            });
        });

    } catch (error) {
        console.error('Error al cargar conceptos:', error);
    }
}

// Función para modificar un concepto
function modificarConcepto(id, nombreActual) {
    const nuevoNombre = prompt("Ingrese el nuevo nombre del concepto:", nombreActual);
    if (!nuevoNombre || nuevoNombre.trim() === '') {
        alert('El nombre del concepto no puede estar vacío');
        return;
    }

    const token = localStorage.getItem('jwt-token');

    fetch(`http://localhost:8080/conceptos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ nombre: nuevoNombre })
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error al modificar el concepto'); });
            }
            alert('concepto modificado con éxito');
            cargarConceptos(); // Recargar lista
        })
        .catch(error => {
            console.error('Error al modificar concepto:', error);
            alert(error.message);
        });
}

// Función para eliminar un concepto
function eliminarConcepto(id) {
    if (!confirm("¿Seguro que deseas eliminar este concepto?")) return;

    const token = localStorage.getItem('jwt-token');

    fetch(`http://localhost:8080/conceptos/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error al eliminar el Concepto'); });
            }
            alert('Concepto eliminado con éxito');
            cargarConceptos(); // Recargar lista
        })
        .catch(error => {
            console.error('Error al eliminar Concepto:', error);
            alert(error.message);
        });
}

// Cargar rubros cuando se carga la página
document.addEventListener('DOMContentLoaded', cargarConceptos);

