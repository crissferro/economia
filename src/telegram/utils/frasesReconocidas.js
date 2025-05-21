module.exports = {
    frasesGastosNoPagados: [
        'que debo',
        'que me falta pagar',
        'que gastos tengo pendientes',
        'tengo que pagar algo',
        'debo algo',
        'que tengo que pagar',
        'que gastos no pague',
        'no pague',
        'cuales son mis deudas',
        'mis deudas',
    ],

    frasesPagosRealizados: [
        'que pague',
        'que gastos ya pague',
        'gastos pagados',
        'ya pagados',
        'pagos realizados',
        'que pague este mes',
        'lo que ya pague',
    ],

    frasesGastosVencidos: [
        'que gastos se vencieron',
        'que esta vencido',
        'gastos vencidos',
        'que vencio',
        'que no pagué a tiempo',
        'deudas vencidas',
        'vencidos',
    ],
    frasesGastosProximos: [
        'que gastos se vencen',
        'que esta por vencer',
        'deudas que vencen',
        'vence',
    ],

    frasesInicio:

        ['nuevo gasto', 'cargar gasto', 'añadir gasto', 'ingresar gasto'],

    frasesIA: [
        { patron: /cuánto debo/i, accion: 'consultarDeuda' },
        { patron: /gastos.*mes/i, accion: 'consultarGastosMes' },
        { patron: /promedio.*luz/i, accion: 'promedioLuz' },
    ],

};
