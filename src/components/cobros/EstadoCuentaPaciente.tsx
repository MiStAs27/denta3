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
} from "lucide-react";
import ModalNuevoPresupuesto from "@/components/cobros/ModalNuevoPresupuesto";
import ModalNuevoPago from "@/components/cobros/ModalNuevoPago";
import ModalAnularPago from "@/components/cobros/ModalAnularPago";
import {
  obtenerMovimientosCuenta,
  obtenerPagosPaciente,
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

export default function EstadoCuentaPaciente({
  pacienteId,
  pacienteNombre,
  esMoroso,
  onSaldoActualizado,
}: Props) {
  const [movimientos, setMovimientos] = useState<MovimientoCuenta[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>("todos");
  const [filtroTexto, setFiltroTexto] = useState("");
  const [modalPresupuesto, setModalPresupuesto] = useState(false);
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
      const [movs, pgs] = await Promise.all([
        obtenerMovimientosCuenta(pacienteId),
        obtenerPagosPaciente(pacienteId),
      ]);
      setMovimientos(movs);
      setPagos(pgs);
    } finally {
      setCargando(false);
    }
  }, [pacienteId, onSaldoActualizado]);

  useEffect(() => {
    cargarDatos();
    const interval = setInterval(cargarDatos, 5 * 60 * 1000); // Refrescar cada 5 minutos
    return () => clearInterval(interval);
  }, [cargarDatos]);

  const saldoActual =
    movimientos.length > 0 ? movimientos[0].saldoAcumulado : 0;

  const totalPagado = pagos
    .filter((p) => p.estado === "Activo")
    .reduce((acc, p) => acc + p.montoNeto, 0);

  const totalCargos = movimientos
    .filter((m) => m.tipo === "cargo" && !m.anulado)
    .reduce((acc, m) => acc + m.monto, 0);

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

  const imprimirPresupuesto = async (mov: MovimientoCuenta) => {
    const { obtenerPresupuestosPaciente } = await import("@/lib/cobros-store");
    const pres = await obtenerPresupuestosPaciente(pacienteId);
    const p = pres.find((x) => x.id === mov.id);
    if (p) generarPresupuestoPDF(p);
  };

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
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col min-h-[600px]">
      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-50 rounded-lg p-4 border">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Total cargos
          </p>
          <p className="text-xl font-bold text-slate-800">
            Bs. {totalCargos.toFixed(2)}
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
            Saldo pendiente
          </p>
          <p
            className={`text-xl font-bold ${saldoActual > 0 ? "text-red-600" : "text-emerald-600"}`}
          >
            Bs. {saldoActual.toFixed(2)}
          </p>
        </div>
        <div className="bg-slate-50 rounded-lg p-4 border flex flex-col justify-center">
          {esMoroso ? (
            <Badge className="bg-red-600 text-white w-fit">MOROSO</Badge>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-700 w-fit">
              Al día
            </Badge>
          )}
        </div>
      </div>

      {/* Acciones y filtros */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button
            className="bg-[#2651A3] hover:bg-[#1e4082] gap-2"
            onClick={() => setModalPresupuesto(true)}
          >
            <Plus className="w-4 h-4" /> Nuevo Presupuesto
          </Button>
          <Button
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
            onClick={() => setModalPago(true)}
          >
            <Wallet className="w-4 h-4" /> Registrar Pago
          </Button>
          <Button variant="outline" onClick={cargarDatos} disabled={cargando}>
            <RefreshCw
              className={`w-4 h-4 ${cargando ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
        <div className="flex gap-2">
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value as FiltroTipo)}
            className="border rounded-md px-3 py-2 text-sm"
          >
            <option value="todos">Todos</option>
            <option value="cargo">Cargos</option>
            <option value="pago">Pagos</option>
          </select>
          <Input
            placeholder="Buscar..."
            className="w-40"
            value={filtroTexto}
            onChange={(e) => setFiltroTexto(e.target.value)}
          />
        </div>
      </div>

      {/* Tabla */}
      <ScrollArea className="flex-1 border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left">Fecha</th>
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
                  Cargando movimientos...
                </td>
              </tr>
            ) : movimientosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-slate-400">
                  Sin movimientos registrados.
                </td>
              </tr>
            ) : (
              movimientosFiltrados.map((mov) => (
                <tr key={`${mov.tipo}-${mov.id}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">
                    {new Date(mov.fecha).toLocaleDateString("es-ES")}
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
                      {mov.tipo === "cargo" ? "Cargo" : "Pago"}
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
                    <div className="flex justify-end gap-1">
                      {mov.tipo === "cargo" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Imprimir presupuesto"
                            onClick={() => imprimirPresupuesto(mov)}
                          >
                            <FileText className="w-4 h-4" />
                          </Button>
                          {mov.estado === "Pendiente" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Aceptar"
                                className="text-emerald-600"
                                onClick={() =>
                                  cambiarEstadoPresupuesto(mov.id, "Aceptado")
                                }
                              >
                                ✓
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                title="Rechazar"
                                className="text-red-500"
                                onClick={() =>
                                  cambiarEstadoPresupuesto(mov.id, "Rechazado")
                                }
                              >
                                ✕
                              </Button>
                            </>
                          )}
                        </>
                      )}
                      {mov.tipo === "pago" && !mov.anulado && (
                        <>
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

      <ModalNuevoPresupuesto
        isOpen={modalPresupuesto}
        onClose={() => setModalPresupuesto(false)}
        pacienteId={pacienteId}
        pacienteNombre={pacienteNombre}
        onPresupuestoCreado={cargarDatos}
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
