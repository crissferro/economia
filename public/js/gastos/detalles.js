document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const gastoId = urlParams.get('id');
    const token = localStorage.getItem('jwt-token');

    if (!gastoId) {
        alert('No se encontró el ID del gasto.');
        return;
    }

    console.log('Gasto ID:', gastoId);

    const detallesList = document.getElementById('detallesList');
    const agregarBtn = document.getElementById('agregarDetalle');
    const form = document.getElementById('formDetalles');

    let conceptosDisponibles = [];

    // ✅ Cargar conceptos al iniciar
    try {
        const res = await fetch('/conceptos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await res.json();

        if (!Array.isArray(data)) throw new Error('Formato inesperado en los conceptos');
        conceptosDisponibles = data;
    } catch (error) {
        console.error('Error al cargar conceptos:', error);
        alert('No se pudieron cargar los conceptos.');
        return;
    }

    const crearSelectConceptos = () => {
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
            option.value = c.nombre;
            option.textContent = c.nombre;
            select.appendChild(option);
        });

        return select;
    };

    agregarBtn.addEventListener('click', () => {
        const div = document.createElement('div');
        div.classList.add('mb-3');

        const selectConcepto = crearSelectConceptos();
        const inputMonto = document.createElement('input');
        inputMonto.type = 'number';
        inputMonto.step = '0.01';
        inputMonto.classList.add('form-control', 'mb-1');
        inputMonto.name = 'detalleMonto[]';
        inputMonto.placeholder = 'Monto del detalle';
        inputMonto.required = true;

        div.appendChild(selectConcepto);
        div.appendChild(inputMonto);
        div.innerHTML += '<hr>';

        detallesList.appendChild(div);
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const conceptos = document.querySelectorAll('select[name="detalleConcepto[]"]');
        const montos = document.querySelectorAll('input[name="detalleMonto[]"]');

        const detalles = [];
        conceptos.forEach((select, i) => {
            const concepto = select.value.trim();
            const monto = parseFloat(montos[i].value);
            if (concepto && !isNaN(monto)) {
                detalles.push({ concepto, monto });
            }
        });

        if (detalles.length === 0) {
            alert('Debe agregar al menos un detalle.');
            return;
        }

        try {
            const res = await fetch(`/gastos/${gastoId}/detalles`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ detalles })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al guardar los detalles.');
            }

            alert('Detalles guardados correctamente.');
            window.location.href = 'listado_gastos.html';

        } catch (error) {
            console.error('Error al guardar detalles:', error);
            alert(error.message);
        }
    });
});
