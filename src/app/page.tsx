"use client"

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Stethoscope, ChevronRight, Sparkles, ShieldCheck, Zap } from 'lucide-react'

export default function PaginaInicial() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navegación */}
      <nav className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-lg text-white">
            <Stethoscope size={24} />
          </div>
          <span className="font-headline text-2xl font-bold tracking-tight text-primary">
            DentaSync
          </span>
        </div>
        <Link href="/dashboard">
          <Button variant="ghost">Entrar al Portal</Button>
        </Link>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="flex justify-center mb-6">
          <Badge className="bg-secondary/10 text-secondary border-secondary/20 px-4 py-1.5 rounded-full text-sm font-semibold">
            Plataforma Dental Impulsada por IA
          </Badge>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6">
          Optimice su Clínica con <span className="text-primary">Inteligencia Real</span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          La solución integral para la gestión de pacientes, agendas inteligentes y flujos de trabajo optimizados.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="h-14 px-8 text-lg font-bold gap-2 bg-primary text-white hover:bg-primary/90">
              Entrar al Sistema
              <ChevronRight size={20} />
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold">
            Solicitar Demo
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="p-8 rounded-3xl bg-slate-50 text-left border border-slate-100">
            <Zap className="text-primary mb-6" size={32} />
            <h3 className="text-xl font-bold mb-3 text-slate-900">Agenda Inteligente</h3>
            <p className="text-slate-600 leading-relaxed">Optimización automática de espacios vacíos.</p>
          </div>
          <div className="p-8 rounded-3xl bg-slate-50 text-left border border-slate-100">
            <Sparkles className="text-secondary mb-6" size={32} />
            <h3 className="text-xl font-bold mb-3 text-slate-900">Conserje IA</h3>
            <p className="text-slate-600 leading-relaxed">Atención 24/7 para sus pacientes mediante IA.</p>
          </div>
          <div className="p-8 rounded-3xl bg-slate-50 text-left border border-slate-100">
            <ShieldCheck className="text-blue-500 mb-6" size={32} />
            <h3 className="text-xl font-bold mb-3 text-slate-900">Seguridad Clínica</h3>
            <p className="text-slate-600 leading-relaxed">Fichas clínicas digitales y protegidas.</p>
          </div>
        </div>
      </main>
    </div>
  )
}