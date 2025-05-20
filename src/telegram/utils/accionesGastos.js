// telegram/utils/accionesGastos.js
function formatearGasto(gasto) {
    return `🧾 *${gasto.concepto}*\n💰 ${gasto.monto} - 📅 ${gasto.vencimiento}`;
}

module.exports = {
    formatearGasto
};
