"use client";

import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle } from "lucide-react";
import { anularPago } from "@/lib/cobros-store";
import type { Pago } from "@/types/cobros";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pacienteId: string;
  pago: Pago | null;
  onPagoAnulado: () => void;
}

export default function ModalAnularPago({
  isOpen,
  onClose,
  pacienteId,
  pago,
  onPagoAnulado,
}: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [motivo, setMotivo] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleAnular = async () => {
    if (!pago?.id || !motivo.trim()) {
      toast({
        title: "Motivo requerido",
        variant: "destructive",
      });
      return;
    }

    setGuardando(true);
    try {
      await anularPago(
        pacienteId,
        pago.id,
        motivo.trim(),
        user?.nombre || user?.email || "Sistema"
      );
      toast({ title: "Pago anulado", description: pago.numero });
      setMotivo("");
      onPagoAnulado();
      onClose();
    } catch (err) {
      console.error(err);
      toast({ title: "Error", variant: "destructive" });
    } finally {
      setGuardando(false);
    }
  };

  if (!pago) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Anular Comprobante
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-sm space-y-1">
            <p>
              <span className="font-bold">Comprobante:</span> {pago.numero}
            </p>
            <p>
              <span className="font-bold">Monto:</span> Bs.{" "}
              {pago.montoNeto.toFixed(2)}
            </p>
          </div>
          <div>
            <Label>Motivo de anulación *</Label>
            <Textarea
              rows={3}
              className="mt-1 resize-none"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleAnular}
            disabled={guardando || !motivo.trim()}
          >
            {guardando ? "Anulando..." : "Confirmar Anulación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
