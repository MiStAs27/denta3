"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  obtenerConfigMorosos,
  guardarConfigMorosos,
  evaluarMorososTenant,
} from "@/lib/cobros-store";
import type { ConfiguracionMorosos } from "@/types/cobros";

export default function ConfigMorososTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<ConfiguracionMorosos | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [evaluando, setEvaluando] = useState(false);

  useEffect(() => {
    if (user?.tenantId) {
      obtenerConfigMorosos(user.tenantId).then(setConfig);
    }
  }, [user?.tenantId]);

  if (!config) {
    return <p className="text-sm text-gray-500 py-4">Cargando...</p>;
  }

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.tenantId) return;
    setGuardando(true);
    try {
      await guardarConfigMorosos({ ...config, tenantId: user.tenantId });
      toast({ title: "Configuración de morosos guardada" });
    } finally {
      setGuardando(false);
    }
  };

  const evaluar = async () => {
    if (!user?.tenantId) return;
    setEvaluando(true);
    try {
      const marcados = await evaluarMorososTenant(user.tenantId, config);
      toast({
        title: "Evaluación completada",
        description: `${marcados} paciente(s) marcados como morosos.`,
      });
    } catch (error: any) {
      console.error("Error al evaluar morosos:", error);
      toast({
        title: "Error al evaluar morosos",
        description: error.message || "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setEvaluando(false);
    }
  };

  return (
    <div className="max-w-xl bg-white p-6 rounded-xl shadow-sm border space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800">Morosos automáticos</h2>
        <p className="text-xs text-gray-500 mt-1">
          Reglas para marcar pacientes con deuda vencida.
        </p>
      </div>

      <form onSubmit={guardar} className="space-y-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.activo}
            onChange={(e) =>
              setConfig({ ...config, activo: e.target.checked })
            }
          />
          Activar evaluación automática de morosos
        </label>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Días mínimos de deuda</Label>
            <Input
              type="number"
              min={1}
              value={config.diasMinimos}
              onChange={(e) =>
                setConfig({
                  ...config,
                  diasMinimos: parseInt(e.target.value) || 30,
                })
              }
            />
          </div>
          <div>
            <Label>Saldo mínimo (Bs.)</Label>
            <Input
              type="number"
              min={0}
              value={config.montoMinimo}
              onChange={(e) =>
                setConfig({
                  ...config,
                  montoMinimo: parseFloat(e.target.value) || 0,
                })
              }
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={config.bloquearCitas}
            onChange={(e) =>
              setConfig({ ...config, bloquearCitas: e.target.checked })
            }
          />
          Bloquear agendamiento de citas si es moroso
        </label>

        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={evaluar}
            disabled={evaluando}
          >
            {evaluando ? "Evaluando..." : "Evaluar ahora"}
          </Button>
          <Button
            type="submit"
            className="bg-[#39ACB8] hover:bg-[#2c8892]"
            disabled={guardando}
          >
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
