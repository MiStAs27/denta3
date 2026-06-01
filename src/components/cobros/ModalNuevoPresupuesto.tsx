"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Search,
  FileText,
  Printer,
  X,
} from "lucide-react";
import {
  generarNumeroPresupuesto,
  calcularFechaVencimiento,
  crearPresupuesto,
  obtenerCatalogoProcedimientos,
} from "@/lib/cobros-store";
import { generarPresupuestoPDF } from "@/lib/generarPresupuestoPDF";
import type { ItemPresupuesto, TipoDescuento } from "@/types/cobros";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: string;
  pacienteNombre: string;
  onPresupuestoCreado: () => void;
}
interface ProcedimientoItem {
  id: string;
  nombre: string;
  codigo: string;
  precio: number;
  categoria: string;
}
export default function ModalNuevoPresupuesto({
  isOpen,
  onClose,
  pacienteId,
  pacienteNombre,
  onPresupuestoCreado,
}: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [catalogo, setCatalogo] = useState<ProcedimientoItem[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [items, setItems] = useState<ItemPresupuesto[]>([]);
  const [vigenciaDias, setVigenciaDias] = useState(30);
  const [descuentoTipo, setDescuentoTipo] = useState<TipoDescuento>("porcentaje");
  const [descuentoValor, setDescuentoValor] = useState("");
  const [notas, setNotas] = useState("");
  const [guardando, setGuardando] = useState(false);
  useEffect(() => {
    if (isOpen && user?.tenantId) {
      obtenerCatalogoProcedimientos(user.tenantId).then((data) =>
        setCatalogo(data as ProcedimientoItem[])
      );
    }
  }, [isOpen, user?.tenantId]);
  const catalogoFiltrado = catalogo.filter(
    (p) =>
      p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busqueda.toLowerCase())
  );
  const agregarProcedimiento = (proc: ProcedimientoItem) => {
    const existente = items.find((i) => i.procedimientoId === proc.id);
    if (existente) {
      setItems(
        items.map((i) =>
          i.procedimientoId === proc.id
            ? {
                ...i,
                cantidad: i.cantidad + 1,
                subtotalItem: (i.cantidad + 1) * i.precio,
              }
            : i
        )
      );
    } else {
      setItems([
        ...items,
        {
          procedimientoId: proc.id,
          nombre: proc.nombre,
          codigo: proc.codigo,
          precio: proc.precio,
          cantidad: 1,
          subtotalItem: proc.precio,
        },
      ]);
    }
    setBusqueda("");
  };
  const actualizarCantidad = (idx: number, cantidad: number) => {
    if (cantidad < 1) return;
    setItems(
      items.map((item, i) =>
        i === idx
          ? { ...item, cantidad, subtotalItem: cantidad * item.precio }
          : item
      )
    );
  };
  const eliminarItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };
  const subtotal = items.reduce((acc, i) => acc + i.subtotalItem, 0);
  const descuentoMonto =
    descuentoTipo === "porcentaje"
      ? (subtotal * (parseFloat(descuentoValor) || 0)) / 100
      : parseFloat(descuentoValor) || 0;
  const total = Math.max(0, subtotal - descuentoMonto);
  const resetForm = () => {
    setItems([]);
    setBusqueda("");
    setVigenciaDias(30);
    setDescuentoTipo("porcentaje");
    setDescuentoValor("");
    setNotas("");
  };
  const handleGuardar = async (imprimirPDF = false) => {
    if (!user?.tenantId) return;
    if (items.length === 0) {
      toast({
        title: "Sin procedimientos",
        description: "Agrega al menos un procedimiento al presupuesto.",
        variant: "destructive",
      });
      return;
    }
    const descVal = parseFloat(descuentoValor) || 0;
    if (descuentoTipo === "porcentaje" && descVal > 100) {
      toast({
        title: "Descuento inválido",
        description: "El descuento no puede superar el 100%.",
        variant: "destructive",
      });
      return;
    }
    if (descuentoMonto > subtotal) {
      toast({
        title: "Descuento inválido",
        description: "El descuento no puede superar el subtotal.",
        variant: "destructive",
      });
      return;
    }
    setGuardando(true);
    try {
      const numero = generarNumeroPresupuesto();
      const fechaVencimiento = calcularFechaVencimiento(vigenciaDias);
      const presupuesto = {
        numero,
        tenantId: user.tenantId,
        pacienteId,
        pacienteNombre,
        fecha: new Date().toISOString(),
        vigenciaDias,
        fechaVencimiento,
        estado: "Pendiente" as const,
        items,
        subtotal,
        descuento: descuentoMonto,
        descuentoTipo,
        descuentoValor: descVal,
        total,
        notas,
        creadoPor: user.nombre || user.email || "Sistema",
        creadoEn: new Date().toISOString(),
        abonado: 0,
        saldoPendiente: total,
      };
      await crearPresupuesto(presupuesto);
      if (imprimirPDF) {
        generarPresupuestoPDF(presupuesto);
      }
      toast({
        title: "Presupuesto creado",
        description: `Número: ${numero}`,
      });
      resetForm();
      onPresupuestoCreado();
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudo guardar el presupuesto.",
        variant: "destructive",
      });
    } finally {
      setGuardando(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50 rounded-t-lg">
          <DialogTitle className="text-xl font-bold text-[#2651A3] flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Nuevo Presupuesto
          </DialogTitle>
          <p className="text-sm text-slate-500 mt-1">
            Paciente:{" "}
            <span className="font-semibold text-slate-700">{pacienteNombre}</span>
          </p>
        </DialogHeader>
        <div className="flex flex-1 overflow-hidden">
          {/* ── Panel izquierdo: buscador de procedimientos ── */}
          <div className="w-72 border-r flex flex-col bg-slate-50">
            <div className="p-3 border-b">
              <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                Catálogo de Procedimientos
              </p>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o código..."
                  className="pl-8 text-sm bg-white"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
              </div>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {catalogoFiltrado.slice(0, 30).map((proc) => (
                  <button
                    key={proc.id}
                    onClick={() => agregarProcedimiento(proc)}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-white hover:shadow-sm border border-transparent hover:border-blue-100 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-slate-700 truncate group-hover:text-[#2651A3]">
                          {proc.nombre}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {proc.codigo}
                        </p>
                      </div>
                      <div className="flex flex-col items-end ml-2">
                        <span className="text-sm font-bold text-emerald-700">
                          Bs. {proc.precio}
                        </span>
                        <Plus className="w-3 h-3 text-blue-400 mt-1 opacity-0 group-hover:opacity-100" />
                      </div>
                    </div>
                  </button>
                ))}
                {catalogoFiltrado.length === 0 && (
                  <p className="text-center text-slate-400 text-xs py-6">
                    Sin resultados
                  </p>
                )}
              </div>
            </ScrollArea>
          </div>
          {/* ── Panel derecho: items + configuración ── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 px-6 py-4">
              <div className="space-y-5">
                {/* Tabla de ítems */}
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-2">
                    Procedimientos seleccionados
                  </p>
                  {items.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
                      <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">
                        Selecciona procedimientos del catálogo
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-50 text-slate-500 text-xs font-bold">
                          <tr>
                            <th className="px-3 py-2 text-left">Procedimiento</th>
                            <th className="px-3 py-2 text-center w-20">Cant.</th>
                            <th className="px-3 py-2 text-right w-28">P. Unit.</th>
                            <th className="px-3 py-2 text-right w-28">Subtotal</th>
                            <th className="px-2 py-2 w-8"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {items.map((item, idx) => (
                            <tr key={idx} className="bg-white hover:bg-slate-50">
                              <td className="px-3 py-2.5">
                                <p className="font-medium text-slate-800">
                                  {item.nombre}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {item.codigo}
                                </p>
                              </td>
                              <td className="px-3 py-2.5">
                                <Input
                                  type="number"
                                  min={1}
                                  value={item.cantidad}
                                  onChange={(e) =>
                                    actualizarCantidad(idx, parseInt(e.target.value) || 1)
                                  }
                                  className="w-16 text-center h-8 text-sm mx-auto"
                                />
                              </td>
                              <td className="px-3 py-2.5 text-right text-slate-600">
                                Bs. {item.precio.toFixed(2)}
                              </td>
                              <td className="px-3 py-2.5 text-right font-semibold text-slate-800">
                                Bs. {item.subtotalItem.toFixed(2)}
                              </td>
                              <td className="px-2 py-2.5">
                                <button
                                  onClick={() => eliminarItem(idx)}
                                  className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                {/* Configuración: vigencia + descuento */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-bold text-slate-600 uppercase">
                      Vigencia (días)
                    </Label>
                    <Input
                      type="number"
                      min={1}
                      max={365}
                      value={vigenciaDias}
                      onChange={(e) => setVigenciaDias(parseInt(e.target.value) || 30)}
                      className="mt-1"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      Vence:{" "}
                      {new Date(
                        Date.now() + vigenciaDias * 86400000
                      ).toLocaleDateString("es-ES")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-xs font-bold text-slate-600 uppercase">
                      Descuento
                    </Label>
                    <div className="flex gap-2 mt-1">
                      <select
                        value={descuentoTipo}
                        onChange={(e) =>
                          setDescuentoTipo(e.target.value as TipoDescuento)
                        }
                        className="border rounded-md px-2 py-2 text-sm bg-white flex-shrink-0"
                      >
                        <option value="porcentaje">%</option>
                        <option value="monto">Bs.</option>
                      </select>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        placeholder={
                          descuentoTipo === "porcentaje" ? "0.00 %" : "0.00 Bs."
                        }
                        value={descuentoValor}
                        onChange={(e) => setDescuentoValor(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-bold text-slate-600 uppercase">
                    Notas (opcional)
                  </Label>
                  <Textarea
                    placeholder="Observaciones o condiciones del presupuesto..."
                    className="mt-1 resize-none"
                    rows={2}
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                  />
                </div>
                {/* Resumen de totales */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <div className="flex justify-between text-sm text-slate-600 mb-1">
                    <span>Subtotal</span>
                    <span className="font-semibold">Bs. {subtotal.toFixed(2)}</span>
                  </div>
                  {descuentoMonto > 0 && (
                    <div className="flex justify-between text-sm text-red-500 mb-1">
                      <span>Descuento</span>
                      <span className="font-semibold">- Bs. {descuentoMonto.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold text-[#2651A3] border-t border-slate-200 pt-2 mt-2">
                    <span>TOTAL</span>
                    <span>Bs. {total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </ScrollArea>
            {/* Footer de acciones */}
            <DialogFooter className="px-6 py-4 border-t bg-white gap-2">
              <Button variant="outline" onClick={onClose} disabled={guardando}>
                Cancelar
              </Button>
              <Button
                variant="outline"
                onClick={() => handleGuardar(true)}
                disabled={guardando || items.length === 0}
                className="gap-2"
              >
                <Printer className="w-4 h-4" />
                Guardar e Imprimir PDF
              </Button>
              <Button
                onClick={() => handleGuardar(false)}
                disabled={guardando || items.length === 0}
                className="bg-[#2651A3] hover:bg-[#1e4082] gap-2"
              >
                <FileText className="w-4 h-4" />
                {guardando ? "Guardando..." : "Guardar Presupuesto"}
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
