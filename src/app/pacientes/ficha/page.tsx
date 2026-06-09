"use client";
import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { jsPDF } from "jspdf"; // <-- IMPORTAMOS EL GENERADOR DE PDF

import { Odontograma } from "@/components/odontograma/Odontograma";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  UserCircle,
  Calendar,
  Save,
  Stethoscope,
  FileText,
  Pill,
  Image as ImageIcon,
  CircleDollarSign,
  Plus,
  X,
  Download,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function FichaPacientePage() {
  const [tabActiva, setTabActiva] = useState("recetas"); // Iniciamos en recetas para probar más rápido

  // Simulación de datos (En el futuro vendrán de la base de datos real)
  const pacienteIdDemo = "paciente_demo_001";
  const nombrePacienteDemo = "Juan Pérez Gómez";
  const nombreDoctorSimulado = "Dr. Carlos Ruiz";

  // --- ESTADOS: EVOLUCIÓN ---
  const [evoluciones, setEvoluciones] = useState<any[]>([]);
  const [mostrandoFormularioEvo, setMostrandoFormularioEvo] = useState(false);
  const [nuevoTratamiento, setNuevoTratamiento] = useState("");
  const [guardandoEvo, setGuardandoEvo] = useState(false);

  // --- ESTADOS: RECETAS ---
  const [recetas, setRecetas] = useState<any[]>([]);
  const [mostrandoFormularioReceta, setMostrandoFormularioReceta] =
    useState(false);
  const [medicamentos, setMedicamentos] = useState("");
  const [indicaciones, setIndicaciones] = useState("");
  const [guardandoReceta, setGuardandoReceta] = useState(false);

  // 1. Cargar datos en tiempo real (Evoluciones o Recetas según la pestaña)
  useEffect(() => {
    if (tabActiva === "evolucion") {
      const q = query(
        collection(db, "pacientes", pacienteIdDemo, "evoluciones"),
        orderBy("fecha", "desc"),
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setEvoluciones(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      });
      return () => unsubscribe();
    }

    if (tabActiva === "recetas") {
      const q = query(
        collection(db, "pacientes", pacienteIdDemo, "recetas"),
        orderBy("fecha", "desc"),
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setRecetas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }
  }, [tabActiva]);

  // 2. Guardar Evolución
  const guardarEvolucion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTratamiento.trim()) return;
    setGuardandoEvo(true);
    try {
      await addDoc(collection(db, "pacientes", pacienteIdDemo, "evoluciones"), {
        tratamiento: nuevoTratamiento.trim(),
        doctor: nombreDoctorSimulado,
        fecha: new Date().toISOString(),
      });
      setNuevoTratamiento("");
      setMostrandoFormularioEvo(false);
    } finally {
      setGuardandoEvo(false);
    }
  };

  // 3. LA MAGIA DEL PDF: Generar y Descargar la Receta Médica
  const generarPDF = (recetaDatos: any) => {
    const doc = new jsPDF();

    // Configurar tipografía
    doc.setFont("helvetica");

    // Cabecera (Logo/Nombre de la clínica)
    doc.setFontSize(22);
    doc.setTextColor(38, 81, 163); // Azul DentaSync
    doc.text("Clínica Odontológica DentaSync", 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Av. Principal 123, Ciudad - Tel: +591 12345678", 20, 28);
    doc.line(20, 32, 190, 32); // Línea divisoria

    // Datos del Paciente y Doctor
    doc.setFontSize(12);
    doc.setTextColor(0);
    const fechaFormat = new Date(recetaDatos.fecha).toLocaleDateString("es-ES");
    doc.text(`Fecha: ${fechaFormat}`, 150, 42);
    doc.text(`Paciente: ${nombrePacienteDemo}`, 20, 42);
    doc.text(`Atendido por: ${recetaDatos.doctor}`, 20, 49);

    // Título Central
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("RECETA MÉDICA", 105, 65, { align: "center" });

    // Sección de Medicamentos (Rx)
    doc.setFontSize(14);
    doc.setTextColor(57, 172, 184); // Turquesa
    doc.text("Rx. (Medicamentos):", 20, 80);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    // doc.splitTextToSize hace que el texto baje de línea si es muy largo
    const lineasMedicamentos = doc.splitTextToSize(
      recetaDatos.medicamentos,
      170,
    );
    doc.text(lineasMedicamentos, 20, 90);

    // Sección de Indicaciones
    // Calculamos dónde terminó el texto anterior para no encimar
    let alturaActual = 90 + lineasMedicamentos.length * 7 + 10;

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(57, 172, 184);
    doc.text("Indicaciones:", 20, alturaActual);

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    const lineasIndicaciones = doc.splitTextToSize(
      recetaDatos.indicaciones,
      170,
    );
    doc.text(lineasIndicaciones, 20, alturaActual + 10);

    // Pie de página (Firma)
    doc.line(70, 250, 140, 250); // Línea para la firma
    doc.setFontSize(10);
    doc.text(`Firma y Sello: ${recetaDatos.doctor}`, 105, 255, {
      align: "center",
    });

    // Descargar el archivo
    doc.save(
      `Receta_${nombrePacienteDemo.replace(/\s/g, "_")}_${fechaFormat}.pdf`,
    );
  };

  // 4. Guardar Receta en Firebase y generar el PDF simultáneamente
  const guardarReceta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicamentos.trim() || !indicaciones.trim()) return;

    setGuardandoReceta(true);
    try {
      const nuevaReceta = {
        medicamentos: medicamentos.trim(),
        indicaciones: indicaciones.trim(),
        doctor: nombreDoctorSimulado,
        fecha: new Date().toISOString(),
      };

      // Guardamos en la base de datos
      await addDoc(
        collection(db, "pacientes", pacienteIdDemo, "recetas"),
        nuevaReceta,
      );

      // Generamos el PDF inmediatamente para dárselo al paciente
      generarPDF(nuevaReceta);

      setMedicamentos("");
      setIndicaciones("");
      setMostrandoFormularioReceta(false);
    } finally {
      setGuardandoReceta(false);
    }
  };

  const formatearFecha = (isoString: string) => {
    return new Date(isoString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
      {/* CABECERA DEL PACIENTE */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#2651A3]">
            <UserCircle size={40} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {nombrePacienteDemo}
            </h1>
            <div className="flex gap-4 text-sm text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> 35 años
              </span>
              <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border">
                CI: 12345678
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MENÚ DE PESTAÑAS */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-px scrollbar-hide">
        <button
          onClick={() => setTabActiva("odontograma")}
          className={`px-4 py-3 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${tabActiva === "odontograma" ? "border-[#2651A3] text-[#2651A3]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Stethoscope className="w-4 h-4" /> Odontograma
        </button>
        <button
          onClick={() => setTabActiva("evolucion")}
          className={`px-4 py-3 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${tabActiva === "evolucion" ? "border-[#2651A3] text-[#2651A3]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <FileText className="w-4 h-4" /> Evolución y Consultas
        </button>
        <button
          onClick={() => setTabActiva("recetas")}
          className={`px-4 py-3 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${tabActiva === "recetas" ? "border-[#2651A3] text-[#2651A3]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Pill className="w-4 h-4" /> Recetas Médicas
        </button>
        <button
          onClick={() => setTabActiva("finanzas")}
          className={`px-4 py-3 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors ${tabActiva === "finanzas" ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <CircleDollarSign className="w-4 h-4" /> Presupuestos
        </button>
      </div>

      {/* CONTENIDO DE LAS PESTAÑAS */}
      <div className="mt-4">
        {tabActiva === "finanzas" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Presupuestos y Pagos
              </h2>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" /> Nuevo Movimiento
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-xs">
                  <tr>
                    <th className="px-4 py-3">Fecha</th>
                    <th className="px-4 py-3">Tratamiento</th>
                    <th className="px-4 py-3 text-right">Costo Total</th>
                    <th className="px-4 py-3 text-right">Abonado</th>
                    <th className="px-4 py-3 text-right">Saldo Pendiente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {/* Fila de ejemplo (Esto vendrá de Firebase) */}
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-4 font-mono text-slate-500">
                      2026-05-25
                    </td>
                    <td className="px-4 py-4 font-medium text-slate-800">
                      Ortodoncia - Fase 1
                    </td>
                    <td className="px-4 py-4 text-right font-bold">$ 500.00</td>
                    <td className="px-4 py-4 text-right text-emerald-600 font-bold">
                      $ 200.00
                    </td>
                    <td className="px-4 py-4 text-right text-red-600 font-bold">
                      $ 300.00
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tabActiva === "odontograma" && (
          <div className="animate-in fade-in">
            <Odontograma patientId={pacienteIdDemo} />
          </div>
        )}

        {/* PESTAÑA: EVOLUCIÓN (Oculta aquí por brevedad, asume que está tu código anterior o puedes usar este simplificado) */}
        {tabActiva === "evolucion" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Historial</h2>
              <Button
                className="bg-[#2651A3]"
                onClick={() =>
                  setMostrandoFormularioEvo(!mostrandoFormularioEvo)
                }
              >
                Registrar
              </Button>
            </div>
            {/* Formulario Evo simplificado */}
            {mostrandoFormularioEvo && (
              <form onSubmit={guardarEvolucion} className="mb-4 flex gap-2">
                <Textarea
                  value={nuevoTratamiento}
                  onChange={(e) => setNuevoTratamiento(e.target.value)}
                  placeholder="Nota médica..."
                  required
                />
                <Button type="submit">Guardar</Button>
              </form>
            )}
            <ScrollArea className="flex-1 bg-slate-50 p-4 rounded-lg">
              {evoluciones.map((evo) => (
                <div
                  key={evo.id}
                  className="bg-white p-4 mb-3 rounded border-l-4 border-[#39ACB8] shadow-sm"
                >
                  <p className="font-bold text-sm mb-1">
                    {formatearFecha(evo.fecha)}
                  </p>
                  <p>{evo.tratamiento}</p>
                </div>
              ))}
            </ScrollArea>
          </div>
        )}

        {/* --- NUEVA PESTAÑA FUNCIONAL: RECETAS --- */}
        {tabActiva === "recetas" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300 h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">
                Recetario Electrónico
              </h2>
              {!mostrandoFormularioReceta && (
                <Button
                  className="bg-[#2651A3] hover:bg-[#1e4082]"
                  onClick={() => setMostrandoFormularioReceta(true)}
                >
                  <Plus className="w-4 h-4 mr-2" /> Nueva Receta
                </Button>
              )}
            </div>

            {/* FORMULARIO DE RECETA */}
            {mostrandoFormularioReceta && (
              <form
                onSubmit={guardarReceta}
                className="bg-blue-50/50 p-5 rounded-lg border border-blue-100 mb-6 shrink-0 animate-in slide-in-from-top-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <Label className="text-[#2651A3] font-bold text-lg">
                    Emitir Receta
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setMostrandoFormularioReceta(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4 mb-4">
                  <div>
                    <Label className="font-bold text-slate-700">
                      Rx. Medicamentos
                    </Label>
                    <Textarea
                      placeholder="Ej. Amoxicilina 500mg - 1 caja&#10;Ibuprofeno 400mg - 10 tabletas"
                      className="min-h-[80px] bg-white mt-1"
                      value={medicamentos}
                      onChange={(e) => setMedicamentos(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label className="font-bold text-slate-700">
                      Indicaciones para el paciente
                    </Label>
                    <Textarea
                      placeholder="Ej. Tomar 1 cápsula de Amoxicilina cada 8 horas por 7 días.&#10;Tomar 1 tableta de Ibuprofeno cada 8 horas en caso de dolor."
                      className="min-h-[80px] bg-white mt-1"
                      value={indicaciones}
                      onChange={(e) => setIndicaciones(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMostrandoFormularioReceta(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#39ACB8] hover:bg-[#2c8892]"
                    disabled={guardandoReceta}
                  >
                    {guardandoReceta ? "Generando..." : "Guardar y Generar PDF"}
                  </Button>
                </div>
              </form>
            )}

            {/* HISTORIAL DE RECETAS */}
            <ScrollArea className="flex-1 bg-slate-50/50 border border-slate-100 rounded-lg p-4">
              <div className="space-y-4">
                {recetas.length === 0 ? (
                  <div className="text-center py-10 text-slate-400">
                    <Pill className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>No hay recetas emitidas para este paciente.</p>
                  </div>
                ) : (
                  recetas.map((receta) => (
                    <div
                      key={receta.id}
                      className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-l-[#2651A3] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all hover:shadow-md"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-800">
                            Receta Médica
                          </span>
                          <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">
                            {formatearFecha(receta.fecha)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-1">
                          <span className="font-bold text-slate-500">Rx:</span>{" "}
                          {receta.medicamentos}
                        </p>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-[#2651A3] border-[#2651A3] hover:bg-blue-50"
                        onClick={() => generarPDF(receta)}
                        title="Volver a descargar PDF"
                      >
                        <Download className="w-4 h-4 mr-2" /> PDF
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
