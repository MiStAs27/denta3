export const ESPECIALISTAS = [
  { id: "doc_1", nombre: "Dr. Carlos Ruiz", bg: "bg-blue-100", text: "text-blue-700" },
  { id: "doc_2", nombre: "Dra. Ana López", bg: "bg-purple-100", text: "text-purple-700" },
];

export const TIPOS_CITA_COLORS = [
  { tipo: "Consulta", bg: "bg-blue-500", text: "text-white" },
  { tipo: "Limpieza", bg: "bg-cyan-500", text: "text-white" },
  { tipo: "Extracción", bg: "bg-red-500", text: "text-white" },
  { tipo: "Curación", bg: "bg-emerald-500", text: "text-white" },
  { tipo: "Ortodoncia", bg: "bg-purple-500", text: "text-white" },
  { tipo: "General", bg: "bg-gray-500", text: "text-white" }
];

export const determinarColorPorEstado = (estado: string | undefined) => {
  if (!estado) return "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100";
  
  const e = estado.toLowerCase().trim();
  
  if (e.includes("confirm")) {
    return "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100";
  }
  if (e.includes("repro") || e.includes("prog")) {
    return "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100";
  }
  if (e.includes("cancel")) {
    return "bg-red-100 border-red-200 text-red-700 hover:bg-red-200 line-through opacity-90";
  }
  
  // Fallback para 'pendiente' u otros
  return "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100";
};

export const determinarColorPorMotivo = (motivo: string) => {
  const m = motivo.toLowerCase();
  if (m.includes("limpieza") || m.includes("profilaxis")) return TIPOS_CITA_COLORS[1];
  if (m.includes("extracci") || m.includes("cirugía") || m.includes("muela")) return TIPOS_CITA_COLORS[2];
  if (m.includes("curación") || m.includes("caries") || m.includes("empaste")) return TIPOS_CITA_COLORS[3];
  if (m.includes("ortodoncia") || m.includes("brackets") || m.includes("frenos")) return TIPOS_CITA_COLORS[4];
  if (m.includes("consulta") || m.includes("revisión")) return TIPOS_CITA_COLORS[0];
  return TIPOS_CITA_COLORS[5]; // General
};
