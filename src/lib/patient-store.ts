export type PatientStatus = 'Activo' | 'Inactivo' | 'Moroso' | 'Seguimiento'

type ClinicalChangeType = 'Alergia' | 'Enfermedad' | 'Medicación' | 'Nota'

type PaymentStatus = 'Pagado' | 'Vencido' | 'Pendiente'

export type ClinicalEntry = {
  id: string
  date: string
  user: string
  type: ClinicalChangeType
  description: string
}

export type EmergencyContact = {
  name: string
  relation: string
  phone: string
}

export type PaymentEntry = {
  id: string
  date: string
  amount: number
  status: PaymentStatus
  method: string
}

export type VisitEntry = {
  id: string
  date: string
  professional: string
  reason: string
  notes: string
}

export type Patient = {
  id: string
  name: string
  email: string
  phone: string
  dni: string
  birthDate: string
  gender: string
  status: PatientStatus
  lastVisit: string
  treatment: string
  address: string
  emergencyContact: EmergencyContact
  balance: number
  overduePayments: number
  paymentHistory: PaymentEntry[]
  visitHistory: VisitEntry[]
  allergies: string[]
  conditions: string[]
  medications: string[]
  clinicalHistory: ClinicalEntry[]
  documents: { id: string; name: string; type: string; uploadedAt: string }[]
  createdAt: string
  updatedAt: string
  createdBy: string
  updatedBy: string
}

const STORAGE_KEY = 'dentasync-patients-v1'

const defaultEmergencyContact: EmergencyContact = {
  name: 'María López',
  relation: 'Madre',
  phone: '+56 9 1111 2222',
}

const defaultPatients: Patient[] = [
  {
    id: 'PAT-001',
    name: 'Alvaro Morte',
    email: 'alvaro.m@email.com',
    phone: '+56 9 6543 2198',
    dni: '11.223.334',
    birthDate: '1978-02-23',
    gender: 'Masculino',
    status: 'Activo',
    lastVisit: '2024-05-10',
    treatment: 'Ortodoncia Fase II',
    address: 'Av. Libertad 123, Santiago',
    emergencyContact: defaultEmergencyContact,
    balance: 120000,
    overduePayments: 1,
    paymentHistory: [
      { id: 'PAY-001', date: '2024-05-01', amount: 50000, status: 'Pagado', method: 'Transferencia' },
      { id: 'PAY-002', date: '2024-06-01', amount: 70000, status: 'Pendiente', method: 'Tarjeta' },
    ],
    visitHistory: [
      {
        id: 'VIS-001',
        date: '2024-05-10',
        professional: 'Dr. Ricardo Lopez',
        reason: 'Control de ortodoncia',
        notes: 'Revisión mensual sin observaciones.',
      },
    ],
    allergies: ['Penicilina'],
    conditions: ['Bruxismo'],
    medications: ['Ibuprofeno 400 mg'],
    clinicalHistory: [
      {
        id: 'CH-001',
        date: '2024-05-10',
        user: 'Dr. Ricardo Lopez',
        type: 'Alergia',
        description: 'Se registró alergia a Penicilina tras consulta de seguimiento.',
      },
      {
        id: 'CH-002',
        date: '2024-03-22',
        user: 'Dr. Ricardo Lopez',
        type: 'Nota',
        description: 'Paciente con dolor nocturno por bruxismo. Se recomienda férula de descarga.',
      },
    ],
    documents: [],
    createdAt: '2024-04-15T10:20:00.000Z',
    updatedAt: '2024-05-10T14:00:00.000Z',
    createdBy: 'Sistema',
    updatedBy: 'Dr. Ricardo Lopez',
  },
  {
    id: 'PAT-002',
    name: 'María Pedrasa',
    email: 'maria.pedrasa@email.com',
    phone: '+56 9 7123 4455',
    dni: '22.334.445',
    birthDate: '1995-08-14',
    gender: 'Femenino',
    status: 'Activo',
    lastVisit: '2024-04-25',
    treatment: 'Limpieza Dental',
    address: 'Calle Los Pioneros 456, Providencia',
    emergencyContact: {
      name: 'Raúl Pedrasa',
      relation: 'Padre',
      phone: '+56 9 2222 3333',
    },
    balance: 0,
    overduePayments: 0,
    paymentHistory: [
      { id: 'PAY-003', date: '2024-04-25', amount: 45000, status: 'Pagado', method: 'Efectivo' },
    ],
    visitHistory: [
      {
        id: 'VIS-002',
        date: '2024-04-25',
        professional: 'Dra. Ana Rojas',
        reason: 'Limpieza dental',
        notes: 'Paciente mantiene buena higiene bucal.',
      },
    ],
    allergies: [],
    conditions: ['Hipertensión leve'],
    medications: ['Enalapril 10 mg'],
    clinicalHistory: [
      {
        id: 'CH-003',
        date: '2024-04-25',
        user: 'Dr. Ricardo Lopez',
        type: 'Nota',
        description: 'Limpieza completa sin complicaciones. Paciente recibe instrucción de higiene diaria.',
      },
    ],
    documents: [],
    createdAt: '2024-04-16T09:40:00.000Z',
    updatedAt: '2024-04-25T11:15:00.000Z',
    createdBy: 'Sistema',
    updatedBy: 'Dr. Ricardo Lopez',
  },
]

const createId = (prefix = 'PAT') => `${prefix}-${Math.floor(Math.random() * 900000 + 100000)}`

const now = () => new Date().toISOString()

const normalizePatient = (patient: Partial<Patient>): Patient => ({
  id: patient.id ?? createId('PAT'),
  name: patient.name ?? '',
  email: patient.email ?? '',
  phone: patient.phone ?? '',
  dni: patient.dni ?? '',
  birthDate: patient.birthDate ?? '',
  gender: patient.gender ?? '',
  status: patient.status ?? 'Activo',
  lastVisit: patient.lastVisit ?? '',
  treatment: patient.treatment ?? '',
  address: patient.address ?? '',
  emergencyContact: {
    name: patient.emergencyContact?.name ?? '',
    relation: patient.emergencyContact?.relation ?? '',
    phone: patient.emergencyContact?.phone ?? '',
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
  createdBy: patient.createdBy ?? 'Sistema',
  updatedBy: patient.updatedBy ?? 'Sistema',
})

export function loadPatients(): Patient[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const stored = JSON.parse(raw) as Partial<Patient>[]
    return stored.map(normalizePatient)
  } catch {
    return []
  }
}

export function savePatients(patients: Patient[]) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(patients))
}

export function getInitialPatients(): Patient[] {
  const stored = loadPatients()
  if (stored.length > 0) {
    return stored
  }

  savePatients(defaultPatients)
  return defaultPatients
}

export function getPatientById(id: string): Patient | null {
  return loadPatients().find((patient) => patient.id === id) ?? null
}

export function findPatientByDni(dni: string): Patient | null {
  return loadPatients().find((patient) => patient.dni === dni) ?? null
}

export function addPatient(patient: Omit<Patient, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy' | 'clinicalHistory' | 'documents'>): Patient {
  const patients = loadPatients()
  const newPatient: Patient = {
    ...patient,
    id: createId('PAT'),
    allergies: [],
    conditions: [],
    medications: [],
    clinicalHistory: [],
    documents: [],
    createdAt: now(),
    updatedAt: now(),
    createdBy: 'Secretaria',
    updatedBy: 'Secretaria',
  }
  const next = [...patients, newPatient]
  savePatients(next)
  return newPatient
}

export function updatePatient(updatedPatient: Patient): Patient[] {
  const patients = loadPatients()
  const next = patients.map((patient) =>
    patient.id === updatedPatient.id
      ? { ...updatedPatient, updatedAt: now(), updatedBy: updatedPatient.updatedBy || 'Usuario Sistema' }
      : patient
  )
  savePatients(next)
  return next
}

export function syncPatientStatus(patient: Patient): Patient {
  if (patient.overduePayments > 2 && patient.status !== 'Moroso') {
    return {
      ...patient,
      status: 'Moroso',
      updatedAt: now(),
      updatedBy: 'Sistema',
    }
  }

  return patient
}

export function isDuplicateDni(dni: string, patientId?: string): boolean {
  const patients = loadPatients()
  return patients.some((patient) => patient.dni === dni && patient.id !== patientId)
}
