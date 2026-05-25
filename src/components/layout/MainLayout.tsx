"use client";

import { usePathname } from 'next/navigation';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { ClinicSidebar } from '@/components/layout/ClinicSidebar';
import { AuthProvider } from '@/context/AuthContext'; // <-- Importamos el guardia

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const rutasSinSidebar = ['/', '/login'];
  const ocultarSidebar = rutasSinSidebar.includes(pathname);

  if (ocultarSidebar) {
    return (
      <AuthProvider> {/* <-- Protegemos las rutas públicas también */}
        <main className="flex min-h-screen w-full bg-white">{children}</main>
      </AuthProvider>
    );
  }

  return (
    <AuthProvider> {/* <-- Protegemos todo el sistema interno */}
      <SidebarProvider>
        <ClinicSidebar />
        <SidebarInset className="flex w-full flex-col bg-[#F5F8FA]">
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </AuthProvider>
  );
}