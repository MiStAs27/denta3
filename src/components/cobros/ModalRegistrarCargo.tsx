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
import { ClipboardList } from "lucide-react";
import {
  generarNumeroCargo,
  registrarCargo,
  obtenerPresupuestosPaciente,
} from "@/lib/cobros-store";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: string;
  pacienteNombre: string;
  onCargoRegistrado: () => void;
}

export default function ModalRegistrarCargo({
  isOpen,
  onClose,
  pacienteId,
  pacienteNombre,
  onCargoRegistrado,
}: Props) {
  const { user } = useAuth();
  const { toast } = useToast();

  const [concepto, setConcepto] = useState("");
  const [monto, setMonto] = useState("");
  const [presupuestoId, setPresupuestoId] = useState("");
  const [presupuestos, setPresupuestos] = useState<
    { id: string; numero: string; total: number }[]
  >([]);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (isOpen && pacienteId) {
      obtenerPresupuestosPaciente(pacienteId).then((data) =>
        setPresupuestos(
          data
            .filter((p) => p.estado === "Aceptado" || p.estado === "Pendiente")
            .map((p) => ({
              id: p.id!,
              numero: p.numero,
              total: p.total,
            }))
        )
      );
      setConcepto("");
      setMonto("");
      setPresupuestoId("");
    }
  }, [isOpen, pacienteId]);

  const presSel = presupuestos.find((p) => p.id === presupuestoId);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;

    const montoNum = parseFloat(monto) || 0;
    if (!concepto.trim() || montoNum <= 0) {
      toast({
        title: "Datos incompletos",
        description: "Indica qué se realizó y el monto cobrado.",
        variant: "destructive",
      });
      return;
    }

    setGuardando(true);
    try {
      const ahora = new Date().toISOString();
      await registrarCargo({
        numero: generarNumeroCargo(),
        tenantId: user.tenantId,
        pacienteId,
        pacienteNombre,
        fecha: ahora,
        concepto: concepto.trim(),
        monto: montoNum,
        presupuestoId: presupuestoId || undefined,
        presupuestoNumero: presSel?.numero,
        estado: "Activo",
        creadoPor: user.nombre || user.email || "Sistema",
        creadoEn: ahora,
      });

      toast({
        title: "Cargo registrado",
        description: "Quedó en el historial de lo realizado.",
      });
      onCargoRegistrado();
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "No se pudo registrar el cargo.",
        variant: "destructive",
      });
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#2651A3] flex items-center gap-2">
            <ClipboardList className="w-5 h-5" />
            Registrar lo realizado
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Esto es lo que se hizo hoy y se cobra al paciente. No es el
            presupuesto estimado.
          </p>
        </DialogHeader>

        <form onSubmit={handleGuardar} className="space-y-4 py-2">
          <div>
            <Label>¿Qué se realizó? *</Label>
            <Input
              placeholder="Ej. Limpieza dental, sesión ortodoncia..."
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label>Monto cobrado (Bs.) *</Label>
            <Input
              type="number"
              min={0}
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          {presupuestos.length > 0 && (
            <div>
              <Label>Vincular a presupuesto (opcional)</Label>
              <select
                value={presupuestoId}
                onChange={(e) => setPresupuestoId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="">Sin vincular</option>
                {presupuestos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.numero} — plan ~ Bs. {p.total.toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-[#2651A3] hover:bg-[#1e4082]"
              disabled={guardando}
            >
              {guardando ? "Guardando..." : "Registrar en cuenta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
