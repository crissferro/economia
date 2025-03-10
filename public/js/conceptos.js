
export const cargarConceptos = async () => {
    const token = getToken();
    const listaConceptosDiv = document.getElementById('listaConceptos');
    const nombreConceptoInput = document.getElementById('nombreConcepto');
    const agregarConceptoButton = document.getElementById('agregarConcepto');
    const rubroConceptoSelect = document.getElementById('rubroConcepto');
    const tipoConceptoSelect = document.getElementById('tipoConcepto');
    const requiereVencimientoConcepto = document.getElementById('requiereVencimientoConcepto');
    //variables para el form de edicion
    const editarConceptoForm = document.getElementById('editarConceptoForm');
    const editarNombreConceptoInput = document.getElementById('editarNombreConcepto');
    const editarRubroConceptoSelect = document.getElementById('editarRubroConcepto');
    const editarTipoConceptoSelect = document.getElementById('editarTipoConcepto');
    const editarRequiereVencimientoConcepto = document.getElementById('editarRequiereVencimientoConcepto');
    const guardarConceptoButton = document.getElementById('guardarConcepto');
    const cancelarEditarConceptoButton = document.getElementById('cancelarEditarConcepto');
    let conceptoAEditar = null;

    document.querySelector('body').onload = async () => {
        const token = localStorage.getItem('jwt-token');
        console.log('Token from localStorage:', token);

        try {
            // Limpiar Event Listeners existentes en listaConceptosDiv
            const listaConceptosClone = listaConceptosDiv.cloneNode(true);
            listaConceptosDiv.replaceWith(listaConceptosClone);
            //Reasignar listaConceptosDiv
            const listaConceptosDivNew = document.getElementById('listaConceptos');

            // Cargar conceptos
            const responseConceptos = await fetch('/api/conceptos', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const conceptos = await responseConceptos.json();

            listaConceptosDivNew.innerHTML = '';
            conceptos.forEach(concepto => {
                const conceptoElement = document.createElement('div');
                conceptoElement.innerHTML = `
             <div class="d-flex justify-content-between align-items-center">
                <p id="concepto-${concepto.id}" class="mb-0">${concepto.nombre} - Rubro: ${concepto.rubro_nombre} - Tipo: ${concepto.tipo} - Requiere Vencimiento: ${concepto.requiere_vencimiento}</p>
                <div>
                    <button class="btn btn-sm btn-warning editarConcepto" data-id="${concepto.id}">Editar</button>
                    <button class="btn btn-sm btn-danger eliminarConcepto" data-id="${concepto.id}">Eliminar</button>
                </div>
            </div>
            `;
                listaConceptosDivNew.appendChild(conceptoElement);
            });
            // Cargar rubros en el select
            const responseRubros = await fetch('/api/rubros', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const rubros = await responseRubros.json();

            rubroConceptoSelect.innerHTML = '';
            editarRubroConceptoSelect.innerHTML = '';
            rubros.forEach(rubro => {
                rubroConceptoSelect.innerHTML += `<option value="${rubro.id}">${rubro.nombre}</option>`;
                editarRubroConceptoSelect.innerHTML += `<option value="${rubro.id}">${rubro.nombre}</option>`;
            });
            // Agregar concepto
            if (agregarConceptoButton) {
                agregarConceptoButton.addEventListener('click', async () => {
                    const nombreConcepto = nombreConceptoInput.value;
                    const rubroConcepto = rubroConceptoSelect.value;
                    const tipoConcepto = tipoConceptoSelect.value;
                    const requiereVencimiento = requiereVencimientoConcepto.checked;
                    const response = await fetch('/api/conceptos', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ nombre: nombreConcepto, rubro_id: rubroConcepto, tipo: tipoConcepto, requiere_vencimiento: requiereVencimiento })
                    });

                    if (response.ok) {
                        nombreConceptoInput.value = '';
                        cargarConceptos();
                    } else {
                        const data = await response.json();
                        alert(data.error);
                    }
                });
            }


            // Delegación de eventos para Editar y Eliminar conceptos
            listaConceptosDivNew.addEventListener('click', async (event) => {
                const target = event.target;
                const conceptoId = target.dataset.id;

                if (target.classList.contains('editarConcepto')) {
                    // Obtener los datos del concepto seleccionado
                    conceptoAEditar = conceptos.find(concepto => concepto.id == conceptoId);
                    // Mostrar el formulario y ocultar el parrafo
                    editarConceptoForm.style.display = 'block';
                    document.getElementById(`concepto-${conceptoId}`).style.display = 'none';
                    // Completar el formulario con los datos del concepto
                    editarNombreConceptoInput.value = conceptoAEditar.nombre;
                    editarRubroConceptoSelect.value = conceptoAEditar.rubro_id;
                    editarTipoConceptoSelect.value = conceptoAEditar.tipo;
                    editarRequiereVencimientoConcepto.checked = conceptoAEditar.requiere_vencimiento;

                    // Logica para guardar
                    guardarConceptoButton.addEventListener('click', async () => {
                        const nuevoNombre = editarNombreConceptoInput.value;
                        const nuevoRubroId = editarRubroConceptoSelect.value;
                        const nuevoTipo = editarTipoConceptoSelect.value;
                        const nuevoRequiereVencimiento = editarRequiereVencimientoConcepto.checked;

                        try {
                            const response = await fetch(`/api/conceptos/${conceptoId}`, {
                                method: 'PUT',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({ nombre: nuevoNombre, rubro_id: nuevoRubroId, tipo: nuevoTipo, requiere_vencimiento: nuevoRequiereVencimiento })
                            });

                            if (response.ok) {
                                // Ocultar el formulario
                                editarConceptoForm.style.display = 'none';
                                // Mostrar el parrafo
                                document.getElementById(`concepto-${conceptoId}`).style.display = 'block';
                                cargarConceptos();
                            } else {
                                const data = await response.json();
                                alert(data.error);
                            }
                        } catch (error) {
                            console.error('Error:', error);
                        }
                    });

                    // Logica para cancelar
                    cancelarEditarConceptoButton.addEventListener('click', () => {
                        editarConceptoForm.style.display = 'none';
                        document.getElementById(`concepto-${conceptoId}`).style.display = 'block';
                    });
                } else if (target.classList.contains('eliminarConcepto')) {
                    // Lógica para eliminar concepto
                    try {
                        const response = await fetch(`/api/conceptos/${conceptoId}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });

                        if (response.ok) {
                            cargarConceptos();
                        } else {
                            const data = await response.json();
                            alert(data.error);
                        }
                    } catch (error) {
                        console.error('Error:', error);
                    }
                }
            });
        } catch (error) {
            console.error('Error:', error);
        }
    }
}