"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Mail, ChevronLeft } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate authentication and automatic role detection
    setTimeout(() => {
      setIsLoading(false)
      // Redirect to dashboard (in a real app, this would depend on the user's role)
      router.push('/dashboard')
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-[#04112e] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-cyan-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link href="/" className="inline-flex items-center text-white/70 hover:text-white mb-6 text-sm transition-colors">
          <ChevronLeft size={16} className="mr-1" />
          Volver al inicio
        </Link>
        
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-transparent text-white">
            <span className="font-headline text-4xl font-bold tracking-tight flex items-center gap-1">
              denta<span className="text-[#d51375] font-light">sync</span>
            </span>
          </div>
        </div>

        <Card className="border-white/10 bg-white shadow-2xl backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl text-center font-bold text-slate-900">Iniciar Sesión</CardTitle>
            <CardDescription className="text-center text-slate-500">
              Ingresa tus credenciales para acceder a la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    placeholder="ejemplo@correo.com" 
                    className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-[#d51375]" 
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-slate-700">Contraseña</Label>
                  <Link href="#" className="text-xs text-[#d51375] hover:underline">
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••"
                    className="pl-9 bg-slate-50 border-slate-200 focus-visible:ring-[#d51375]" 
                    required 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#d51375] hover:bg-[#b00f60] text-white mt-6 h-12 text-base font-bold shadow-md shadow-[#d51375]/20" 
                disabled={isLoading}
              >
                {isLoading ? "Ingresando..." : "Entrar a DentaSync"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-slate-100 pt-6 pb-6">
            <p className="text-sm text-slate-500">
              ¿No tienes cuenta? <Link href="#" className="text-[#d51375] hover:underline font-semibold">Regístrate o solicita acceso</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
