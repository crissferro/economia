document.addEventListener('DOMContentLoaded', () => {
    const secciones = document.querySelectorAll('.tarjeta');
    secciones.forEach(seccion => {
        const tipo = seccion.getAttribute('data-tipo');
        fetchProductos(tipo, seccion);
    });
});

async function fetchProductos(tipo, seccion) {
    try {
        const response = await fetch('/api/productos');
        const productos = await response.json();

        let productosFiltrados;

        switch (tipo) {
            case 'capsulas':
                productosFiltrados = productos.filter(producto => producto.id_tipoProducto === 1);
                break;
            case 'cafeEspecialidad':
                productosFiltrados = productos.filter(producto => producto.id_tipoProducto === 3);
                break;
            case 'tazas':
                productosFiltrados = productos.filter(producto => producto.id_tipoProducto === 2);
                break;
            case 'portacapsulas':
                productosFiltrados = productos.filter(producto => producto.id_tipoProducto === 4);
                break;
            case 'capsulasRecargables':
                productosFiltrados = productos.filter(producto => producto.id_tipoProducto === 5);
                break;
            default:
                productosFiltrados = [];
        }

        seccion.innerHTML = productosFiltrados.map(producto => `
            <article>
                <h3>${producto.nombre}</h3>
                <div class="cuerpo">
                    <img src="/img/${producto.imagen}" alt="${producto.nombre}">
                    <p>${producto.descripcion}</p>
                    <p class="precio">$${producto.precio}</p>
                </div>
                <div class="pie">
                    <a href="#!">Comprar</a>
                </div>
            </article>
        `).join('');
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}