"use client"

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Facebook, Linkedin, Instagram, Mail, Award, Smile } from 'lucide-react'

export default function PaginaInicial() {
  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Hero Section (Dark Blue) */}
      <div className="bg-[#04112e] min-h-[90vh] flex flex-col relative overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-cyan-500/20 blur-[120px]"></div>
           <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/20 blur-[100px]"></div>
        </div>

        {/* Navegación */}
        <nav className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center">
            <div className="bg-transparent text-white">
              <span className="font-headline text-3xl font-bold tracking-tight flex items-center gap-1">
                Denta<span className="text-[#48B4D4] font-bold ">Sync</span>
              </span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-white/90">
            <Link href="#" className="hover:text-white border-b-2 border-[#d51375] pb-1">Inicio</Link>
            <Link href="#" className="hover:text-white transition-colors">Empresa</Link>
            <Link href="#" className="hover:text-white transition-colors">Contacto</Link>
          </div>

          <div className="flex items-center">
            <Link href="/login">
              <Button className="bg-[#0B7D99] hover:bg-[#0B7D99] text-white rounded-full px-6 py-5 text-sm md:text-base font-bold shadow-lg shadow-[#0B7D99]/20">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <main className="relative z-10 flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center pt-12 pb-20 gap-12">
          {/* Left Text */}
          <div className="flex-1 text-left pt-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-[1.15] tracking-tight mb-6 max-w-2xl">
              Sistema Completo de Gestión Clínica Inteligente
            </h1>
            <p className="text-lg md:text-xl text-blue-100/80 max-w-xl mb-10 leading-relaxed font-light">
              El único sistema dental impulsado por IA diseñado para la gestión integral de su clínica, agenda optimizada y operaciones de laboratorio.
            </p>
            <Link href="/login">
              <Button className="bg-[#0B7D99] hover:bg-[#0B7D99] text-white rounded-full px-8 py-6 text-lg font-bold shadow-lg shadow-[#0B7D99]/30">
                Leer Más
              </Button>
            </Link>
          </div>
          
          {/* Right Image */}
          <div className="flex-1 relative flex justify-center items-center w-full min-h-[400px] lg:min-h-[600px]">
            <div className="relative w-full max-w-[700px] aspect-square">
              <Image 
                src="/hero-tooth.png" 
                alt="3D Glowing Tooth" 
                fill 
                className="object-contain drop-shadow-[0_0_60px_rgba(0,255,255,0.2)]"
                priority
              />
            </div>
          </div>
        </main>
      </div>

      {/* Feature Cards Section (White) */}
      <section className="bg-white py-24 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto grid md:grid-cols-2 gap-8">
          {/* Card 1 */}
          <div className="bg-[#f8f9fa] rounded-none p-10 md:p-14 flex flex-col items-start">
            <div className="flex items-center gap-5 mb-8">
              <Award className="text-slate-700" size={48} strokeWidth={1.5} />
              <h3 className="text-2xl font-extrabold text-slate-800">Sistema de Recompensas para Clínicas</h3>
            </div>
            <p className="text-slate-600 leading-relaxed mb-12 flex-1 text-base">
              Un sistema de recompensas flexible que permite a los proveedores diseñar niveles de descuento personalizados o un programa de reembolso para dentistas y clínicas. Rastrea automáticamente las ventas, asegurando que los clientes reciban los descuentos adecuados según su actividad.
            </p>
            <Button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-full px-8 py-6 text-base font-bold shadow-md shadow-[#0ea5e9]/20">
              Ver Precios
            </Button>
          </div>

          {/* Card 2 */}
          <div className="bg-[#f8f9fa] rounded-none p-10 md:p-14 flex flex-col items-start">
            <div className="flex items-center gap-5 mb-8">
              <Smile className="text-slate-700" size={48} strokeWidth={1.5} />
              <h3 className="text-2xl font-extrabold text-slate-800">Pedidos de Alineadores Transparentes</h3>
            </div>
            <p className="text-slate-600 leading-relaxed mb-12 flex-1 text-base">
              DentaSync agiliza el proceso de planificación del tratamiento entregando los planes directamente al panel del usuario. Esto permite a los dentistas revisar y aprobar planes de tratamiento de forma conveniente, rápida y eficiente, garantizando un flujo de trabajo más fluido y una mejor atención al paciente.
            </p>
            <Button className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white rounded-full px-8 py-6 text-base font-bold shadow-md shadow-[#0ea5e9]/20">
              Ver Precios
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#06112a] py-16 px-8 flex flex-col items-center">
        <div className="flex gap-5 mb-10">
          <Link href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-all">
            <Facebook size={20} strokeWidth={1.5} />
          </Link>
          <Link href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-all">
            <Linkedin size={20} strokeWidth={1.5} />
          </Link>
          <Link href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-all">
            <Instagram size={20} strokeWidth={1.5} />
          </Link>
          <Link href="#" className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:bg-white/5 hover:text-white transition-all">
            <Mail size={20} strokeWidth={1.5} />
          </Link>
        </div>
        <p className="text-white/40 text-sm font-light tracking-wide">
          © {new Date().getFullYear()} DentaSync | Política de Privacidad
        </p>
      </footer>
    </div>
  )
}