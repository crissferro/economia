document.addEventListener('DOMContentLoaded', () => {
    const mesSelect = document.getElementById("mes");
    const anioSelect = document.getElementById("anio");
    const rubroSelect = document.getElementById("rubro");
    const conceptoSelect = document.getElementById("concepto");
    const pagadoSelect = document.getElementById("pagado");
    const aplicarBtn = document.getElementById("aplicarFiltros");

    const fechaActual = new Date();
    const mesActual = fechaActual.getMonth() + 1;
    const anioActual = fechaActual.getFullYear();

    for (let i = 1; i <= 12; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = new Date(2023, i - 1).toLocaleString("es-ES", { month: "long" });
        if (i === mesActual) option.selected = true;
        mesSelect.appendChild(option);
    }

    for (let i = anioActual - 5; i <= anioActual; i++) {
        const option = document.createElement("option");
        option.value = i;
        option.textContent = i;
        if (i === anioActual) option.selected = true;
        anioSelect.appendChild(option);
    }

    // Cargar Rubros y Conceptos dinámicamente
    cargarRubros();
    cargarConceptos();

    // Cargar gastos al inicio sin filtros
    getGastos();

    // Evento para aplicar filtros
    aplicarBtn.addEventListener("click", () => {
        console.log("Botón de aplicar filtros presionado");

        const conceptoSeleccionado = conceptoSelect.value;
        const rubroSeleccionado = rubroSelect.value;

        const filtros = {
            mes: mesSelect.value,
            anio: anioSelect.value,
            concepto_id: conceptoSeleccionado,
            pagado: pagadoSelect.value
        };

        // Solo enviar rubro_id si tiene un valor válido
        if (rubroSeleccionado) {
            filtros.rubro_id = rubroSeleccionado;
        }

        console.log("Filtros aplicados:", filtros);
        getGastos(filtros);
    });

    // Delegación de eventos en la lista de gastos
    document.getElementById('listaGastos').addEventListener('click', (event) => {
        if (event.target.classList.contains('chkPagado')) {
            const id = event.target.dataset.id;
            const pagado = event.target.checked;
            actualizarEstadoPago(id, pagado);
        }

        if (event.target.classList.contains('modificar')) {
            const id = event.target.dataset.id;
            abrirVentanaEdicion(id);
        }

        if (event.target.classList.contains('eliminar')) {
            const id = event.target.dataset.id;
            eliminarGasto(id);
        }
    });
});

async function cargarRubros() {
    const rubroSelect = document.getElementById("rubro");
    if (!rubroSelect) return;

    const token = localStorage.getItem('jwt-token');

    try {
        const res = await fetch('http://localhost:8080/rubros', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Error al cargar rubros');

        const rubros = await res.json();
        rubros.forEach(rubro => {
            const option = document.createElement("option");
            option.value = rubro.id;
            option.textContent = rubro.nombre;
            rubroSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar rubros:', error);
    }
}

async function cargarConceptos() {
    const conceptoSelect = document.getElementById("concepto");
    if (!conceptoSelect) return;

    const token = localStorage.getItem('jwt-token');

    try {
        const res = await fetch('http://localhost:8080/conceptos', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Error al cargar conceptos');

        const conceptos = await res.json();
        conceptos.forEach(concepto => {
            const option = document.createElement("option");
            option.value = concepto.id;
            option.textContent = concepto.nombre;
            conceptoSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error al cargar conceptos:', error);
    }
}

async function getGastos(filtros = {}) {
    console.log("Ejecutando getGastos con filtros:", filtros); // <- Debug

    const token = localStorage.getItem('jwt-token');

    // 🔹 Filtrar solo los valores que NO están vacíos
    const filtrosLimpios = Object.fromEntries(
        Object.entries(filtros).filter(([_, value]) => value !== "")
    );

    // Construir la URL con los filtros como query parameters
    const params = new URLSearchParams(filtrosLimpios).toString();
    const url = `http://localhost:8080/gastos?${params}`;

    console.log("URL generada para la petición:", url); // 🔍 Debugging

    try {
        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Error al obtener gastos');



        const gastos = await res.json();

        console.log("Gastos recibidos:", gastos); // <- Debug

        const listaGastos = document.getElementById('listaGastos');
        listaGastos.innerHTML = `
            <div class="list-header">
                <h4>Año</h4>
                <h4>Mes</h4>
                <h4>Concepto</h4>
                <h4>Monto</h4>
                <h4>Vencimiento</h4>
                <h4>Pagado</h4>
                <h4>Fecha Pago</h4>
                <h4>Acciones</h4>
            </div>`;

        gastos.forEach(gasto => {
            let fechaVenc = gasto.fecha_vencimiento
                ? new Date(gasto.fecha_vencimiento).toLocaleDateString('es-AR')
                : 'Sin fecha';

            let fechaPago = gasto.fecha_pago
                ? new Date(gasto.fecha_pago).toLocaleDateString('es-AR')
                : '-';

            listaGastos.innerHTML += `
                <div class="list-item ${gasto.pagado ? 'pagado' : ''}">
                    <h5>${gasto.anio}</h5>
                    <h5>${gasto.mes}</h5>
                    <h5>${gasto.concepto}</h5>
                    <h5>${gasto.monto}</h5>
                    <h5>${fechaVenc}</h5>
                    <input type="checkbox" class="chkPagado" data-id="${gasto.id}" ${gasto.pagado ? 'checked' : ''}>
                    <h5>${fechaPago}</h5>
                    <div class="acciones">
                        <button class="btn modificar" data-id="${gasto.id}"><i class="fas fa-edit"></i></button>
                        <button class="btn eliminar" data-id="${gasto.id}"><i class="fas fa-trash"></i></i></button>
                    </div>
                </div>`;
        });

    } catch (error) {
        console.error('Error al cargar gastos:', error);
    }
}

async function actualizarEstadoPago(id, pagado) {
    const token = localStorage.getItem('jwt-token');
    try {
        const res = await fetch(`http://localhost:8080/gastos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ pagado: pagado ? 1 : 0 })
        });

        if (!res.ok) throw new Error('Error al actualizar el estado de pago');

        console.log(`Gasto ${id} actualizado a ${pagado ? 'PAGADO' : 'NO PAGADO'}`);
        getGastos(); // Refrescar la lista

    } catch (error) {
        console.error('Error al actualizar estado de pago:', error);
    }
}

function abrirVentanaEdicion(id) {
    window.location.href = `/gastos/modificar/${id}`;
}

function eliminarGasto(id) {
    if (!confirm("¿Seguro que deseas eliminar este gasto?")) return;

    const token = localStorage.getItem('jwt-token');

    fetch(`http://localhost:8080/gastos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(res => {
            if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Error al eliminar el Gasto'); });
            alert('Gasto eliminado con éxito');
            getGastos();
        })
        .catch(error => {
            console.error('Error al eliminar Gasto:', error);
            alert(error.message);
        });
}
