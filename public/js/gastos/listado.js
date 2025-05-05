document.addEventListener('DOMContentLoaded', async () => {
    let backendUrl;

    try {
        const configResponse = await fetch('/config');
        const configData = await configResponse.json();
        backendUrl = configData.backendUrl;
    } catch (error) {
        console.error('No se pudo obtener la URL del backend desde /config:', error);
        return;
    }

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

    await cargarRubros();
    await cargarConceptos();

    // Cargar automáticamente los gastos del mes en curso al iniciar
    getGastos({ mes: mesActual, anio: anioActual });

    aplicarBtn.addEventListener("click", () => {
        const filtros = {
            mes: mesSelect.value,
            anio: anioSelect.value,
            concepto_id: conceptoSelect.value,
            rubro_id: rubroSelect.value,
            pagado: pagadoSelect.value
        };

        // Elimina filtros vacíos
        const filtrosLimpios = Object.fromEntries(
            Object.entries(filtros).filter(([_, v]) => v !== "")
        );

        getGastos(filtrosLimpios);
    });

    let ordenAscendente = true;

    document.getElementById("ordenarVencimiento").addEventListener("click", () => {
        ordenAscendente = !ordenAscendente;

        if (window.ultimosGastos) {
            const gastosOrdenados = [...window.ultimosGastos].sort((a, b) => {
                const fechaA = new Date(a.fecha_vencimiento || '2100-01-01');
                const fechaB = new Date(b.fecha_vencimiento || '2100-01-01');
                return ordenAscendente ? fechaA - fechaB : fechaB - fechaA;
            });

            renderizarGastos(gastosOrdenados);
        }
    });

    document.getElementById('listaGastos').addEventListener('click', (event) => {
        const chk = event.target.closest('.chkPagado');
        if (chk) {
            const id = chk.dataset.id;
            const pagado = chk.checked;
            actualizarEstadoPago(id, pagado);
            return;
        }

        const btnModificar = event.target.closest('.modificar');
        if (btnModificar) {
            const id = btnModificar.dataset.id;
            abrirVentanaEdicion(id);
            return;
        }

        const btnEliminar = event.target.closest('.eliminar');
        if (btnEliminar) {
            const id = btnEliminar.dataset.id;
            eliminarGasto(id);
        }
    });

    async function cargarRubros() {
        const token = localStorage.getItem('jwt-token');
        try {
            const res = await fetch(`${backendUrl}/rubros`, {
                headers: { 'Authorization': `Bearer ${token}` }
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
        const token = localStorage.getItem('jwt-token');
        try {
            const res = await fetch(`${backendUrl}/conceptos`, {
                headers: { 'Authorization': `Bearer ${token}` }
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
        const token = localStorage.getItem('jwt-token');
        const params = new URLSearchParams(filtros).toString();
        const url = `${backendUrl}/gastos?${params}`;

        try {
            const res = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) throw new Error('Error al obtener gastos');

            const gastos = await res.json();
            window.ultimosGastos = gastos;
            renderizarGastos(gastos);
        } catch (error) {
            console.error('Error al cargar gastos:', error);
        }
    }

    function renderizarGastos(gastos) {
        const listaGastos = document.getElementById('listaGastos');
        listaGastos.innerHTML = `
        <table class="tablagastos" id="tablaGastos">
            <thead>
                <tr>
                    <th>Año</th>
                    <th>Mes</th>
                    <th>Rubro</th>
                    <th>Concepto</th>
                    <th>Monto</th>
                    <th>Vencimiento</th>
                    <th>Pagado</th>
                    <th>Fecha Pago</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
        `;

        if (gastos.length === 0) {
            listaGastos.innerHTML += `<tr><td colspan="9">No se encontraron gastos.</td></tr></tbody></table>`;
            return;
        }

        const hoy = new Date();

        gastos.forEach(gasto => {
            const fechaVenc = gasto.fecha_vencimiento ? new Date(gasto.fecha_vencimiento) : null;
            const vencStr = fechaVenc ? fechaVenc.toLocaleDateString('es-AR') : 'Sin fecha';
            const fechaPago = gasto.fecha_pago ? new Date(gasto.fecha_pago).toLocaleDateString('es-AR') : '-';

            let clase = '';
            if (!gasto.pagado && fechaVenc) {
                const diasDiff = (fechaVenc - hoy) / (1000 * 60 * 60 * 24);
                if (diasDiff < 0) clase = 'vencido';
                else if (diasDiff <= 3) clase = 'proximo-vencimiento';
            }

            listaGastos.innerHTML += `
            <tr class="${gasto.pagado ? 'pagado' : ''} ${clase}">
                <td>${gasto.anio}</td>
                <td>${gasto.mes}</td>
                <td>${gasto.rubro || '-'}</td>
                <td>${gasto.concepto}</td>
                <td>${gasto.monto}</td>
                <td>${vencStr}</td>
                <td><input type="checkbox" class="chkPagado" data-id="${gasto.id}" ${gasto.pagado ? 'checked' : ''}></td>
                <td>${fechaPago}</td>
                <td>
                    <button class="btn modificar" data-id="${gasto.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn eliminar" data-id="${gasto.id}"><i class="fas fa-trash"></i></button>
                </td>
            </tr>`;
        });

        listaGastos.innerHTML += `</tbody></table>`;
    }

    async function actualizarEstadoPago(id, pagado) {
        const token = localStorage.getItem('jwt-token');
        try {
            const res = await fetch(`${backendUrl}/gastos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ pagado: pagado ? 1 : 0 })
            });

            if (!res.ok) throw new Error('Error al actualizar el estado de pago');

            getGastos({ mes: mesSelect.value, anio: anioSelect.value });
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

        fetch(`${backendUrl}/gastos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => {
                if (!res.ok) return res.json().then(err => { throw new Error(err.error || 'Error al eliminar el Gasto'); });
                alert('Gasto eliminado con éxito');
                getGastos({ mes: mesSelect.value, anio: anioSelect.value });
            })
            .catch(error => {
                console.error('Error al eliminar Gasto:', error);
                alert(error.message);
            });
    }
});
