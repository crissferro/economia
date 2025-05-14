// Esta función es reutilizada desde gastos.js, adaptada para estadísticas
async function cargarConceptos(backendUrl, conceptoIdSeleccionado = null) {
    try {
        const response = await fetch(`${backendUrl}/conceptos`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
        });

        if (!response.ok) throw new Error('Error al obtener conceptos');

        const conceptos = await response.json();
        const conceptoSelect = document.getElementById('concepto'); // ID en estadisticas.html

        if (!conceptoSelect) {
            console.error("Error: No se encontró el select 'concepto'");
            return;
        }

        conceptoSelect.innerHTML = '<option value="">Seleccione un concepto</option>';

        conceptos.forEach(concepto => {
            let option = document.createElement('option');
            option.value = concepto.id;
            option.textContent = concepto.nombre;
            option.dataset.requiereVencimiento = concepto.requiere_vencimiento;
            if (conceptoIdSeleccionado == concepto.id) {
                option.selected = true;
            }
            conceptoSelect.appendChild(option);
        });

    } catch (error) {
        console.error('Error al cargar conceptos:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarConceptos('', null); // backendUrl vacío si estás en el mismo dominio

    document.getElementById('form-estadisticas').addEventListener('submit', async (e) => {
        e.preventDefault();

        const concepto = document.getElementById('concepto').value;
        const mes = document.getElementById('mes').value;
        const anio = document.getElementById('anio').value;

        if (!concepto || !mes || !anio) {
            alert('Por favor complete todos los campos');
            return;
        }

        try {
            const response = await fetch(`/estadisticas?concepto=${concepto}&mes=${mes}&anio=${anio}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
            });

            if (!response.ok) throw new Error('Error al obtener estadísticas');

            const data = await response.json();

            const resultadoDiv = document.getElementById('resultado-estadisticas');
            resultadoDiv.innerHTML = `
                <p><strong>Total:</strong> $${data.total}</p>
                <p><strong>Promedio mensual:</strong> $${data.promedio}</p>
            `;
        } catch (error) {
            console.error('Error al consultar estadísticas:', error);
            alert('No se pudo obtener la estadística');
        }
    });
});
