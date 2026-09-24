// PASO 3: CONSULTAS DE LECTURA (MQL)

// 1. Filtrado básico por coincidencia exacta
db.inmuebles.find({ "estado": "Disponible" })

// 2. Operadores de comparación sobre campos numéricos ($gt)
db.contratos.find({ "condiciones.monto_base": { $gt: 200000 } })

// 3. Acceso a propiedades anidadas (Dot notation)
db.propietarios.find({ "datos_bancarios.banco": "Galicia" })

// 4. Proyección de campos específica excluyendo el _id
db.inquilinos.find({}, { "nombre": 1, "dni": 1, "_id": 0 })

// 5. Filtrado en arreglos con operadores específicos ($all)
db.inmuebles.find({ "caracteristicas_especiales": { $all: ["Cochera doble", "Pileta"] } })

// PASO 4: ACTUALIZACIONES ATÓMICAS (UPDATE & DELETE)

// 1. Actualización con $set (Modificar y agregar campo)
db.contratos.updateOne({ "_id": "cto_001" }, { $set: { "estado_contrato": "Renovado", "fecha_renovacion": "2026-09-23" } })

// 2. Incremento numérico con $inc
db.inmuebles.updateOne({ "_id": "inm_001" }, { $inc: { "expensas.monto_actual": 5000 } })

// 3. Eliminación segura con filtro estricto
db.contratos.deleteOne({ "_id": "cto_010", "estado_contrato": "Cancelado" })
