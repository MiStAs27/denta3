"use client"

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BrainCircuit, 
  MessageSquare, 
  Activity, 
  Settings,
  Stethoscope
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter
} from '@/components/ui/sidebar'

const NAV_ITEMS = [
  { name: 'Vista General', href: '/tablero', icon: LayoutDashboard },
  { name: 'Agenda', href: '/agenda', icon: Calendar },
  { name: 'Pacientes', href: '/pacientes', icon: Users },
  { name: 'Optimizador IA', href: '/optimizador-ia', icon: BrainCircuit },
  { name: 'Conserje IA', href: '/conserje', icon: MessageSquare },
  { name: 'Analíticas', href: '/analiticas', icon: Activity },
  { name: 'Configuración', href: '/ajustes', icon: Settings },
]

export function ClinicSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="py-6 px-4">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-lg text-primary shrink-0">
            <Stethoscope size={24} strokeWidth={2.5} />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight text-white group-data-[collapsible=icon]:hidden">
            DentaSync
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2">
          {NAV_ITEMS.map((item) => (
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
      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <div className="bg-primary/20 p-3 rounded-lg border border-primary-foreground/10">
          <p className="text-xs text-primary-foreground/80 font-medium">Plan Gratuito</p>
          <div className="mt-2 h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-secondary w-2/3" />
          </div>
          <p className="text-[10px] mt-1 text-primary-foreground/60 text-right">650 / 1000 pacientes</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
