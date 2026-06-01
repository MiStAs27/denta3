"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  obtenerConfigComisiones,
  guardarConfigComision,
  obtenerReporteComisiones,
} from "@/lib/cobros-store";
import type { ConfigComisionDoctor } from "@/types/cobros";

export default function ConfigComisionesTab() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comisiones, setComisiones] = useState<ConfigComisionDoctor[]>([]);
  const [doctores, setDoctores] = useState<{ id: string; nombre: string }[]>(
    []
  );
  const [periodo, setPeriodo] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [reporte, setReporte] = useState<
    { doctorNombre: string; total: number }[]
  >([]);
  const [nuevoDoctorId, setNuevoDoctorId] = useState("");
  const [nuevoPorcentaje, setNuevoPorcentaje] = useState("10");

  const cargar = async () => {
    if (!user?.tenantId) return;
    const [configs, usuariosSnap] = await Promise.all([
      obtenerConfigComisiones(user.tenantId),
      getDocs(
        query(
          collection(db, "usuarios"),
          where("tenantId", "==", user.tenantId)
        )
      ),
    ]);
    setComisiones(configs);
    setDoctores(
      usuariosSnap.docs
        .map((d) => ({
          id: d.id,
          nombre: d.data().nombre,
          rol: d.data().rol,
        }))
        .filter((u) => u.rol === "ESPECIALISTA" || u.rol === "TENANT_ADMIN")
        .map((u) => ({ id: u.id, nombre: u.nombre }))
    );
  };

  useEffect(() => {
    cargar();
  }, [user?.tenantId]);

  const agregarComision = async () => {
    if (!user?.tenantId || !nuevoDoctorId) return;
    const doc = doctores.find((d) => d.id === nuevoDoctorId);
    if (!doc) return;

    const existente = comisiones.find((c) => c.doctorId === nuevoDoctorId);
    if (existente) {
      toast({
        title: "Ya configurado",
        description: "Este doctor ya tiene comisión asignada.",
        variant: "destructive",
      });
      return;
    }

    await guardarConfigComision({
      tenantId: user.tenantId,
      doctorId: nuevoDoctorId,
      doctorNombre: doc.nombre,
      porcentajeGlobal: parseFloat(nuevoPorcentaje) || 0,
      activo: true,
    });
    toast({ title: "Comisión agregada" });
    cargar();
  };

  const cargarReporte = async () => {
    if (!user?.tenantId) return;
    const registros = await obtenerReporteComisiones(user.tenantId, periodo);
    const porDoctor: Record<string, number> = {};
    registros.forEach((r) => {
      porDoctor[r.doctorNombre] =
        (porDoctor[r.doctorNombre] || 0) + r.comisionCalculada;
    });
    setReporte(
      Object.entries(porDoctor).map(([doctorNombre, total]) => ({
        doctorNombre,
        total,
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="max-w-xl bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <h2 className="text-xl font-bold text-gray-800">
          Comisiones por doctor
        </h2>
        <p className="text-xs text-gray-500">
          Porcentaje sobre pagos presenciales registrados con doctor asignado.
        </p>

        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <Label>Doctor</Label>
            <select
              value={nuevoDoctorId}
              onChange={(e) => setNuevoDoctorId(e.target.value)}
              className="mt-1 flex h-10 w-full rounded-md border px-3 text-sm"
            >
              <option value="">Seleccionar...</option>
              {doctores.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="w-24">
            <Label>%</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={nuevoPorcentaje}
              onChange={(e) => setNuevoPorcentaje(e.target.value)}
              className="mt-1"
            />
          </div>
          <Button onClick={agregarComision} className="bg-[#2651A3]">
            Agregar
          </Button>
        </div>

        <div className="space-y-2">
          {comisiones.length === 0 ? (
            <p className="text-sm text-gray-400">Sin comisiones configuradas.</p>
          ) : (
            comisiones.map((c) => (
              <div
                key={c.id}
                className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border"
              >
                <span className="font-medium">{c.doctorNombre}</span>
                <span className="text-[#2651A3] font-bold">
                  {c.porcentajeGlobal}%
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="max-w-xl bg-white p-6 rounded-xl shadow-sm border space-y-4">
        <h3 className="font-bold text-gray-800">Reporte de comisiones</h3>
        <div className="flex gap-2 items-end">
          <div>
            <Label>Periodo (YYYY-MM)</Label>
            <Input
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="mt-1 w-40"
            />
          </div>
          <Button variant="outline" onClick={cargarReporte}>
            Generar
          </Button>
        </div>
        {reporte.map((r) => (
          <div
            key={r.doctorNombre}
            className="flex justify-between p-2 border-b text-sm"
          >
            <span>{r.doctorNombre}</span>
            <span className="font-bold">Bs. {r.total.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
