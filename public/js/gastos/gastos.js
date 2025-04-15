document.addEventListener('DOMContentLoaded', async () => {
    // Detectar entorno
    const backendUrl = window.location.origin;

    await cargarConceptos(backendUrl);
    configurarCambioConcepto();

    document.querySelector("#agregarGasto")?.addEventListener('click', async () => {
        const conceptoId = document.getElementById('nombreConcepto')?.value.trim();
        const monto = document.getElementById('importeGasto')?.value.trim();
        const mes = document.getElementById('mesGasto')?.value;
        const anio = document.getElementById('anioGasto')?.value;
        const fechaVencimiento = document.getElementById('fechaVencimientoGasto')?.value || null;
        const token = localStorage.getItem('jwt-token');

        if (!conceptoId || !monto || !mes || !anio) {
            alert('Todos los campos son obligatorios');
            return;
        }

        try {
            const response = await fetch(`${backendUrl}/gastos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    monto,
                    mes,
                    anio,
                    concepto_id: conceptoId,
                    fecha_vencimiento: fechaVencimiento,
                    pagado: false
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al agregar gasto');
            }

            alert('Gasto agregado con éxito');
            setTimeout(() => {
                document.getElementById('importeGasto').value = '';
                document.getElementById('nombreConcepto').value = '';
                document.getElementById('mesGasto').value = '1';
                document.getElementById('anioGasto').value = new Date().getFullYear();
                document.getElementById('fechaVencimientoGasto').value = '';
                document.getElementById('fechaVencimientoDiv').style.display = 'none';
            }, 100);

        } catch (error) {
            console.error('Error al agregar gasto:', error);
            alert(error.message);
        }
    });
});

// Función reutilizable para cargar conceptos dinámicamente
async function cargarConceptos(backendUrl, conceptoIdSeleccionado = null) {
    try {
        const response = await fetch(`${backendUrl}/conceptos`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
        });

        if (!response.ok) throw new Error('Error al obtener conceptos');

        const conceptos = await response.json();
        const conceptoSelect = document.getElementById('nombreConcepto');

        if (!conceptoSelect) {
            console.error("Error: No se encontró el select nombreConcepto");
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

// Mostrar u ocultar el campo de fecha de vencimiento
function configurarCambioConcepto() {
    const conceptoSelect = document.getElementById('nombreConcepto');
    if (!conceptoSelect) return;

    conceptoSelect.addEventListener('change', function () {
        const selectedOption = this.options[this.selectedIndex];
        const requiereVencimiento = selectedOption.dataset.requiereVencimiento === "1";
        document.getElementById('fechaVencimientoDiv').style.display = requiereVencimiento ? 'block' : 'none';
    });
}
