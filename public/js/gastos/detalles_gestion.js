document.addEventListener('DOMContentLoaded', async () => {
    // Obtener el ID del gasto de la URL
    const urlParams = new URLSearchParams(window.location.search);

    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    console.log('URL path:', window.location.pathname);
    console.log('Path segments:', pathSegments);

    const gastoId = urlParams.get('id') || window.location.pathname.split('/').filter(Boolean)[1];
    console.log('ID del gasto extraído:', gastoId);

    if (!gastoId) {
        alert('No se encontró el ID del gasto.');
        window.location.href = 'listado_gastos.html';
        return;
    }

    const token = localStorage.getItem('jwt-token');
    const gastoInfo = document.getElementById('gastoInfo');
    const detallesList = document.getElementById('detallesList');
    const agregarBtn = document.getElementById('agregarDetalle');
    const form = document.getElementById('formDetalles');

    let conceptosDisponibles = [];
    let gastoActual = null;

    // Cargar información del gasto
    async function cargarGasto() {
        try {
            const res = await fetch(`/gastos/${gastoId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Error al obtener el gasto');

            gastoActual = await res.json();

            // Mostrar información del gasto
            gastoInfo.innerHTML = `
                <strong>Concepto:</strong> ${gastoActual.concepto} | 
                <strong>Monto:</strong> $${Math.abs(gastoActual.monto)} | 
                <strong>Fecha:</strong> ${new Date(0, gastoActual.mes - 1).toLocaleString('es-ES', { month: 'long' })} ${gastoActual.anio}
            `;
        } catch (error) {
            console.error('Error al cargar gasto:', error);
            alert('No se pudo cargar la información del gasto.');
        }
    }

    // Cargar conceptos disponibles
    async function cargarConceptos() {
        try {
            const res = await fetch('/conceptos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Error al obtener conceptos');

            conceptosDisponibles = await res.json();
        } catch (error) {
            console.error('Error al cargar conceptos:', error);
            alert('No se pudieron cargar los conceptos.');
        }
    }

    // Cargar detalles existentes
    async function cargarDetalles() {
        try {
            const res = await fetch(`/gastos/${gastoId}/detalles`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Error al obtener detalles');

            const detalles = await res.json();

            if (detalles.length === 0) {
                detallesList.innerHTML = '<p class="text-muted">No hay detalles para este gasto. Agrega el primer detalle.</p>';
            } else {
                detallesList.innerHTML = '';
                detalles.forEach(detalle => agregarFilaDetalle(detalle));
            }
        } catch (error) {
            console.error('Error al cargar detalles:', error);
            detallesList.innerHTML = '<p class="text-danger">Error al cargar los detalles. Intenta recargar la página.</p>';
        }
    }

    // Crear select de conceptos
    function crearSelectConceptos(conceptoId = '') {
        const select = document.createElement('select');
        select.classList.add('form-select', 'mb-2');
        select.name = 'detalleConcepto[]';
        select.required = true;

        const opcionInicial = document.createElement('option');
        opcionInicial.value = '';
        opcionInicial.textContent = '-- Seleccione un concepto --';
        select.appendChild(opcionInicial);

        conceptosDisponibles.forEach(c => {
            const option = document.createElement('option');
            option.value = c.id;
            option.textContent = c.nombre;

            if (c.id == conceptoId) {
                option.selected = true;
            }

            select.appendChild(option);
        });

        return select;
    }

    // Agregar fila de detalle
    function agregarFilaDetalle(detalle = null) {
        const div = document.createElement('div');
        div.classList.add('card', 'mb-3');

        const cardBody = document.createElement('div');
        cardBody.classList.add('card-body');

        const row = document.createElement('div');
        row.classList.add('row');

        // Columna para el concepto
        const colConcepto = document.createElement('div');
        colConcepto.classList.add('col-md-6');

        const labelConcepto = document.createElement('label');
        labelConcepto.classList.add('form-label');
        labelConcepto.textContent = 'Concepto';

        const selectConcepto = crearSelectConceptos(detalle?.concepto_id);

        colConcepto.appendChild(labelConcepto);
        colConcepto.appendChild(selectConcepto);

        // Columna para el monto
        const colMonto = document.createElement('div');
        colMonto.classList.add('col-md-4');

        const labelMonto = document.createElement('label');
        labelMonto.classList.add('form-label');
        labelMonto.textContent = 'Monto';

        const inputMonto = document.createElement('input');
        inputMonto.type = 'number';
        inputMonto.step = '0.01';
        inputMonto.classList.add('form-control');
        inputMonto.name = 'detalleMonto[]';
        inputMonto.placeholder = 'Monto';
        inputMonto.required = true;

        if (detalle) {
            inputMonto.value = detalle.monto;
        }

        colMonto.appendChild(labelMonto);
        colMonto.appendChild(inputMonto);

        // Columna para el botón de eliminar
        const colBtn = document.createElement('div');
        colBtn.classList.add('col-md-2', 'd-flex', 'align-items-end');

        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.classList.add('btn', 'btn-danger', 'w-100');
        btnEliminar.innerHTML = '<i class="fas fa-trash"></i>';
        btnEliminar.addEventListener('click', () => {
            if (confirm('¿Estás seguro de eliminar este detalle?')) {
                div.remove();

                // Si no quedan detalles, mostrar mensaje
                if (detallesList.querySelectorAll('.card').length === 0) {
                    detallesList.innerHTML = '<p class="text-muted">No hay detalles para este gasto. Agrega el primer detalle.</p>';
                }
            }
        });

        colBtn.appendChild(btnEliminar);

        // Armar la estructura
        row.appendChild(colConcepto);
        row.appendChild(colMonto);
        row.appendChild(colBtn);

        cardBody.appendChild(row);
        div.appendChild(cardBody);

        // Si hay mensaje de "no hay detalles", eliminarlo
        const noDetallesMsg = detallesList.querySelector('p.text-muted');
        if (noDetallesMsg) {
            detallesList.innerHTML = '';
        }

        detallesList.appendChild(div);
    }

    // Evento para agregar nuevo detalle
    agregarBtn.addEventListener('click', () => {
        agregarFilaDetalle();
    });

    // Evento para guardar detalles
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const conceptos = document.querySelectorAll('select[name="detalleConcepto[]"]');
        const montos = document.querySelectorAll('input[name="detalleMonto[]"]');

        const detalles = [];

        conceptos.forEach((select, i) => {
            const conceptoId = select.value;
            const monto = parseFloat(montos[i].value);

            if (conceptoId && !isNaN(monto)) {
                detalles.push({
                    concepto_id: conceptoId,
                    monto
                });
            }
        });

        if (detalles.length === 0) {
            alert('Debe agregar al menos un detalle.');
            return;
        }

        try {
            console.log('Enviando detalles:', detalles);
            const res = await fetch(`/gastos/${gastoId}/detalles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ detalles })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Error al guardar los detalles');
            }

            alert('Detalles guardados correctamente.');
            window.location.href = '/listado_gastos.html';
        } catch (error) {
            console.error('Error al guardar detalles:', error);
            alert('Error al guardar los detalles: ' + error.message);
        }
    });

    // Inicializar
    await cargarGasto();
    await cargarConceptos();
    await cargarDetalles();
});
