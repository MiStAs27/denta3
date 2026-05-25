import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import MainLayout from '@/components/layout/MainLayout'; // <-- Importamos el nuevo envoltorio

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
        
        {/* Aquí pasamos el contenido al envoltorio inteligente */}
        <MainLayout>
          {children}
        </MainLayout>

        <Toaster />
      </body>
    </html>
  );
}