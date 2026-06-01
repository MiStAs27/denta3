// src/types/cobros.ts
// Tipos del módulo Cobros y Saldos — DentaSync Sprint 7
// ─────────────────────────────────────────────────────────────
// PROCEDIMIENTOS (catálogo por consultorio)
// ─────────────────────────────────────────────────────────────
export interface ProcedimientoCatalogo {
  id?: string;
  tenantId: string;
  nombre: string;
  codigo: string;
  precio: number;
  categoria: string;
}
// ─────────────────────────────────────────────────────────────
// PRESUPUESTOS
// ─────────────────────────────────────────────────────────────
export type EstadoPresupuesto = "Pendiente" | "Aceptado" | "Rechazado" | "Vencido";
export type TipoDescuento = "porcentaje" | "monto";
export interface ItemPresupuesto {
  procedimientoId: string;
  nombre: string;
  codigo: string;
  precio: number;
  cantidad: number;
  subtotalItem: number; // precio * cantidad
}
export interface Presupuesto {
  id?: string;
  numero: string;           // PR-YYYY-XXXXX
  tenantId: string;
  pacienteId: string;
  pacienteNombre: string;
  fecha: string;            // ISO
  vigenciaDias: number;
  fechaVencimiento: string; // ISO (fecha + vigencia)
  estado: EstadoPresupuesto;
  items: ItemPresupuesto[];
  subtotal: number;
  descuento: number;        // monto real descontado
  descuentoTipo: TipoDescuento;
  descuentoValor: number;   // % o monto fijo ingresado
  total: number;
  notas?: string;
  creadoPor: string;
  creadoEn: string;
}
// ─────────────────────────────────────────────────────────────
// PAGOS
// ─────────────────────────────────────────────────────────────
export type MetodoPago = "Efectivo" | "Tarjeta" | "Otro";
export type EstadoPago = "Activo" | "Anulado";
export interface Pago {
  id?: string;
  numero: string;           // CP-YYYY-XXXXX
  tenantId: string;
  pacienteId: string;
  pacienteNombre: string;
  fecha: string;            // ISO
  concepto: string;
  presupuestoId?: string;   // Opcional: enlazado a un presupuesto
  presupuestoNumero?: string;
  montoBruto: number;
  descuento: number;
  descuentoTipo: TipoDescuento;
  descuentoValor: number;
  montoNeto: number;        // montoBruto - descuento
  metodoPago: MetodoPago;
  nota?: string;
  estado: EstadoPago;
  motivoAnulacion?: string;
  anuladoPor?: string;
  fechaAnulacion?: string;
  creadoPor: string;
  creadoEn: string;
}
// ─────────────────────────────────────────────────────────────
// CONFIGURACIÓN MOROSOS (por tenant)
// ─────────────────────────────────────────────────────────────
export interface ConfiguracionMorosos {
  id?: string;
  tenantId: string;
  activo: boolean;
  diasMinimos: number;      // días de antigüedad de la deuda más antigua
  montoMinimo: number;      // saldo mínimo para marcar moroso
  bloquearCitas: boolean;   // bloquear agendamiento si es moroso
  recordatorioCadaDias: number; // frecuencia de recordatorio (0 = desactivado)
}
// ─────────────────────────────────────────────────────────────
// COMISIONES
// ─────────────────────────────────────────────────────────────
export interface ConfigComisionDoctor {
  id?: string;
  tenantId: string;
  doctorId: string;
  doctorNombre: string;
  porcentajeGlobal: number; // % aplicable a todos sus cobros
  activo: boolean;
}
export interface RegistroComision {
  id?: string;
  tenantId: string;
  doctorId: string;
  doctorNombre: string;
  pagoId: string;
  pacienteId: string;
  pacienteNombre: string;
  fecha: string;
  periodo: string;          // YYYY-MM
  montoBase: number;        // montoNeto del pago
  porcentaje: number;
  comisionCalculada: number;
  anulado: boolean;
}
// ─────────────────────────────────────────────────────────────
// ESTADO DE CUENTA — movimiento unificado para la tabla
// ─────────────────────────────────────────────────────────────
export type TipoMovimiento = "cargo" | "pago";
export interface MovimientoCuenta {
  id: string;
  tipo: TipoMovimiento;
  fecha: string;
  concepto: string;
  numero: string;            // PR-... o CP-...
  monto: number;             // positivo = cargo, negativo = pago
  saldoAcumulado: number;
  estado: string;            // estado del presupuesto o pago
  anulado?: boolean;
}
// ─────────────────────────────────────────────────────────────
// RESUMEN FINANCIERO DE UN PACIENTE
// ─────────────────────────────────────────────────────────────
export interface ResumenFinanciero {
  totalCargos: number;
  totalPagado: number;
  saldoPendiente: number;
  esMoroso: boolean;
  fechaMoroso?: string;
}