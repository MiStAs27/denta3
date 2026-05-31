"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useAuth } from '@/context/AuthContext'
import { tienePermiso, Permiso } from '@/types/roles'

import { 
  LayoutDashboard, Users, Calendar, BrainCircuit, 
  MessageSquare, Activity, Settings, Stethoscope, LogOut, CreditCard, AlertCircle
} from 'lucide-react'
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu,
  SidebarMenuButton, SidebarMenuItem, SidebarFooter
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'

interface NavItem {
  name: string;
  href: string;
  icon: any;
  permisoRequerido?: Permiso;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Vista General', href: '/dashboard', icon: LayoutDashboard }, 
  { name: 'Agenda', href: '/agenda', icon: Calendar, permisoRequerido: 'gestionar_agenda' },
  { name: 'Pacientes', href: '/pacientes', icon: Users, permisoRequerido: 'gestionar_pacientes' },
  { name: 'Informes y Reportes', href: '/analytics', icon: Activity, permisoRequerido: 'ver_reportes_financieros' },
  { name: 'Mi Suscripción', href: '/suscripcion', icon: CreditCard, permisoRequerido: 'configurar_consultorio' },
  { name: 'Configuración', href: '/settings', icon: Settings, permisoRequerido: 'configurar_consultorio' },
]

export function ClinicSidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }

  const menuFiltrado = NAV_ITEMS.filter(item => {
    if (!item.permisoRequerido) return true;
    if (!user?.rol) return false;
    return tienePermiso(user.rol, item.permisoRequerido);
  });

  const nombreUsuario: string = (user as any)?.nombre || user?.displayName || 'Usuario';

  const obtenerIniciales = (nombreCompleto: string): string => {
    if (!nombreCompleto) return 'U';
    const partes = nombreCompleto.trim().split(' ');
    if (partes.length >= 2) {
      return `${partes[0][0]}${partes[1][0]}`.toUpperCase();
    }
    return nombreCompleto.substring(0, 2).toUpperCase();
  };

  const formatearRol = (rol: string | undefined) => {
    if (!rol) return 'USUARIO';
    if (rol === 'TENANT_ADMIN') return 'DIRECTOR MÉDICO';
    if (rol === 'SUPER_ADMIN') return 'SUPER ADMIN';
    return rol.replace('_', ' ');
  };

  // 🔥 NUEVA LÓGICA: Calcular los días restantes para mostrarlos en la barra
  const calcularDiasRestantes = () => {
    if (!user?.fechaVencimiento) return null;
    const vencimiento = new Date(user.fechaVencimiento);
    const hoy = new Date();
    const diferencia = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  };

  const diasRestantes = calcularDiasRestantes();
  
  // Determinar el diseño de la tarjeta según los días
  const esPeligro = diasRestantes !== null && diasRestantes <= 5;
  const colorFondo = esPeligro ? 'from-amber-50 to-orange-50 border-amber-200' : 'from-blue-50 to-sky-50 border-blue-200';
  const colorTexto = esPeligro ? 'text-amber-700' : 'text-[#2651A3]';
  const iconoColor = esPeligro ? 'text-amber-500' : 'text-sky-500';

  return (
    <Sidebar collapsible="icon">
      
      <SidebarHeader className="pt-6 pb-4 px-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#2651A3] p-2 rounded-xl text-white shrink-0 shadow-md">
            <Stethoscope size={24} strokeWidth={2.5} />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-[#ffffff] group-data-[collapsible=icon]:hidden">
            DentaSync
          </span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <div className="px-4 py-4 mb-4 mx-2 flex items-center gap-4 group-data-[collapsible=icon]:hidden bg-white rounded-lg border border-gray-100 shadow-sm">
          
          {/* Círculo con Iniciales (Fondo azul principal, letras blancas para máximo contraste) */}
          <div className="w-14 h-14 rounded-full bg-[#2651A3] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-md">
            {obtenerIniciales(nombreUsuario)}
          </div>
          
          {/* Textos Apilados según tu imagen de referencia */}
          <div className="flex flex-col overflow-hidden justify-center">
            <span className="text-[11px] font-bold text-black uppercase tracking-widest mb-0.5">
              {formatearRol(user?.rol)}
            </span>
            <span className="text-xl font-bold text-black leading-tight truncate">
              {nombreUsuario}
            </span>
          </div>
        </div>

        <SidebarMenu className="px-2">
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
        
        {/* 🔥 TARJETA DE SUSCRIPCIÓN INTELIGENTE */}
        {user?.rol === 'TENANT_ADMIN' && (
          <Link href="/suscripcion" className="block transition-transform hover:-translate-y-1">
            <div className={`bg-gradient-to-br p-3 rounded-lg border shadow-sm hover:shadow-md cursor-pointer ${colorFondo}`}>
              <div className="flex items-center justify-between mb-2">
                <p className={`text-xs font-bold uppercase tracking-wider ${colorTexto}`}>
                  {esPeligro ? '¡Aviso de Pago!' : 'Suscripción'}
                </p>
                {esPeligro ? <AlertCircle className={`w-4 h-4 animate-pulse ${iconoColor}`} /> : <CreditCard className={`w-4 h-4 ${iconoColor}`} />}
              </div>
              
              <p className="text-sm font-bold text-slate-800 mb-1">
                {diasRestantes !== null 
                  ? (diasRestantes > 0 ? `Quedan ${diasRestantes} días` : '¡Servicio Vencido!') 
                  : 'Modo de Prueba'}
              </p>
              
              <p className="text-[10px] text-slate-600 leading-tight">
                {esPeligro 
                  ? 'Tu plan está por expirar. Haz clic para renovar y evitar bloqueos.' 
                  : 'Haz clic aquí para ver tus beneficios o renovar.'}
              </p>
            </div>
          </Link>
        )}

        <Button 
          variant="outline" 
          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100 flex gap-2 items-center justify-start transition-colors"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span className="font-semibold">Cerrar Sesión</span>
        </Button>
      </SidebarFooter>
      
    </Sidebar>
  )
}


