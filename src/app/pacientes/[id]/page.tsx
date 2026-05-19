"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/hooks/use-toast'
import jsPDF from 'jspdf'
import {
  FileText,
  History,
  ClipboardList,
  Image as ImageIcon,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  Stethoscope,
  Printer,
} from 'lucide-react'
import { Odontogram } from '@/components/dental/Odontogram'
import { getPatientById, isDuplicateDni, syncPatientStatus, updatePatient, Patient } from '@/lib/patient-store'

const initialClinicalInput = {
  allergy: '',
  condition: '',
  medication: '',
  note: '',
}

const initialProfileForm = {
  name: '',
  email: '',
  phone: '',
  dni: '',
  birthDate: '',
  gender: 'Masculino' as Patient['gender'],
  status: 'Activo' as Patient['status'],
  address: '',
  emergencyName: '',
  emergencyRelation: '',
  emergencyPhone: '',
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    maximumFractionDigits: 0,
  }).format(amount)

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const patientId = params.id
  const [patient, setPatient] = useState<Patient | null>(null)
  const [doctorMode, setDoctorMode] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState(initialProfileForm)
  const [clinicalInput, setClinicalInput] = useState(initialClinicalInput)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()

  const currentUser = doctorMode ? 'Dr. Ricardo Lopez' : 'Secretaria'

  useEffect(() => {
    const stored = getPatientById(patientId)
    if (stored) {
      const synced = syncPatientStatus(stored)
      if (synced.status !== stored.status) {
        updatePatient(synced)
      }
      setPatient(synced)
      setProfileForm({
        name: synced.name,
        email: synced.email,
        phone: synced.phone,
        dni: synced.dni,
        birthDate: synced.birthDate,
        gender: synced.gender,
        status: synced.status,
        address: synced.address,
        emergencyName: synced.emergencyContact.name,
        emergencyRelation: synced.emergencyContact.relation,
        emergencyPhone: synced.emergencyContact.phone,
      })
    }
  }, [patientId])

  const savePatient = (updatedPatient: Patient, description: string) => {
    updatePatient(updatedPatient)
    setPatient(updatedPatient)
    toast({
      title: 'Ficha actualizada',
      description,
      variant: 'default',
    })
  }

  const addHistoryEntry = (
    updatedPatient: Patient,
    type: Patient['clinicalHistory'][0]['type'],
    description: string
  ) => {
    const next = {
      ...updatedPatient,
      clinicalHistory: [
        {
          id: `CH-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          user: currentUser,
          type,
          description,
        },
        ...updatedPatient.clinicalHistory,
      ],
      updatedBy: currentUser,
      updatedAt: new Date().toISOString(),
    }

    savePatient(next, description)
  }

  const handleClinicalInput = (field: keyof typeof initialClinicalInput) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setClinicalInput({ ...clinicalInput, [field]: event.target.value })
    }

  const handleProfileChange = (field: keyof typeof initialProfileForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setProfileForm({ ...profileForm, [field]: event.target.value })
    }

  const handleSaveProfile = () => {
    if (!patient) return

    if (!profileForm.name.trim() || !profileForm.dni.trim() || !profileForm.phone.trim()) {
      toast({
        title: 'Faltan datos',
        description: 'Nombre, DNI y teléfono son obligatorios.',
        variant: 'destructive',
      })
      return
    }

    if (isDuplicateDni(profileForm.dni, patient.id)) {
      toast({
        title: 'DNI duplicado',
        description: 'Ya existe un paciente con ese DNI.',
        variant: 'destructive',
      })
      return
    }

    const next = {
      ...patient,
      name: profileForm.name,
      email: profileForm.email,
      phone: profileForm.phone,
      dni: profileForm.dni,
      birthDate: profileForm.birthDate,
      gender: profileForm.gender,
      status: profileForm.status,
      address: profileForm.address,
      emergencyContact: {
        name: profileForm.emergencyName,
        relation: profileForm.emergencyRelation,
        phone: profileForm.emergencyPhone,
      },
      updatedBy: currentUser,
      updatedAt: new Date().toISOString(),
    }

    addHistoryEntry(next, 'Nota', `Se actualizaron datos de paciente por ${currentUser}.`)
    setEditingProfile(false)
  }

  const handleAddAllergy = () => {
    if (!patient || !clinicalInput.allergy.trim()) return

    const allergy = clinicalInput.allergy.trim()
    if (patient.allergies.includes(allergy)) {
      toast({
        title: 'Ya existe esta alergia',
        description: 'No se puede registrar dos veces la misma alergia.',
        variant: 'destructive',
      })
      return
    }

    const next = {
      ...patient,
      allergies: [allergy, ...patient.allergies],
    }

    addHistoryEntry(next, 'Alergia', `Se registró alergia: ${allergy}`)
    setClinicalInput({ ...clinicalInput, allergy: '' })
  }

  const handleAddCondition = () => {
    if (!patient || !clinicalInput.condition.trim()) return

    const condition = clinicalInput.condition.trim()
    const next = {
      ...patient,
      conditions: [condition, ...patient.conditions],
    }

    addHistoryEntry(next, 'Enfermedad', `Se registró enfermedad: ${condition}`)
    setClinicalInput({ ...clinicalInput, condition: '' })
  }

  const handleAddMedication = () => {
    if (!patient || !clinicalInput.medication.trim()) return

    const medication = clinicalInput.medication.trim()
    const next = {
      ...patient,
      medications: [medication, ...patient.medications],
    }

    addHistoryEntry(next, 'Medicación', `Se registró medicación: ${medication}`)
    setClinicalInput({ ...clinicalInput, medication: '' })
  }

  const handleAddNote = () => {
    if (!patient || !clinicalInput.note.trim()) return

    const next = {
      ...patient,
    }

    addHistoryEntry(next, 'Nota', clinicalInput.note.trim())
    setClinicalInput({ ...clinicalInput, note: '' })
  }

  const handleUploadDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!patient) return
    const file = event.target.files?.[0]
    if (!file) return

    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg']
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Formato no permitido',
        description: 'Solo se permiten archivos PDF, JPG o PNG.',
        variant: 'destructive',
      })
      event.target.value = ''
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'Archivo muy grande',
        description: 'El archivo supera el tamaño máximo de 10 MB.',
        variant: 'destructive',
      })
      event.target.value = ''
      return
    }

    const documentEntry = {
      id: `DOC-${Date.now()}`,
      name: file.name,
      type: file.type,
      uploadedAt: new Date().toISOString(),
    }

    const next = {
      ...patient,
      documents: [documentEntry, ...patient.documents],
      updatedBy: currentUser,
      updatedAt: new Date().toISOString(),
    }

    addHistoryEntry(next, 'Nota', `Documento adjuntado: ${file.name}`)
    event.target.value = ''
  }

  const handleExportPdf = () => {
    if (!patient) return

    try {
      const doc = new jsPDF()
      doc.setFontSize(18)
      doc.text('DentaSync', 14, 20)
      doc.setFontSize(14)
      doc.text('Ficha de paciente', 14, 30)

      doc.setFontSize(11)
      doc.text(`Nombre: ${patient.name}`, 14, 44)
      doc.text(`ID: ${patient.id}`, 14, 52)
      doc.text(`DNI: ${patient.dni}`, 14, 60)
      doc.text(`Teléfono: ${patient.phone}`, 14, 68)
      doc.text(`Email: ${patient.email || 'No registrado'}`, 14, 76)
      doc.text(`Nacimiento: ${patient.birthDate || 'No registrado'}`, 14, 84)
      doc.text(`Estado: ${patient.status}`, 14, 92)
      doc.text(`Dirección: ${patient.address || 'No registrada'}`, 14, 100)
      doc.text(`Contacto emergencia: ${patient.emergencyContact.name} (${patient.emergencyContact.relation})`, 14, 108)
      doc.text(`Teléfono emergencia: ${patient.emergencyContact.phone}`, 14, 116)
      doc.text(`Saldo pendiente: ${formatCurrency(patient.balance)}`, 14, 124)

      doc.setFontSize(12)
      doc.text('Alergias', 14, 140)
      doc.setFontSize(10)
      doc.text(patient.allergies.length > 0 ? patient.allergies.join(', ') : 'No registradas', 14, 148)

      doc.save(`ficha-${patient.id}.pdf`)
      toast({
        title: 'Ficha exportada',
        description: 'El PDF se descargó correctamente.',
        variant: 'default',
      })
    } catch {
      toast({
        title: 'No se pudo exportar la ficha',
        description: 'Intente nuevamente.',
        variant: 'destructive',
      })
    }
  }

  const isCriticalAllergy = useMemo(
    () => !!patient?.allergies.length,
    [patient?.allergies.length]
  )

  if (!patient) {
    return (
      <div className="space-y-6">
        <Card className="border-none shadow-sm">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-foreground">Paciente no encontrado</h2>
            <p className="text-sm text-muted-foreground mt-2">Verifique el ID y regrese a la lista de pacientes.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="w-full md:w-80 border-none shadow-sm h-fit">
          <CardContent className="pt-8 flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold mb-4 border-2 border-primary/20">
              {patient.name
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')}
            </div>
            <h2 className="text-xl font-bold text-foreground">{patient.name}</h2>
            <p className="text-sm text-muted-foreground font-medium">ID Paciente: {patient.id}</p>
            <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">{patient.status}</Badge>

            <div className="w-full space-y-4 mt-8 pt-8 border-t">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone size={16} className="text-primary" />
                <span>{patient.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail size={16} className="text-primary" />
                <span>{patient.email || 'Sin correo'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar size={16} className="text-primary" />
                <span>Nacimiento: {patient.birthDate || 'No registrado'}</span>
              </div>
              <div className="rounded-2xl border border-muted/80 bg-white/90 p-4 text-left">
                <p className="text-sm font-semibold text-foreground">Contacto emergencia</p>
                <p className="text-sm text-muted-foreground">{patient.emergencyContact.name} • {patient.emergencyContact.relation}</p>
                <p className="text-sm text-muted-foreground">{patient.emergencyContact.phone}</p>
              </div>
            </div>

            <div className="flex gap-2 mt-8 w-full">
              <Button className="flex-1 gap-2 bg-secondary text-white">
                <MessageCircle size={16} />
                Chat
              </Button>
              <Button variant="outline" size="icon" className="shrink-0">
                <Printer size={16} />
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 w-full space-y-6">
          <Card className="border-none shadow-sm">
            <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl">Ficha Clínica</CardTitle>
                <CardDescription>Actualice los datos clínicos desde modo doctor.</CardDescription>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">Modo Doctor</span>
                <Switch checked={doctorMode} onCheckedChange={(value) => setDoctorMode(Boolean(value))} />
              </div>
            </CardHeader>
            <CardContent>
              {isCriticalAllergy && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <div className="font-semibold">Alerta de alergias activada</div>
                  <p className="mt-1">Este paciente tiene alergias registradas. Verifique antes de recetar medicación.</p>
                </div>
              )}
              <div className="grid gap-4 md:grid-cols-3 mt-4">
                <div className="rounded-2xl border border-muted/80 p-4 bg-white/90">
                  <p className="text-sm font-medium text-muted-foreground">Alergias</p>
                  <div className="mt-3 space-y-2">
                    {patient.allergies.length > 0 ? (
                      patient.allergies.map((item, index) => (
                        <div key={index} className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700 inline-block">
                          {item}
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Sin alergias registradas</p>
                    )}
                  </div>
                </div>
                {/* Resto de columnas y secciones similares al original... */}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
