"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Wallet,
  AlertTriangle,
  Search,
  RefreshCw,
  User,
} from "lucide-react";
import {
  evaluarMorososTenant,
  obtenerConfigMorosos,
} from "@/lib/cobros-store";
import { tienePermiso } from "@/types/roles";

interface PacienteCobro {
  id: string;
  nombre: string;
  ci: string;
  saldoPendiente: number;
  esMoroso?: boolean;
}

export default function CobrosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [pacientes, setPacientes] = useState<PacienteCobro[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<"todos" | "deuda" | "morosos">("todos");
  const [cargando, setCargando] = useState(true);
  const [evaluando, setEvaluando] = useState(false);

  const cargarPacientes = async () => {
    if (!user?.tenantId) return;
    setCargando(true);
    try {
      const q = query(
        collection(db, "pacientes"),
        where("tenantId", "==", user.tenantId)
      );
      const snap = await getDocs(q);
      setPacientes(
        snap.docs.map((d) => ({
          id: d.id,
          nombre: d.data().nombre,
          ci: d.data().ci,
          saldoPendiente: d.data().saldoPendiente || 0,
          esMoroso: d.data().esMoroso,
        }))
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user?.rol || !tienePermiso(user.rol, "gestionar_cobros")) {
      router.push("/dashboard");
      return;
    }
    cargarPacientes();
  }, [user?.tenantId, authLoading]);

  const evaluarMorosos = async () => {
    if (!user?.tenantId) return;
    setEvaluando(true);
    try {
      const config = await obtenerConfigMorosos(user.tenantId);
      const marcados = await evaluarMorososTenant(user.tenantId, config);
      toast({
        title: "Evaluación completada",
        description: `${marcados} paciente(s) marcados como morosos.`,
      });
      cargarPacientes();
    } finally {
      setEvaluando(false);
    }
  };

  const filtrados = pacientes.filter((p) => {
    if (filtro === "deuda" && p.saldoPendiente <= 0) return false;
    if (filtro === "morosos" && !p.esMoroso) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return (
        p.nombre.toLowerCase().includes(q) || p.ci.includes(busqueda)
      );
    }
    return true;
  });

  const totalDeuda = pacientes.reduce((a, p) => a + p.saldoPendiente, 0);
  const totalMorosos = pacientes.filter((p) => p.esMoroso).length;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-[#2651A3] flex items-center gap-2">
            <Wallet className="w-8 h-8" />
            Cobros y Saldos
          </h1>
          <p className="text-gray-500 mt-1">
            Gestión de deudas, pagos presenciales y morosos del consultorio.
          </p>
        </div>
        {user?.rol === "TENANT_ADMIN" && (
          <Button
            variant="outline"
            onClick={evaluarMorosos}
            disabled={evaluando}
            className="gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${evaluando ? "animate-spin" : ""}`}
            />
            Evaluar morosos
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Deuda total
          </p>
          <p className="text-2xl font-bold text-red-600">
            Bs. {totalDeuda.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold">
            Pacientes con deuda
          </p>
          <p className="text-2xl font-bold text-amber-600">
            {pacientes.filter((p) => p.saldoPendiente > 0).length}
          </p>
        </div>
        <div className="bg-white p-5 rounded-xl border shadow-sm">
          <p className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Morosos
          </p>
          <p className="text-2xl font-bold text-red-700">{totalMorosos}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {(["todos", "deuda", "morosos"] as const).map((f) => (
          <Button
            key={f}
            variant={filtro === f ? "default" : "outline"}
            size="sm"
            onClick={() => setFiltro(f)}
            className={filtro === f ? "bg-[#2651A3]" : ""}
          >
            {f === "todos"
              ? "Todos"
              : f === "deuda"
                ? "Con deuda"
                : "Morosos"}
          </Button>
        ))}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Buscar por nombre o CI..."
            className="pl-9"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 text-slate-600 uppercase text-xs font-bold">
            <tr>
              <th className="px-4 py-3 text-left">Paciente</th>
              <th className="px-4 py-3 text-left">CI</th>
              <th className="px-4 py-3 text-right">Saldo</th>
              <th className="px-4 py-3 text-center">Estado</th>
              <th className="px-4 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {cargando ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400">
                  Cargando...
                </td>
              </tr>
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-slate-400">
                  Sin resultados.
                </td>
              </tr>
            ) : (
              filtrados.map((p) => (
                <tr
                  key={p.id}
                  className="hover:bg-slate-50 cursor-pointer"
                  onClick={() => router.push(`/cobros/${p.id}`)}
                >
                  <td className="px-4 py-3 font-medium">{p.nombre}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">
                    {p.ci}
                  </td>
                  <td
                    className={`px-4 py-3 text-right font-bold ${p.saldoPendiente > 0 ? "text-red-600" : "text-emerald-600"}`}
                  >
                    Bs. {p.saldoPendiente.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {p.esMoroso ? (
                      <Badge className="bg-red-600">Moroso</Badge>
                    ) : p.saldoPendiente > 0 ? (
                      <Badge className="bg-amber-100 text-amber-700">
                        Pendiente
                      </Badge>
                    ) : (
                      <Badge className="bg-emerald-100 text-emerald-700">
                        Al día
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/cobros/${p.id}`);
                      }}
                    >
                      <User className="w-4 h-4 mr-1" /> Ver cuenta
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
