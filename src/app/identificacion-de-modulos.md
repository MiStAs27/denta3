# Identificación de Módulos del Sistema (Actualizado)

Este documento mapea los módulos solicitados con la implementación real encontrada en la carpeta `src/` del proyecto.

## M01 - Autenticación
- Estado: No implementado en el código actual.
- Observación: No se encontró ninguna página de login, sistema de sesiones, recuperación de contraseña ni manejo de roles.
- Archivos relacionados: Ninguno.

## M02 - Gestión de Consultorios
- Estado: No implementado en el código actual.
- Observación: No hay registro de consultorios/tenants, ni gestión de planes, sucursales o monitoreo de recursos.
- Archivos relacionados: Ninguno.

## M03 - Gestión del Consultorio
- Estado: No implementado en el código actual.
- Observación: No hay pantallas de configuración de especialidades, asignación de doctores, horarios ni gestión de boxes.
- Archivos relacionados: Ninguno.

## M04 - Agenda y Citas
- Estado: Parcialmente implementado.
- Observación: Existe una UI de agenda con citas de ejemplo, vista diaria y botones de acción.
- Archivos relacionados:
  - `src/app/agenda/page.tsx`
- Funcionalidades presentes:
  - Registro / visualización de citas de muestra
  - Vista diaria con horarios y estado de cita
  - Botones de filtro y "Nueva Cita"
- Funcionalidades faltantes:
  - Confirmación/cancelación real de citas
  - Lista de espera
  - Bloqueo de horarios por ausencia o reunión
  - Cambio de estado dinámico con persistencia

## M05 - Gestión de Pacientes
- Estado: Parcialmente implementado.
- Observación: Hay un listado de pacientes y una ficha de paciente con datos clínicos demo.
- Archivos relacionados:
 - Archivos relacionados:
  - `src/app/pacientes/page.tsx`
  - `src/app/pacientes/[id]/page.tsx`
- Funcionalidades presentes:
  - Listado de pacientes con búsqueda y filtrado UI
  - Navegación al detalle de paciente
  - Estado de paciente (Activo, Moroso, etc.)
- Funcionalidades faltantes:
  - Registro con verificación de duplicados por DNI
  - Edición de datos con historial automático
  - Contacto de emergencia
  - Adjuntar documentos con validación
  - Exportación de ficha en PDF

## M06 - Historia Clínica
- Estado: Parcialmente implementado.
- Observación: El detalle de paciente incluye pestañas de historial clínico, notas de evolución y odontograma estático.
- Archivos relacionados:
  - `src/app/pacientes/[id]/page.tsx`
- Funcionalidades presentes:
  - Historial clínico y notas de evolución de ejemplo
  - Alerta de alergia en la ficha
  - Odontograma visual
- Funcionalidades faltantes:
  - Registro real de evoluciones por visita
  - Emisión de recetas médicas
  - Consentimientos informados con firma digital

## M07 - Plan de Tratamiento
- Estado: No hay módulo dedicado.
- Observación: Solo hay referencias estáticas a un plan actual en la ficha de paciente, pero no existe pantalla o flujo real de tratamiento.
- Archivos relacionados: Ninguno específico.

## M08 - Cobros y Saldos
- Estado: Parcialmente implementado como datos demo.
- Observación: Los detalles de saldo aparecen en la ficha de paciente, pero no hay gestión de cobros ni comprobantes.
- Archivos relacionados:
  - `src/app/pacientes/[id]/page.tsx`
- Funcionalidades presentes:
  - Indicadores de Total Pagado y Saldo Pendiente
- Funcionalidades faltantes:
  - Registro real de cobros
  - Control de abonos parciales
  - Comprobante de pago con número único
  - Historial de pagos
  - Cálculo de comisiones por doctor

## M09 - Chatbot Conversacional
- Estado: Implementado.
- Observación: Hay un chat IA funcionando con un flujo de conserje de citas y respuestas simuladas.
- Archivos relacionados:
  - `src/app/concierge/page.tsx`
  - `src/ai/flows/patient-ai-appointment-concierge.ts`
- Funcionalidades presentes:
  - Interacción conversacional de paciente
  - Reserva, reprogramación y cancelación de cita simuladas
  - Mensajes de IA y UI de chat
- Funcionalidades faltantes:
  - Integración real con WhatsApp
  - Derivación a secretaria/humano
  - Registro persistente del historial de conversación

## M10 - Reportes y Dashboard
- Estado: Implementado.
- Observación: Existe un dashboard con KPIs y gráficos de ejemplo.
- Archivos relacionados:
  - `src/app/dashboard/page.tsx`
- Funcionalidades presentes:
  - KPIs de pacientes, citas y retención
  - Gráficos de flujo de pacientes y tratamientos top
  - Tarjeta de próximas citas
- Funcionalidades faltantes:
  - Reportes financieros detallados
  - Reportes de pacientes por estado
  - Reporte de ocupación de agenda y ausentismo

## Conclusión general
- M04, M05, M06, M09 y M10 existen como prototipos UI con datos de ejemplo.
- M01, M02, M03 y M07 no están implementados.
- La plataforma actual es más un prototipo de frontend con componentes de dashboard/agenda/pacientes y un chat IA mock.

## Recomendación
Para avanzar hacia la versión completa, conviene priorizar:
1. Autenticación y roles (M01)
2. Gestión de consultorios/tenants (M02)
3. Configuración de consultorio (M03)
4. Persistencia de datos y APIs para pacientes, citas, planes y cobros
5. Reportes reales y generación/exportación de documentos
