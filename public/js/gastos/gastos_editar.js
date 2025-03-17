document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (id) cargarDatosGasto(id);

    document.getElementById('formularioEdicion').addEventListener('submit', (event) => {
        event.preventDefault();
        modificarGastos(id);
    });
});

function cargarDatosGasto(id) {
    fetch(`http://localhost:8080/gastos/${id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
    })
        .then(res => res.json())
        .then(gasto => {
            document.getElementById('gastos-nombre').value = gasto.concepto;
            document.getElementById('gastos-tipo').value = gasto.tipo;
            document.getElementById('gastos-requiere-vencimiento').checked = gasto.requiere_vencimiento == 1;

            // Cargar rubros en el select
            fetch('http://localhost:8080/rubros', {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt-token')}` }
            })
                .then(res => res.json())
                .then(rubros => {
                    const selectRubro = document.getElementById('gastos-rubro');
                    selectRubro.innerHTML = '';
                    rubros.forEach(rubro => {
                        let option = document.createElement('option');
                        option.value = rubro.id;
                        option.textContent = rubro.nombre;
                        if (rubro.id == gasto.rubro_id) {
                            option.selected = true;
                        }
                        selectRubro.appendChild(option);
                    });
                });
        });
}

function modificarGastos(id) {
    const data = {
        concepto: document.getElementById('gastos-nombre').value.trim(),
        rubro_id: document.getElementById('gastos-rubro').value,
        tipo: document.getElementById('gastos-tipo').value,
        requiere_vencimiento: document.getElementById('gastos-requiere-vencimiento').checked ? 1 : 0
    };

    fetch(`http://localhost:8080/gastos/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('jwt-token')}`
        },
        body: JSON.stringify(data)
    })
        .then(res => res.ok ? window.close() : alert('Error al modificar gasto'));
}