document.addEventListener('DOMContentLoaded', () => {
    
    const mesSelect = document.getElementById("mes");
    const anioSelect = document.getElementById("anio");

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

    // Asignar eventos de cambio solo una vez
    mesSelect.addEventListener("change", getGastos);
    anioSelect.addEventListener("change", getGastos);

    // Cargar gastos al inicio
    getGastos();

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

async function getGastos() {
    const token = localStorage.getItem('jwt-token');
    try {
        const res = await fetch('http://localhost:8080/gastos', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Error al obtener gastos');

        const gastos = await res.json();
        const listaGastos = document.getElementById('listaGastos');
        listaGastos.innerHTML = `
            <div class="list-header">
                <h4>Año</h4>
                <h4>Mes</h4>
                <h4>Concepto</h4>
                <h4>Monto</h4>
                <h4>Vencimiento</h4>
                <h4>Pagado</h4>
                <h4>Acciones</h4>
            </div>`;

        gastos.forEach(gasto => {
            let fechaVenc = gasto.fecha_vencimiento
                ? new Date(gasto.fecha_vencimiento).toLocaleDateString('es-AR')
                : 'Sin fecha';

            listaGastos.innerHTML += `
                <div class="list-item ${gasto.pagado ? 'pagado' : ''}">
                    <h5>${gasto.anio}</h5>
                    <h5>${gasto.mes}</h5>
                    <h5>${gasto.concepto}</h5>
                    <h5>${gasto.monto}</h5>
                    <h5>${fechaVenc}</h5>
                    <input type="checkbox" class="chkPagado" data-id="${gasto.id}" ${gasto.pagado ? 'checked' : ''}>
                    <div class="acciones">
                        <button class="btn modificar" data-id="${gasto.id}">Modificar</button>
                        <button class="btn eliminar" data-id="${gasto.id}">Eliminar</button>
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
    const url = `editar_gastos.html?id=${id}`;
    const opciones = 'width=500,height=600,top=100,left=100,resizable=yes,scrollbars=yes';
    const ventanaEdicion = window.open(url, 'EditarGastos', opciones);

    const chequeoCierre = setInterval(() => {
        if (ventanaEdicion.closed) {
            clearInterval(chequeoCierre);
            getGastos();
        }
    }, 1000);
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
