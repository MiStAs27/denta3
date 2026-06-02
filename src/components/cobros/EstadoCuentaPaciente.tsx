"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Wallet,
  Printer,
  Ban,
  FileText,
  RefreshCw,
  ClipboardList,
} from "lucide-react";
import ModalNuevoPresupuesto from "@/components/cobros/ModalNuevoPresupuesto";
import ModalNuevoPago from "@/components/cobros/ModalNuevoPago";
import ModalAnularPago from "@/components/cobros/ModalAnularPago";
import ModalRegistrarCargo from "@/components/cobros/ModalRegistrarCargo";
import {
  obtenerMovimientosCuenta,
  obtenerPagosPaciente,
  obtenerPresupuestosPaciente,
  marcarPresupuestosVencidos,
  recalcularSaldoPaciente,
  actualizarEstadoPresupuesto,
} from "@/lib/cobros-store";
import { generarPresupuestoPDF } from "@/lib/generarPresupuestoPDF";
import { generarComprobantePDF } from "@/lib/generarComprobantePDF";
import type { MovimientoCuenta, Pago, Presupuesto } from "@/types/cobros";

interface Props {
  pacienteId: string;
  pacienteNombre: string;
  esMoroso?: boolean;
  onSaldoActualizado?: (saldo: number) => void;
}

type FiltroTipo = "todos" | "cargo" | "pago";

function formatearFechaHora(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function EstadoCuentaPaciente({
  pacienteId,
  pacienteNombre,
  esMoroso,
  onSaldoActualizado,
}: Props) {
  const [movimientos, setMovimientos] = useState<MovimientoCuenta[]>([]);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [modalPresupuesto, setModalPresupuesto] = useState(false);
  const [modalCargo, setModalCargo] = useState(false);
  const [modalPago, setModalPago] = useState(false);
  const [modalAnular, setModalAnular] = useState(false);
  const [pagoAnular, setPagoAnular] = useState<Pago | null>(null);

  const cargarDatos = useCallback(async () => {
    if (!pacienteId) return;
    setCargando(true);
    try {
      await marcarPresupuestosVencidos(pacienteId);
      const saldo = await recalcularSaldoPaciente(pacienteId);
      onSaldoActualizado?.(saldo);
      const [movs, pgs, pres] = await Promise.all([
        obtenerMovimientosCuenta(pacienteId),
        obtenerPagosPaciente(pacienteId),
        obtenerPresupuestosPaciente(pacienteId),
      ]);
      setMovimientos(movs);
      setPagos(pgs);
      setPresupuestos(pres);
    } finally {
      setCargando(false);
    }
  }, [pacienteId, onSaldoActualizado]);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  const saldoActual =
    movimientos.length > 0 ? movimientos[0].saldoAcumulado : 0;

  const totalPagado = pagos
    .filter((p) => p.estado === "Activo")
    .reduce((acc, p) => acc + p.montoNeto, 0);

  const totalRealizado = movimientos
    .filter((m) => m.tipo === "cargo" && !m.anulado)
    .reduce((acc, m) => acc + m.monto, 0);

  const totalEstimadoPlanes = presupuestos
    .filter((p) => p.estado === "Pendiente" || p.estado === "Aceptado")
    .reduce((acc, p) => acc + p.total, 0);

  const movimientosFiltrados = movimientos.filter((m) => {
    if (filtroTipo !== "todos" && m.tipo !== filtroTipo) return false;
    if (filtroTexto) {
      const q = filtroTexto.toLowerCase();
      return (
        m.concepto.toLowerCase().includes(q) ||
        m.numero.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const imprimirPago = (mov: MovimientoCuenta) => {
    const p = pagos.find((x) => x.id === mov.id);
    if (p) generarComprobantePDF(p);
  };

  const cambiarEstadoPresupuesto = async (
    presupuestoId: string,
    estado: Presupuesto["estado"]
  ) => {
    await actualizarEstadoPresupuesto(pacienteId, presupuestoId, estado);
    cargarDatos();
  };

  const estadoBadge = (estado: string, anulado?: boolean) => {
    if (anulado)
      return (
        <Badge variant="outline" className="text-slate-400">
          Anulado
        </Badge>
      );
    const colores: Record<string, string> = {
      Pendiente: "bg-amber-100 text-amber-700",
      Aceptado: "bg-emerald-100 text-emerald-700",
      Rechazado: "bg-red-100 text-red-700",
      Vencido: "bg-orange-100 text-orange-700",
      Activo: "bg-emerald-100 text-emerald-700",
      Anulado: "bg-slate-100 text-slate-500",
    };
    return (
      <Badge className={colores[estado] || "bg-slate-100"}>{estado}</Badge>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col gap-6">
      {/* Resumen de cuenta real */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 rounded-lg p-4 border">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Total realizado (cargos)
          </p>
          <p className="text-xl font-bold text-slate-800">
            Bs. {totalRealizado.toFixed(2)}
          </p>
        </div>
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
          <p className="text-xs text-emerald-600 uppercase font-bold">
            Total pagado
          </p>
          <p className="text-xl font-bold text-emerald-700">
            Bs. {totalPagado.toFixed(2)}
          </p>
        </div>
        <div
          className={`rounded-lg p-4 border ${saldoActual > 0 ? "bg-red-50 border-red-100" : "bg-emerald-50 border-emerald-100"}`}
        >
          <p className="text-xs uppercase font-bold text-slate-500">
            Saldo pendiente (real)
          </p>
          <p
            className={`text-xl font-bold ${saldoActual > 0 ? "text-red-600" : "text-emerald-600"}`}
          >
            Bs. {saldoActual.toFixed(2)}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <p className="text-xs text-blue-600 uppercase font-bold">
            Planes activos (estimado)
          </p>
          <p className="text-xl font-bold text-[#2651A3]">
            Bs. {totalEstimadoPlanes.toFixed(2)}
          </p>
          <p className="text-[10px] text-slate-500 mt-1">
            Aprox. a invertir según presupuestos
          </p>
        </div>
      </div>

      {/* ── SECCIÓN: PRESUPUESTOS (plan estimado) ── */}
      <div className="border rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-3 border-b flex flex-wrap justify-between items-center gap-2">
          <div>
            <h3 className="font-bold text-[#2651A3] flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Presupuestos / Plan de tratamiento
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cuánto más o menos va a gastar el paciente (cotización, no es lo
              ya realizado).
            </p>
          </div>
          <Button
            size="sm"
            className="bg-[#2651A3] hover:bg-[#1e4082] gap-1"
            onClick={() => setModalPresupuesto(true)}
          >
            <Plus className="w-4 h-4" /> Nuevo presupuesto
          </Button>
        </div>

        <ScrollArea className="max-h-48">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left">Número</th>
                <th className="px-3 py-2 text-left">Emitido</th>
                <th className="px-3 py-2 text-left">Válido hasta</th>
                <th className="px-3 py-2 text-right">Total estimado</th>
                <th className="px-3 py-2 text-right">Abonado al plan</th>
                <th className="px-3 py-2 text-center">Estado</th>
                <th className="px-3 py-2 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {presupuestos.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-slate-400 text-sm"
                  >
                    Sin presupuestos. Crea uno para indicar el gasto
                    aproximado del tratamiento.
                  </td>
                </tr>
              ) : (
                presupuestos.map((pres) => (
                  <tr key={pres.id} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-xs">
                      {pres.numero}
                    </td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      {formatearFechaHora(pres.fecha)}
                    </td>
                    <td className="px-3 py-2 text-xs whitespace-nowrap">
                      {new Date(pres.fechaVencimiento).toLocaleDateString(
                        "es-ES"
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-bold text-[#2651A3]">
                      Bs. {pres.total.toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right text-emerald-600">
                      Bs. {(pres.abonado || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {estadoBadge(pres.estado)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Imprimir PDF"
                          onClick={() => generarPresupuestoPDF(pres)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        {pres.estado === "Pendiente" && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-emerald-600"
                              title="Aceptar plan"
                              onClick={() =>
                                cambiarEstadoPresupuesto(pres.id!, "Aceptado")
                              }
                            >
                              ✓
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500"
                              title="Rechazar"
                              onClick={() =>
                                cambiarEstadoPresupuesto(pres.id!, "Rechazado")
                              }
                            >
                              ✕
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      {/* ── SECCIÓN: Historial realizado ── */}
      <div>
        <div className="flex flex-wrap gap-3 justify-between items-center mb-3">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="w-4 h-4" />
              Historial de lo realizado
            </h3>
            <p className="text-xs text-slate-500">
              Cargos (trabajo hecho) y pagos con fecha y hora exacta.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              className="bg-[#2651A3] hover:bg-[#1e4082] gap-2"
              onClick={() => setModalCargo(true)}
            >
              <ClipboardList className="w-4 h-4" /> Registrar lo realizado
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 gap-2"
              onClick={() => setModalPago(true)}
            >
              <Wallet className="w-4 h-4" /> Registrar pago
            </Button>
            <Button variant="outline" onClick={cargarDatos} disabled={cargando}>
              <RefreshCw
                className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 mb-3 justify-end">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="todos">Todos</option>
            <option value="cargo">Solo cargos</option>
            <option value="pago">Solo pagos</option>
          </select>
          <Input
            placeholder="Buscar..."
            className="w-40"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
        </div>

        <ScrollArea className="border rounded-lg max-h-[360px]">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left">Fecha y hora</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Número</th>
                <th className="px-4 py-3 text-left">Concepto</th>
                <th className="px-4 py-3 text-right">Monto</th>
                <th className="px-4 py-3 text-right">Saldo</th>
                <th className="px-4 py-3 text-center">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {cargando ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Cargando...
                  </td>
                </tr>
              ) : movimientosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-slate-400">
                    Aún no hay cargos ni pagos registrados.
                    <br />
                    <span className="text-xs">
                      Usa &quot;Registrar lo realizado&quot; cuando atiendas al
                      paciente.
                    </span>
                  </td>
                </tr>
              ) : (
                movimientosFiltrados.map((mov) => (
                  <tr key={`${mov.tipo}-${mov.id}`} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                      {formatearFechaHora(mov.fecha)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={
                          mov.tipo === "cargo"
                            ? "text-blue-600"
                            : "text-emerald-600"
                        }
                      >
                        {mov.tipo === "cargo"
                          ? "Cargo (realizado)"
                          : "Pago"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">{mov.numero}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">
                      {mov.concepto}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${mov.monto > 0 ? "text-red-600" : "text-emerald-600"}`}
                    >
                      {mov.monto > 0 ? "+" : ""}Bs.{" "}
                      {Math.abs(mov.monto).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      Bs. {mov.saldoAcumulado.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {estadoBadge(mov.estado, mov.anulado)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {mov.tipo === "pago" && !mov.anulado && (
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Imprimir comprobante"
                            onClick={() => imprimirPago(mov)}
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Anular"
                            className="text-red-500"
                            onClick={() => {
                              const p = pagos.find((x) => x.id === mov.id);
                              if (p) {
                                setPagoAnular(p);
                                setModalAnular(true);
                              }
                            }}
                          >
                            <Ban className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </ScrollArea>
      </div>

      {esMoroso && (
        <Badge className="bg-red-600 text-white w-fit">PACIENTE MOROSO</Badge>
      )}

      <ModalNuevoPresupuesto
        isOpen={modalPresupuesto}
        onClose={() => setModalPresupuesto(false)}
        pacienteId={pacienteId}
        pacienteNombre={pacienteNombre}
        onPresupuestoCreado={cargarDatos}
      />
      <ModalRegistrarCargo
        isOpen={modalCargo}
        onClose={() => setModalCargo(false)}
        pacienteId={pacienteId}
        pacienteNombre={pacienteNombre}
        onCargoRegistrado={cargarDatos}
      />
      <ModalNuevoPago
        isOpen={modalPago}
        onClose={() => setModalPago(false)}
        pacienteId={pacienteId}
        pacienteNombre={pacienteNombre}
        onPagoRegistrado={cargarDatos}
      />
      <ModalAnularPago
        isOpen={modalAnular}
        onClose={() => setModalAnular(false)}
        pacienteId={pacienteId}
        pago={pagoAnular}
        onPagoAnulado={cargarDatos}
      />
    </div>
  );
}
