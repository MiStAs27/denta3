"use client";

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { ClinicSidebar } from '@/components/layout/ClinicSidebar';
import { SuperAdminSidebar } from '@/components/layout/SuperAdminSidebar'; // <-- Importamos la nueva barra
import { AuthProvider } from '@/context/AuthContext'; 

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const rutasPublicas = ['/', '/login'];
  const esRutaPublica = rutasPublicas.includes(pathname);
  
  // Detectamos si el usuario está en la zona del Super Admin
  const esSuperAdmin = pathname.startsWith('/super-admin');

  // Si es la página web pública o el Login, no renderizamos ninguna barra
  if (esRutaPublica) {
    return (
      <AuthProvider>
        <main className="flex min-h-screen w-full">{children}</main>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <SidebarProvider>
        
        {/* INTERCAMBIADOR MAGNÉTICO DE BARRAS LATERALES */}
        {esSuperAdmin ? <SuperAdminSidebar /> : <ClinicSidebar />}
        
        {/* El contenido central cambiará su color de fondo si es SaaS (Oscuro) o Clínica (Claro) */}
        <SidebarInset className={`flex w-full flex-col ${esSuperAdmin ? 'bg-[#0F172A]' : 'bg-[#F5F8FA]'}`}>
          
          {/* BARRA SUPERIOR PARA CELULARES (Se adapta al modo oscuro automáticamente) */}
          <header className={`flex md:hidden h-14 items-center gap-4 border-b px-4 shadow-sm shrink-0 ${esSuperAdmin ? 'bg-slate-950 border-slate-800' : 'bg-white'}`}>
            <SidebarTrigger className={esSuperAdmin ? "text-emerald-400" : "text-[#2651A3]"} />
            <span className={`font-bold ${esSuperAdmin ? 'text-white' : 'text-[#2651A3]'}`}>
              {esSuperAdmin ? 'SaaS Control' : 'DentaSync'}
            </span>
          </header>

          <main className="flex-1 overflow-auto">
            {children}
          </main>
          
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}