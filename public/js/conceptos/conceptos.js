// Detectar entorno
const backendUrl = window.location.origin;

document.addEventListener('DOMContentLoaded', () => {
    cargarRubros();
    cargarConceptos();
});

// Cargar Rubros
async function cargarRubros() {
    try {
        const response = await fetch(`${backendUrl}/rubros`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
        });

        if (!response.ok) throw new Error('Error al obtener rubros');

        const rubros = await response.json();
        const rubroSelect = document.getElementById('rubroConcepto');

        if (!rubroSelect) return console.error("No se encontró el select rubroConcepto");

        rubroSelect.innerHTML = '<option value="">Seleccione un rubro</option>';

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

// Cargar Conceptos
function cargarConceptos() {
    fetch(`${backendUrl}/conceptos`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
    })
        .then(res => res.json())
        .then(conceptos => {
            const lista = document.getElementById('listaConceptos');
            lista.innerHTML = `
                <div class="list-header">
                    <h4>Id</h4>
                    <h4>Nombre</h4>
                    <h4>Tipo</h4>
                    <h4>Requiere Vencimiento</h4>
                    <h4>Requiere Detalle</h4>
                    <h4>Acciones</h4>
                </div>`;

            conceptos.forEach(concepto => {
                const item = document.createElement('div');
                item.classList.add('list-item');
                item.innerHTML = `
                    <h5>${concepto.id}</h5>
                    <h5>${concepto.nombre}</h5>
                    <h5>${concepto.tipo}</h5>
                    <h5>${concepto.requiere_vencimiento == 1 ? 'Sí' : 'No'}</h5>
                    <h5>${concepto.requiere_detalle == 1 ? 'Sí' : 'No'}</h5>
                    <div class="acciones">
                        <button class="btn modificar modificar-btn" data-id="${concepto.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn eliminar" data-id="${concepto.id}"><i class="fas fa-trash"></i></button>
                    </div>`;
                lista.appendChild(item);
            });

            document.querySelectorAll('.modificar-btn').forEach(btn => {
                btn.addEventListener('click', e => modificarConcepto(e.currentTarget.dataset.id));
            });

            document.querySelectorAll('.eliminar').forEach(btn => {
                btn.addEventListener('click', e => eliminarConcepto(e.currentTarget.dataset.id));
            });
        });
}

// Agregar nuevo concepto
document.querySelector("#agregarConcepto")?.addEventListener('click', async () => {
    const nombre = document.getElementById('nombreConcepto')?.value.trim();
    const rubroId = document.getElementById('rubroConcepto')?.value;
    const tipo = document.getElementById('tipoConcepto')?.value;
    const requiereVenc = parseInt(document.getElementById('requiereVencimiento')?.value, 10);
    const requiereDetalle = parseInt(document.getElementById('requiereDetalle')?.value, 10);
    const token = localStorage.getItem('jwt-token');

    if (!nombre || !rubroId) return alert('El nombre y el rubro no pueden estar vacíos');

    try {
        const res = await fetch(`${backendUrl}/conceptos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                nombre,
                rubro_id: rubroId,
                tipo,
                requiere_vencimiento: requiereVenc,
                requiere_detalle: requiereDetalle
            })
        });

        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Error al agregar concepto');
        }

        alert('Concepto agregado con éxito');
        document.getElementById('nombreConcepto').value = '';
        document.getElementById('rubroConcepto').value = '';
        document.getElementById('tipoConcepto').value = '';
        document.getElementById('requiereVencimiento').value = '0';
        document.getElementById('requiereDetalle').value = '0';

        cargarConceptos();
    } catch (err) {
        console.error('Error al agregar concepto:', err);
        alert(err.message);
    }
});

// Modificar
function modificarConcepto(id) {
    window.location.href = `/conceptos/modificar/${id}`;
}

// Eliminar
function eliminarConcepto(id) {
    if (!confirm("¿Seguro que deseas eliminar este concepto?")) return;

    fetch(`${backendUrl}/conceptos/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        }
    })
        .then(res => {
            if (!res.ok) return res.json().then(err => { throw new Error(err.error); });
            alert('Concepto eliminado con éxito');
            cargarConceptos();
        })
        .catch(err => {
            console.error('Error al eliminar concepto:', err);
            alert(err.message);
        });
}
