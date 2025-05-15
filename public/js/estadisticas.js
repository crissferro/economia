// Esta función es reutilizada desde gastos.js, adaptada para estadísticas
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

        console.log('📋 Valores seleccionados:');
        console.log('➡️ Concepto ID:', concepto);
        console.log('➡️ Mes:', mes);
        console.log('➡️ Año:', anio);

        if (!concepto || !mes || !anio) {
            alert('Por favor complete todos los campos');
            return;
        }

        const url = `/estadisticas?concepto=${concepto}&mes=${mes}&anio=${anio}`;
        console.log('🔗 URL construida:', url);

        try {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
            });

            if (!response.ok) {
                console.error('❌ Error HTTP:', response.status, response.statusText);
                throw new Error('Error al obtener estadísticas');
            }

            const data = await response.json();
            console.log('📊 Respuesta recibida del backend:', data);

            const resultadoDiv = document.getElementById('resultados');
            resultadoDiv.innerHTML = `
                <div class="estadisticas-box">
                    <p><strong>Total del mes:</strong> $${parseFloat(data.total).toLocaleString()}</p>
                    <p><strong>Promedio últimos 5 meses:</strong> $${parseFloat(data.promedio).toLocaleString()}</p>
                </div>
            `;

            // Obtener evolución mensual
            const evolucionUrl = `/estadisticas/evolucion?concepto=${concepto}&mes=${mes}&anio=${anio}`;
            const evolucionRes = await fetch(evolucionUrl, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
            });

            if (!evolucionRes.ok) throw new Error('Error al obtener evolución mensual');

            const evolucionData = await evolucionRes.json();
            console.log('📈 Datos de evolución mensual:', evolucionData);

            const labels = evolucionData.map(item => `${item.mes}/${item.anio}`);
            const valores = evolucionData.map(item => parseFloat(item.total));

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
                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
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
                            enabled: true,
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
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            beginAtZero: true,
                            ticks: {
                                color: '#555',
                                callback: value => `$${value.toLocaleString()}`
                            },
                            grid: {
                                color: '#e0e0e0'
                            }
                        }
                    }
                }
            })




        } catch (error) {
            console.error('❌ Error al consultar estadísticas:', error);
            alert('No se pudo obtener la estadística');
        }
        });
    });

    

