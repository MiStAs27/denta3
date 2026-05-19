"use client"

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Plus, Filter, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

const HOURS = Array.from({ length: 9 }, (_, i) => i + 9) // 9 AM to 5 PM

const APPOINTMENTS = [
  { time: '09:00', patient: 'Elena Gilbert', type: 'Limpieza', status: 'Confirmada', duration: '30m' },
  { time: '10:30', patient: 'Stefan Salvatore', type: 'Endodoncia', status: 'En Espera', duration: '60m' },
  { time: '14:00', patient: 'Damon Salvatore', type: 'Consulta', status: 'Pendiente', duration: '15m' },
  { time: '15:30', patient: 'Bonnie Bennett', type: 'Ajuste Brackets', status: 'Confirmada', duration: '30m' },
]

export default function AgendaPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Agenda de la Clínica</h1>
          <p className="text-muted-foreground">Gestione su horario diario y la disponibilidad de especialistas.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter size={16} /> Filtrar
          </Button>
          <Button className="bg-primary text-white gap-2">
            <Plus size={18} /> Nueva Cita
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-white border-b flex flex-row items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center bg-muted rounded-lg p-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white"><ChevronLeft size={16} /></Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white"><ChevronRight size={16} /></Button>
            </div>
            <h2 className="font-bold text-lg">Jueves, 30 Nov, 2023</h2>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="font-bold">Día</Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">Semana</Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground">Mes</Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-muted/50">
            {HOURS.map((hour) => {
              const hourStr = `${hour < 10 ? '0' : ''}${hour}:00`
              const appts = APPOINTMENTS.filter(a => a.time.startsWith(`${hour < 10 ? '0' : ''}${hour}`))
              
              return (
                <div key={hour} className="flex min-h-[80px] group">
                  <div className="w-20 sm:w-28 py-4 px-6 text-right border-r bg-muted/20">
                    <span className="text-xs font-bold text-muted-foreground uppercase">{hourStr}</span>
                  </div>
                  <div className="flex-1 p-2 relative flex flex-col gap-2">
                    {appts.length > 0 ? (
                      appts.map((appt, i) => (
                        <div key={i} className={cn(
                          "rounded-xl p-3 border-l-4 shadow-sm flex items-center justify-between hover:scale-[1.01] transition-transform",
                          appt.status === 'Confirmada' ? "bg-blue-50 border-blue-500" : 
                          appt.status === 'En Espera' ? "bg-green-50 border-green-500" : 
                          "bg-yellow-50 border-yellow-500"
                        )}>
                          <div>
                            <p className="text-sm font-bold text-foreground">{appt.patient}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{appt.type}</span>
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Clock size={10} /> {appt.duration}
                              </span>
                            </div>
                          </div>
                          <Badge variant="outline" className={cn(
                            "text-[10px] rounded-full",
                            appt.status === 'Confirmada' ? "bg-white text-blue-700 border-blue-200" :
                            appt.status === 'En Espera' ? "bg-white text-green-700 border-green-200" :
                            "bg-white text-yellow-700 border-yellow-200"
                          )}>
                            {appt.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest text-primary gap-1">
                           <Plus size={12} /> Reservar Espacio
                         </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
