import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Settings, Bell, ShieldCheck, UserPlus } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-headline font-bold text-foreground">Configuración</h1>
          <p className="text-muted-foreground mt-1">Ajusta los parámetros de tu clínica y personaliza la experiencia del equipo.</p>
        </div>
        <Button className="bg-primary text-white">Guardar Cambios</Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Información del Consultorio</CardTitle>
            <CardDescription>Datos generales y contacto del consultorio.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Nombre del Consultorio</label>
              <Input defaultValue="Clínica DentaSync" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Correo de Contacto</label>
              <Input defaultValue="contacto@dentasync.com" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Teléfono</label>
              <Input defaultValue="+56 9 1234 5678" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Seguridad y Acceso</CardTitle>
            <CardDescription>Configura las opciones de acceso y notificaciones.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-muted/80 bg-muted/50 p-4">
              <div>
                <p className="font-semibold text-foreground">Autenticación 2FA</p>
                <p className="text-sm text-muted-foreground">Requiere verificación en dos pasos al iniciar sesión.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-muted/80 bg-muted/50 p-4">
              <div>
                <p className="font-semibold text-foreground">Notificaciones por email</p>
                <p className="text-sm text-muted-foreground">Recibe avisos de citas, recordatorios y alertas administrativas.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-muted/80 bg-muted/50 p-4">
              <div>
                <p className="font-semibold text-foreground">Permitir login de invitados</p>
                <p className="text-sm text-muted-foreground">Habilita el acceso temporal para asistentes o abogados.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Usuarios del Equipo</CardTitle>
            <CardDescription>Administra roles y accesos internos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Dr. Ricardo Lopez', role: 'Especialista', status: 'Activo' },
              { name: 'Maria Sánchez', role: 'Secretaria', status: 'Activo' },
              { name: 'Carlos Pérez', role: 'Asistente', status: 'Pendiente' },
            ].map((user) => (
              <div key={user.name} className="rounded-2xl border border-muted/80 p-4 bg-white/90">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-foreground">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.role}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary">{user.status}</span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">Agregar Usuario</Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle>Preferencias del Sistema</CardTitle>
            <CardDescription>Define valores por defecto y ajustes de experiencia.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Zona Horaria</label>
              <Input defaultValue="America/Santiago" />
            </div>
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Formato de Fecha</label>
              <Input defaultValue="DD/MM/YYYY" />
            </div>
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-muted/80 bg-muted/50 p-4">
              <div>
                <p className="font-semibold text-foreground">Modo oscuro</p>
                <p className="text-sm text-muted-foreground">Activa el tema oscuro para la interfaz.</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
