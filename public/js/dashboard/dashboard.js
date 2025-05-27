document.addEventListener("DOMContentLoaded", async () => {
    const mesSelect = document.getElementById("mes");
    const anioSelect = document.getElementById("anio");
    const totalIngresos = document.getElementById("totalIngresos");
    const totalEgresos = document.getElementById("totalEgresos");
    const totalResumen = document.getElementById("totalResumen");
    const rubrosTable = document.getElementById("rubrosTable");
    const rubrosChartCanvas = document.getElementById("rubrosChart").getContext("2d");
    const conceptosChartCanvas = document.getElementById("conceptosChart").getContext("2d");

    let rubrosChart;
    let conceptosChart;

    // Detectar entorno automáticamente
    const backendUrl = window.location.origin;

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

    async function cargarResumen() {
        const mes = mesSelect.value;
        const anio = anioSelect.value;
        try {
            const res = await fetch(`${backendUrl}/dashboard/resumen?mes=${mes}&anio=${anio}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
            });
            if (!res.ok) throw new Error('Error al obtener dashboard');
            const data = await res.json();

            totalResumen.textContent = `$${data.totalResumen}`;
            totalIngresos.textContent = `$${data.ingresos}`;
            totalEgresos.textContent = `$${data.egresos}`;
            actualizarTablaRubros(data.rubros);
            actualizarGraficoRubros(data.rubros);
        } catch (error) {
            console.error("Error al cargar el resumen:", error);
        }
    }

    function actualizarTablaRubros(rubros) {
        rubrosTable.innerHTML = "<tr><th>Rubro</th><th>Total</th></tr>";
        rubros.forEach(rubro => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${rubro.rubro}</td><td>$${rubro.total}</td>`;
            rubrosTable.appendChild(row);
        });
    }

    function actualizarGraficoRubros(rubros) {
        if (rubrosChart) {
            rubrosChart.destroy();
        }
        rubrosChart = new Chart(rubrosChartCanvas, {
            type: 'pie',
            data: {
                labels: rubros.map(r => r.rubro),
                datasets: [{
                    data: rubros.map(r => r.total),
                    backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff", "#ff9f40"]
                }]
            }
        });
    }

    // NUEVO: Función para cargar el resumen de conceptos
    async function cargarResumenConceptos() {
        const mes = mesSelect.value;
        const anio = anioSelect.value;
        try {
            const res = await fetch(`${backendUrl}/dashboard/resumen-conceptos?mes=${mes}&anio=${anio}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
            });
            if (!res.ok) throw new Error('Error al obtener resumen de conceptos');
            const data = await res.json();

            actualizarGraficoConceptos(data.conceptos);
        } catch (error) {
            console.error("Error al cargar el resumen de conceptos:", error);
        }
    }

    // NUEVO: Función para actualizar el gráfico de conceptos
    function actualizarGraficoConceptos(conceptos) {
        if (conceptosChart) {
            conceptosChart.destroy();
        }

        // Ordenar conceptos por monto total (de mayor a menor)
        conceptos.sort((a, b) => b.total - a.total);

        // Limitar a los 10 conceptos con mayor monto
        const topConceptos = conceptos.slice(0, 10);

        conceptosChart = new Chart(conceptosChartCanvas, {
            type: 'bar',
            data: {
                labels: topConceptos.map(c => c.concepto),
                datasets: [{
                    label: 'Monto por concepto',
                    data: topConceptos.map(c => c.total),
                    backgroundColor: [
                        "#ff6384", "#36a2eb", "#ffce56", "#4bc0c0",
                        "#9966ff", "#ff9f40", "#45b7d8", "#ff6b6b",
                        "#98df8a", "#d62728"
                    ]
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 10 Conceptos por Monto'
                    }
                }
            }
        });
    }

    // Event listeners
    mesSelect.addEventListener("change", () => {
        cargarResumen();
        cargarResumenConceptos();
    });

    anioSelect.addEventListener("change", () => {
        cargarResumen();
        cargarResumenConceptos();
    });

    // Cargar datos iniciales
    cargarResumen();
    cargarResumenConceptos();
});
