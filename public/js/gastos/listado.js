document.addEventListener('DOMContentLoaded', () => {
    getGastos(); // Cargar gastos al cargar la página

    // Función para cargar conceptos en la lista con botones de acción
    async function getGastos() {
        const token = localStorage.getItem('jwt-token');
        try {
            const response = await fetch('http://localhost:8080/gastos', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al obtener gastos');
            }

            const gastos = await response.json();
            const listaGastos = document.getElementById('listaGastos');
            listaGastos.innerHTML = ''; // Limpiar lista antes de agregar nuevos elementos

            listaGastos.innerHTML = `
                <div class="list-header">
                        <h4>Año</h4>
                        <h4>Mes</h4>
                        <h4>Concepto</h4>
                        <h4>Monto</h4>
                        <h4>Vencimiento</h4>
                        <h4>Pagado</h4>
                        <h4>Acciones</h4>
                    </div>`

                ;

            gastos.forEach(gastos => {
                const listItem = document.createElement('div');
                listItem.classList.add('list-item');
                // Formatear la fecha de vencimiento
                let fechaVenc = gastos.fecha_vencimiento
                    ? new Date(gastos.fecha_vencimiento).toLocaleDateString('es-AR')
                    : 'Sin fecha';

                listItem.innerHTML = `
                    <h5>${gastos.anio}</h5>
                    <h5>${gastos.mes}</h5>
                    <h5>${gastos.concepto}</h5>
                    <h5>${gastos.monto}</h5>
                    <h5>${fechaVenc}</h5>
                    <h5>${gastos.pagado}</h5>
                    <div class="acciones">
                        <button class="btn modificar" data-id="${gastos.id}">Modificar</button>
                        <button class="btn eliminar" data-id="${gastos.id}">Eliminar</button>
                    </div>
                `;
                listaGastos.appendChild(listItem);
            });

            // Agregar evento a los botones de modificar
            document.querySelectorAll('.modificar').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    const id = event.target.dataset.id;
                    abrirVentanaEdicion(id);
                });
            });

            document.querySelectorAll('.eliminar').forEach(btn => {
                btn.addEventListener('click', (event) => {
                    const gastosId = event.target.dataset.id;
                    eliminarGasto(gastosId);
                });
            });

        } catch (error) {
            console.error('Error al cargar gastos:', error);
        }
    }




    // Función para abrir una nueva ventana con el formulario de edición
    function abrirVentanaEdicion(id) {
        const url = `editar_gastos.html?id=${id}`; // Página de edición
        const opciones = 'width=500,height=600,top=100,left=100,resizable=yes,scrollbars=yes';
        const ventanaEdicion = window.open(url, 'EditarGastos', opciones);

        // Cuando se cierra la ventana, recargar la lista de gastos
        const chequeoCierre = setInterval(() => {
            if (ventanaEdicion.closed) {
                clearInterval(chequeoCierre);
                getGastos(); // Refresca la lista después de modificar
            }
        }, 1000);
    }

    // Función para eliminar un gasto
    function eliminarGasto(id) {
        if (!confirm("¿Seguro que deseas eliminar este gasto?")) return;

        const token = localStorage.getItem('jwt-token');

        fetch(`http://localhost:8080/gastos/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => { throw new Error(err.error || 'Error al eliminar el Gasto'); });
                }
                alert('Gasto eliminado con éxito');
                getGastos();
            })
            .catch(error => {
                console.error('Error al eliminar Gasto:', error);
                alert(error.message);
            });
    }
})
