export type PatientStatus = "Activo" | "Inactivo" | "Moroso" | "Seguimiento";

type ClinicalChangeType = "Alergia" | "Enfermedad" | "Medicación" | "Nota";

type PaymentStatus = "Pagado" | "Vencido" | "Pendiente";

export type ClinicalEntry = {
  id: string;
  date: string;
  user: string;
  type: ClinicalChangeType;
  description: string;
};

export type EmergencyContact = {
  name: string;
  relation: string;
  phone: string;
};

export type PaymentEntry = {
  id: string;
  date: string;
  amount: number;
  status: PaymentStatus;
  method: string;
};

export type VisitEntry = {
  id: string;
  date: string;
  professional: string;
  reason: string;
  notes: string;
};

export type Patient = {
  id: string;
  clinicId: string;
  name: string;
  email: string;
  phone: string;
  dni: string;
  birthDate: string;
  gender: string;
  status: PatientStatus;
  lastVisit: string;
  treatment: string;
  address: string;
  emergencyContact: EmergencyContact;
  balance: number;
  overduePayments: number;
  paymentHistory: PaymentEntry[];
  visitHistory: VisitEntry[];
  allergies: string[];
  conditions: string[];
  medications: string[];
  clinicalHistory: ClinicalEntry[];
  documents: { id: string; name: string; type: string; uploadedAt: string }[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
};

const STORAGE_KEY = "dentasync-patients-v1";

const defaultEmergencyContact: EmergencyContact = {
  name: "María López",
  relation: "Madre",
  phone: "+56 9 1111 2222",
};

const defaultPatients: Patient[] = [
  {
    id: "PAT-001",
    clinicId: "clinica-demo",
    name: "Alvaro Morte",
    email: "alvaro.m@email.com",
    phone: "+56 9 6543 2198",
    dni: "11.223.334",
    birthDate: "1978-02-23",
    gender: "Masculino",
    status: "Activo",
    lastVisit: "2024-05-10",
    treatment: "Ortodoncia Fase II",
    address: "Av. Libertad 123, Santiago",
    emergencyContact: defaultEmergencyContact,
    balance: 120000,
    overduePayments: 1,
    paymentHistory: [
      {
        id: "PAY-001",
        date: "2024-05-01",
        amount: 50000,
        status: "Pagado",
        method: "Transferencia",
      },
      {
        id: "PAY-002",
        date: "2024-06-01",
        amount: 70000,
        status: "Pendiente",
        method: "Tarjeta",
      },
    ],
    visitHistory: [
      {
        id: "VIS-001",
        date: "2024-05-10",
        professional: "Dr. Ricardo Lopez",
        reason: "Control de ortodoncia",
        notes: "Revisión mensual sin observaciones.",
      },
    ],
    allergies: ["Penicilina"],
    conditions: ["Bruxismo"],
    medications: ["Ibuprofeno 400 mg"],
    clinicalHistory: [
      {
        id: "CH-001",
        date: "2024-05-10",
        user: "Dr. Ricardo Lopez",
        type: "Alergia",
        description:
          "Se registró alergia a Penicilina tras consulta de seguimiento.",
      },
      {
        id: "CH-002",
        date: "2024-03-22",
        user: "Dr. Ricardo Lopez",
        type: "Nota",
        description:
          "Paciente con dolor nocturno por bruxismo. Se recomienda férula de descarga.",
      },
    ],
    documents: [],
    createdAt: "2024-04-15T10:20:00.000Z",
    updatedAt: "2024-05-10T14:00:00.000Z",
    createdBy: "Sistema",
    updatedBy: "Dr. Ricardo Lopez",
  },
  {
    id: "PAT-002",
    clinicId: "clinica-demo",
    name: "María Pedrasa",
    email: "maria.pedrasa@email.com",
    phone: "+56 9 7123 4455",
    dni: "22.334.445",
    birthDate: "1995-08-14",
    gender: "Femenino",
    status: "Activo",
    lastVisit: "2024-04-25",
    treatment: "Limpieza Dental",
    address: "Calle Los Pioneros 456, Providencia",
    emergencyContact: {
      name: "Raúl Pedrasa",
      relation: "Padre",
      phone: "+56 9 2222 3333",
    },
    balance: 0,
    overduePayments: 0,
    paymentHistory: [
      {
        id: "PAY-003",
        date: "2024-04-25",
        amount: 45000,
        status: "Pagado",
        method: "Efectivo",
      },
    ],
    visitHistory: [
      {
        id: "VIS-002",
        date: "2024-04-25",
        professional: "Dra. Ana Rojas",
        reason: "Limpieza dental",
        notes: "Paciente mantiene buena higiene bucal.",
      },
    ],
    allergies: [],
    conditions: ["Hipertensión leve"],
    medications: ["Enalapril 10 mg"],
    clinicalHistory: [
      {
        id: "CH-003",
        date: "2024-04-25",
        user: "Dr. Ricardo Lopez",
        type: "Nota",
        description:
          "Limpieza completa sin complicaciones. Paciente recibe instrucción de higiene diaria.",
      },
    ],
    documents: [],
    createdAt: "2024-04-16T09:40:00.000Z",
    updatedAt: "2024-04-25T11:15:00.000Z",
    createdBy: "Sistema",
    updatedBy: "Dr. Ricardo Lopez",
  },
];

const createId = (prefix = "PAT") =>
  `${prefix}-${Math.floor(Math.random() * 900000 + 100000)}`;

const now = () => new Date().toISOString();

const normalizePatient = (patient: Partial<Patient>): Patient => ({
  id: patient.id ?? createId("PAT"),
  clinicId: patient.clinicId ?? "",
  name: patient.name ?? "",
  email: patient.email ?? "",
  phone: patient.phone ?? "",
  dni: patient.dni ?? "",
  birthDate: patient.birthDate ?? "",
  gender: patient.gender ?? "",
  status: patient.status ?? "Activo",
  lastVisit: patient.lastVisit ?? "",
  treatment: patient.treatment ?? "",
  address: patient.address ?? "",
  emergencyContact: {
    name: patient.emergencyContact?.name ?? "",
    relation: patient.emergencyContact?.relation ?? "",
    phone: patient.emergencyContact?.phone ?? "",
  },
  balance: patient.balance ?? 0,
  overduePayments: patient.overduePayments ?? 0,
  paymentHistory: patient.paymentHistory ?? [],
  visitHistory: patient.visitHistory ?? [],
  allergies: patient.allergies ?? [],
  conditions: patient.conditions ?? [],
  medications: patient.medications ?? [],
  clinicalHistory: patient.clinicalHistory ?? [],
  documents: patient.documents ?? [],
  createdAt: patient.createdAt ?? now(),
  updatedAt: patient.updatedAt ?? now(),
  createdBy: patient.createdBy ?? "Sistema",
  updatedBy: patient.updatedBy ?? "Sistema",
});

export function loadPatientsByClinic(clinicId: string): Patient[] {
  if (typeof window === "undefined" || !clinicId) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const stored = JSON.parse(raw) as Partial<Patient>[];

    // 🔥 EL FILTRO MÁGICO: Solo retorna los de esta clínica
    const allPatients = stored.map(normalizePatient);
    return allPatients.filter((p) => p.clinicId === clinicId);
  } catch {
    return [];
  }
}

export function savePatients(patients: Patient[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

export function getInitialPatients(clinicId: string): Patient[] {
  const stored = loadPatientsByClinic(clinicId);
  if (stored.length > 0) {
    return stored;
  }

  // Si no hay pacientes para esta clínica, creamos los de por defecto asignándoles el clinicId
  const defaultWithClinic = defaultPatients.map((p) => ({ ...p, clinicId }));

  // Guardamos preservando los datos de otras clínicas
  let allPatients: Patient[] = [];
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw)
      allPatients = (JSON.parse(raw) as Partial<Patient>[]).map(
        normalizePatient,
      );
  }

  savePatients([...allPatients, ...defaultWithClinic]);
  return defaultWithClinic;
}

export function getPatientById(id: string, clinicId: string): Patient | null {
  return (
    loadPatientsByClinic(clinicId).find((patient) => patient.id === id) ?? null
  );
}

export function findPatientByDni(
  dni: string,
  clinicId: string,
): Patient | null {
  return (
    loadPatientsByClinic(clinicId).find((patient) => patient.dni === dni) ??
    null
  );
}

export function addPatient(
  clinicId: string,
  patient: Omit<
    Patient,
    | "id"
    | "clinicId"
    | "createdAt"
    | "updatedAt"
    | "createdBy"
    | "updatedBy"
    | "clinicalHistory"
    | "documents"
  >,
): Patient {
  // Obtenemos TODOS los pacientes (incluso de otras clínicas) para no sobrescribir el storage
  let allPatients: Patient[] = [];
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw)
      allPatients = (JSON.parse(raw) as Partial<Patient>[]).map(
        normalizePatient,
      );
  }

  const newPatient: Patient = {
    ...patient,
    id: createId("PAT"),
    clinicId: clinicId, // 🔥 Se lo inyectamos al nuevo registro
    allergies: [],
    conditions: [],
    medications: [],
    clinicalHistory: [],
    documents: [],
    createdAt: now(),
    updatedAt: now(),
    createdBy: "Secretaria",
    updatedBy: "Secretaria",
  };

  const next = [...allPatients, newPatient];
  savePatients(next);
  return newPatient;
}

export function updatePatient(updatedPatient: Patient): Patient[] {
  // 1. Obtenemos absolutamente todos los pacientes (de todas las clínicas)
  let allPatients: Patient[] = [];
  if (typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw)
      allPatients = (JSON.parse(raw) as Partial<Patient>[]).map(
        normalizePatient,
      );
  }

  // 2. Actualizamos solo el que coincide con el ID
  const next = allPatients.map((patient) =>
    patient.id === updatedPatient.id
      ? {
          ...updatedPatient,
          updatedAt: now(),
          updatedBy: updatedPatient.updatedBy || "Usuario Sistema",
        }
      : patient,
  );

  // 3. Guardamos todo el lote completo
  savePatients(next);

  // 4. Retornamos SOLO los de la clínica actual para que la tabla en la UI no muestre pacientes de otros
  return next.filter((p) => p.clinicId === updatedPatient.clinicId);
}

export function syncPatientStatus(patient: Patient): Patient {
  if (patient.overduePayments > 2 && patient.status !== "Moroso") {
    return {
      ...patient,
      status: "Moroso",
      updatedAt: now(),
      updatedBy: "Sistema",
    };
  }

  return patient;
}

export function isDuplicateDni(dni: string, clinicId: string, patientId?: string): boolean {
  // Solo buscamos duplicados dentro de la misma clínica
  const patients = loadPatientsByClinic(clinicId)
  return patients.some((patient) => patient.dni === dni && patient.id !== patientId)
}