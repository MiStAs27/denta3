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
import { Textarea } from "@/components/ui/textarea";
import { CreditCard, Printer, Wallet } from "lucide-react";
import {
  generarNumeroPago,
  registrarPago,
  obtenerPresupuestosPaciente,
  obtenerConfigComisiones,
} from "@/lib/cobros-store";
import { generarComprobantePDF } from "@/lib/generarComprobantePDF";
import type { MetodoPago, Presupuesto, TipoDescuento } from "@/types/cobros";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: string;
  pacienteNombre: string;
  onPagoRegistrado: () => void;
  presupuestoPreseleccionado?: Presupuesto | null;
}

export default function ModalNuevoPago({
  isOpen,
  onClose,
  pacienteId,
  pacienteNombre,
  onPagoRegistrado,
  presupuestoPreseleccionado,
}: Props) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);
  const [doctores, setDoctores] = useState<{ id: string; nombre: string }[]>(
    []
  );
  const [presupuestoId, setPresupuestoId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [concepto, setConcepto] = useState("");
  const [montoBruto, setMontoBruto] = useState("");
  const [descuentoTipo, setDescuentoTipo] =
    useState<TipoDescuento>("porcentaje");
  const [descuentoValor, setDescuentoValor] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("Efectivo");
  const [nota, setNota] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!isOpen || !pacienteId || !user?.tenantId) return;

    obtenerPresupuestosPaciente(pacienteId).then((data) => {
      setPresupuestos(
        data.filter((p) => (p.saldoPendiente ?? p.total) > 0)
      );
    });

    obtenerConfigComisiones(user.tenantId).then((configs) => {
      setDoctores(
        configs
          .filter((c) => c.activo)
          .map((c) => ({ id: c.doctorId, nombre: c.doctorNombre }))
      );
    });
  }, [isOpen, pacienteId, user?.tenantId]);

  useEffect(() => {
    if (!isOpen) return;

    if (presupuestoPreseleccionado) {
      setPresupuestoId(presupuestoPreseleccionado.id || "");
      const saldo =
        presupuestoPreseleccionado.saldoPendiente ??
        presupuestoPreseleccionado.total;
      setMontoBruto(String(saldo));
      setConcepto(
        `Abono a presupuesto ${presupuestoPreseleccionado.numero}`
      );
    } else {
      setPresupuestoId("");
      setConcepto("");
      setMontoBruto("");
    }
    setDoctorId("");
    setDescuentoTipo("porcentaje");
    setDescuentoValor("");
    setMetodoPago("Efectivo");
    setNota("");
  }, [isOpen, presupuestoPreseleccionado]);

  const presupuestoSel = presupuestos.find((p) => p.id === presupuestoId);
  const doctorSel = doctores.find((d) => d.id === doctorId);

  const handlePresupuestoChange = (id: string) => {
    setPresupuestoId(id);
    const pres = presupuestos.find((p) => p.id === id);
    if (pres) {
      const saldo = pres.saldoPendiente ?? pres.total;
      setMontoBruto(String(saldo));
      setConcepto(`Abono a presupuesto ${pres.numero}`);
    }
  };

  const bruto = parseFloat(montoBruto) || 0;
  const descVal = parseFloat(descuentoValor) || 0;
  const descuentoMonto =
    descuentoTipo === "porcentaje" ? (bruto * descVal) / 100 : descVal;
  const montoNeto = Math.max(0, bruto - descuentoMonto);

  const handleGuardar = async (imprimirPDF = false) => {
    if (!user?.tenantId) return;

    if (!concepto.trim()) {
      toast({
        title: "Concepto requerido",
        variant: "destructive",
      });
      return;
    }
    if (bruto <= 0) {
      toast({
        title: "Monto inválido",
        description: "El monto debe ser mayor a cero.",
        variant: "destructive",
      });
      return;
    }
    if (descuentoMonto > bruto) {
      toast({
        title: "Descuento inválido",
        variant: "destructive",
      });
      return;
    }

    setGuardando(true);
    try {
      const pago = {
        numero: generarNumeroPago(),
        tenantId: user.tenantId,
        pacienteId,
        pacienteNombre,
        fecha: new Date().toISOString(),
        concepto: concepto.trim(),
        presupuestoId: presupuestoId || undefined,
        presupuestoNumero: presupuestoSel?.numero,
        montoBruto: bruto,
        descuento: descuentoMonto,
        descuentoTipo,
        descuentoValor: descVal,
        montoNeto,
        metodoPago,
        nota: nota.trim() || undefined,
        estado: "Activo" as const,
        doctorId: doctorId || undefined,
        doctorNombre: doctorSel?.nombre,
        creadoPor: user.nombre || user.email || "Sistema",
        creadoEn: new Date().toISOString(),
      };

      await registrarPago(pago);

      if (imprimirPDF) generarComprobantePDF(pago);

      toast({
        title: "Pago registrado",
        description: `Comprobante: ${pago.numero}`,
      });

      onPagoRegistrado();
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudo registrar el pago.",
        variant: "destructive",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#2651A3] flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Registrar Pago (Presencial)
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Paciente:{" "}
            <span className="font-semibold">{pacienteNombre}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <Label>Presupuesto (opcional)</Label>
            <select
              value={presupuestoId}
              onChange={(e) => handlePresupuestoChange(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
            >
              <option value="">Pago libre</option>
              {presupuestos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.numero} — Saldo: Bs.{" "}
                  {(p.saldoPendiente ?? p.total).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {doctores.length > 0 && (
            <div>
              <Label>Doctor (comisión)</Label>
              <select
                value={doctorId}
                onChange={(e) => setDoctorId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="">Sin doctor asignado</option>
                {doctores.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <Label>Concepto</Label>
            <Input
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Monto bruto (Bs.)</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={montoBruto}
                onChange={(e) => setMontoBruto(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label>Método (presencial)</Label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta (POS físico)</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Descuento</Label>
            <div className="flex gap-2 mt-1">
              <select
                value={descuentoTipo}
                onChange={(e) =>
                  setDescuentoTipo(e.target.value as TipoDescuento)
                }
                className="border rounded-md px-2 py-2 text-sm"
              >
                <option value="porcentaje">%</option>
                <option value="monto">Bs.</option>
              </select>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={descuentoValor}
                onChange={(e) => setDescuentoValor(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label>Nota (opcional)</Label>
            <Textarea
              rows={2}
              className="mt-1 resize-none"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
            />
          </div>

          <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
            <div className="flex justify-between text-lg font-bold text-emerald-700">
              <span>Total a pagar</span>
              <span>Bs. {montoNeto.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={() => handleGuardar(true)}
            disabled={guardando}
            className="gap-2"
          >
            <Printer className="w-4 h-4" />
            Guardar e Imprimir
          </Button>
          <Button
            onClick={() => handleGuardar(false)}
            disabled={guardando}
            className="bg-emerald-600 hover:bg-emerald-700 gap-2"
          >
            <CreditCard className="w-4 h-4" />
            {guardando ? "Procesando..." : "Registrar Pago"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
