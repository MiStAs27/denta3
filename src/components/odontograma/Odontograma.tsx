"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Stethoscope, 
  XSquare, 
  CheckCircle2, 
  AlertCircle,
  Undo2
} from "lucide-react";

// Nomenclatura FDI para adultos (32 dientes)
const DIENTES_SUPERIORES = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const DIENTES_INFERIORES = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

type EstadoDiente = "sano" | "caries" | "resina" | "extraido";

interface DienteProps {
  numero: number;
  estado: EstadoDiente;
  onClick: (numero: number) => void;
}

// Sub-componente visual para cada diente
const Diente = ({ numero, estado, onClick }: DienteProps) => {
  let colorClass = "bg-white border-slate-300 text-slate-700 hover:bg-slate-50";
  
  if (estado === "caries") colorClass = "bg-red-100 border-red-500 text-red-700 font-bold";
  if (estado === "resina") colorClass = "bg-blue-100 border-blue-500 text-blue-700 font-bold";
  if (estado === "extraido") colorClass = "bg-slate-200 border-slate-400 text-slate-400 line-through opacity-60";

  return (
    <div 
      onClick={() => onClick(numero)}
      className={`w-10 h-14 sm:w-12 sm:h-16 border-2 rounded-t-lg rounded-b-md flex items-center justify-center cursor-pointer transition-all shadow-sm ${colorClass}`}
      title={`Diente ${numero}`}
    >
      {numero}
    </div>
  );
};

export function Odontograma() {
  // Estado para guardar la condición de cada diente (Ej: { 14: 'caries', 21: 'resina' })
  const [estados, setEstados] = useState<Record<number, EstadoDiente>>({});
  
  // Herramienta seleccionada actualmente para "pintar"
  const [herramienta, setHerramienta] = useState<EstadoDiente>("caries");

  // Al hacer clic en un diente, le aplicamos la herramienta seleccionada
  const manejarClicDiente = (numero: number) => {
    setEstados((prev) => ({
      ...prev,
      [numero]: herramienta,
    }));
  };

  const limpiarOdontograma = () => {
    if (window.confirm("¿Seguro que deseas limpiar todo el odontograma?")) {
      setEstados({});
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Stethoscope className="text-[#39ACB8]" />
            Odontograma Inicial
          </h2>
          <p className="text-sm text-slate-500">Selecciona una herramienta y haz clic en la pieza dental.</p>
        </div>
        
        <Button variant="outline" size="sm" onClick={limpiarOdontograma} className="text-slate-500">
          <Undo2 className="w-4 h-4 mr-2" />
          Reiniciar
        </Button>
      </div>

      {/* BARRA DE HERRAMIENTAS */}
      <div className="flex flex-wrap gap-3 bg-slate-50 p-4 rounded-lg border border-slate-100">
        <span className="text-sm font-bold text-slate-700 w-full md:w-auto md:mr-4 flex items-center">
          Herramienta Activa:
        </span>
        
        <Button 
          variant={herramienta === "caries" ? "default" : "outline"}
          className={herramienta === "caries" ? "bg-red-500 hover:bg-red-600" : "text-red-500 border-red-200 hover:bg-red-50"}
          onClick={() => setHerramienta("caries")}
        >
          <AlertCircle className="w-4 h-4 mr-2" /> Caries
        </Button>

        <Button 
          variant={herramienta === "resina" ? "default" : "outline"}
          className={herramienta === "resina" ? "bg-blue-500 hover:bg-blue-600" : "text-blue-500 border-blue-200 hover:bg-blue-50"}
          onClick={() => setHerramienta("resina")}
        >
          <CheckCircle2 className="w-4 h-4 mr-2" /> Resina / Restauración
        </Button>

        <Button 
          variant={herramienta === "extraido" ? "default" : "outline"}
          className={herramienta === "extraido" ? "bg-slate-600 hover:bg-slate-700" : "text-slate-600 border-slate-300 hover:bg-slate-100"}
          onClick={() => setHerramienta("extraido")}
        >
          <XSquare className="w-4 h-4 mr-2" /> Extracción
        </Button>

        <Button 
          variant={herramienta === "sano" ? "default" : "outline"}
          className={herramienta === "sano" ? "bg-emerald-500 hover:bg-emerald-600" : "text-emerald-600 border-emerald-200 hover:bg-emerald-50"}
          onClick={() => setHerramienta("sano")}
        >
          Sano (Borrar)
        </Button>
      </div>

      {/* RENDERIZADO DE LOS DIENTES */}
      <div className="overflow-x-auto pb-4">
        <div className="min-w-[700px] flex flex-col items-center gap-8">
          
          {/* Fila Superior */}
          <div className="w-full">
            <div className="text-center text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">Maxilar Superior</div>
            <div className="flex justify-center gap-1 sm:gap-2">
              {/* Cuadrante 1 y 2 */}
              <div className="flex gap-1 border-r-4 border-slate-200 pr-2">
                {DIENTES_SUPERIORES.slice(0, 8).map(num => (
                  <Diente key={num} numero={num} estado={estados[num] || "sano"} onClick={manejarClicDiente} />
                ))}
              </div>
              <div className="flex gap-1 pl-2">
                {DIENTES_SUPERIORES.slice(8, 16).map(num => (
                  <Diente key={num} numero={num} estado={estados[num] || "sano"} onClick={manejarClicDiente} />
                ))}
              </div>
            </div>
          </div>

          {/* Fila Inferior */}
          <div className="w-full">
            <div className="flex justify-center gap-1 sm:gap-2">
              {/* Cuadrante 4 y 3 */}
              <div className="flex gap-1 border-r-4 border-slate-200 pr-2">
                {DIENTES_INFERIORES.slice(0, 8).map(num => (
                  <Diente key={num} numero={num} estado={estados[num] || "sano"} onClick={manejarClicDiente} />
                ))}
              </div>
              <div className="flex gap-1 pl-2">
                {DIENTES_INFERIORES.slice(8, 16).map(num => (
                  <Diente key={num} numero={num} estado={estados[num] || "sano"} onClick={manejarClicDiente} />
                ))}
              </div>
            </div>
            <div className="text-center text-xs font-bold text-slate-400 mt-2 uppercase tracking-widest">Mandíbula Inferior</div>
          </div>

        </div>
      </div>

      {/* RESUMEN DE HALLAZGOS */}
      <div className="bg-[#F5F8FA] p-4 rounded-lg border border-slate-200">
        <h3 className="font-bold text-slate-700 mb-2 text-sm uppercase">Resumen Clínico</h3>
        {Object.keys(estados).length === 0 || Object.values(estados).every(e => e === 'sano') ? (
          <p className="text-sm text-slate-500 italic">No hay hallazgos registrados aún.</p>
        ) : (
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            {Object.entries(estados).map(([diente, estado]) => {
              if (estado === "sano") return null;
              return (
                <li key={diente} className="flex items-center gap-2 bg-white p-2 rounded shadow-sm border border-slate-100">
                  <span className="font-bold text-[#2651A3]">Pza. {diente}:</span> 
                  <span className="capitalize text-slate-600">{estado}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

    </div>
  );
}