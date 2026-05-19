"use client"

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight,
  UserCircle
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const PATIENTS = [
  { id: 'PAT-001', name: 'Alvaro Morte', age: 45, status: 'Active', lastVisit: '2023-11-15', treatment: 'Orthodontics' },
  { id: 'PAT-002', name: 'Maria Pedrasa', age: 29, status: 'Active', lastVisit: '2023-11-20', treatment: 'Cleaning' },
  { id: 'PAT-003', name: 'Pedro Alonso', age: 52, status: 'Moroso', lastVisit: '2023-10-05', treatment: 'Extraction' },
  { id: 'PAT-004', name: 'Ursula Corbero', age: 34, status: 'Active', lastVisit: '2023-11-28', treatment: 'Crown' },
  { id: 'PAT-005', name: 'Miguel Herran', age: 27, status: 'Follow-up', lastVisit: '2023-11-25', treatment: 'Fillings' },
]

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Patients</h1>
          <p className="text-muted-foreground">Manage records, medical history, and clinical follow-ups.</p>
        </div>
        <Button className="bg-primary text-white gap-2">
          <Plus size={18} />
          Add New Patient
        </Button>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="border-b pb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input placeholder="Search by name, ID, or phone..." className="pl-10" />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" className="gap-2">
                <Filter size={16} />
                Filter
              </Button>
              <Button variant="outline">Export List</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="pl-6">Patient</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Primary Treatment</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead className="text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {PATIENTS.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/10 cursor-pointer group">
                  <TableCell className="pl-6">
                    <Link href={`/patients/${p.id}`} className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <UserCircle size={24} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.id} • {p.age} years</p>
                      </div>
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "rounded-full px-3",
                        p.status === 'Active' ? "bg-green-100 text-green-700 border-green-200" :
                        p.status === 'Moroso' ? "bg-red-100 text-red-700 border-red-200" :
                        "bg-blue-100 text-blue-700 border-blue-200"
                      )}
                    >
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{p.treatment}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{p.lastVisit}</span>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                        <MoreVertical size={16} />
                      </Button>
                      <Link href={`/patients/${p.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                          <ChevronRight size={16} />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ')
}