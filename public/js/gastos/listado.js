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
    await getGastos();

    aplicarBtn.addEventListener("click", () => {
        const conceptoSeleccionado = conceptoSelect.value;
        const rubroSeleccionado = rubroSelect.value;

        const filtros = {
            mes: mesSelect.value,
            anio: anioSelect.value,
            concepto_id: conceptoSeleccionado,
            pagado: pagadoSelect.value
        };

        if (rubroSeleccionado) filtros.rubro_id = rubroSeleccionado;

        getGastos(filtros);
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
        const filtrosLimpios = Object.fromEntries(
            Object.entries(filtros).filter(([_, value]) => value !== "")
        );

        const params = new URLSearchParams(filtrosLimpios).toString();
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
        <div class="list-header">
            <h4>Año</h4>
            <h4>Mes</h4>
            <h4>Rubro</h4>
            <h4>Concepto</h4>
            <h4>Monto</h4>
            <h4>Vencimiento</h4>
            <h4>Pagado</h4>
            <h4>Fecha Pago</h4>
            <h4>Acciones</h4>
        </div>`;

        if (gastos.length === 0) {
            listaGastos.innerHTML += `<div class="list-item"><h5>No se encontraron gastos.</h5></div>`;
            return;
        }

        const hoy = new Date();

        gastos.forEach(gasto => {
            const fechaVenc = gasto.fecha_vencimiento
                ? new Date(gasto.fecha_vencimiento)
                : null;

            const vencStr = fechaVenc
                ? fechaVenc.toLocaleDateString('es-AR')
                : 'Sin fecha';

            const fechaPago = gasto.fecha_pago
                ? new Date(gasto.fecha_pago).toLocaleDateString('es-AR')
                : '-';

            let clase = '';
            if (!gasto.pagado && fechaVenc) {
                const diasDiff = (fechaVenc - hoy) / (1000 * 60 * 60 * 24);
                if (diasDiff < 0) {
                    clase = 'vencido';
                } else if (diasDiff <= 3) {
                    clase = 'proximo-vencimiento';
                }
            }

            listaGastos.innerHTML += `
            <div class="list-item ${gasto.pagado ? 'pagado' : ''} ${clase}">
                <h5>${gasto.anio}</h5>
                <h5>${gasto.mes}</h5>
                <h5>${gasto.rubro || '-'}</h5>
                <h5>${gasto.concepto}</h5>
                <h5>${gasto.monto}</h5>
                <h5>${vencStr}</h5>
                <input type="checkbox" class="chkPagado" data-id="${gasto.id}" ${gasto.pagado ? 'checked' : ''}>
                <h5>${fechaPago}</h5>
                <div class="acciones">
                    <button class="btn modificar" data-id="${gasto.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn eliminar" data-id="${gasto.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>`;
        });
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

            console.log(`Gasto ${id} actualizado a ${pagado ? 'PAGADO' : 'NO PAGADO'}`);
            getGastos();
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
                getGastos();
            })
            .catch(error => {
                console.error('Error al eliminar Gasto:', error);
                alert(error.message);
            });
    }
});
