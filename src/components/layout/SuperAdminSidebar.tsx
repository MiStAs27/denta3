"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard,
  Users,
  Calendar,
  BrainCircuit,
  MessageSquare,
  Activity,
  Settings,
  Stethoscope,
  LogOut,
  CreditCard,
  Building2,
  Server,
  Wallet,
  BarChart3, // <-- AÑADIMOS EL ICONO PARA REPORTES
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { name: "Dashboard Global", href: "/super-admin", icon: Activity },
  {
    name: "Clínicas (Tenants)",
    href: "/super-admin/clinicas",
    icon: Building2,
  },
  {
    name: "Tarifas Globales",
    href: "/super-admin/suscripciones",
    icon: Activity,
    soloSuperAdmin: true,
  },
  {
    name: "Validar Pagos",
    href: "/super-admin/pagos",
    icon: Wallet,
    soloSuperAdmin: true,
  },
  // 👇 AÑADIMOS EL NUEVO MÓDULO AQUÍ 👇
  {
    name: "Informes y Reportes",
    href: "/super-admin/reportes",
    icon: BarChart3,
    soloSuperAdmin: true,
  },
  { name: "Servidores", href: "/super-admin/servidor", icon: Server },
  {
    name: "Ajustes del Sistema",
    href: "/super-admin/settings",
    icon: Settings,
  },
];

export function SuperAdminSidebar() {
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      className="border-r-slate-800 bg-slate-950 text-slate-300"
    >
      <SidebarHeader className="py-6 px-4 bg-slate-950">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500/20 p-2 rounded-lg text-emerald-400 shrink-0 border border-emerald-500/30">
            <Server size={24} strokeWidth={2.5} />
          </div>
          <span className="font-headline text-xl font-bold tracking-tight text-white group-data-[collapsible=icon]:hidden">
            SaaS Central
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-slate-950">
        <SidebarMenu className="px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.name}
                  className={
                    isActive
                      ? "bg-slate-800 text-emerald-400 hover:bg-slate-800 hover:text-emerald-400"
                      : "hover:bg-slate-800 hover:text-white"
                  }
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 flex flex-col gap-4 bg-slate-950 group-data-[collapsible=icon]:hidden">
        <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
          <p className="text-xs text-slate-400 font-medium">
            Estado de los Servidores
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <p className="text-[10px] text-emerald-400">
              Todos los servicios en línea
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full text-slate-400 hover:text-white hover:bg-red-500/20 border-slate-800 hover:border-red-500/30 flex gap-2 items-center justify-start bg-slate-900"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}