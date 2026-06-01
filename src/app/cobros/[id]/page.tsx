"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import EstadoCuentaPaciente from "@/components/cobros/EstadoCuentaPaciente";
import { tienePermiso } from "@/types/roles";

export default function CobrosPacientePage() {
  const params = useParams();
  const pacienteId = params.id as string;
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [paciente, setPaciente] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user?.rol || !tienePermiso(user.rol, "gestionar_cobros")) {
      router.push("/dashboard");
      return;
    }

    const cargar = async () => {
      const snap = await getDoc(doc(db, "pacientes", pacienteId));
      if (snap.exists()) {
        const data = snap.data();
        if (data.tenantId !== user?.tenantId) {
          router.push("/cobros");
          return;
        }
        setPaciente({ id: snap.id, ...data });
      } else {
        router.push("/cobros");
      }
    };
    cargar();
  }, [pacienteId, user?.tenantId, authLoading]);

  if (!paciente) {
    return (
      <div className="p-8 text-center text-slate-400">Cargando cuenta...</div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-4">
      <Button
        variant="ghost"
        onClick={() => router.push("/cobros")}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a Cobros
      </Button>

      <div>
        <h1 className="text-2xl font-bold text-[#2651A3]">
          Cuenta de {paciente.nombre}
        </h1>
        <p className="text-sm text-slate-500">CI: {paciente.ci}</p>
      </div>

      <EstadoCuentaPaciente
        pacienteId={pacienteId}
        pacienteNombre={paciente.nombre}
        esMoroso={paciente.esMoroso}
        onSaldoActualizado={(saldo) =>
          setPaciente((p: any) => ({ ...p, saldoPendiente: saldo }))
        }
      />
    </div>
  );
}
