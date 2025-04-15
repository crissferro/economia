document.addEventListener("DOMContentLoaded", async () => {
    const mesSelect = document.getElementById("mes");
    const anioSelect = document.getElementById("anio");
    const totalIngresos = document.getElementById("totalIngresos");
    const totalEgresos = document.getElementById("totalEgresos");
    const totalResumen = document.getElementById("totalResumen");
    const rubrosTable = document.getElementById("rubrosTable");
    const rubrosChartCanvas = document.getElementById("rubrosChart").getContext("2d");
    let rubrosChart;

    // Detectar entorno automáticamente
    // Detectar entorno
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

    mesSelect.addEventListener("change", cargarResumen);
    anioSelect.addEventListener("change", cargarResumen);
    cargarResumen();
});
