document.addEventListener("DOMContentLoaded", () => {
    const mesSelect = document.getElementById("mes");
    const anioSelect = document.getElementById("anio");
    const totalIngresos = document.getElementById("totalIngresos");
    const totalEgresos = document.getElementById("totalEgresos");

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
            const res = await fetch(`http://localhost:8080/dashboard/resumen?mes=${mes}&anio=${anio}`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
            });
            if (!res.ok) throw new Error('Error al obtener dashboard');
            // const res = await fetch(`http://localhost:8080/resumen?mes=${mes}&anio=${anio}`);
            const data = await res.json();
            if (data.ingresos !== undefined && data.egresos !== undefined) {
                totalResumen.textContent = `$${data.totalResumen}`;
                totalIngresos.textContent = `$${data.ingresos}`;
                totalEgresos.textContent = `$${data.egresos}`;
            } else {
                console.error("Datos inválidos recibidos:", data);
            }
        } catch (error) {
            console.error("Error al cargar el resumen:", error);
        }
    }

    mesSelect.addEventListener("change", cargarResumen);
    anioSelect.addEventListener("change", cargarResumen);
    cargarResumen();
});