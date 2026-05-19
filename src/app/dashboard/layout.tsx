import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ClinicSidebar } from "@/components/layout/ClinicSidebar"
import { Bell, Search, User, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <ClinicSidebar />
      <SidebarInset className="bg-background">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b bg-white/80 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4 flex-1">
            <SidebarTrigger />
            <div className="relative max-w-md w-full">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search patients, records..." 
                className="pl-8 bg-background border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20" 
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="text-muted-foreground relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-3 ml-2 border-l pl-5 cursor-pointer hover:bg-slate-50 p-2 rounded-lg transition-colors">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-foreground">Dr. Ricardo Lopez</p>
                    <p className="text-xs text-muted-foreground">Especialista</p>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <User size={20} />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/" className="text-red-600 flex items-center cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar sesión</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}