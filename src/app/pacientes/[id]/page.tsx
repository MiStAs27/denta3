"use client";

import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import {
  UserCircle,
  Calendar,
  Printer,
  Stethoscope,
  FileText,
  Pill,
  CircleDollarSign,
  Phone,
  Mail,
  UserRound,
  Plus,
  X,
  Download,
} from "lucide-react";
import { Odontograma } from "@/components/odontograma/Odontograma";

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;
  const [patient, setPatient] = useState<any>(null);
  const { user } = useAuth();
  const [tabActiva, setTabActiva] = useState("perfil");
  const { toast } = useToast();

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

  // --- ESTADOS: FINANZAS ---
  const [presupuestos, setPresupuestos] = useState<any[]>([]);
  const [mostrandoFormularioFinanzas, setMostrandoFormularioFinanzas] =
    useState(false);
  const [finanzasForm, setFinanzasForm] = useState({
    tratamiento: "",
    costoTotal: "",
    abonado: "",
  });
  const [guardandoFinanzas, setGuardandoFinanzas] = useState(false);
  const [movimientoSeleccionado, setMovimientoSeleccionado] =
    useState<any>(null);
  const [montoAbonoExtra, setMontoAbonoExtra] = useState("");
  const [guardandoAbono, setGuardandoAbono] = useState(false);

  // 1. CARGAR DATOS DEL PACIENTE DESDE FIREBASE
  useEffect(() => {
    if (!patientId) return;

    const cargarPacienteReal = async () => {
      try {
        const docRef = doc(db, "pacientes", patientId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setPatient({ id: docSnap.id, ...docSnap.data() });
        } else {
          toast({
            title: "Error",
            description: "Paciente no encontrado.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error al cargar paciente:", error);
      }
    };

    cargarPacienteReal();
  }, [patientId, toast]);

  // 2. CARGAR EVOLUCIONES Y RECETAS (Tiempo real)
  useEffect(() => {
    if (!patientId) return;

    if (tabActiva === "evolucion") {
      const q = query(
        collection(db, "pacientes", patientId, "evoluciones"),
        orderBy("fecha", "desc"),
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setEvoluciones(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      });
      return () => unsubscribe();
    }

    // (Este es el que ya tienes para recetas)
    if (tabActiva === "recetas") {
      const q = query(
        collection(db, "pacientes", patientId, "recetas"),
        orderBy("fecha", "desc"),
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setRecetas(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      });
      return () => unsubscribe();
    }

    // AGREGA ESTE NUEVO BLOQUE PARA FINANZAS:
    if (tabActiva === "finanzas") {
      const q = query(
        collection(db, "pacientes", patientId, "presupuestos"),
        orderBy("fecha", "desc"),
      );
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setPresupuestos(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
        );
      });
      return () => unsubscribe();
    }
  }, [tabActiva, patientId]);

  // --- FUNCIONES DE EVOLUCIÓN Y RECETAS (Las tuyas) ---
  const guardarEvolucion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoTratamiento.trim() || !patientId) return;
    setGuardandoEvo(true);
    try {
      await addDoc(collection(db, "pacientes", patientId, "evoluciones"), {
        tratamiento: nuevoTratamiento.trim(),
        doctor: nombreDoctorSimulado,
        fecha: new Date().toISOString(),
      });
      setNuevoTratamiento("");
      setMostrandoFormularioEvo(false);
      toast({ title: "Guardado", description: "Evolución registrada." });
    } finally {
      setGuardandoEvo(false);
    }
  };

  const guardarPresupuesto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!finanzasForm.tratamiento || !patientId) return;

    setGuardandoFinanzas(true);
    try {
      const costo = parseFloat(finanzasForm.costoTotal) || 0;
      const abonoInicial = parseFloat(finanzasForm.abonado) || 0;

      // 1. PRIMERO: Creamos la nueva fila de deuda
      const docRef = await addDoc(
        collection(db, "pacientes", patientId, "presupuestos"),
        {
          tratamiento: finanzasForm.tratamiento,
          costoTotal: costo,
          abonado: abonoInicial,
          saldoPendiente: costo - abonoInicial, // Inicialmente lo que falta
          fecha: new Date().toISOString(),
        },
      );

      // 2. SEGUNDO: Si pagaste más de lo que cuesta (excedente),
      // o si tenías dinero de antes, el sistema lo distribuye automáticamente
      // usando nuestra función de "pago automático"
      if (abonoInicial > costo) {
        const excedente = abonoInicial - costo;
        // El excedente se reparte a otras deudas viejas
        await procesarPagoAutomatico(excedente);

        // Ajustamos la fila recién creada para que quede en CERO (pagada)
        await updateDoc(docRef, { abonado: costo, saldoPendiente: 0 });
      }

      setFinanzasForm({ tratamiento: "", costoTotal: "", abonado: "" });
      setMostrandoFormularioFinanzas(false);
      toast({
        title: "Tratamiento registrado",
        description: "El saldo se distribuyó automáticamente.",
      });
    } finally {
      setGuardandoFinanzas(false);
    }
  };

  const procesarPagoAutomatico = async (montoIngresado: number) => {
    if (!patientId || montoIngresado <= 0) return;

    setGuardandoAbono(true);
    let restante = montoIngresado;

    // 1. Obtener deudas ordenadas de la más antigua (fecha) a la más nueva
    const deudas = [...presupuestos]
      .filter((p) => p.saldoPendiente > 0)
      .sort(
        (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime(),
      );

    // 2. Distribuir el pago en cascada
    for (const deuda of deudas) {
      if (restante <= 0) break;

      const pagoParaEstaFila = Math.min(restante, deuda.saldoPendiente);

      // Actualizar en Firebase
      const docRef = doc(db, "pacientes", patientId, "presupuestos", deuda.id);
      await updateDoc(docRef, {
        abonado: deuda.abonado + pagoParaEstaFila,
        saldoPendiente: deuda.saldoPendiente - pagoParaEstaFila,
      });

      restante -= pagoParaEstaFila;
    }

    // 3. (Opcional) Si sobra dinero, podrías guardarlo como "A favor" o simplemente avisar
    if (restante > 0) {
      toast({
        title: "Pago procesado",
        description: `Se cubrieron todas las deudas. Sobraron Bs. ${restante.toFixed(2)} de saldo a favor.`,
      });
    } else {
      toast({
        title: "Pago procesado",
        description: "Deudas actualizadas automáticamente.",
      });
    }

    setMontoAbonoExtra("");
    setGuardandoAbono(false);
  };

  const registrarAbonoExtra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movimientoSeleccionado || !montoAbonoExtra || !patientId) return;

    setGuardandoAbono(true);
    try {
      const montoExtra = parseFloat(montoAbonoExtra) || 0;
      // Sumamos lo que acaba de pagar a lo que ya había abonado antes
      const nuevoAbonado = movimientoSeleccionado.abonado + montoExtra;
      // Recalculamos el saldo restante
      const nuevoSaldo = movimientoSeleccionado.costoTotal - nuevoAbonado;

      const docRef = doc(
        db,
        "pacientes",
        patientId,
        "presupuestos",
        movimientoSeleccionado.id,
      );
      // Dentro de registrarAbonoExtra:
      await updateDoc(docRef, {
        abonado: nuevoAbonado,
        saldoPendiente: nuevoSaldo,
      });

      // NUEVO: Sincronizamos con el perfil principal
      const deudaTotal = presupuestos.reduce(
        (acc, mov) => acc + (mov.saldoPendiente || 0),
        0,
      );
      await actualizarSaldoGlobalEnPerfil(deudaTotal - nuevoSaldo + nuevoSaldo); // O simplemente pasa el valor calculado

      setMovimientoSeleccionado(null);
      setMontoAbonoExtra("");
      toast({
        title: "Pago actualizado",
        description: "El saldo del tratamiento ha sido reducido.",
      });
    } finally {
      setGuardandoAbono(false);
    }
  };

  const actualizarSaldoGlobalEnPerfil = async (nuevoSaldoTotal: number) => {
    if (!patientId) return;
    const docRef = doc(db, "pacientes", patientId);
    await updateDoc(docRef, {
      saldoPendiente: nuevoSaldoTotal,
      status: nuevoSaldoTotal > 0 ? "Pendiente" : "Activo", // Actualiza el semáforo
    });
  };

  const generarPDF = (recetaDatos: any) => {
    const doc = new jsPDF();
    doc.setFont("helvetica");
    doc.setFontSize(22);
    doc.setTextColor(38, 81, 163);
    doc.text("Clínica Odontológica DentaSync", 20, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Av. Principal 123, Ciudad - Tel: +591 12345678", 20, 28);
    doc.line(20, 32, 190, 32);

    doc.setFontSize(12);
    doc.setTextColor(0);
    const fechaFormat = new Date(recetaDatos.fecha).toLocaleDateString("es-ES");
    doc.text(`Fecha: ${fechaFormat}`, 150, 42);
    doc.text(`Paciente: ${patient?.nombre || "Paciente"}`, 20, 42);
    doc.text(`Atendido por: ${recetaDatos.doctor}`, 20, 49);

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("RECETA MÉDICA", 105, 65, { align: "center" });

    doc.setFontSize(14);
    doc.setTextColor(57, 172, 184);
    doc.text("Rx. (Medicamentos):", 20, 80);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    const lineasMedicamentos = doc.splitTextToSize(
      recetaDatos.medicamentos,
      170,
    );
    doc.text(lineasMedicamentos, 20, 90);

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

    doc.line(70, 250, 140, 250);
    doc.setFontSize(10);
    doc.text(`Firma y Sello: ${recetaDatos.doctor}`, 105, 255, {
      align: "center",
    });
    doc.save(
      `Receta_${patient?.nombre?.replace(/\s/g, "_") || "Paciente"}_${fechaFormat}.pdf`,
    );
  };

  const guardarReceta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicamentos.trim() || !indicaciones.trim() || !patientId) return;

    setGuardandoReceta(true);
    try {
      const nuevaReceta = {
        medicamentos: medicamentos.trim(),
        indicaciones: indicaciones.trim(),
        doctor: nombreDoctorSimulado,
        fecha: new Date().toISOString(),
      };
      await addDoc(
        collection(db, "pacientes", patientId, "recetas"),
        nuevaReceta,
      );
      generarPDF(nuevaReceta);
      setMedicamentos("");
      setIndicaciones("");
      setMostrandoFormularioReceta(false);
      toast({
        title: "Receta creada",
        description: "PDF generado correctamente.",
      });
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

  const handleExportPdfFicha = () => {
    if (!patient) return;
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("DentaSync - Ficha de paciente", 14, 20);
      doc.setFontSize(11);
      doc.text(`Nombre: ${patient.nombre}`, 14, 40);
      doc.text(`DNI: ${patient.dni}`, 14, 48);
      doc.text(`Teléfono: ${patient.telefono}`, 14, 56);
      doc.save(`ficha-${patient.id}.pdf`);
      toast({
        title: "Ficha exportada",
        description: "El PDF se descargó correctamente.",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo exportar.",
        variant: "destructive",
      });
    }
  };

  if (!patient)
    return (
      <div className="p-8 text-center text-slate-500">
        Cargando expediente...
      </div>
    );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* 1. CABECERA CON DATOS REALES */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-[#2651A3] text-2xl font-bold uppercase">
            {/* Muestra la primera letra del nombre */}
            {patient.nombre ? (
              patient.nombre.charAt(0)
            ) : (
              <UserCircle size={40} />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {patient.nombre}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 mt-1 items-center">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" /> {patient.edad || "N/R"} años
              </span>
              <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded border">
                CI: {patient.ci || "No registrado"}
              </span>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleExportPdfFicha}
          className="text-slate-600 border-slate-300 shrink-0"
        >
          <Printer className="w-4 h-4 mr-2" /> Exportar Ficha PDF
        </Button>
      </div>

      {/* 2. MENÚ DE PESTAÑAS */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-px scrollbar-hide">
        <button
          onClick={() => setTabActiva("perfil")}
          className={`px-4 py-3 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${tabActiva === "perfil" ? "border-[#2651A3] text-[#2651A3]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <UserRound className="w-4 h-4" /> Perfil del Paciente
        </button>
        <button
          onClick={() => setTabActiva("odontograma")}
          className={`px-4 py-3 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${tabActiva === "odontograma" ? "border-[#2651A3] text-[#2651A3]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Stethoscope className="w-4 h-4" /> Odontograma
        </button>
        <button
          onClick={() => setTabActiva("evolucion")}
          className={`px-4 py-3 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${tabActiva === "evolucion" ? "border-[#2651A3] text-[#2651A3]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <FileText className="w-4 h-4" /> Evolución y Consultas
        </button>
        <button
          onClick={() => setTabActiva("recetas")}
          className={`px-4 py-3 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${tabActiva === "recetas" ? "border-[#2651A3] text-[#2651A3]" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <Pill className="w-4 h-4" /> Recetas Médicas
        </button>
        <button
          onClick={() => setTabActiva("finanzas")}
          className={`px-4 py-3 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${tabActiva === "finanzas" ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
        >
          <CircleDollarSign className="w-4 h-4" /> Saldos y Presupuestos
        </button>
      </div>

      {/* 3. CONTENIDO DE LAS PESTAÑAS */}
      <div className="mt-4">
        {/* --- PESTAÑA: PERFIL --- */}
        {tabActiva === "perfil" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {/* Columna Izquierda: Tarjeta de Contacto (como en la foto) */}
            <div className="col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-[#2651A3] text-4xl font-bold uppercase mb-4 border-2 border-blue-100">
                {patient.nombre ? patient.nombre.charAt(0) : "?"}
              </div>
              <h2 className="text-lg font-bold text-slate-800">
                {patient.nombre}
              </h2>
              <p className="text-sm text-slate-500 font-mono mb-4">
                ID: {patient.id}
              </p>

              <div className="w-full space-y-3 mt-4 pt-4 border-t border-slate-100 text-left">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Phone className="text-[#39ACB8] w-5 h-5" />
                  <span>{patient.celular || "No registrado"}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail className="text-[#39ACB8] w-5 h-5" />
                  <span className="truncate">
                    {patient.correo || "No registrado"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar className="text-[#39ACB8] w-5 h-5" />
                  <span>Nacimiento: {patient.fechaNacimiento || "N/R"}</span>
                </div>
              </div>

              <div className="w-full mt-6 bg-slate-50 p-4 rounded-lg border border-slate-100 text-left">
                <p className="text-xs font-bold text-slate-500 uppercase mb-1">
                  Contacto de Emergencia
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  {patient.contactoEmergencia?.nombre || "No registrado"}
                  {patient.contactoEmergencia?.parentesco
                    ? ` (${patient.contactoEmergencia.parentesco})`
                    : ""}
                </p>
                <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                  <Phone className="w-3 h-3" />{" "}
                  {patient.contactoEmergencia?.celular || "S/N"}
                </p>
              </div>
            </div>

            {/* Columna Derecha: Datos Generales y Médicos (como en la foto) */}
            <div className="col-span-1 md:col-span-2 space-y-6">
              {/* Tarjeta de Datos Generales */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <UserRound className="w-5 h-5 text-[#2651A3]" /> Datos
                  Generales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">
                      Sexo
                    </p>
                    <p className="text-sm text-slate-800 font-medium capitalize">
                      {patient.genero || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">
                      Edad
                    </p>
                    <p className="text-sm text-slate-800 font-medium">
                      {patient.edad ? `${patient.edad} años` : "No registrada"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">
                      Profesión / Lugar de Trabajo
                    </p>
                    <p className="text-sm text-slate-800 font-medium">
                      {patient.lugarTrabajo || "No registrado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold">
                      Cédula de Identidad (CI)
                    </p>
                    <p className="text-sm text-slate-800 font-medium">
                      {patient.ci || "No registrado"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-slate-500 uppercase font-semibold">
                      Dirección
                    </p>
                    <p className="text-sm text-slate-800 font-medium">
                      {patient.domicilio || "No registrada"}
                    </p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs text-slate-500 uppercase font-semibold">
                      Fecha de Registro
                    </p>
                    <p className="text-sm text-slate-800 font-medium">
                      {patient.fechaCreacion || "No registrada"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Tarjeta de Alertas Médicas */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
                <h3 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5" /> Alertas Médicas /
                  Antecedentes
                </h3>

                {patient.antecedentes ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <p className="text-xs text-red-600 uppercase font-bold mb-1">
                        Alergias
                      </p>
                      <p className="text-sm text-red-800 font-medium">
                        {patient.antecedentes.alergias || "Ninguna"}
                      </p>
                    </div>
                    <div className="bg-red-50 p-3 rounded-lg border border-red-100">
                      <p className="text-xs text-red-600 uppercase font-bold mb-1">
                        Embarazo
                      </p>
                      <p className="text-sm text-red-800 font-medium">
                        {patient.antecedentes.embarazo ? "Sí" : "No"}
                      </p>
                    </div>
                    <div className="sm:col-span-2 bg-red-50 p-3 rounded-lg border border-red-100">
                      <p className="text-xs text-red-600 uppercase font-bold mb-1">
                        Observaciones
                      </p>
                      <p className="text-sm text-red-800 font-medium">
                        {patient.antecedentes.observaciones ||
                          "Sin observaciones adicionales."}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    No hay antecedentes médicos registrados.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- PESTAÑA: ODONTOGRAMA --- */}
        {tabActiva === "odontograma" && (
          <div className="animate-in fade-in duration-300">
            <Odontograma patientId={patientId} /> {/* 👈 agrega esto */}
          </div>
        )}
        {/* --- PESTAÑA: EVOLUCIÓN --- */}
        {tabActiva === "evolucion" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-[600px] flex flex-col animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">
                Historial de Consultas
              </h2>
              {!mostrandoFormularioEvo && user?.rol !== "SECRETARIA" && (
                <Button
                  className="bg-[#2651A3]"
                  onClick={() => setMostrandoFormularioEvo(true)}
                >
                  <Plus className="w-4 h-4 mr-2" /> Registrar
                </Button>
              )}
            </div>

            {mostrandoFormularioEvo && (
              <form
                onSubmit={guardarEvolucion}
                className="mb-4 bg-slate-50 p-4 rounded-lg border border-slate-100"
              >
                <div className="flex justify-between items-center mb-2">
                  <Label className="font-bold text-[#2651A3]">
                    Nueva Nota de Evolución
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setMostrandoFormularioEvo(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <Textarea
                  value={nuevoTratamiento}
                  onChange={(e) => setNuevoTratamiento(e.target.value)}
                  placeholder="Escribe el tratamiento realizado..."
                  required
                  className="mb-3"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={guardandoEvo}>
                    {guardandoEvo ? "Guardando..." : "Guardar Registro"}
                  </Button>
                </div>
              </form>
            )}

            <ScrollArea className="flex-1 bg-slate-50/50 p-4 rounded-lg border border-slate-100">
              {evoluciones.length === 0 ? (
                <p className="text-center text-slate-400 py-10">
                  No hay registros de evolución.
                </p>
              ) : (
                evoluciones.map((evo) => (
                  <div
                    key={evo.id}
                    className="bg-white p-4 mb-3 rounded-lg border-l-4 border-[#39ACB8] shadow-sm"
                  >
                    <p className="font-bold text-sm text-slate-500 mb-1">
                      {formatearFecha(evo.fecha)} - {evo.doctor}
                    </p>
                    <p className="text-slate-700 whitespace-pre-wrap">
                      {evo.tratamiento}
                    </p>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        )}

        {/* --- PESTAÑA: RECETAS --- */}
        {tabActiva === "recetas" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300 h-[600px] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">
                Recetario Electrónico
              </h2>
              {!mostrandoFormularioReceta && user?.rol !== "SECRETARIA" && (
                <Button
                  className="bg-[#2651A3] hover:bg-[#1e4082]"
                  onClick={() => setMostrandoFormularioReceta(true)}
                >
                  <Plus className="w-4 h-4 mr-2" /> Nueva Receta
                </Button>
              )}
            </div>

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
                      value={medicamentos}
                      onChange={(e) => setMedicamentos(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="font-bold text-slate-700">
                      Indicaciones para el paciente
                    </Label>
                    <Textarea
                      value={indicaciones}
                      onChange={(e) => setIndicaciones(e.target.value)}
                      required
                      className="mt-1"
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
                    className="bg-[#39ACB8]"
                    disabled={guardandoReceta}
                  >
                    Guardar y Generar PDF
                  </Button>
                </div>
              </form>
            )}

            <ScrollArea className="flex-1 bg-slate-50/50 border border-slate-100 rounded-lg p-4">
              {recetas.length === 0 ? (
                <p className="text-center text-slate-400 py-10">
                  No hay recetas emitidas.
                </p>
              ) : (
                recetas.map((receta) => (
                  <div
                    key={receta.id}
                    className="bg-white p-4 mb-3 rounded-lg shadow-sm border-l-4 border-l-[#2651A3] flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                  >
                    <div>
                      <span className="text-xs text-slate-500 font-mono bg-slate-100 px-2 py-1 rounded">
                        {formatearFecha(receta.fecha)}
                      </span>
                      <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                        <span className="font-bold text-slate-500">Rx:</span>{" "}
                        {receta.medicamentos}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generarPDF(receta)}
                    >
                      <Download className="w-4 h-4 mr-2" /> PDF
                    </Button>
                  </div>
                ))
              )}
            </ScrollArea>
          </div>
        )}

        {/* --- PESTAÑA: FINANZAS --- */}
        {tabActiva === "finanzas" && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in fade-in duration-300 flex flex-col h-[600px]">
            {/* CABECERA FINANCIERA (CON SALDO GLOBAL) */}
            <div className="flex justify-between items-center mb-6 shrink-0 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Estado de Cuenta
                </h2>
                <div className="mt-1 text-sm">
                  Deuda Total del Paciente:{" "}
                  <span
                    className={`font-bold text-lg ml-2 ${presupuestos.reduce((acc, mov) => acc + (mov.saldoPendiente || 0), 0) > 0 ? "text-red-600" : "text-emerald-600"}`}
                  >
                    Bs.{" "}
                    {presupuestos
                      .reduce((acc, mov) => acc + (mov.saldoPendiente || 0), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
              {!mostrandoFormularioFinanzas && !movimientoSeleccionado && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => setMostrandoFormularioFinanzas(true)}
                >
                  <Plus className="w-4 h-4 mr-2" /> Nuevo Tratamiento
                </Button>
              )}
            </div>

            {/* 1. FORMULARIO: NUEVO TRATAMIENTO */}
            {mostrandoFormularioFinanzas && (
              <form
                onSubmit={guardarPresupuesto}
                className="bg-emerald-50/50 p-5 rounded-lg border border-emerald-100 mb-6 shrink-0 animate-in slide-in-from-top-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-emerald-700 font-bold text-lg">
                    Registrar Nuevo Tratamiento
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setMostrandoFormularioFinanzas(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="md:col-span-3">
                    <Label className="font-bold text-slate-700">
                      Tratamiento o Concepto
                    </Label>
                    <Input
                      placeholder="Ej. Ortodoncia Fase 1"
                      className="mt-1 bg-white"
                      value={finanzasForm.tratamiento}
                      onChange={(e: any) =>
                        setFinanzasForm({
                          ...finanzasForm,
                          tratamiento: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label className="font-bold text-slate-700">
                      Costo Total (Bs.)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="mt-1 bg-white"
                      value={finanzasForm.costoTotal}
                      onChange={(e: any) =>
                        setFinanzasForm({
                          ...finanzasForm,
                          costoTotal: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div>
                    <Label className="font-bold text-slate-700">
                      Abono Inicial (Bs.)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      className="mt-1 bg-white"
                      value={finanzasForm.abonado}
                      onChange={(e: any) =>
                        setFinanzasForm({
                          ...finanzasForm,
                          abonado: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setMostrandoFormularioFinanzas(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    disabled={guardandoFinanzas}
                  >
                    {guardandoFinanzas ? "Guardando..." : "Guardar Registro"}
                  </Button>
                </div>
              </form>
            )}

            {/* 2. FORMULARIO: AGREGAR PAGO A DEUDA VIEJA */}
            {movimientoSeleccionado && (
              <form
                onSubmit={registrarAbonoExtra}
                className="bg-blue-50 p-5 rounded-lg border border-blue-200 mb-6 shrink-0 animate-in slide-in-from-top-4"
              >
                <div className="flex justify-between items-center mb-4">
                  <Label className="text-[#2651A3] font-bold text-lg">
                    Abonar a: {movimientoSeleccionado.tratamiento}
                  </Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setMovimientoSeleccionado(null)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex items-end gap-4 mb-4">
                  <div className="flex-1">
                    <Label className="font-bold text-slate-700">
                      Deuda actual:{" "}
                      <span className="text-red-600">
                        Bs. {movimientoSeleccionado.saldoPendiente.toFixed(2)}
                      </span>
                    </Label>
                    <Input
                      type="number"
                      min="0.01"
                      max={movimientoSeleccionado.saldoPendiente}
                      step="0.01"
                      placeholder="¿Cuánto paga hoy?"
                      className="mt-1 bg-white border-blue-200"
                      value={montoAbonoExtra}
                      onChange={(e: any) => setMontoAbonoExtra(e.target.value)}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-[#2651A3] hover:bg-[#1e4082]"
                    disabled={guardandoAbono}
                  >
                    {guardandoAbono ? "Procesando..." : "Registrar Pago"}
                  </Button>
                </div>
              </form>
            )}

            {/* TABLA DE HISTORIAL */}
            <ScrollArea className="flex-1 bg-slate-50/50 border border-slate-100 rounded-lg p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-600 uppercase font-bold text-xs sticky top-0">
                    <tr>
                      <th className="px-4 py-3">Fecha</th>
                      <th className="px-4 py-3">Tratamiento</th>
                      <th className="px-4 py-3 text-right">Costo Total</th>
                      <th className="px-4 py-3 text-right">Abonado</th>
                      <th className="px-4 py-3 text-right">Saldo / Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {presupuestos.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-4 py-10 text-center text-slate-400"
                        >
                          No hay registros financieros.
                        </td>
                      </tr>
                    ) : (
                      presupuestos.map((mov) => (
                        <tr
                          key={mov.id}
                          className="hover:bg-slate-50 transition-colors bg-white"
                        >
                          <td className="px-4 py-4 font-mono text-slate-500 whitespace-nowrap">
                            {formatearFecha(mov.fecha).split(",")[0]}
                          </td>
                          <td className="px-4 py-4 font-medium text-slate-800">
                            {mov.tratamiento}
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-slate-600">
                            Bs. {mov.costoTotal.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-right font-bold text-emerald-600">
                            Bs. {mov.abonado.toFixed(2)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            {mov.saldoPendiente > 0 ? (
                              <div className="flex flex-col items-end gap-2">
                                <span className="text-red-600 bg-red-50 px-2 py-1 rounded font-bold">
                                  Bs. {mov.saldoPendiente.toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-xs uppercase font-bold">
                                Pagado
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
}
