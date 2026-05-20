import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
// 1. Importamos el proveedor y el contenedor de la barra lateral
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
// 2. Importamos tu componente de la barra lateral
import { ClinicSidebar } from '@/components/layout/ClinicSidebar';

export const metadata: Metadata = {
  title: 'DentaSync',
  description: 'Plataforma de Optimización de Clínicas Dentales Impulsada por IA',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon.svg" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased selection:bg-primary/10 selection:text-primary">
        
        {/* 3. Envolvemos toda la app con el SidebarProvider */}
        <SidebarProvider>
          {/* Tu barra lateral fija */}
          <ClinicSidebar />
          
          {/* SidebarInset asegura que el contenido de la derecha (children) no se pise con la barra */}
          <SidebarInset className="flex w-full flex-col bg-[#F5F8FA]">
            {/* Aquí es donde cambiarán las páginas (Pacientes, Agenda, etc.) */}
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>

        <Toaster />
      </body>
    </html>
  );
}