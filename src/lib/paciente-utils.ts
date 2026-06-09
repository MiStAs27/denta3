import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

/** Verifica si ya existe un paciente con el mismo CI en el consultorio */
export async function verificarCiDuplicado(
  tenantId: string,
  ci: string,
  excludePacienteId?: string
): Promise<boolean> {
  const ciNorm = ci.trim();
  if (!ciNorm) return false;

  const q = query(
    collection(db, "pacientes"),
    where("tenantId", "==", tenantId),
    where("ci", "==", ciNorm)
  );
  const snap = await getDocs(q);
  return snap.docs.some((d) => d.id !== excludePacienteId);
}
