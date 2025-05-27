document.addEventListener('DOMContentLoaded', async () => {
    const gastoId = document.querySelector('input[name="idMod"]').value;
    const conceptoSelect = document.getElementById('nombreConcepto');
    const detallesSection = document.getElementById('detallesSection');
    const detallesList = document.getElementById('detallesList');
    const agregarDetalleBtn = document.getElementById('agregarDetalle');
    const form = document.querySelector('form');

    let conceptosDisponibles = [];
    let detallesActuales = [];

    // Cargar conceptos disponibles para detalles
    async function cargarConceptosDetalles() {
        try {
            const res = await fetch('/conceptos', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
                }
            });
            const data = await res.json();

            if (!Array.isArray(data)) throw new Error('Formato inesperado en los conceptos');
            conceptosDisponibles = data;
        } catch (error) {
            console.error('Error al cargar conceptos:', error);
            alert('No se pudieron cargar los conceptos para detalles.');
        }
    }

    // Cargar detalles existentes
    async function cargarDetalles() {
        try {
            const res = await fetch(`/gastos/${gastoId}/detalles`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
                }
            });
            const data = await res.json();

            if (!Array.isArray(data)) throw new Error('Formato inesperado en los detalles');
            detallesActuales = data;

            // Mostrar detalles en la interfaz
            mostrarDetalles();
        } catch (error) {
            console.error('Error al cargar detalles:', error);
        }
    }

    // Crear select de conceptos para detalles
    function crearSelectConceptos() {
        const select = document.createElement('select');
        select.classList.add('form-control', 'mb-1');
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
            select.appendChild(option);
        });

        return select;
    }

    // Mostrar detalles existentes
    function mostrarDetalles() {
        detallesList.innerHTML = '';

        if (detallesActuales.length === 0) {
            const mensaje = document.createElement('p');
            mensaje.textContent = 'No hay detalles para este gasto.';
            detallesList.appendChild(mensaje);
        } else {
            detallesActuales.forEach((detalle, index) => {
                agregarFilaDetalle(detalle);
            });
        }
    }

    // Agregar fila de detalle (nueva o existente)
    function agregarFilaDetalle(detalle = null) {
        const div = document.createElement('div');
        div.classList.add('detalle-item', 'mb-3');

        const selectConcepto = crearSelectConceptos();
        const inputMonto = document.createElement('input');
        inputMonto.type = 'number';
        inputMonto.step = '0.01';
        inputMonto.classList.add('form-control', 'mb-1');
        inputMonto.name = 'detalleMonto[]';
        inputMonto.placeholder = 'Monto del detalle';
        inputMonto.required = true;

        // Si es un detalle existente, seleccionar el concepto y monto
        if (detalle) {
            selectConcepto.value = detalle.concepto_id;
            inputMonto.value = detalle.monto;
        }

        const btnEliminar = document.createElement('button');
        btnEliminar.type = 'button';
        btnEliminar.classList.add('btn', 'btn-danger', 'btn-sm');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.addEventListener('click', () => {
            div.remove();
        });

        div.appendChild(selectConcepto);
        div.appendChild(inputMonto);
        div.appendChild(btnEliminar);
        div.innerHTML += '<hr>';

        detallesList.appendChild(div);
    }

    // Verificar si el concepto seleccionado requiere detalles
    function verificarRequiereDetalles() {
        const selectedOption = conceptoSelect.options[conceptoSelect.selectedIndex];
        if (selectedOption && selectedOption.dataset.requiereDetalles === "1") {
            detallesSection.style.display = 'block';
        } else {
            detallesSection.style.display = 'none';
        }
    }

    // Evento para agregar nuevo detalle
    agregarDetalleBtn.addEventListener('click', () => {
        agregarFilaDetalle();
    });

    // Modificar el evento submit del formulario
    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Si el concepto requiere detalles, recopilar y enviar
        const selectedOption = conceptoSelect.options[conceptoSelect.selectedIndex];
        if (selectedOption && selectedOption.dataset.requiereDetalles === "1") {
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
                // Enviar detalles al servidor
                await fetch(`/gastos/${gastoId}/detalles`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
                    },
                    body: JSON.stringify({ detalles })
                });
            } catch (error) {
                console.error('Error al guardar detalles:', error);
                alert('Error al guardar los detalles.');
                return;
            }
        }

        // Continuar con el envío del formulario principal
        this.submit();
    });

    // Inicialización
    await cargarConceptosDetalles();
    await cargarDetalles();

    // Verificar si el concepto actual requiere detalles
    verificarRequiereDetalles();

    // Actualizar cuando cambie el concepto
    conceptoSelect.addEventListener('change', verificarRequiereDetalles);
});
