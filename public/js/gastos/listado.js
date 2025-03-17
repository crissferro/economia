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
                    mostrarFormularioEdicion(id);
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




    // Función para mostrar el formulario debajo de la lista
    function mostrarFormularioEdicion(id) {
        const formularioEdicion = document.getElementById('formularioEdicion');

        // Obtener datos del concepto a modificar
        fetch(`http://localhost:8080/gastos/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
        })
            .then(res => res.json())
            .then(concepto => {
                document.getElementById('concepto-nombre').value = concepto.nombre;
                document.getElementById('concepto-tipo').value = concepto.tipo;
                document.getElementById('concepto-requiere-vencimiento').checked = concepto.requiere_vencimiento == 1;

                // Cargar rubros en el select
                fetch('http://localhost:8080/gastos', {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
                })
                    .then(res => res.json())
                    .then(rubros => {
                        const selectRubro = document.getElementById('concepto-rubro');
                        selectRubro.innerHTML = ''; // Limpiar opciones anteriores
                        rubros.forEach(rubro => {
                            let option = document.createElement('option');
                            option.value = rubro.id;
                            option.textContent = rubro.nombre;
                            if (rubro.id == concepto.rubro_id) {
                                option.selected = true;
                            }
                            selectRubro.appendChild(option);
                        });
                    });

                // Guardar cambios
                document.getElementById('formularioEdicion').querySelector('button[type="submit"]').onclick = () => {
                    modificarConcepto(id);
                };

                // Cancelar edición
                document.getElementById('cancelarEditarConcepto').onclick = () => {
                    formularioEdicion.style.display = 'none'; // Oculta el formulario
                };
            });

        formularioEdicion.style.display = 'block'; // Muestra el formulario
    }

    // Función para modificar en la API
    function modificarConcepto(id) {
        const nuevoNombre = document.getElementById('concepto-nombre').value.trim();
        const nuevoRubroId = document.getElementById('concepto-rubro').value;
        const nuevoTipo = document.getElementById('concepto-tipo').value;
        const nuevoRequiereVencimiento = document.getElementById('concepto-requiere-vencimiento').checked ? 1 : 0;

        if (!nuevoNombre) {
            alert('El nombre no puede estar vacío');
            return;
        }

        fetch(`http://localhost:8080/gastos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
            },
            body: JSON.stringify({
                nombre: nuevoNombre,
                rubro_id: nuevoRubroId,
                tipo: nuevoTipo,
                requiere_vencimiento: nuevoRequiereVencimiento
            })
        })
            .then(response => {
                if (!response.ok) throw new Error('Error al modificar concepto');
                alert('Concepto modificado con éxito');
                cargarConceptos(); // Refresca lista
                document.getElementById('formularioEdicion').style.display = 'none'; // Oculta el formulario
            })
            .catch(error => alert(error.message));
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
