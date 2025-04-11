let backendUrl;

// Detectar entorno automáticamente
if (location.hostname === "localhost" || location.hostname.startsWith("192.168.")) {
    backendUrl = "http://192.168.1.222:8080";
} else {
    backendUrl = "http://crissferro.net.ar:8080";
}

// Cargar lista de conceptos dinámicamente en el formulario de edición
async function cargarConceptosEdit(idGasto) {
    try {
        const response = await fetch(`${backendUrl}/conceptos`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
        });

        if (!response.ok) throw new Error('Error al obtener conceptos');

        const conceptos = await response.json();
        const conceptoSelect = document.getElementById('nombreConcepto');

        if (!conceptoSelect) {
            console.error("Error: No se encontró el select nombreConcepto");
            return;
        }

        conceptoSelect.innerHTML = '<option value="">Seleccione un concepto</option>';

        conceptos.forEach(concepto => {
            let option = document.createElement('option');
            option.value = concepto.id;
            option.textContent = concepto.nombre;
            option.dataset.requiereVencimiento = concepto.requiere_vencimiento;
            conceptoSelect.appendChild(option);
        });

        if (idGasto) {
            await cargarDatosGasto(idGasto);
        }

    } catch (error) {
        console.error('Error al cargar conceptos:', error);
    }
}

// Cargar datos del gasto en el formulario de edición
async function cargarDatosGasto(id) {
    if (!id) {
        console.error("Error: ID del gasto no encontrado en la URL");
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/gastos/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
        });

        if (!response.ok) throw new Error('Error al obtener datos del gasto');

        const gasto = await response.json();

        if (!gasto || Object.keys(gasto).length === 0) {
            throw new Error("El objeto de gasto está vacío o es inválido");
        }

        document.getElementById('importeGasto').value = gasto.concepto || '';
        document.getElementById('nombreConcepto').value = gasto.tipo || '';
        document.getElementById('mesGasto').value = gasto.mes || '';
        document.getElementById('anioGasto').value = gasto.anio || '';
        document.getElementById('fechaVencimientoGasto').value = gasto.fecha_vencimiento || '';
        document.getElementById('fechaVencimientoDiv').checked = gasto.requiere_vencimiento == 1;

        await cargarConceptosEdit(gasto.rubro_id);

    } catch (error) {
        console.error('Error al cargar datos del gasto:', error);
    }
}

// Modificar un gasto
async function modificarGasto(id) {
    const conceptoId = document.getElementById('nombreConcepto')?.value.trim();
    const monto = document.getElementById('importeGasto')?.value.trim();
    const mes = document.getElementById('mesGasto')?.value;
    const anio = document.getElementById('anioGasto')?.value;
    const fechaVencimiento = document.getElementById('fechaVencimientoGasto')?.value || null;
    const token = localStorage.getItem('jwt-token');

    if (!conceptoId || !monto || !mes || !anio) {
        alert('Todos los campos son obligatorios');
        return;
    }

    try {
        const response = await fetch(`${backendUrl}/gastos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                monto,
                mes,
                anio,
                concepto_id: conceptoId,
                fecha_vencimiento: fechaVencimiento
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al modificar el gasto');
        }

        alert('Gasto modificado con éxito');
        window.location.reload();

    } catch (error) {
        console.error('Error al modificar gasto:', error);
        alert(error.message);
    }
}

// Evento para detectar cambios en el concepto y mostrar/ocultar fecha de vencimiento
document.getElementById('nombreConcepto').addEventListener('change', function () {
    const selectedOption = this.options[this.selectedIndex];
    const requiereVencimiento = selectedOption.dataset.requiereVencimiento === "1";
    document.getElementById('fechaVencimientoDiv').style.display = requiereVencimiento ? 'block' : 'none';
});

// Evento para cargar datos al iniciar
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (id) {
            await cargarConceptosEdit(id);
        }

        document.getElementById('formularioEdicion')?.addEventListener('submit', async (event) => {
            event.preventDefault();
            await modificarGasto(id);
        });
    } catch (error) {
        console.error("Error en DOMContentLoaded:", error);
    }
});
