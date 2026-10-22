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

Fase 2: Consultas y Actualizaciones

<img width="886" height="481" alt="image" src="https://github.com/user-attachments/assets/27d0afd3-c208-44cf-b9ab-90452956fb16" />

<img width="878" height="591" alt="image" src="https://github.com/user-attachments/assets/047dcc5c-da7b-4bde-ada6-0ed2f37f496d" />
<img width="931" height="577" alt="image" src="https://github.com/user-attachments/assets/1517f93d-7f8b-4d3f-91aa-f9df01b411d2" />

<img width="946" height="553" alt="image" src="https://github.com/user-attachments/assets/b0717c45-038f-49a4-a3d5-6ade7af82b47" />

<img width="934" height="562" alt="image" src="https://github.com/user-attachments/assets/62326b69-ba29-496f-a57d-3518cadb609c" />

<img width="885" height="429" alt="image" src="https://github.com/user-attachments/assets/1a03f7ab-4dad-4aa2-9e03-23bafb4e3ac3" />

<img width="896" height="325" alt="image" src="https://github.com/user-attachments/assets/52c428e8-711e-4a63-a12e-e5a5afdd2a8a" />

<img width="885" height="214" alt="image" src="https://github.com/user-attachments/assets/636f3e46-e4bf-4d13-ac89-8cb49306a20a" />


Fase 3: Resiliencia, Transacciones y Securización (Proyecto Integrador Final)

1. Diagrama de Arquitectura
El sistema ha migrado de un entorno de desarrollo aislado a un clúster de Alta Disponibilidad (Replica Set) compuesto por tres nodos locales para garantizar la continuidad del negocio:

**Nodo Primario** (Puerto 27021): Procesa todas las operaciones de lectura y escritura de la aplicación `SistemaAlquileres`.
**Nodo Secundario** (Puerto 27022): Replica los datos del Primario en tiempo real para garantizar redundancia y resguardo de la información.
**Nodo Árbitro** (Puerto 27023): No almacena datos de negocio, pero participa en las elecciones de topología para romper empates y promover al Secundario en caso de un fallo general.

2. Bitácora del Failover (Tolerancia a Fallos)
Para demostrar la resiliencia del clúster, se ejecutó un script de inserción continua, simulando una carga de trabajo en producción. Durante este proceso, se provocó la caída intencional del **Nodo Primario**.

1. Fallo provocado: Se detuvo abruptamente el proceso del puerto 27021. El sistema arrojó temporalmente el error `MongoServerError[NotWritablePrimary]`, pausando las escrituras para evitar inconsistencias.
2. Elección automática: El Nodo Árbitro detectó la ausencia del Primario y emitió su voto para promover al Nodo Secundario.
3. Recuperación: En cuestión de segundos, el puerto 27022 asumió como nuevo Primario y el script continuó insertando datos automáticamente sin intervención manual.
<img width="886" height="750" alt="image" src="https://github.com/user-attachments/assets/8b832ffe-d920-4647-a428-ef7b6d4f7c0e" />

<img width="886" height="608" alt="image" src="https://github.com/user-attachments/assets/3185594b-fcd9-4f4c-b324-a2bfc67f2655" />

   <img width="886" height="478" alt="image" src="https://github.com/user-attachments/assets/f62ab3f8-ae89-463c-9f3d-bb63e4bf10dd" />

3. Transacciones ACID Multi-documento
Se implementó una transacción crítica del dominio: **La creación de un nuevo contrato de alquiler**. Esta operación requiere atomicidad absoluta; si se crea el documento del contrato, el inmueble correspondiente debe actualizar su estado a "Alquilado". Si alguna de las dos operaciones falla, el sistema revierte los cambios (Rollback).

Escenario de Éxito (Commit):
La sesión inicia la transacción, inserta el contrato, actualiza el inmueble y confirma los cambios.

Escenario de Fallo (Rollback):
Se simuló un error de negocio (rechazo crediticio del inquilino) en el medio de la transacción. El motor detectó la excepción y ejecutó automáticamente un `abortTransaction()`, deshaciendo la creación del contrato y manteniendo la base de datos intacta.

<img width="886" height="479" alt="image" src="https://github.com/user-attachments/assets/e85fd9af-5aeb-48de-b112-afbf03f3d542" />

<img width="947" height="600" alt="image" src="https://github.com/user-attachments/assets/165e7f80-5be6-4421-97e3-9fc481d330cd" />

<img width="857" height="534" alt="image" src="https://github.com/user-attachments/assets/423151ae-ba85-4ef7-9824-d72d2f944699" />

<img width="886" height="551" alt="image" src="https://github.com/user-attachments/assets/ba8d2055-d1fa-4b69-86ef-18317b873018" />

Cifrado de comunicación interna: Se habilitó el parámetro `--keyFile` con un archivo secreto (`clave.txt`). Esto obliga a los nodos del clúster a identificarse con una llave criptográfica compartida, evitando que servidores no autorizados se unan al Replica Set para robar datos.

2. Control de Acceso Basado en Roles (RBAC): Se deshabilitó el acceso anónimo y se crearon perfiles bajo el estricto principio de mínimos privilegios:
   **Administrador (rol: root):** Usuario maestro de acceso exclusivo para la configuración y mantenimiento.
   **AppAlquileres (rol: readWrite):** Usuario restringido que la aplicación utilizará para conectarse, con permisos limitados únicamente a la base de datos `SistemaAlquileres`.

   Evidencia de blindaje: El sistema ahora rechaza activamente cualquier intento de consulta no autenticada o anónima, arrojando un error de autorización antes de exponer cualquier colección.

   <img width="794" height="671" alt="image" src="https://github.com/user-attachments/assets/66d15b65-3cd4-48cf-b232-1aa85f4bef7d" />

<img width="886" height="791" alt="image" src="https://github.com/user-attachments/assets/1e07f5d9-1a0e-4d99-b194-25b42032b90b" />

<img width="981" height="925" alt="image" src="https://github.com/user-attachments/assets/38e657f8-5e2b-44e3-b37c-3eeb3ee6c6f9" />

<img width="775" height="929" alt="image" src="https://github.com/user-attachments/assets/7b61acd1-6626-4d7f-9ee8-b85038a353fa" />

<img width="909" height="444" alt="image" src="https://github.com/user-attachments/assets/872d5a3c-b732-4eff-ab13-1adf712955ee" />

<img width="886" height="228" alt="image" src="https://github.com/user-attachments/assets/881ce3d0-2c1a-4a65-a001-733acba10f1b" />

<img width="909" height="515" alt="image" src="https://github.com/user-attachments/assets/87ea1fbc-14c5-407b-83ba-f911451a83ea" />

<img width="428" height="145" alt="image" src="https://github.com/user-attachments/assets/15fe0e7d-4b53-4fd6-a5dc-e172f877a1a9" />

