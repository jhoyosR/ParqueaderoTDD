
export class Parqueadero {
    /**
     * Inicializa el parqueadero con su capacidad máxima y tarifa.
     */
    constructor(maxCapacity = 10, ratePerHour = 5000) {
        this.maxCapacity = maxCapacity;
        this.ratePerHour = ratePerHour;
        // Almacena los vehiculos parqueados
        this.parkedVehicles = {};
    }

    // Verifica la capacidad disponible
    checkCapacity() {
        return this.maxCapacity - Object.keys(this.parkedVehicles).length;
    }

    // Registra la entrada de un vehículo.
    entry(plate) {
        // Valida que haya un espacio disponible
        if (this.checkCapacity() <= 0) {
            throw new Error('Parqueadero lleno. No se puede registrar la entrada.');
        }
        // Valida si ya está registrado el vehículo
        if (this.parkedVehicles[plate]) {
            throw new Error(`El vehículo con placa ${plate} ya está parqueado.`);
        }

        // Registramos la entrada con el tiempo actual
        this.parkedVehicles[plate] = {
            plate: plate,
            entryTime: Date.now(),
        };
        return true;
    }

    // Procesa la salida del vehículo, calcula el pago y lo retira.
    exit(plate, exitTime = Date.now()) {
        // Busca el vehículo en los registros
        const vehicle = this.parkedVehicles[plate];

        // Verifica que exista el vehículo
        if (!vehicle) {
            throw new Error(`Placa ${plate} no encontrada. El vehículo no está registrado como parqueado.`);
        }

        // Calcula la duración en milisegundos
        const durationMs = exitTime - vehicle.entryTime;
        // La duración mínima de cobro es 1 hora.
        const durationHours = Math.max(1, durationMs / (1000 * 60 * 60));

        // Redondeamos la duración al medio punto superior más cercano
        const roundedHours = Math.ceil(durationHours * 2) / 2;

        // Obtiene el costo total
        const totalCost = roundedHours * this.ratePerHour;

        // Se elimina el vehículo del registro
        delete this.parkedVehicles[plate];

        return {
            plate: plate,
            durationHours: parseFloat(roundedHours.toFixed(2)),
            totalCost: totalCost
        };
    }

    // Genera un reporte de los vehículos actualmente parqueados.
    getOccupancyReport() {
        // Obtiene fecha y hora actual
        const now = Date.now();
        const report = [];

        // Recorre los vehículos para generar reporte
        for (const plate in this.parkedVehicles) {
            // Busca el vehículo
            const vehicle = this.parkedVehicles[plate];
            // Calcula duración en milisegundos
            const durationMs = now - vehicle.entryTime;
            // Calcula la duración en horas
            const durationHours = durationMs / (1000 * 60 * 60);

            // Agrega al arreglo del reporte los datos
            report.push({
                plate: plate,
                entryTime: new Date(vehicle.entryTime).toLocaleString(),
                estimatedDurationHours: parseFloat(durationHours.toFixed(2)),
            });
        }
        return report;
    }

    /**
     * Método para simular el tiempo.
     */
    simulateTimePass(plate, ms) {
        // Busca el registro
        if (this.parkedVehicles[plate]) {
            // Le resta tiempo al momento de entrada simulando paso del tiempo
            this.parkedVehicles[plate].entryTime -= ms;
        }
    }
}

