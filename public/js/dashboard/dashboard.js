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

    // Configuración de colores para los gráficos
    const colores = [
        "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", 
        "#9966FF", "#FF9F40", "#45B7D8", "#FF6B6B",
        "#98DF8A", "#D62728", "#7F7F7F", "#BCBD22",
        "#17BECF", "#E377C2", "#8C564B", "#3366CC"
    ];

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

            totalResumen.textContent = `$${formatearNumero(data.totalResumen)}`;
            totalIngresos.textContent = `$${formatearNumero(data.ingresos)}`;
            totalEgresos.textContent = `$${formatearNumero(data.egresos)}`;
            actualizarTablaRubros(data.rubros);
            actualizarGraficoRubros(data.rubros);
        } catch (error) {
            console.error("Error al cargar el resumen:", error);
        }
    }

    function formatearNumero(numero) {
        // Formatear números para mejor legibilidad
        return new Intl.NumberFormat('es-AR').format(parseFloat(numero));
    }

    function actualizarTablaRubros(rubros) {
        rubrosTable.innerHTML = "<tr><th>Rubro</th><th>Total</th></tr>";
        rubros.forEach(rubro => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${rubro.rubro}</td><td>$${formatearNumero(rubro.total)}</td>`;
            rubrosTable.appendChild(row);
        });
    }

    function actualizarGraficoRubros(rubros) {
        if (rubrosChart) {
            rubrosChart.destroy();
        }
        
        // Ordenar rubros por monto (de mayor a menor)
        rubros.sort((a, b) => b.total - a.total);
        
        rubrosChart = new Chart(rubrosChartCanvas, {
            type: 'pie',
            data: {
                labels: rubros.map(r => r.rubro),
                datasets: [{
                    data: rubros.map(r => r.total),
                    backgroundColor: colores.slice(0, rubros.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Distribución de Gastos por Rubro',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: $${formatearNumero(value)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Función para cargar el resumen de conceptos
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

    // Función para actualizar el gráfico de conceptos
    function actualizarGraficoConceptos(conceptos) {
        if (conceptosChart) {
            conceptosChart.destroy();
        }

        // Ordenar conceptos por monto total (de mayor a menor)
        conceptos.sort((a, b) => b.total - a.total);

        // Limitar a los 10 conceptos con mayor monto
        const topConceptos = conceptos.slice(0, 10);
        
        // Calcular el total para los porcentajes
        const totalGastos = topConceptos.reduce((sum, concepto) => sum + parseFloat(concepto.total), 0);

        conceptosChart = new Chart(conceptosChartCanvas, {
            type: 'bar',
            data: {
                labels: topConceptos.map(c => c.concepto),
                datasets: [{
                    label: 'Monto por concepto',
                    data: topConceptos.map(c => c.total),
                    backgroundColor: colores.slice(0, topConceptos.length),
                    borderColor: colores.map(color => color.replace('0.8', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',  // Gráfico de barras horizontales
                scales: {
                    x: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return '$' + formatearNumero(value);
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Top 10 Conceptos por Monto',
                        font: {
                            size: 16
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const percentage = Math.round((value / totalGastos) * 100);
                                return `${label}: $${formatearNumero(value)} (${percentage}%)`;
                            }
                        }
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
