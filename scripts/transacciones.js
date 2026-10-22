// --- FASE 3: TRANSACCIONES ACID MULTI-DOCUMENTO ---

// ESCENARIO 1: ÉXITO (COMMIT)
print("Iniciando Transacción 1: Escenario de Éxito...");
const session = db.getMongo().startSession();
session.startTransaction();

try {
    const contratos = session.getDatabase("SistemaAlquileres").contratos;
    const inmuebles = session.getDatabase("SistemaAlquileres").inmuebles;

    // 1. Creamos el nuevo contrato
    contratos.insertOne({ _id: "cto_trans_01", inmueble_id: "inm_002", inquilino_id: "inq_003", estado: "Vigente" });
    
    // 2. Actualizamos la propiedad a "Alquilado"
    inmuebles.updateOne({ _id: "inm_002" }, { $set: { estado: "Alquilado" } });

    // Si todo sale bien, confirmamos (Commit)
    session.commitTransaction();
    print("ÉXITO: Transacción confirmada. Contrato creado e inmueble actualizado.");
} catch (error) {
    session.abortTransaction();
    print("FALLO: Se ejecutó el Rollback.");
} finally {
    session.endSession();
}

// ESCENARIO 2: FALLO INTENCIONAL (ROLLBACK)
print("Iniciando Transacción 2: Escenario de Fallo...");
const session2 = db.getMongo().startSession();
session2.startTransaction();

try {
    const contratos2 = session2.getDatabase("SistemaAlquileres").contratos;
    const inmuebles2 = session2.getDatabase("SistemaAlquileres").inmuebles;

    // 1. Creamos el contrato
    contratos2.insertOne({ _id: "cto_trans_02", inmueble_id: "inm_003", inquilino_id: "inq_004", estado: "Vigente" });
    
    // 2. Simulamos una caída del sistema o un error de negocio
    throw new Error("El inquilino no pasó la validación crediticia.");

    // Esta línea nunca se va a ejecutar
    session2.commitTransaction();
} catch (error) {
    // El motor aborta todo y borra el contrato
    session2.abortTransaction();
    print("ERROR DETECTADO: " + error.message + " -> Rollback ejecutado. Base de datos intacta.");
} finally {
    session2.endSession();
}
