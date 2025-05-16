async function cargarConceptos(backendUrl = '', conceptoIdSeleccionado = null) {
    try {
        const response = await fetch(`${backendUrl}/conceptos`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
        });

        if (!response.ok) throw new Error('Error al obtener conceptos');

        const conceptos = await response.json();
        const conceptoSelect = document.getElementById('concepto');

        if (!conceptoSelect) {
            console.error("❌ No se encontró el select 'concepto'");
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
        console.error('❌ Error al cargar conceptos:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    await cargarConceptos();

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
            document.getElementById('resultados').innerHTML = `
                <div class="estadisticas-box">
                    <p><strong>Total del mes:</strong> $${parseFloat(data.total).toLocaleString()}</p>
                    <p><strong>Promedio últimos 5 meses:</strong> $${parseFloat(data.promedio).toLocaleString()}</p>
                </div>
            `;

            const evolucionRes = await fetch(`/estadisticas/evolucion?concepto=${concepto}&mes=${mes}&anio=${anio}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
            });

            if (!evolucionRes.ok) throw new Error('Error al obtener evolución mensual');

            const evolucionData = await evolucionRes.json();

            // Ordenar de más viejo a más nuevo (para cálculo de variaciones)
            evolucionData.sort((a, b) => (a.anio * 12 + a.mes) - (b.anio * 12 + b.mes));

            const labels = evolucionData.map(item => `${item.mes}/${item.anio}`);
            const valores = evolucionData.map(item => parseFloat(item.total));

            // Calcular variaciones mensuales
            const variaciones = [];
            for (let i = 1; i < evolucionData.length; i++) {
                const anterior = parseFloat(evolucionData[i - 1].total);
                const actual = parseFloat(evolucionData[i].total);
                const porcentaje = anterior === 0 ? 0 : ((actual - anterior) / anterior) * 100;

                variaciones.push({
                    mes: `${evolucionData[i].mes}/${evolucionData[i].anio}`,
                    total: actual,
                    variacion: porcentaje
                });
            }

            // Armar tabla desde el más nuevo al más viejo
            const tablaFilas = [
                {
                    mes: `${evolucionData[0].mes}/${evolucionData[0].anio}`,
                    total: parseFloat(evolucionData[0].total),
                    variacion: null
                },
                ...variaciones
            ].reverse();

            const tabla = `
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Mes</th>
                            <th>Total ($)</th>
                            <th>Variación</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${tablaFilas.map(item => `
                            <tr>
                                <td>${item.mes}</td>
                                <td>$${item.total.toLocaleString()}</td>
                                <td>
                                    ${item.variacion === null
                    ? '—'
                    : `<span style="color: ${item.variacion < 0 ? 'red' : 'green'};">
                                                    ${item.variacion < 0 ? '🔻' : '🔺'} ${Math.abs(item.variacion).toFixed(2)}%
                                               </span>`
                }
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

            document.getElementById('tabla-variaciones').innerHTML = tabla;

            // Destruir gráfico anterior si existe
            if (window.graficoEvolucion) {
                window.graficoEvolucion.destroy();
            }

            const ctx = document.getElementById('grafico-evolucion').getContext('2d');
            window.graficoEvolucion = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Evolución mensual ($)',
                        data: valores,
                        backgroundColor: [
                            'rgba(255, 99, 132, 0.2)',
                            'rgba(255, 159, 64, 0.2)',
                            'rgba(255, 205, 86, 0.2)',
                            'rgba(75, 192, 192, 0.2)',
                            'rgba(54, 162, 235, 0.2)',
                            'rgba(153, 102, 255, 0.2)',
                            'rgba(201, 203, 207, 0.2)'
                        ],
                        borderColor: [
                            'rgb(255, 99, 132)',
                            'rgb(255, 159, 64)',
                            'rgb(255, 205, 86)',
                            'rgb(75, 192, 192)',
                            'rgb(54, 162, 235)',
                            'rgb(153, 102, 255)',
                            'rgb(201, 203, 207)'
                        ],
                        borderRadius: 10,
                        barPercentage: 0.6,
                        categoryPercentage: 0.7
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: '#333',
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: ctx => `$${ctx.parsed.y.toLocaleString()}`
                            }
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    scales: {
                        x: {
                            ticks: {
                                color: '#555',
                                font: { size: 12 }
                            },
                            grid: { display: false }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#555',
                                callback: value => `$${value.toLocaleString()}`
                            },
                            grid: { color: '#e0e0e0' }
                        }
                    }
                }
            });

        } catch (error) {
            console.error('❌ Error al consultar estadísticas:', error);
            alert('No se pudo obtener la estadística');
        }
    });
});
