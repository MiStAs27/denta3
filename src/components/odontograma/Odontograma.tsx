"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import {
  Stethoscope,
  XSquare,
  CheckCircle2,
  AlertCircle,
  Undo2,
  Save,
  Crown,
  Zap,
  Anchor,
  PenLine,
} from "lucide-react";

const DIENTES_SUPERIORES = [
  18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
];
const DIENTES_INFERIORES = [
  48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38,
];
type EstadoDiente =
  | "sano"
  | "caries"
  | "resina"
  | "extraido"
  | "corona"
  | "endodoncia"
  | "implante"
  | "otros";
  // Ponlo junto a EstadoDiente, FUERA de cualquier función o componente:
type SuperficieDiente = "vestibular" | "lingual" | "mesial" | "distal" | "oclusal";

interface OdontogramaProps {
  patientId: string; // <-- recibe el ID del paciente
}

// Colores por estado
const ESTADO_STYLES: Record<
  EstadoDiente,
  { bg: string; border: string; text: string }
> = {
  sano: { bg: "bg-white", border: "border-slate-300", text: "text-slate-600" },
  caries: { bg: "bg-red-100", border: "border-red-500", text: "text-red-700" },
  resina: {
    bg: "bg-blue-100",
    border: "border-blue-500",
    text: "text-blue-700",
  },
  extraido: {
    bg: "bg-slate-200",
    border: "border-slate-500",
    text: "text-slate-400",
  },
  corona: {
    bg: "bg-yellow-100",
    border: "border-yellow-500",
    text: "text-yellow-700",
  },
  endodoncia: {
    bg: "bg-purple-100",
    border: "border-purple-500",
    text: "text-purple-700",
  },
  implante: {
    bg: "bg-emerald-100",
    border: "border-emerald-500",
    text: "text-emerald-700",
  },
  otros: {
    bg: "bg-orange-100",
    border: "border-orange-500",
    text: "text-orange-700",
  },
};

// Diente con 5 superficies (cruz)
const Diente = ({
  numero,
  estados,
  onClick,
}: {
  numero: number;
  estados: Record<string, EstadoDiente>;
  onClick: (numero: number, superficie: SuperficieDiente) => void;
}) => {
  const getColor = (superficie: SuperficieDiente) => {
    const estado = estados[`${numero}-${superficie}`] ?? "sano";
    return {
      fill: estado !== "sano" ? getSvgColor(estado) : "#f8fafc",
      stroke: getSvgStroke(estado),
    };
  };

  const isExtraido = Object.values(
    ["vestibular", "lingual", "mesial", "distal", "oclusal"].reduce(
      (acc, s) => {
        acc[s] = estados[`${numero}-${s}`] ?? "sano";
        return acc;
      },
      {} as Record<string, string>,
    ),
  ).some((e) => e === "extraido");

  return (
    <div className="flex flex-col items-center gap-0.5 group">
      <span className="text-[10px] font-bold text-slate-500">{numero}</span>
      <div className="relative w-10 h-10">
        {isExtraido ? (
          <div className="w-full h-full rounded border-2 border-slate-400 bg-slate-200 flex items-center justify-center">
            <span className="text-slate-400 text-lg font-bold">✕</span>
          </div>
        ) : (
          <svg viewBox="0 0 40 40" className="w-full h-full">
            {/* Vestibular - arriba */}
            <polygon
              points="0,0 40,0 28,12 12,12"
              style={{
                fill: getColor("vestibular").fill,
                stroke: getColor("vestibular").stroke,
                strokeWidth: 1,
              }}
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => onClick(numero, "vestibular")}
            />
            {/* Lingual - abajo */}
            <polygon
              points="12,28 28,28 40,40 0,40"
              style={{
                fill: getColor("lingual").fill,
                stroke: getColor("lingual").stroke,
                strokeWidth: 1,
              }}
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => onClick(numero, "lingual")}
            />
            {/* Mesial - izquierda */}
            <polygon
              points="0,0 12,12 12,28 0,40"
              style={{
                fill: getColor("mesial").fill,
                stroke: getColor("mesial").stroke,
                strokeWidth: 1,
              }}
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => onClick(numero, "mesial")}
            />
            {/* Distal - derecha */}
            <polygon
              points="40,0 28,12 28,28 40,40"
              style={{
                fill: getColor("distal").fill,
                stroke: getColor("distal").stroke,
                strokeWidth: 1,
              }}
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => onClick(numero, "distal")}
            />
            {/* Oclusal - centro */}
            <rect
              x="12"
              y="12"
              width="16"
              height="16"
              style={{
                fill: getColor("oclusal").fill,
                stroke: getColor("oclusal").stroke,
                strokeWidth: 1.5,
              }}
              className="cursor-pointer hover:opacity-70 transition-opacity"
              onClick={() => onClick(numero, "oclusal")}
            />
          </svg>
        )}
      </div>
    </div>
  );
};

// Helpers de color SVG
function getSvgColor(estado: EstadoDiente): string {
  const map: Partial<Record<EstadoDiente, string>> = {
    caries: "#fecaca",
    resina: "#bfdbfe",
    corona: "#fef08a",
    endodoncia: "#e9d5ff",
    implante: "#a7f3d0",
  };
  return map[estado] ?? "#f8fafc";
}
function getSvgStroke(estado: EstadoDiente): string {
  const map: Partial<Record<EstadoDiente, string>> = {
    caries: "#ef4444",
    resina: "#3b82f6",
    corona: "#eab308",
    endodoncia: "#a855f7",
    implante: "#10b981",
    sano: "#cbd5e1",
  };
  return map[estado] ?? "#cbd5e1";
}

// Herramientas disponibles
const HERRAMIENTAS: {
  id: EstadoDiente;
  label: string;
  color: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "caries",
    label: "Caries",
    color: "bg-red-500 hover:bg-red-600",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  {
    id: "resina",
    label: "Resina",
    color: "bg-blue-500 hover:bg-blue-600",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  {
    id: "extraido",
    label: "Extracción",
    color: "bg-slate-600 hover:bg-slate-700",
    icon: <XSquare className="w-4 h-4" />,
  },
  {
    id: "corona",
    label: "Corona",
    color: "bg-yellow-500 hover:bg-yellow-600",
    icon: <Crown className="w-4 h-4" />,
  },
  {
    id: "endodoncia",
    label: "Endodoncia",
    color: "bg-purple-500 hover:bg-purple-600",
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: "implante",
    label: "Implante",
    color: "bg-emerald-500 hover:bg-emerald-600",
    icon: <Anchor className="w-4 h-4" />,
  },
  {
    id: "sano",
    label: "Borrar",
    color: "bg-slate-400 hover:bg-slate-500",
    icon: <Undo2 className="w-4 h-4" />,
  },
  // Agrega esta entrada en HERRAMIENTAS:
  {
    id: "otros",
    label: "Otros",
    color: "bg-orange-500 hover:bg-orange-600",
    icon: <PenLine className="w-4 h-4" />,
  },
];

export function Odontograma({ patientId }: OdontogramaProps) {
  
  const [estados, setEstados] = useState<Record<string, EstadoDiente>>({});
  const [herramienta, setHerramienta] = useState<EstadoDiente>("caries");
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const { toast } = useToast();
  const [etiquetasPersonalizadas, setEtiquetasPersonalizadas] = useState<Record<string, string>>({});
  const [dienteEditando, setDienteEditando] = useState<number | null>(null);
  const [textoTemp, setTextoTemp] = useState("");
  // Junto a los otros useState nuevos:
  const [superficieEditando, setSuperficieEditando] =
    useState<SuperficieDiente | null>(null);

  // Cargar desde Firebase al montar
  useEffect(() => {
    if (!patientId) return;
    const cargar = async () => {
      try {
        const ref = doc(db, "pacientes", patientId, "odontograma", "estado");
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setEstados(snap.data().dientes ?? {});
          setEtiquetasPersonalizadas(snap.data().etiquetas ?? {}); // 👈 agrega esto
        }
      } catch (e) {
        console.error(e);
      } finally {
        setCargando(false);
      }
    };
    cargar();
  }, [patientId]);

  const manejarClicDiente = (numero: number, superficie: SuperficieDiente) => {
    if (herramienta === "otros") {
      const key = `${numero}-${superficie}`;
      setDienteEditando(numero);
      setSuperficieEditando(superficie);
      setTextoTemp(etiquetasPersonalizadas[key] ?? "");
      setEstados((prev) => ({ ...prev, [`${numero}-${superficie}`]: "otros" }));
    } else {
      setEstados((prev) => ({
        ...prev,
        [`${numero}-${superficie}`]: herramienta,
      }));
    }
  };
  const confirmarTextoOtros = () => {
    const key = `${dienteEditando}-${superficieEditando}`;
    if (!textoTemp.trim() || dienteEditando === null) {
      setEstados((prev) => ({ ...prev, [key]: "sano" }));
    } else {
      setEtiquetasPersonalizadas((prev) => ({
        ...prev,
        [key]: textoTemp.trim(),
      }));
    }
    setDienteEditando(null);
    setSuperficieEditando(null);
    setTextoTemp("");
  };

  const guardarEnFirebase = async () => {
    if (!patientId) return;
    setGuardando(true);
    try {
      const ref = doc(db, "pacientes", patientId, "odontograma", "estado");
      await setDoc(ref, {
        dientes: estados,
        etiquetas: etiquetasPersonalizadas,
        actualizadoEn: new Date().toISOString(),
      });
      toast({
        title: "Odontograma guardado",
        description: "Los cambios se guardaron correctamente.",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo guardar.",
        variant: "destructive",
      });
    } finally {
      setGuardando(false);
    }
  };

  const limpiarOdontograma = () => {
    if (window.confirm("¿Reiniciar todo el odontograma?")) setEstados({});
  };

  const hallazgos = Object.entries(estados).filter(([, e]) => e !== "sano");

  if (cargando)
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-slate-400">
        Cargando odontograma...
      </div>
    );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="text-[#39ACB8]" /> Odontograma Clínico
          </h2>
          <p className="text-sm text-slate-500">
            Selecciona herramienta y haz clic en la pieza dental.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={limpiarOdontograma}
            className="text-slate-500"
          >
            <Undo2 className="w-4 h-4 mr-2" /> Reiniciar
          </Button>
          <Button
            size="sm"
            onClick={guardarEnFirebase}
            disabled={guardando}
            className="bg-[#2651A3] hover:bg-[#1e4082]"
          >
            <Save className="w-4 h-4 mr-2" />
            {guardando ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>

      {/* HERRAMIENTAS */}
      <div className="flex flex-wrap gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
        <span className="text-xs font-bold text-slate-500 uppercase w-full mb-1">
          Herramienta activa:
        </span>
        {HERRAMIENTAS.map((h) => (
          <button
            key={h.id}
            onClick={() => setHerramienta(h.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all
              ${herramienta === h.id ? `${h.color} ring-2 ring-offset-1 ring-slate-400 scale-105` : "bg-slate-300 hover:bg-slate-400"}`}
          >
            {h.icon} {h.label}
          </button>
        ))}
      </div>

      {/* DIENTES */}
      <div className="overflow-x-auto pb-2">
        <div className="min-w-[720px] flex flex-col items-center gap-6">
          {/* Superior */}
          <div className="w-full">
            <p className="text-center text-xs font-bold text-slate-400 mb-3 uppercase tracking-widest">
              Maxilar Superior
            </p>
            <div className="flex justify-center gap-1">
              <div className="flex gap-1 border-r-4 border-dashed border-slate-300 pr-3">
                {DIENTES_SUPERIORES.slice(0, 8).map((n) => (
                  <Diente
                    key={n}
                    numero={n}
                    estados={estados}
                    onClick={manejarClicDiente}
                  />
                ))}
              </div>
              <div className="flex gap-1 pl-3">
                {DIENTES_SUPERIORES.slice(8).map((n) => (
                  <Diente
                    key={n}
                    numero={n}
                    estados={estados}
                    onClick={manejarClicDiente}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Línea media */}
          <div className="w-full max-w-[660px] h-px bg-slate-200 relative">
            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 text-[10px] text-slate-400 bg-white px-2">
              LÍNEA MEDIA
            </span>
          </div>

          {/* Inferior */}
          <div className="w-full">
            <div className="flex justify-center gap-1">
              <div className="flex gap-1 border-r-4 border-dashed border-slate-300 pr-3">
                {DIENTES_INFERIORES.slice(0, 8).map((n) => (
                  <Diente
                    key={n}
                    numero={n}
                    estados={estados}
                    onClick={manejarClicDiente}
                  />
                ))}
              </div>
              <div className="flex gap-1 pl-3">
                {DIENTES_INFERIORES.slice(8).map((n) => (
                  <Diente
                    key={n}
                    numero={n}
                    estados={estados}
                    onClick={manejarClicDiente}
                  />
                ))}
              </div>
            </div>
            <p className="text-center text-xs font-bold text-slate-400 mt-3 uppercase tracking-widest">
              Mandíbula Inferior
            </p>
          </div>
        </div>
      </div>

      {/* LEYENDA */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
        {HERRAMIENTAS.filter((h) => h.id !== "sano").map((h) => {
          const s = ESTADO_STYLES[h.id];
          return (
            <span
              key={h.id}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${s.bg} ${s.border} ${s.text}`}
            >
              {h.icon} {h.label}
            </span>
          );
        })}
      </div>

      {/* RESUMEN */}
      <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase">
          Resumen Clínico ({hallazgos.length} hallazgo
          {hallazgos.length !== 1 ? "s" : ""})
        </h3>
        {hallazgos.length === 0 ? (
          <p className="text-sm text-slate-400 italic">
            Sin hallazgos registrados.
          </p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {hallazgos.map(([key, estado]) => {
              const [diente, superficie] = key.split("-");
              const s = ESTADO_STYLES[estado as EstadoDiente];
              return (
                <li
                  key={key}
                  className={`flex items-center gap-2 p-2 rounded-lg border ${s.bg} ${s.border}`}
                >
                  <span className={`font-bold ${s.text}`}>Pza. {diente}</span>
                  <span className={`text-xs ${s.text} capitalize`}>
                    {superficie}:
                  </span>
                  <span className={`capitalize ${s.text} text-xs`}>
                    {estado === "otros" && etiquetasPersonalizadas[key]
                      ? etiquetasPersonalizadas[key]
                      : estado}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
      {dienteEditando !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm border border-orange-200 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-slate-800 text-lg mb-1 flex items-center gap-2">
              <PenLine className="w-5 h-5 text-orange-500" />
              Tratamiento personalizado
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Pieza dental{" "}
              <span className="font-bold text-orange-600">
                {dienteEditando}
              </span>
            </p>
            <input
              autoFocus
              type="text"
              value={textoTemp}
              onChange={(e) => setTextoTemp(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && confirmarTextoOtros()}
              placeholder="Ej: Fractura, Sellante, Tratamiento periodontal..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 mb-4"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setEstados((prev) => ({ ...prev, [dienteEditando]: "sano" }));
                  setDienteEditando(null);
                  setTextoTemp("");
                }}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarTextoOtros}
                className="px-4 py-2 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 font-medium"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
