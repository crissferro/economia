// public/js/dashboard.js

document.querySelector('body').onload = async () => {
    const token = localStorage.getItem('jwt-token');
    console.log('Token from localStorage:', token); // Verifica el token

    try {
        console.log('Token justo antes de la solicitud:', token); // Agrega este log

        const res = await fetch(`http://127.0.0.1/rubros`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        console.log('Rubros response:', res);

        if (!res.ok) {
            window.location.href = "/login.html";
            throw new Error("Problemas en login");
        }

       // if (res.ok) {
       //     const rubrosData = await res.json();
       //     console.log('Rubros data:', rubrosData);
       // }

        const datos = await res.json();
        let listaHTML = document.querySelector(`#listado`);
        listaHTML.innerHTML = `
            <div class="list-header">
                <h4>Descripción</h4>
                <h4>Monto</h4>
                <h4>Fecha</h4>
                <h4>Pagado</h4>
                <h4>Concepto</h4>
                <h4>Rubro</h4>
            </div>
        `;
        datos.forEach(registro => {
            listaHTML.innerHTML += `
                <div class="list-item">
                    <h5>${registro.descripcion}</h5>
                    <h5>${registro.monto}</h5>
                    <h5>${registro.fecha}</h5>
                    <h5>${registro.pagado ? 'Sí' : 'No'}</h5>
                    <h5>${registro.concepto}</h5>
                    <h5>${registro.rubro}</h5>
                </div>
            `;
        });
    } catch (error) {
        console.error('Error en dashboard.js:', error);
    }
};