import React from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col w-full h-full">
      {/* Si más adelante quieres agregar un "Header" superior,
        notificaciones o migas de pan (breadcrumbs), puedes ponerlos aquí arriba.
      */}
      
      {/* Este {children} renderizará page.tsx del dashboard */}
      {children}
    </div>
  )
}