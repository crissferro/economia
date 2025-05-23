document.addEventListener('DOMContentLoaded', async () => {
    const backendUrl = window.location.origin;
    let conceptosGlobal = [];

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

        // Recolectar detalles si están visibles
        const detalles = [];
        if (document.getElementById('detallesContainer').style.display !== 'none') {
            const conceptos = document.querySelectorAll('input[name="detalleConcepto[]"]');
            const montos = document.querySelectorAll('input[name="detalleMonto[]"]');

            conceptos.forEach((input, i) => {
                const concepto = input.value.trim();
                const monto = parseFloat(montos[i].value);
                if (concepto && !isNaN(monto)) {
                    detalles.push({ concepto, monto });
                }
            });
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
                    pagado: false,
                    detalles
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
                document.getElementById('detallesContainer').style.display = 'none';
                document.getElementById('detallesList').innerHTML = '';
            }, 100);

        } catch (error) {
            console.error('Error al agregar gasto:', error);
            alert(error.message);
        }
    });

    // Botón para agregar detalles
    document.getElementById("botonAgregarDetalle")?.addEventListener("click", () => {
        const div = document.createElement("div");
        div.classList.add("mb-2");
        div.innerHTML = `
            <input type="text" class="form-control mb-1" placeholder="Concepto" name="detalleConcepto[]">
            <input type="number" step="0.01" class="form-control mb-1" placeholder="Monto" name="detalleMonto[]">
            <hr>`;
        document.getElementById("detallesList").appendChild(div);
    });

    function configurarCambioConcepto() {
        const conceptoSelect = document.getElementById('nombreConcepto');
        conceptoSelect?.addEventListener('change', function () {
            const selectedOption = this.options[this.selectedIndex];
            const requiereVencimiento = selectedOption.dataset.requiereVencimiento === "1";
            document.getElementById('fechaVencimientoDiv').style.display = requiereVencimiento ? 'block' : 'none';

            const requiereDetalle = parseInt(selectedOption.dataset.requiereDetalle) === 1;
            if (requiereDetalle) {
                document.getElementById("detallesContainer").style.display = "block";
            } else {
                document.getElementById("detallesContainer").style.display = "none";
                document.getElementById("detallesList").innerHTML = "";
            }
        });
    }

    async function cargarConceptos(backendUrl) {
        try {
            const response = await fetch(`${backendUrl}/conceptos`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
            });

            if (!response.ok) throw new Error('Error al obtener conceptos');

            const conceptos = await response.json();
            conceptosGlobal = conceptos;
            const conceptoSelect = document.getElementById('nombreConcepto');
            conceptoSelect.innerHTML = '<option value="">Seleccione un concepto</option>';

            conceptos.forEach(concepto => {
                let option = document.createElement('option');
                option.value = concepto.id;
                option.textContent = concepto.nombre;
                option.dataset.requiereVencimiento = concepto.requiere_vencimiento;
                option.dataset.requiereDetalle = concepto.requiere_detalle;
                conceptoSelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error al cargar conceptos:', error);
        }
    }
});
