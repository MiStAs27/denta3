// src/lib/cobros-store.ts
// Capa de acceso a Firestore para el módulo Cobros y Saldos
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type {
  Presupuesto,
  Pago,
  ConfiguracionMorosos,
  ConfigComisionDoctor,
  RegistroComision,
  MovimientoCuenta,
} from "@/types/cobros";
// ─────────────────────────────────────────────────────────────
// UTILIDADES DE NUMERACIÓN
// ─────────────────────────────────────────────────────────────
/** Genera un número de 5 dígitos aleatorio (00001–99999) */
const randomSeq = () => String(Math.floor(Math.random() * 90000) + 10000);
/** PR-2026-12345 */
export function generarNumeroPresupuesto(): string {
  const year = new Date().getFullYear();
  return `PR-${year}-${randomSeq()}`;
}
/** CP-2026-12345 */
export function generarNumeroPago(): string {
  const year = new Date().getFullYear();
  return `CP-${year}-${randomSeq()}`;
}
/** Calcula la fecha de vencimiento sumando N días a hoy */
export function calcularFechaVencimiento(vigenciaDias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + vigenciaDias);
  return d.toISOString();
}
// ─────────────────────────────────────────────────────────────
// PRESUPUESTOS
// ─────────────────────────────────────────────────────────────
export async function crearPresupuesto(
  presupuesto: Omit<Presupuesto, "id">
): Promise<string> {
  const ref = collection(db, "pacientes", presupuesto.pacienteId, "presupuestos");
  const docRef = await addDoc(ref, presupuesto);
  return docRef.id;
}
export async function actualizarEstadoPresupuesto(
  pacienteId: string,
  presupuestoId: string,
  estado: Presupuesto["estado"]
): Promise<void> {
  const ref = doc(db, "pacientes", pacienteId, "presupuestos", presupuestoId);
  await updateDoc(ref, { estado });
}
export async function obtenerPresupuestosPaciente(
  pacienteId: string
): Promise<Presupuesto[]> {
  const ref = collection(db, "pacientes", pacienteId, "presupuestos");
  const q = query(ref, orderBy("fecha", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Presupuesto));
}
// ─────────────────────────────────────────────────────────────
// PAGOS — transaccional: registra pago + actualiza saldo en el doc raíz
// ─────────────────────────────────────────────────────────────
export async function registrarPago(
  pago: Omit<Pago, "id">
): Promise<string> {
  let pagoId = "";
  await runTransaction(db, async (transaction) => {
    // 1. Crear el documento de pago
    const pagosRef = collection(db, "pacientes", pago.pacienteId, "pagos");
    const pagoDocRef = doc(pagosRef);
    pagoId = pagoDocRef.id;
    transaction.set(pagoDocRef, pago);
    // 2. Si hay presupuesto asociado, actualizamos su saldo
    if (pago.presupuestoId) {
      const presRef = doc(
        db,
        "pacientes",
        pago.pacienteId,
        "presupuestos",
        pago.presupuestoId
      );
      const presSnap = await transaction.get(presRef);
      if (presSnap.exists()) {
        const presData = presSnap.data() as Presupuesto;
        const nuevoAbonado = (presData as any).abonado
          ? (presData as any).abonado + pago.montoNeto
          : pago.montoNeto;
        const nuevoSaldo = Math.max(0, presData.total - nuevoAbonado);
        transaction.update(presRef, {
          abonado: nuevoAbonado,
          saldoPendiente: nuevoSaldo,
          estado: nuevoSaldo <= 0 ? "Aceptado" : presData.estado,
        });
      }
    }
    // 3. Actualizar saldoPendiente en el doc raíz del paciente
    // (se recalcula leyendo todos los presupuestos con saldo > 0)
    // Nota: el recalculado completo lo hacemos en recalcularSaldoPaciente
  });
  // 4. Recalculo completo del saldo (fuera de la transaction por limitación de lecturas)
  await recalcularSaldoPaciente(pago.pacienteId);
  return pagoId;
}
export async function anularPago(
  pacienteId: string,
  pagoId: string,
  motivoAnulacion: string,
  anuladoPor: string
): Promise<void> {
  const pagoRef = doc(db, "pacientes", pacienteId, "pagos", pagoId);
  const pagoSnap = await getDoc(pagoRef);
  if (!pagoSnap.exists()) throw new Error("Pago no encontrado");
  const pago = pagoSnap.data() as Pago;
  await runTransaction(db, async (transaction) => {
    // Marcar pago como anulado
    transaction.update(pagoRef, {
      estado: "Anulado",
      motivoAnulacion,
      anuladoPor,
      fechaAnulacion: new Date().toISOString(),
    });
    // Revertir el saldo del presupuesto asociado si existe
    if (pago.presupuestoId) {
      const presRef = doc(
        db,
        "pacientes",
        pacienteId,
        "presupuestos",
        pago.presupuestoId
      );
      const presSnap = await transaction.get(presRef);
      if (presSnap.exists()) {
        const presData = presSnap.data() as any;
        const nuevoAbonado = Math.max(
          0,
          (presData.abonado || 0) - pago.montoNeto
        );
        const nuevoSaldo = presData.total - nuevoAbonado;
        transaction.update(presRef, {
          abonado: nuevoAbonado,
          saldoPendiente: nuevoSaldo,
          estado: nuevoSaldo > 0 ? "Pendiente" : "Aceptado",
        });
      }
    }
  });
  await recalcularSaldoPaciente(pacienteId);
}
export async function obtenerPagosPaciente(pacienteId: string): Promise<Pago[]> {
  const ref = collection(db, "pacientes", pacienteId, "pagos");
  const q = query(ref, orderBy("fecha", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Pago));
}
// ─────────────────────────────────────────────────────────────
// RECÁLCULO DE SALDO TOTAL DEL PACIENTE
// ─────────────────────────────────────────────────────────────
export async function recalcularSaldoPaciente(
  pacienteId: string
): Promise<number> {
  const presSnap = await getDocs(
    collection(db, "pacientes", pacienteId, "presupuestos")
  );
  let saldoTotal = 0;
  presSnap.docs.forEach((d) => {
    const data = d.data();
    const saldoItem = data.saldoPendiente ?? 0;
    saldoTotal += saldoItem;
  });
  const pacienteRef = doc(db, "pacientes", pacienteId);
  await updateDoc(pacienteRef, {
    saldoPendiente: saldoTotal,
  });
  return saldoTotal;
}
// ─────────────────────────────────────────────────────────────
// ESTADO DE CUENTA — movimientos unificados (presupuestos + pagos)
// ─────────────────────────────────────────────────────────────
export async function obtenerMovimientosCuenta(
  pacienteId: string
): Promise<MovimientoCuenta[]> {
  const [presupuestos, pagos] = await Promise.all([
    obtenerPresupuestosPaciente(pacienteId),
    obtenerPagosPaciente(pacienteId),
  ]);
  const movimientos: MovimientoCuenta[] = [];
  // Cargos (presupuestos)
  presupuestos.forEach((p) => {
    movimientos.push({
      id: p.id!,
      tipo: "cargo",
      fecha: p.fecha,
      concepto: p.items.map((i) => i.nombre).join(", ") || "Presupuesto",
      numero: p.numero,
      monto: p.total,
      saldoAcumulado: 0, // se calcula a continuación
      estado: p.estado,
      anulado: false,
    });
  });
  // Pagos
  pagos.forEach((p) => {
    movimientos.push({
      id: p.id!,
      tipo: "pago",
      fecha: p.fecha,
      concepto: p.concepto,
      numero: p.numero,
      monto: -p.montoNeto, // negativo = reduce deuda
      saldoAcumulado: 0,
      estado: p.estado,
      anulado: p.estado === "Anulado",
    });
  });
  // Ordenar por fecha ascendente y calcular saldo acumulado
  movimientos.sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );
  let saldoAcum = 0;
  movimientos.forEach((m) => {
    if (!m.anulado) {
      saldoAcum += m.monto;
    }
    m.saldoAcumulado = saldoAcum;
  });
  // Devolver en orden descendente (más reciente primero)
  return movimientos.reverse();
}
// ─────────────────────────────────────────────────────────────
// MOROSOS
// ─────────────────────────────────────────────────────────────
export async function obtenerConfigMorosos(
  tenantId: string
): Promise<ConfiguracionMorosos> {
  const ref = doc(db, "configuracion", tenantId, "morosos", "config");
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as ConfiguracionMorosos;
  }
  // Default
  return {
    tenantId,
    activo: true,
    diasMinimos: 30,
    montoMinimo: 100,
    bloquearCitas: false,
    recordatorioCadaDias: 0,
  };
}
export async function guardarConfigMorosos(
  config: ConfiguracionMorosos
): Promise<void> {
  const ref = doc(db, "configuracion", config.tenantId, "morosos", "config");
  await updateDoc(ref, { ...config }).catch(async () => {
    await addDoc(collection(db, "configuracion", config.tenantId, "morosos"), {
      ...config,
    });
  });
}
export async function marcarMorosoManual(
  pacienteId: string,
  esMoroso: boolean,
  nota: string,
  usuarioNombre: string
): Promise<void> {
  const ref = doc(db, "pacientes", pacienteId);
  await updateDoc(ref, {
    esMoroso,
    fechaMoroso: esMoroso ? new Date().toISOString() : null,
    motivoMoroso: esMoroso ? nota : null,
    morosoManual: esMoroso, // para no volver a marcarlo automáticamente hasta que sea limpiado
    ultimoCambioMorosoBy: usuarioNombre,
  });
}
export async function evaluarMorososTenant(
  tenantId: string,
  config: ConfiguracionMorosos
): Promise<number> {
  if (!config.activo) return 0;
  const pacientesSnap = await getDocs(
    query(
      collection(db, "pacientes"),
      where("tenantId", "==", tenantId),
      where("saldoPendiente", ">", config.montoMinimo)
    )
  );
  let marcados = 0;
  const ahora = new Date();
  for (const pacDoc of pacientesSnap.docs) {
    const pac = pacDoc.data();
    if (pac.morosoManual) continue; // Saltamos los marcados manualmente
    // Revisar deuda más antigua
    const presSnap = await getDocs(
      query(
        collection(db, "pacientes", pacDoc.id, "presupuestos"),
        where("saldoPendiente", ">", 0),
        orderBy("saldoPendiente"),
        orderBy("fecha", "asc")
      )
    );
    if (presSnap.empty) continue;
    const masAntigua = presSnap.docs[0].data();
    const fechaDeuda = new Date(masAntigua.fecha);
    const diasDeuda = Math.floor(
      (ahora.getTime() - fechaDeuda.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diasDeuda >= config.diasMinimos) {
      await updateDoc(doc(db, "pacientes", pacDoc.id), {
        esMoroso: true,
        fechaMoroso: ahora.toISOString(),
        motivoMoroso: `Deuda vencida automática: ${diasDeuda} días, Bs. ${pac.saldoPendiente}`,
      });
      marcados++;
    }
  }
  return marcados;
}
// ─────────────────────────────────────────────────────────────
// COMISIONES
// ─────────────────────────────────────────────────────────────
export async function obtenerConfigComisiones(
  tenantId: string
): Promise<ConfigComisionDoctor[]> {
  const ref = collection(db, "configuracion", tenantId, "comisiones");
  const snap = await getDocs(ref);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as ConfigComisionDoctor)
  );
}
export async function guardarConfigComision(
  config: ConfigComisionDoctor
): Promise<void> {
  if (config.id) {
    const ref = doc(
      db,
      "configuracion",
      config.tenantId,
      "comisiones",
      config.id
    );
    await updateDoc(ref, { ...config });
  } else {
    await addDoc(
      collection(db, "configuracion", config.tenantId, "comisiones"),
      config
    );
  }
}
export async function registrarComision(
  comision: Omit<RegistroComision, "id">
): Promise<void> {
  await addDoc(collection(db, "comisiones"), comision);
}
export async function obtenerReporteComisiones(
  tenantId: string,
  periodo: string // YYYY-MM
): Promise<RegistroComision[]> {
  const ref = collection(db, "comisiones");
  const q = query(
    ref,
    where("tenantId", "==", tenantId),
    where("periodo", "==", periodo),
    where("anulado", "==", false)
  );
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ id: d.id, ...d.data() } as RegistroComision)
  );
}
// ─────────────────────────────────────────────────────────────
// CATÁLOGO DE PROCEDIMIENTOS
// ─────────────────────────────────────────────────────────────
export async function obtenerCatalogoProcedimientos(tenantId: string) {
  const ref = collection(db, "configuracion", tenantId, "procedimientos");
  const snap = await getDocs(ref);
  if (!snap.empty) {
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  // Si no hay catálogo, creamos uno de demo
  const demo = [
    { nombre: "Consulta General", codigo: "CG-001", precio: 50, categoria: "Consulta" },
    { nombre: "Limpieza Dental", codigo: "LD-001", precio: 120, categoria: "Preventivo" },
    { nombre: "Extracción Simple", codigo: "ES-001", precio: 80, categoria: "Cirugía" },
    { nombre: "Extracción Quirúrgica", codigo: "EQ-001", precio: 200, categoria: "Cirugía" },
    { nombre: "Endodoncia (1 canal)", codigo: "EN-001", precio: 350, categoria: "Endodoncia" },
    { nombre: "Endodoncia (2 canales)", codigo: "EN-002", precio: 450, categoria: "Endodoncia" },
    { nombre: "Endodoncia (3+ canales)", codigo: "EN-003", precio: 550, categoria: "Endodoncia" },
    { nombre: "Corona Porcelana", codigo: "CP-001", precio: 600, categoria: "Prótesis" },
    { nombre: "Corona Metálica", codigo: "CM-001", precio: 400, categoria: "Prótesis" },
    { nombre: "Ortodoncia (mensual)", codigo: "OR-001", precio: 180, categoria: "Ortodoncia" },
    { nombre: "Ortodoncia (inicial)", codigo: "OR-002", precio: 800, categoria: "Ortodoncia" },
    { nombre: "Blanqueamiento", codigo: "BL-001", precio: 250, categoria: "Estética" },
    { nombre: "Resina (1 cara)", codigo: "RE-001", precio: 90, categoria: "Restauración" },
    { nombre: "Resina (2+ caras)", codigo: "RE-002", precio: 130, categoria: "Restauración" },
    { nombre: "Implante Dental", codigo: "IM-001", precio: 1500, categoria: "Implante" },
  ];
  for (const p of demo) {
    await addDoc(ref, { ...p, tenantId });
  }
  return demo.map((p, i) => ({ id: `demo-${i}`, ...p, tenantId }));
}
