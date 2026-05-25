"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext' // <-- 1. Importamos el guardia (AuthContext)
import { tienePermiso, Permiso } from '@/types/roles' // <-- 2. Importamos los permisos

import { 
  LayoutDashboard, Users, Calendar, BrainCircuit, 
  MessageSquare, Activity, Settings, Stethoscope, LogOut 
} from 'lucide-react'
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarFooter
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

// 3. Añadimos una propiedad "permisoRequerido" a cada botón
interface NavItem {
  name: string;
  href: string;
  icon: any;
  permisoRequerido?: Permiso; // Es opcional porque el Dashboard lo pueden ver todos
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Vista General', href: '/dashboard', icon: LayoutDashboard }, // Sin permiso = visible para todos
  { name: 'Agenda', href: '/agenda', icon: Calendar, permisoRequerido: 'gestionar_agenda' },
  { name: 'Pacientes', href: '/pacientes', icon: Users, permisoRequerido: 'gestionar_pacientes' },
  { name: 'Optimizador IA', href: '/ai-optimizer', icon: BrainCircuit, permisoRequerido: 'gestionar_agenda' },
  { name: 'Asistente IA', href: '/concierge', icon: MessageSquare, permisoRequerido: 'gestionar_agenda' },
  { name: 'Analíticas', href: '/analytics', icon: Activity, permisoRequerido: 'ver_reportes_financieros' },
  { name: 'Configuración', href: '/settings', icon: Settings, permisoRequerido: 'configurar_consultorio' },
]

export function ClinicSidebar() {
  const pathname = usePathname()
  
  // 4. Obtenemos el usuario actual que está navegando
  const { user } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  // 5. Filtramos el menú según el rol del usuario
  const menuFiltrado = NAV_ITEMS.filter(item => {
    // Si el botón no requiere permiso, lo mostramos
    if (!item.permisoRequerido) return true;
    
    // Si requiere permiso, pero el usuario no tiene rol aún (cargando), lo ocultamos por seguridad
    if (!user?.rol) return false;

    // Verificamos si el rol del usuario tiene ese permiso
    return tienePermiso(user.rol, item.permisoRequerido);
  });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-6 px-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#2651A3] p-2 rounded-lg text-white shrink-0">
            <Stethoscope size={24} strokeWidth={2.5} />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight text-[#2651A3] group-data-[collapsible=icon]:hidden">
            DentaSync
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu className="px-2">
          {/* 6. Renderizamos el menú ya filtrado */}
          {menuFiltrado.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.href}
                tooltip={item.name}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 flex flex-col gap-4 group-data-[collapsible=icon]:hidden">
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-900 font-medium">Plan Gratuito</p>
          <div className="mt-2 h-1 w-full bg-blue-200 rounded-full overflow-hidden">
            <div className="h-full bg-[#39ACB8] w-2/3" />
          </div>
          <p className="text-[10px] mt-1 text-blue-800 text-right">650 / 1000 pacientes</p>
        </div>

        <Button 
          variant="outline" 
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 flex gap-2 items-center justify-start"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}