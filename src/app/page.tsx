"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    // Agregamos w-full y overflow-x-hidden aquí para evitar el hueco blanco a la derecha
    <div className="antialiased selection:bg-sky-500 selection:text-white text-slate-700 bg-white w-full overflow-x-hidden">
      
      {/* NAVBAR */}
      {/* Agregué border-slate-100 por defecto para que se separe limpiamente del fondo azul */}
      <nav className={`fixed w-full top-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md border-b ${isScrolled ? 'border-slate-200 shadow-md' : 'border-slate-100'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Logo */}
            <a href="#inicio" onClick={(e) => scrollToSection(e, 'inicio')} className="flex-shrink-0 flex items-center cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <span className="text-white font-bold text-lg tracking-wider">DS</span>
              </div>
              <span className="ml-3 text-2xl font-bold text-slate-800 tracking-tight">Denta<span className="text-sky-500">Sync</span></span>
            </a>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#inicio" onClick={(e) => scrollToSection(e, 'inicio')} className="text-slate-600 hover:text-sky-600 font-medium transition-colors">Inicio</a>
              <a href="#funciones" onClick={(e) => scrollToSection(e, 'funciones')} className="text-slate-600 hover:text-sky-600 font-medium transition-colors">Funciones</a>
              <a href="#novedades" onClick={(e) => scrollToSection(e, 'novedades')} className="text-slate-600 hover:text-sky-600 font-medium transition-colors">Novedades</a>
              <a href="#planes" onClick={(e) => scrollToSection(e, 'planes')} className="text-slate-600 hover:text-sky-600 font-medium transition-colors">Planes</a>
              <a href="#opiniones" onClick={(e) => scrollToSection(e, 'opiniones')} className="text-slate-600 hover:text-sky-600 font-medium transition-colors">Opiniones</a>
              <a href="#contacto" onClick={(e) => scrollToSection(e, 'contacto')} className="text-slate-600 hover:text-sky-600 font-medium transition-colors">Contacto</a>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link href="/registro" className="text-sky-600 border-2 border-sky-600 hover:bg-sky-600 hover:text-white px-6 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200">
                Crear cuenta
              </Link>
              <Link href="/login" className="bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5">
                Iniciar Sesión
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-slate-600 hover:text-sky-600 focus:outline-none p-2">
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 absolute w-full shadow-lg">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <a href="#inicio" onClick={(e) => scrollToSection(e, 'inicio')} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50">Inicio</a>
              <a href="#funciones" onClick={(e) => scrollToSection(e, 'funciones')} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50">Funciones</a>
              <a href="#novedades" onClick={(e) => scrollToSection(e, 'novedades')} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50">Novedades</a>
              <a href="#planes" onClick={(e) => scrollToSection(e, 'planes')} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50">Planes</a>
              <a href="#opiniones" onClick={(e) => scrollToSection(e, 'opiniones')} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50">Opiniones</a>
              <a href="#contacto" onClick={(e) => scrollToSection(e, 'contacto')} className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50">Contacto</a>
              <div className="mt-4 px-3 space-y-3">
                <Link href="/registro" className="block w-full text-center text-sky-600 border-2 border-sky-600 hover:bg-slate-50 px-6 py-3 rounded-lg font-semibold shadow-sm">
                  Crear cuenta
                </Link>
                <Link href="/login" className="block w-full text-center bg-gradient-to-r from-sky-600 to-sky-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md">
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      {/* Cambié el bg-gradient a "to-b" (de arriba a abajo) usando from-sky-100 para que el azul inicie pegado al menú */}
      <div id="inicio" className="relative w-full pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-sky-100 via-white to-sky-50">
        {/* Background Blur Circles */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            
            {/* Left Column */}
            <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
                Gestiona tu <br className="hidden lg:block"/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-sky-500">consultorio dental</span> <br className="hidden lg:block"/>
                con inteligencia
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                DentaSync centraliza tu agenda, pacientes y expedientes clínicos en una plataforma moderna, segura y fácil de usar. Dedica más tiempo a lo que importa: tus pacientes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-5">
                <Link href="/registro" className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-sky-600 to-sky-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-sky-600/30 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center text-center">
                  Comenzar Gratis
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                </Link>
                <a href="#funciones" onClick={(e) => scrollToSection(e, 'funciones')} className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold text-lg hover:border-sky-500 hover:text-sky-500 transition-all duration-300 flex items-center justify-center shadow-sm">
                  Ver Funciones
                </a>
              </div>
            </div>

            {/* Right Column (Dashboard Mockup) */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-2xl bg-white shadow-2xl overflow-hidden border border-slate-100 transform lg:rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
                {/* Mac OS Top Bar */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-3 border-b border-slate-200 flex items-center">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  </div>
                  <div className="mx-auto text-xs font-semibold text-slate-500 tracking-wide">DentaSync — Panel Principal</div>
                </div>
                
                {/* Dashboard Content */}
                <div className="p-6 bg-slate-50/50">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                      <div className="text-2xl font-bold text-sky-500 mb-1">12</div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Citas hoy</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                      <div className="text-2xl font-bold text-emerald-500 mb-1">384</div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pacientes</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                      <div className="text-2xl font-bold text-amber-500 mb-1">5</div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Pendientes</div>
                    </div>
                  </div>
                  
                  {/* Appointments List */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Próximas Citas</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50 border border-sky-100">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-sky-600 font-bold shadow-sm text-sm">09:00</div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-800">María González</div>
                            <div className="text-xs text-slate-500">Limpieza dental</div>
                          </div>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-700 font-bold shadow-sm text-sm">10:30</div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-800">Juan Pérez</div>
                            <div className="text-xs text-slate-500">Ortodoncia</div>
                          </div>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN ESTADÍSTICAS */}
      <div className="bg-white border-y border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
            <div>
              <div className="text-4xl font-extrabold text-sky-600 mb-2">100%</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Digital</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-sky-600 mb-2">24/7</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Acceso al sistema</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-sky-600 mb-2">99.9%</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Disponibilidad</div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-sky-600 mb-2">1 click</div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Para agendar</div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN FUNCIONALIDADES */}
      <section id="funciones" className="py-24 bg-white relative">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-lg text-sky-500 font-bold tracking-wide uppercase mb-3">Todo en un solo lugar</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Funcionalidades diseñadas para ti</h3>
            <p className="text-lg text-slate-600">Desde la primera cita hasta el seguimiento post-tratamiento, DentaSync automatiza el flujo de trabajo de tu clínica.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full items-stretch">
            {/* Feature 1 */}
            <div className="w-full bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-sky-500/50 transition-all duration-300 group flex flex-col justify-start">
              <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Agenda y Citas</h4>
              <p className="text-sm text-slate-600 leading-relaxed">Gestiona citas de forma eficiente, evitando traslapes y optimizando los tiempos muertos en tu clínica con recordatorios automáticos.</p>
            </div>
            {/* Feature 2 */}
            <div className="w-full bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-sky-500/50 transition-all duration-300 group flex flex-col justify-start">
              <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  <line x1="9" y1="14" x2="15" y2="14"></line>
                  <line x1="9" y1="18" x2="13" y2="18"></line>
                  <line x1="9" y1="10" x2="15" y2="10"></line>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Expedientes Clínicos</h4>
              <p className="text-sm text-slate-600 leading-relaxed">Odontograma digital, diagnósticos precisos, planes de tratamiento y almacenamiento seguro de radiografías en la nube.</p>
            </div>
            {/* Feature 3 */}
            <div className="w-full bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-sky-500/50 transition-all duration-300 group flex flex-col justify-start">
              <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <svg width="22" height="22" viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-sky-500">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">Recordatorios Automáticos</h4>
              <p className="text-sm text-slate-600 leading-relaxed">Envía notificaciones automáticas y alertas personalizadas para reducir ausencias y mantener comunicación activa con tus pacientes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN PLANES (#planes) */}
      <section id="planes" className="py-24 bg-slate-50 relative border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base text-sky-500 font-bold tracking-wide uppercase mb-3">Precios</h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">Planes transparentes</h3>
            <p className="text-lg text-slate-600">Elige el plan que mejor se adapte al tamaño de tu clínica.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Plan Básico */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <h4 className="text-xl font-bold text-slate-800 mb-2">Gratuito</h4>
              <div className="text-4xl font-extrabold text-slate-900 mb-6">0 Bs.<span className="text-lg font-medium text-slate-500">/mes</span></div>
              <ul className="space-y-4 mb-8 text-slate-600">
                <li className="flex items-start"><svg className="w-5 h-5 text-sky-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 1 consultorio en simultáneo</li>
                <li className="flex items-start"><svg className="w-5 h-5 text-sky-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Límite de 10 pacientes activos</li>
              </ul>
              <Link href="/registro" className="block w-full py-3 px-4 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-xl font-bold transition-colors text-center">
                Comenzar Ya
              </Link>
            </div>

            {/* Plan Pro */}
            <div className="bg-white p-8 rounded-2xl border-2 border-sky-600 shadow-xl relative transform md:-translate-y-4 transition-all duration-300 hover:-translate-y-6">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-sky-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                Más Popular
              </div>
              <h4 className="text-xl font-bold text-sky-600 mb-2">Básico</h4>
              <div className="text-4xl font-extrabold text-slate-900 mb-6">199 Bs.<span className="text-lg font-medium text-slate-500">/mes</span></div>
              <ul className="space-y-4 mb-8 text-slate-600">
                <li className="flex items-start"><svg className="w-5 h-5 text-sky-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 2 consultorios simultáneos</li>
                <li className="flex items-start"><svg className="w-5 h-5 text-sky-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Hasta 80 pacientes</li>
                <li className="flex items-start"><svg className="w-5 h-5 text-sky-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Presupuestos y reportes</li>
              </ul>
              <Link href="/registro" className="block w-full py-3 px-4 bg-sky-600 text-white hover:bg-sky-700 rounded-xl font-bold transition-colors shadow-md text-center">
                Adquirir Plan
              </Link>
            </div>

            {/* Plan Avanzado */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
              <h4 className="text-xl font-bold text-slate-800 mb-2">Avanzado</h4>
              <div className="text-4xl font-extrabold text-slate-900 mb-6">499 Bs.<span className="text-lg font-medium text-slate-500">/mes</span></div>
              <ul className="space-y-4 mb-8 text-slate-600">
                <li className="flex items-start"><svg className="w-5 h-5 text-sky-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> 4 consultorios simultáneos</li>
                <li className="flex items-start"><svg className="w-5 h-5 text-sky-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg> Hasta 300 pacientes</li>
              </ul>
              <Link href="/registro" className="block w-full py-3 px-4 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-xl font-bold transition-colors text-center">
                Adquirir Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center border-t border-slate-800 pt-8">
            <p className="text-slate-500 text-sm mb-4 md:mb-0">
              &copy; 2026 DentaSync. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6">
              <span className="text-slate-500 hover:text-white text-sm transition-colors cursor-pointer">Privacidad</span>
              <span className="text-slate-500 hover:text-white text-sm transition-colors cursor-pointer">Términos de Servicio</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}