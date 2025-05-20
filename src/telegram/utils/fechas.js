function formatearMesAnio(fechaStr) {
    const [anio, mes] = fechaStr.split('-');
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return `${meses[parseInt(mes) - 1]} de ${anio}`;
}

module.exports = { formatearMesAnio };
