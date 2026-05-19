"use client"

import React from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  Printer
} from 'lucide-react'
import { Odontogram } from '@/components/dental/Odontogram'

export default function PatientDetailPage({ params }: { params: { id: string } }) {
  const patientId = params.id

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="w-full md:w-80 border-none shadow-sm h-fit">
          <CardContent className="pt-8 flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold mb-4 border-2 border-primary/20">
              AM
            </div>
            <h2 className="text-xl font-bold text-foreground">Alvaro Morte</h2>
            <p className="text-sm text-muted-foreground font-medium">ID Paciente: {patientId}</p>
            <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">Paciente Activo</Badge>
            
            <div className="w-full space-y-4 mt-8 pt-8 border-t">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone size={16} className="text-primary" />
                <span>+34 654 231 987</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail size={16} className="text-primary" />
                <span>alvaro.m@email.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar size={16} className="text-primary" />
                <span>Nacimiento: 23 Feb, 1978</span>
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
          <Tabs defaultValue="clinical" className="w-full">
            <TabsList className="bg-white p-1 h-12 shadow-sm mb-6 border w-full justify-start overflow-x-auto">
              <TabsTrigger value="clinical" className="gap-2 px-6">
                <Stethoscope size={16} /> Historial Clínico
              </TabsTrigger>
              <TabsTrigger value="odontogram" className="gap-2 px-6">
                <FileText size={16} /> Odontograma
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2 px-6">
                <History size={16} /> Historia
              </TabsTrigger>
              <TabsTrigger value="images" className="gap-2 px-6">
                <ImageIcon size={16} /> Radiografías
              </TabsTrigger>
            </TabsList>

            <TabsContent value="clinical" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Diagnósticos Recientes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-red-50 border border-red-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-red-600 uppercase">Alerta</span>
                        <span className="text-[10px] text-red-400">12 Nov, 2023</span>
                      </div>
                      <p className="text-sm font-semibold text-red-900">Alergia Grave a la Penicilina</p>
                      <p className="text-xs text-red-700 mt-1">El paciente informa urticaria e hinchazón al ingerirla.</p>
                    </div>
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                      <p className="text-sm font-semibold text-blue-900">Plan Actual: Ortodoncia Fase II</p>
                      <p className="text-xs text-blue-700 mt-1">Ajuste de brackets programado cada 4 semanas.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Estadísticas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-sm text-muted-foreground">Total Pagado</span>
                      <span className="text-sm font-bold text-green-600">$3,450.00</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-3">
                      <span className="text-sm text-muted-foreground">Saldo Pendiente</span>
                      <span className="text-sm font-bold text-red-600">$120.00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Próxima Cita</span>
                      <span className="text-sm font-bold text-primary">15 Dic, 2023</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-none shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Notas de Evolución</CardTitle>
                    <CardDescription>Registro cronológico de observaciones clínicas.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    <ClipboardList size={16} /> Nueva Nota
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { date: '12 Nov, 2023', dr: 'Dr. Ricardo Lopez', text: 'Ajuste del arco inferior. El paciente informa de una ligera molestia en el molar 46. Instrucciones sobre el cepillado interdental adecuado.' },
                    { date: '15 Oct, 2023', dr: 'Dr. Ricardo Lopez', text: 'Limpieza profesional realizada. No hay signos de nuevas caries. Salud de las encías mejorada desde la última visita.' },
                  ].map((note, i) => (
                    <div key={i} className="p-4 rounded-xl border border-muted-foreground/10 hover:border-primary/20 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-primary">{note.dr}</span>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold">{note.date}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-foreground/80">{note.text}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="odontogram">
              <Odontogram />
            </TabsContent>

            <TabsContent value="history">
              <Card className="border-none shadow-sm">
                <CardContent className="p-12 text-center text-muted-foreground">
                  El registro de visitas del paciente aparecerá aquí.
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images">
               <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                 {[1,2,3].map(i => (
                    <div key={i} className="aspect-square bg-muted rounded-xl flex items-center justify-center border-2 border-dashed border-muted-foreground/20 hover:border-primary/40 transition-colors cursor-pointer group">
                      <div className="text-center">
                        <ImageIcon className="mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" size={32} />
                        <span className="text-xs text-muted-foreground font-medium">Panorex_2023_{i}.png</span>
                      </div>
                    </div>
                 ))}
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
