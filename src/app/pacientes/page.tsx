"use client"

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { 
  Plus,
  Search,
  Filter,
  ChevronRight,
  UserCircle,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Patient,
  PatientStatus,
  addPatient,
  getInitialPatients,
  isDuplicateDni,
} from '@/lib/patient-store'

const STATUS_OPTIONS: PatientStatus[] = ['Activo', 'Inactivo', 'Moroso', 'Seguimiento']

const initialFormState = {
  name: '',
  dni: '',
  phone: '',
  email: '',
  birthDate: '',
  gender: '',
  status: 'Activo' as PatientStatus,
  lastVisit: '',
  treatment: '',
  address: '',
  emergencyName: '',
  emergencyRelation: '',
  emergencyPhone: '',
}

type PatientFormState = typeof initialFormState

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'Todos' | PatientStatus>('Todos')
  const [form, setForm] = useState<PatientFormState>(initialFormState)
  const { toast } = useToast()
  const formRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setPatients(getInitialPatients())
  }, [])

  const filteredPatients = useMemo(() => {
    const query = search.trim().toLowerCase()

    return patients.filter((patient) => {
      const searchMatches =
        !query ||
        [patient.name, patient.id, patient.phone, patient.dni].some((value) =>
          value.toLowerCase().includes(query)
        )

      const statusMatches = statusFilter === 'Todos' || patient.status === statusFilter
      return searchMatches && statusMatches
    })
  }, [patients, search, statusFilter])

  const handleChange = (field: keyof PatientFormState) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm({ ...form, [field]: event.target.value })
    }

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!form.name.trim() || !form.dni.trim() || !form.phone.trim()) {
      toast({
        title: 'Faltan datos',
        description: 'Nombre, CI/DNI y teléfono son obligatorios.',
        variant: 'destructive',
      })
      return
    }

    if (!form.emergencyName.trim() || !form.emergencyPhone.trim()) {
      toast({
        title: 'Faltan datos',
        description: 'Debe completar el contacto de emergencia.',
        variant: 'destructive',
      })
      return
    }

    if (isDuplicateDni(form.dni)) {
      toast({
        title: 'Paciente duplicado',
        description: 'Ya existe un paciente con ese DNI en el sistema.',
        variant: 'destructive',
      })
      return
    }

    const nextPatient = addPatient({
      name: form.name,
      dni: form.dni,
      phone: form.phone,
      email: form.email,
      birthDate: form.birthDate,
      gender: form.gender as Patient['gender'],
      status: form.status,
      address: form.address,
      emergencyContact: {
        name: form.emergencyName,
        relation: form.emergencyRelation,
        phone: form.emergencyPhone,
      },
      lastVisit: form.lastVisit || new Date().toISOString().split('T')[0],
      treatment: form.treatment || 'Sin tratamiento',
      balance: 0,
      overduePayments: 0,
      paymentHistory: [],
      visitHistory: [],
      allergies: [],
      conditions: [],
      medications: [],
    })

    setPatients((current) => [nextPatient, ...current])
    toast({
      title: 'Paciente registrado',
      description: `${nextPatient.name} se guardó correctamente.`,
      variant: 'default',
    })
    setForm(initialFormState)
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Pacientes</h1>
          <p className="text-muted-foreground">Registre, busque y revise la ficha clínica de sus pacientes.</p>
        </div>
        <Button
          className="bg-primary text-white gap-2"
          onClick={() => formRef.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          <Plus size={18} />
          Nuevo Paciente
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div ref={formRef}>
          <Card className="border-none shadow-sm">
            <CardHeader>
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">Registro de Paciente</h2>
                <p className="text-sm text-muted-foreground">Crea una nueva ficha y evita duplicados por CI.</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Nombre completo</label>
                  <Input
                    placeholder="Ej. Ana González"
                    value={form.name}
                    onChange={handleChange('name')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">CI / DNI</label>
                  <Input
                    placeholder="Ej. 12.345.678"
                    value={form.dni}
                    onChange={handleChange('dni')}
                  />
                </div>
              </div>
              {/* Resto del formulario... */}
              <Button type="submit" className="w-full bg-secondary text-white">
                Guardar Paciente
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>

        <Card className="border-none shadow-sm">
          <CardHeader className="border-b pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-foreground">Lista de Pacientes</h2>
                <p className="text-sm text-muted-foreground">Busca por nombre, CI o teléfono.</p>
              </div>
              {/* Controles de búsqueda... */}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="pl-6">Paciente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Visita</TableHead>
                  <TableHead className="text-right pr-6">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-muted/10 group">
                    <TableCell className="pl-6">
                      <Link href={`/pacientes/${patient.id}`} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <UserCircle size={24} />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{patient.name}</p>
                          <p className="text-xs text-muted-foreground">{patient.id} • {patient.dni}</p>
                        </div>
                      </Link>
                    </TableCell>
                    {/* Resto de celdas... */}
                    <TableCell className="text-right pr-6">
                      <Link href={`/pacientes/${patient.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                          <ChevronRight size={16} />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
