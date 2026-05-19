import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { ClinicSidebar } from "@/components/layout/ClinicSidebar"
import { Bell, Search, User } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
            <div className="flex items-center gap-3 ml-2 border-l pl-5">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">Dr. Ricardo Lopez</p>
                <p className="text-xs text-muted-foreground">Especialista</p>
              </div>
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                <User size={20} />
              </div>
            </div>
          </div>
        </header>
        <main className="p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}