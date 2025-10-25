import { assert } from 'chai';
import { Parqueadero } from '../src/parqueadero.js';

// Constantes para simular el tiempo en milisegundos
const MS_IN_HOUR = 1000 * 60 * 60;
const MS_IN_HALF_HOUR = MS_IN_HOUR / 2;

describe('Sistema de Gestión de Parqueadero', () => {
    let parqueadero;
    // Capacidad máxima
    const MAX_CAPACITY = 3;
    // Precio por hora
    const RATE = 10000;

    // Se inicializa el parqueadero antes de cada prueba
    beforeEach(() => {
        parqueadero = new Parqueadero(MAX_CAPACITY, RATE);
    });

    // F1: Registro de Entrada (entry) 
    describe('F1: Registro de Entrada (entry)', () => {
        it('F1-01: Debe registrar la entrada de un vehículo y aumentar la ocupación.', () => {
            parqueadero.entry('ABC123');
            assert.isTrue(parqueadero.parkedVehicles['ABC123'] !== undefined, 'El vehículo ABC123 debe estar registrado.');
            assert.equal(parqueadero.checkCapacity(), MAX_CAPACITY - 1, 'La capacidad disponible debe disminuir en 1.');
        });

        it('F1-02: Debe lanzar un error si se intenta registrar una placa ya parqueada.', () => {
            parqueadero.entry('DEF456');
            assert.throws(() => parqueadero.entry('DEF456'), 'El vehículo con placa DEF456 ya está parqueado.', 'Debe prevenir la doble entrada.');
        });
    });

    // F2: Cálculo de Pago y Salida (exit) 
    describe('F2: Cálculo de Pago y Salida (exit)', () => {
        const PLATE = 'GHI789';

        it('F2-01: Debe cobrar por una hora si el tiempo es menor a una hora (cobro mínimo).', () => {
            parqueadero.entry(PLATE);
            // Simular 30 minutos (0.5 horas) de permanencia
            const exitTime = parqueadero.parkedVehicles[PLATE].entryTime + (MS_IN_HALF_HOUR);

            const result = parqueadero.exit(PLATE, exitTime);

            assert.equal(result.totalCost, RATE, 'El costo total debe ser de 1 hora completa.');
            assert.isUndefined(parqueadero.parkedVehicles[PLATE], 'El vehículo debe ser removido de la lista.');
        });

        it('F2-02: Debe calcular el pago exacto y remover el vehículo (2.5 horas).', () => {
            parqueadero.entry(PLATE);
            // Simular 2 horas y 16 minutos (2.26 horas) -> Debe redondear a 2.5 horas
            const exitTime = parqueadero.parkedVehicles[PLATE].entryTime + (MS_IN_HOUR * 2) + (16 * 60 * 1000);

            const result = parqueadero.exit(PLATE, exitTime);

            assert.equal(result.durationHours, 2.5, 'La duración redondeada debe ser 2.5 horas.');
            assert.equal(result.totalCost, 25000, 'El costo total debe ser 2.5 * 10000 = 25000.');
            assert.isUndefined(parqueadero.parkedVehicles[PLATE], 'El vehículo debe ser removido de la lista.');
        });

        it('F2-03: Debe lanzar un error si se intenta retirar una placa no registrada.', () => {
            assert.throws(() => parqueadero.exit('XXX000'), 'Placa XXX000 no encontrada.', 'Debe fallar al intentar retirar un vehículo que no existe.');
        });
    });

    // F3: Verificación de Capacidad Máxima (checkCapacity) 
    describe('F3: Control de Capacidad (checkCapacity)', () => {
        it('F3-01: Debe retornar la capacidad total al inicio.', () => {
            assert.equal(parqueadero.checkCapacity(), MAX_CAPACITY, 'La capacidad debe ser la máxima definida.');
        });

        it('F3-02: Debe lanzar un error al intentar registrar una entrada cuando el parqueadero está lleno.', () => {
            // Llenar el parqueadero
            parqueadero.entry('A01');
            parqueadero.entry('A02');
            // Capacidad máxima alcanzada
            parqueadero.entry('A03'); 

            assert.equal(parqueadero.checkCapacity(), 0, 'La capacidad disponible debe ser 0.');
            assert.throws(() => parqueadero.entry('A04'), 'Parqueadero lleno. No se puede registrar la entrada.', 'Debe evitar la sobre-ocupación.');
        });
    });

    // F4: Generación de Reporte de Ocupación (getOccupancyReport) 
    describe('F4: Reporte de Ocupación (getOccupancyReport)', () => {
        it('F4-01: Debe generar un reporte con los vehículos parqueados, incluyendo la duración estimada.', () => {
            parqueadero.entry('P01');
            parqueadero.entry('P02');
            parqueadero.entry('P03');

            // Simular que el primer vehículo estuvo más tiempo (2 horas antes)
            parqueadero.simulateTimePass('P01', MS_IN_HOUR * 2);

            const report = parqueadero.getOccupancyReport();

            assert.isArray(report, 'El reporte debe ser un array.');
            assert.equal(report.length, 3, 'El reporte debe contener los 3 vehículos registrados.');
            
            const p01Report = report.find(v => v.plate === 'P01');
            assert.isAbove(p01Report.estimatedDurationHours, 1.99, 'La duración estimada de P01 debe ser de aproximadamente 2 horas.');
            assert.isString(p01Report.entryTime, 'La hora de entrada debe ser un string formateado.');
        });
    });
});
