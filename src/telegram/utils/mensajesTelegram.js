function formatearMensajePago(gasto) {
    const fecha = new Date().toLocaleDateString('es-AR');
    return `✅ El gasto de *${gasto.concepto}* de importe $${gasto.monto} fue marcado como pagado el ${fecha}.`;
}

function mensajeGastoNoEncontrado() {
    return '❌ No encontré ese gasto o no te pertenece.';
}

function mensajeErrorGeneral() {
    return '⚠️ Ocurrió un error al intentar registrar el pago.';
}

module.exports = {
    formatearMensajePago,
    mensajeGastoNoEncontrado,
    mensajeErrorGeneral,
};
