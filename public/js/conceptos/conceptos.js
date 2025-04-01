// Cargar lista de rubros dinámicamente en el select
async function cargarRubros() {
    try {
        const response = await fetch('http://localhost:8080/rubros', {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
        });

        if (!response.ok) throw new Error('Error al obtener rubros');

        const rubros = await response.json();
        const rubroSelect = document.getElementById('rubroConcepto');

        if (!rubroSelect) {
            console.error("Error: No se encontró el select rubroConcepto");
            return;
        }

        rubroSelect.innerHTML = '<option value="">Seleccione un rubro</option>'; // Limpiar antes de agregar

        rubros.forEach(rubro => {
            let option = document.createElement('option');
            option.value = rubro.id;
            option.textContent = rubro.nombre;
            rubroSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error al cargar rubros:', error);
    }
}

// Función para cargar conceptos en la lista con botones de acción
function cargarConceptos() {
    fetch('http://localhost:8080/conceptos', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
    })
        .then(res => res.json())
        .then(conceptos => {
            const listaConceptos = document.getElementById('listaConceptos');
            listaConceptos.innerHTML = `
            <div class="list-header">
                    <h4>Id</h4>
                    <h4>Nombre</h4>
                    <h4>Tipo</h4>
                    <h4>Requiere Vencimiento</h4>
                    <h4>Acciones</h4>
                </div>
                `;

            conceptos.forEach(concepto => {
                const listItem = document.createElement('div');
                listItem.classList.add('list-item');
                listItem.innerHTML = `
                <h5>${concepto.id}</h5>
                <h5>${concepto.nombre}</h5>
                <h5>${concepto.tipo}</h5>
                <h5>${concepto.requiere_vencimiento == 1 ? 'Sí' : 'No'}</h5>
                <div class="acciones">
                <button class="btn modificar modificar-btn" data-id="${concepto.id}">Modificar</button>
                <button class="btn eliminar" data-id="${concepto.id}">Eliminar</button>
                </div>
            `;
                listaConceptos.appendChild(listItem);
            });


            // Asignar evento a los botones de modificar
            document.querySelectorAll('.modificar-btn').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    const conceptoId = event.target.dataset.id;
                    modificarConcepto(conceptoId);
                });
            });

            // Asignar evento a los botones de eliminar

            document.querySelectorAll('.eliminar').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    const conceptoId = event.target.dataset.id;
                    eliminarConcepto(conceptoId);
                });
            });
        });


}


// Evento para agregar un nuevo concepto
document.addEventListener('DOMContentLoaded', () => {
    cargarRubros();
    cargarConceptos();

    document.querySelector("#agregarConcepto")?.addEventListener('click', async () => {
        const nombreConcepto = document.getElementById('nombreConcepto')?.value.trim();
        const rubroSelect = document.getElementById('rubroConcepto');
        const tipoConcepto = document.getElementById('tipoConcepto')?.value;
        const requiereVencimiento = parseInt(document.getElementById('requiereVencimiento').value, 10);

        if (!rubroSelect) {
            console.error("Error: No se encontró el select rubroConcepto");
            return;
        }

        const rubroId = rubroSelect.value;
        const token = localStorage.getItem('jwt-token');

        if (!nombreConcepto || !rubroId) {
            alert('El nombre del concepto y el rubro no pueden estar vacíos');
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/conceptos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre: nombreConcepto,
                    rubro_id: rubroId,
                    tipo: tipoConcepto,
                    requiere_vencimiento: requiereVencimiento
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al agregar Concepto');
            }

            alert('Concepto agregado con éxito');
            setTimeout(() => {
                document.getElementById('nombreConcepto').value = '';
                document.getElementById('rubroConcepto').value = '';
                document.getElementById('tipoConcepto').value = '';
                document.getElementById('requiereVencimiento').value = '0';
            }, 100);


            cargarConceptos(); // Actualiza la lista después de agregar

        } catch (error) {
            console.error('Error al agregar concepto:', error);
            alert(error.message);
        }
    });
});



// Función para modificar un concepto
function modificarConcepto(id) {
    window.location.href = `/conceptos/modificar/${id}`;
}



// Función para eliminar un concepto
function eliminarConcepto(id) {
    if (!confirm("¿Seguro que deseas eliminar este concepto?")) return;

    const token = localStorage.getItem('jwt-token');

    fetch(`http://localhost:8080/conceptos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error || 'Error al eliminar el Concepto'); });
            }
            alert('Concepto eliminado con éxito');
            cargarConceptos();
        })
        .catch(error => {
            console.error('Error al eliminar Concepto:', error);
            alert(error.message);
        });
}





;
