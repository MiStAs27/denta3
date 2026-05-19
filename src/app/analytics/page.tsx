import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, Calendar, Users, DollarSign, BarChart3 } from 'lucide-react'

const KPIS = [
  { label: 'Ingresos Mensuales', value: '$42,500', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
  { label: 'Citas Confirmadas', value: '124', icon: Calendar, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  { label: 'Nuevos Pacientes', value: '32', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Tasa de Ausentismo', value: '8.2%', icon: Activity, color: 'text-orange-600', bg: 'bg-orange-100' },
]

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Analíticas Clínicas</h1>
          <p className="text-muted-foreground mt-1">Monitorea el desempeño de la clínica y accede a indicadores clave.</p>
        </div>
        <Button className="bg-primary text-white">Exportar Informe</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {KPIS.map((stat) => (
          <Card key={stat.label} className="border-none shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={
                  `p-3 rounded-xl ${stat.bg} text-xl ${stat.color}`
                }>
                  <stat.icon />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h2 className="mt-3 text-3xl font-bold text-foreground">{stat.value}</h2>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Ingresos por Especialidad</CardTitle>
            <CardDescription>Distribución de ingresos por tipo de servicio.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Ortodoncia', value: '$11,300', progress: 72 },
                { name: 'Endodoncia', value: '$8,450', progress: 54 },
                { name: 'Limpieza', value: '$6,900', progress: 45 },
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-medium text-foreground">
                    <span>{item.name}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${item.progress}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Resumen de eventos operativos recientes de la clínica.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              'Nueva cita confirmada para Paciente PAT-002 a las 11:30 AM.',
              'Paciente PAT-005 completó su tratamiento de limpieza.',
              'Se registró un nuevo paciente con historial de alergias.',
              'Se canceló una cita sobre ortodoncia para mañana.',
            ].map((event, index) => (
              <div key={index} className="rounded-2xl border border-muted/60 bg-muted/50 p-4 text-sm text-foreground/90">
                {event}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle>Perspectivas de Uso</CardTitle>
          <CardDescription>Datos de desempeño por doctor y agenda.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-muted/80 p-5 bg-white/90">
              <p className="text-sm font-medium text-muted-foreground">Doctor con mayor carga</p>
              <p className="mt-3 text-xl font-bold text-foreground">Dra. Mariana Ruiz</p>
              <p className="text-sm text-muted-foreground mt-2">34 citas esta semana, 92% de ocupación.</p>
            </div>
            <div className="rounded-2xl border border-muted/80 p-5 bg-white/90">
              <p className="text-sm font-medium text-muted-foreground">Hora más solicitada</p>
              <p className="mt-3 text-xl font-bold text-foreground">10:00 - 11:00 AM</p>
              <p className="text-sm text-muted-foreground mt-2">Mayor número de reservas y menor tasa de ausentismo.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
