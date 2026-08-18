Sistema de Administración de Alquileres
Fase 1: Arquitectura de Datos -

1. Definición del Dominio del Problema
Contexto y Objetivo:
El sistema permitirá a una inmobiliaria o administradora gestionar de manera integral: propietarios y sus propiedades, casas y departamentos, inquilinos, contratos de alquiler, garantes, pagos, aumentos del alquiler, expensas, mantenimiento de propiedades, y disponibilidad y estado de las propiedades.
Las inmobiliarias manejan un volumen de información sumamente heterogéneo: propiedades con características dispares (departamentos que abonan expensas vs. casas que no), inquilinos con distintos números de garantes, y contratos sujetos a legislaciones, plazos e índices de actualización muy variables.

Rol de la Base de Datos:
El objetivo del sistema es centralizar y agilizar esta gestión. Para ello, una base de datos NoSQL orientada a documentos resulta la solución ideal. A diferencia del modelo relacional estricto, el enfoque documental permitirá una estructura flexible. Esto facilitará agrupar toda la información pertinente en documentos autosuficientes, optimizando la velocidad de lectura.

2. Modelado Conceptual Orientado a Documentos y Decisiones Arquitectónicas:
Para el desarrollo de este sistema, estructurare la base de datos en 4 colecciones principales: Propietarios, Inquilinos, Inmuebles y Contratos.

A. Colección: Inquilinos
```json
{
  "_id": "inq_001",
  "nombre": "Florencia Giménez",
  "dni": "35111222",
  "telefonos": ["261-5551234", "261-5559876"],
  "garantes": [
    {
      "nombre": "Carlos Giménez",
      "vinculo": "Padre",
      "telefono": "261-4445555",
      "propiedad_garantia": "San Martín 123, Mendoza"
    }
  ]
}
```


Decisión Arquitectónica: Los números de teléfono y los datos de los garantes se modelan de forma anidada (como arreglos). Al consultar el perfil de un inquilino, la aplicación necesita acceder inmediatamente a sus contactos de garantía. Anidar esta información optimiza la lectura al evitar búsquedas adicionales.

B. Colección: Inmuebles
```json
{
  "_id": "inm_010",
  "propietario_id": "prop_888",
  "tipo": "Departamento",
  "direccion": "Belgrano 450, Piso 3",
  "estado": "Alquilado",
  "expensas": {
    "paga": true,
    "monto_actual": 35000
  },
  "historial_mantenimiento": [
    { "fecha": "2026-05-10", "detalle": "Reparación termotanque", "costo": 25000 }
  ]
}
```

Decisión Arquitectónica: Se utiliza una referencia (propietario_id) para vincular el inmueble con su dueño, evitando duplicar sus datos personales y previniendo inconsistencias . El apartado de expensas y el historial de mantenimiento se modelan de forma anidada, ya que es información que pertenece exclusivamente a esa unidad física.

C. Colección: Contratos
```json
{
  "_id": "cto_2026_005",
  "inmueble_id": "inm_010",
  "inquilino_id": "inq_001",
  "fecha_inicio": "2026-01-01",
  "fecha_vencimiento": "2028-01-01",
  "condiciones": {
    "monto_base": 200000,
    "meses_actualizacion": 4,
    "indice": "ICL"
  },
  "historial_pagos": [
    { "periodo": "2026-01", "monto_abonado": 200000, "fecha_pago": "2026-01-05", "estado": "Pagado" }
  ]
}
```

Decisión Arquitectónica: El contrato utiliza referencias para apuntar al inmueble y al inquilino. Sin embargo, las condiciones específicas del aumento y los pagos mensuales se anidan dentro del contrato para garantizar una consulta eficiente del historial financiero en un solo paso.

D. Colección: Propietarios
```json
{
  "_id": "prop_888",
  "nombre": "Roberto Sánchez",
  "cuit": "20-12345678-9",
  "telefonos": ["261-4443333"],
  "email": "roberto.sanchez@email.com",
  "datos_bancarios": {
    "banco": "Banco Galicia",
    "cbu": "0070000000000000000000",
    "alias": "ROBERTO.CASA.ALQUILER"
  }
  ```
  Decisión Arquitectónica: Los datos bancarios y de contacto se modelan de forma anidada dentro del perfil del propietario. Esto se debe a que la administradora necesita leer esta información en conjunto cada vez que realiza la liquidación mensual de los alquileres. Además, mantener a los propietarios en una colección separada permite utilizar referencias desde la colección Inmuebles, lo cual es vital porque un mismo dueño puede tener múltiples propiedades. Así se evita la redundancia de datos y se asegura la consistencia si el propietario cambia su cuenta bancaria.
}
