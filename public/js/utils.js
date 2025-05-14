async function cargarConceptosSelect(selectId, conceptoIdSeleccionado = null) {
    try {
        const response = await fetch(`/conceptos`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
        });

        if (!response.ok) throw new Error('Error al obtener conceptos');

        const conceptos = await response.json();
        const conceptoSelect = document.getElementById(selectId);

        if (!conceptoSelect) {
            console.error("Error: No se encontró el select", selectId);
            return;
        }

        conceptoSelect.innerHTML = '<option value="">Seleccione un concepto</option>';

        conceptos.forEach(concepto => {
            let option = document.createElement('option');
            option.value = concepto.nombre;
            option.textContent = concepto.nombre;
            if (conceptoIdSeleccionado === concepto.nombre) {
                option.selected = true;
            }
            conceptoSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error al cargar conceptos:', error);
    }
}
