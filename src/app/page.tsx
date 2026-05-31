"use client";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [precios, setPrecios] = useState({
    mes1: 150,
    mes3: 400,
    mes6: 750,
    mes12: 1400,
  });
  const [cargandoPrecios, setCargandoPrecios] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const cargarPrecios = async () => {
      try {
        const docRef = doc(db, "configuracion", "suscripciones");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setPrecios({
            mes1: data.mes1 || 150,
            mes3: data.mes3 || 400,
            mes6: data.mes6 || 750,
            mes12: data.mes12 || 1400,
          });
        }
      } catch (error) {
        console.error("Error al cargar precios:", error);
      } finally {
        setCargandoPrecios(false);
      }
    };

    cargarPrecios();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (
    e: React.MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    // Agregamos w-full y overflow-x-hidden aquí para evitar el hueco blanco a la derecha
    <div className="antialiased selection:bg-sky-500 selection:text-white text-slate-700 bg-white w-full overflow-x-hidden">
      {/* NAVBAR */}
      {/* Agregué border-slate-100 por defecto para que se separe limpiamente del fondo azul */}
      <nav
        className={`fixed w-full top-0 z-50 transition-all duration-300 bg-white/95 backdrop-blur-md border-b ${isScrolled ? "border-slate-200 shadow-md" : "border-slate-100"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <a
              href="#inicio"
              onClick={(e) => scrollToSection(e, "inicio")}
              className="flex-shrink-0 flex items-center cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-600 to-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
                <span className="text-white font-bold text-lg tracking-wider">
                  DS
                </span>
              </div>
              <span className="ml-3 text-2xl font-bold text-slate-800 tracking-tight">
                Denta<span className="text-sky-500">Sync</span>
              </span>
            </a>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#inicio"
                onClick={(e) => scrollToSection(e, "inicio")}
                className="text-slate-600 hover:text-sky-600 font-medium transition-colors"
              >
                Inicio
              </a>
              <a
                href="#funciones"
                onClick={(e) => scrollToSection(e, "funciones")}
                className="text-slate-600 hover:text-sky-600 font-medium transition-colors"
              >
                Funciones
              </a>
              <a
                href="#novedades"
                onClick={(e) => scrollToSection(e, "novedades")}
                className="text-slate-600 hover:text-sky-600 font-medium transition-colors"
              >
                Novedades
              </a>
              <a
                href="#planes"
                onClick={(e) => scrollToSection(e, "planes")}
                className="text-slate-600 hover:text-sky-600 font-medium transition-colors"
              >
                Planes
              </a>
              <a
                href="#opiniones"
                onClick={(e) => scrollToSection(e, "opiniones")}
                className="text-slate-600 hover:text-sky-600 font-medium transition-colors"
              >
                Opiniones
              </a>
              <a
                href="#contacto"
                onClick={(e) => scrollToSection(e, "contacto")}
                className="text-slate-600 hover:text-sky-600 font-medium transition-colors"
              >
                Contacto
              </a>
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                href="/login"
                className="bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-700 hover:to-sky-600 text-white px-6 py-2.5 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
              >
                Iniciar Sesión
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-slate-600 hover:text-sky-600 focus:outline-none p-2"
              >
                <svg
                  className="h-7 w-7"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d={
                      isMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 absolute w-full shadow-lg">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <a
                href="#inicio"
                onClick={(e) => scrollToSection(e, "inicio")}
                className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50"
              >
                Inicio
              </a>
              <a
                href="#funciones"
                onClick={(e) => scrollToSection(e, "funciones")}
                className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50"
              >
                Funciones
              </a>
              <a
                href="#novedades"
                onClick={(e) => scrollToSection(e, "novedades")}
                className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50"
              >
                Novedades
              </a>
              <a
                href="#planes"
                onClick={(e) => scrollToSection(e, "planes")}
                className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50"
              >
                Planes
              </a>
              <a
                href="#opiniones"
                onClick={(e) => scrollToSection(e, "opiniones")}
                className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50"
              >
                Opiniones
              </a>
              <a
                href="#contacto"
                onClick={(e) => scrollToSection(e, "contacto")}
                className="block px-3 py-3 rounded-md text-base font-medium text-slate-700 hover:text-sky-600 hover:bg-slate-50"
              >
                Contacto
              </a>
              <div className="mt-4 px-3 space-y-3">
                <Link
                  href="/registro"
                  className="block w-full text-center text-sky-600 border-2 border-sky-600 hover:bg-slate-50 px-6 py-3 rounded-lg font-semibold shadow-sm"
                >
                  Crear cuenta
                </Link>
                <Link
                  href="/login"
                  className="block w-full text-center bg-gradient-to-r from-sky-600 to-sky-500 text-white px-6 py-3 rounded-lg font-semibold shadow-md"
                >
                  Iniciar Sesión
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      {/* Cambié el bg-gradient a "to-b" (de arriba a abajo) usando from-sky-100 para que el azul inicie pegado al menú */}
      <div
        id="inicio"
        className="relative w-full pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden bg-gradient-to-b from-sky-100 via-white to-sky-50"
      >
        {/* Background Blur Circles */}
        <div className="absolute top-20 left-0 w-72 h-72 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            {/* Left Column */}
            <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6 tracking-tight">
                Gestiona tu <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-sky-500">
                  consultorio dental
                </span>{" "}
                <br className="hidden lg:block" />
                con inteligencia
              </h1>
              <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                DentaSync centraliza tu agenda, pacientes y expedientes clínicos
                en una plataforma moderna, segura y fácil de usar. Dedica más
                tiempo a lo que importa: tus pacientes.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-5">
                  <a
                    href="#planes"
                    onClick={(e) => scrollToSection(e, "planes")}
                    className="w-full sm:w-auto px-8 py-4 bg-blue-500 text-white border-2 border-blue-500 rounded-xl font-bold text-lg hover:border-sky-500 hover:text-sky-500 transition-all duration-300 flex items-center justify-center shadow-sm"
                  >Comenzar Ahora</a>
                  <svg
                    className="w-5 h-5 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    ></path>
                  </svg>
                <a
                  href="#funciones"
                  onClick={(e) => scrollToSection(e, "funciones")}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-slate-700 border-2 border-slate-200 rounded-xl font-bold text-lg hover:border-sky-500 hover:text-sky-500 transition-all duration-300 flex items-center justify-center shadow-sm"
                >
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
                  <div className="mx-auto text-xs font-semibold text-slate-500 tracking-wide">
                    DentaSync — Panel Principal
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 bg-slate-50/50">
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                      <div className="text-2xl font-bold text-sky-500 mb-1">
                        12
                      </div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Citas hoy
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                      <div className="text-2xl font-bold text-emerald-500 mb-1">
                        384
                      </div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Pacientes
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 text-center">
                      <div className="text-2xl font-bold text-amber-500 mb-1">
                        5
                      </div>
                      <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Pendientes
                      </div>
                    </div>
                  </div>

                  {/* Appointments List */}
                  <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                      Próximas Citas
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50 border border-sky-100">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-sky-600 font-bold shadow-sm text-sm">
                            09:00
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-800">
                              María González
                            </div>
                            <div className="text-xs text-slate-500">
                              Limpieza dental
                            </div>
                          </div>
                        </div>
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-slate-700 font-bold shadow-sm text-sm">
                            10:30
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-slate-800">
                              Juan Pérez
                            </div>
                            <div className="text-xs text-slate-500">
                              Ortodoncia
                            </div>
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
              <div className="text-4xl font-extrabold text-sky-600 mb-2">
                100%
              </div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Digital
              </div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-sky-600 mb-2">
                24/7
              </div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Acceso al sistema
              </div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-sky-600 mb-2">
                99.9%
              </div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Disponibilidad
              </div>
            </div>
            <div>
              <div className="text-4xl font-extrabold text-sky-600 mb-2">
                1 click
              </div>
              <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                Para agendar
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN FUNCIONALIDADES */}
      <section id="funciones" className="py-24 bg-white relative">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-lg text-sky-500 font-bold tracking-wide uppercase mb-3">
              Todo en un solo lugar
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
              Funcionalidades diseñadas para ti
            </h3>
            <p className="text-lg text-slate-600">
              Desde la primera cita hasta el seguimiento post-tratamiento,
              DentaSync automatiza el flujo de trabajo de tu clínica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 w-full items-stretch">
            {/* Feature 1 */}
            <div className="w-full bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-sky-500/50 transition-all duration-300 group flex flex-col justify-start">
              <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-sky-500"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">
                Agenda y Citas
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Gestiona citas de forma eficiente, evitando traslapes y
                optimizando los tiempos muertos en tu clínica con recordatorios
                automáticos.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="w-full bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-sky-500/50 transition-all duration-300 group flex flex-col justify-start">
              <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-sky-500"
                >
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                  <line x1="9" y1="14" x2="15" y2="14"></line>
                  <line x1="9" y1="18" x2="13" y2="18"></line>
                  <line x1="9" y1="10" x2="15" y2="10"></line>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">
                Expedientes Clínicos
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Odontograma digital, diagnósticos precisos, planes de
                tratamiento y almacenamiento seguro de radiografías en la nube.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="w-full bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-sky-500/50 transition-all duration-300 group flex flex-col justify-start">
              <div className="w-14 h-14 bg-sky-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-sky-500"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3">
                Recordatorios Automáticos
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Envía notificaciones automáticas y alertas personalizadas para
                reducir ausencias y mantener comunicación activa con tus
                pacientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN PLANES (#planes) */}
      <section
        id="planes"
        className="py-24 bg-slate-50 relative border-t border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base text-sky-500 font-bold tracking-wide uppercase mb-3">
              Precios DentaSync
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
              Ahorra más comprometiéndote
            </h3>
            <p className="text-lg text-slate-600">
              Disfruta de funciones ilimitadas con nuestros planes por tiempo. A
              mayor tiempo, mayor descuento.
            </p>
          </div>

          {cargandoPrecios ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
              {/* PLAN 1 MES */}
              <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <h4 className="text-xl font-bold text-slate-800 mb-2">
                  Mensual
                </h4>
                <div className="text-3xl font-extrabold text-slate-900 mb-6">
                  {precios.mes1} Bs.
                </div>
                <ul className="space-y-4 mb-8 text-slate-600 text-sm">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-sky-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>{" "}
                    Acceso total al sistema
                  </li>
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-sky-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>{" "}
                    Soporte técnico
                  </li>
                </ul>
                <Link
                  href="/registro"
                  className="block w-full py-3 px-4 bg-sky-50 text-sky-600 hover:bg-sky-100 rounded-xl font-bold transition-colors text-center"
                >
                  Elegir Plan
                </Link>
              </div>

              {/* PLAN 3 MESES */}
              <div className="bg-white p-8 rounded-2xl border-2 border-sky-400 shadow-md relative transition-all duration-300 hover:-translate-y-2">
                <h4 className="text-xl font-bold text-sky-600 mb-2">
                  Trimestral
                </h4>
                <div className="text-3xl font-extrabold text-slate-900 mb-6">
                  {precios.mes3} Bs.
                </div>
                <ul className="space-y-4 mb-8 text-slate-600 text-sm">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-sky-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>{" "}
                    3 meses de servicio
                  </li>
                </ul>
                <Link
                  href="/registro"
                  className="block w-full py-3 px-4 bg-sky-600 text-white hover:bg-sky-700 rounded-xl font-bold transition-colors shadow-md text-center"
                >
                  Elegir Plan
                </Link>
              </div>

              {/* PLAN 6 MESES */}
              <div className="bg-white p-8 rounded-2xl border-2 border-purple-500 shadow-xl relative transform md:-translate-y-4 transition-all duration-300 hover:-translate-y-6">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                  Mejor Valor
                </div>
                <h4 className="text-xl font-bold text-purple-600 mb-2">
                  Semestral
                </h4>
                <div className="text-3xl font-extrabold text-slate-900 mb-6">
                  {precios.mes6} Bs.
                </div>
                <ul className="space-y-4 mb-8 text-slate-600 text-sm">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-purple-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>{" "}
                    6 meses de servicio
                  </li>
                </ul>
                <Link
                  href="/registro"
                  className="block w-full py-3 px-4 bg-purple-600 text-white hover:bg-purple-700 rounded-xl font-bold transition-colors shadow-md text-center"
                >
                  Elegir Plan
                </Link>
              </div>

              {/* PLAN 1 AÑO */}
              <div className="bg-white p-8 rounded-2xl border border-emerald-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <h4 className="text-xl font-bold text-emerald-600 mb-2">
                  Anual
                </h4>
                <div className="text-3xl font-extrabold text-slate-900 mb-6">
                  {precios.mes12} Bs.
                </div>
                <ul className="space-y-4 mb-8 text-slate-600 text-sm">
                  <li className="flex items-start">
                    <svg
                      className="w-5 h-5 text-emerald-500 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 13l4 4L19 7"
                      ></path>
                    </svg>{" "}
                    12 meses de servicio
                  </li>
                </ul>
                <Link
                  href="/registro"
                  className="block w-full py-3 px-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold transition-colors text-center"
                >
                  Elegir Plan
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
      {/* SECCIÓN OPINIONES (#opiniones) */}
      <section
        id="opiniones"
        className="py-24 bg-white relative border-t border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base text-sky-500 font-bold tracking-wide uppercase mb-3">
              Casos de Éxito
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
              Lo que dicen nuestros colegas
            </h3>
            <p className="text-lg text-slate-600">
              Únete a los profesionales que ya han modernizado la gestión de sus
              consultorios con DentaSync.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonio 1 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm relative hover:shadow-md transition-all duration-300">
              {/* Icono de comillas de fondo */}
              <div className="absolute top-6 right-6 text-sky-100">
                <svg
                  width="40"
                  height="40"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <div className="flex space-x-1 mb-4 text-amber-400">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                {/* Repetir 4 veces más para 5 estrellas... */}
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <p className="text-slate-600 italic mb-6 relative z-10 text-sm leading-relaxed">
                "Antes de DentaSync, perder historias clínicas en papel era mi
                dolor de cabeza diario. Ahora, con el odontograma digital y los
                reportes, ahorro al menos 2 horas diarias de trabajo
                administrativo."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 font-bold text-lg">
                  CM
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Dr. Carlos Mendoza
                  </h4>
                  <p className="text-xs text-slate-500">Odontólogo General</p>
                </div>
              </div>
            </div>

            {/* Testimonio 2 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm relative hover:shadow-md transition-all duration-300">
              <div className="absolute top-6 right-6 text-sky-100">
                <svg
                  width="40"
                  height="40"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <div className="flex space-x-1 mb-4 text-amber-400">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                {/* (x4 más) */}
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <p className="text-slate-600 italic mb-6 relative z-10 text-sm leading-relaxed">
                "Tengo dos consultorios y administrar ambos era un caos. Con
                este software en la nube puedo ver la agenda de mis dos
                secretarias y los ingresos totales desde mi teléfono."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
                  AL
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Dra. Ana López
                  </h4>
                  <p className="text-xs text-slate-500">Directora de Clínica</p>
                </div>
              </div>
            </div>

            {/* Testimonio 3 */}
            <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 shadow-sm relative hover:shadow-md transition-all duration-300">
              <div className="absolute top-6 right-6 text-sky-100">
                <svg
                  width="40"
                  height="40"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <div className="flex space-x-1 mb-4 text-amber-400">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                {/* (x4 más) */}
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
              </div>
              <p className="text-slate-600 italic mb-6 relative z-10 text-sm leading-relaxed">
                "Lo que más me gusta es lo fácil que es de usar. No necesité
                manuales ni capacitaciones complejas para que mi secretaria
                empezara a registrar los pagos de los pacientes."
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-lg">
                  RF
                </div>
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">
                    Dr. Roberto Fernández
                  </h4>
                  <p className="text-xs text-slate-500">Ortodoncista</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN CONTACTO (#contacto) */}
      <section
        id="contacto"
        className="py-24 bg-slate-50 relative border-t border-slate-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-base text-sky-500 font-bold tracking-wide uppercase mb-3">
              Contacto
            </h2>
            <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
              ¿Tienes dudas? Hablemos
            </h3>
            <p className="text-lg text-slate-600">
              Nuestro equipo está listo para ayudarte a dar el siguiente paso en
              la digitalización de tu consultorio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 max-w-5xl mx-auto">
            {/* Panel de Información de Contacto */}
            <div className="bg-gradient-to-br from-sky-600 to-sky-800 p-10 md:p-12 text-white flex flex-col justify-between">
              <div>
                <h4 className="text-2xl font-bold mb-6">
                  Información de Contacto
                </h4>
                <p className="text-sky-100 mb-10 leading-relaxed">
                  Escríbenos y nuestro equipo se comunicará contigo lo antes
                  posible para agendar una demostración en vivo de DentaSync.
                </p>

                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-sky-500/30 rounded-full flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        ></path>
                      </svg>
                    </div>
                    <span className="font-medium">ventas@dentasync.com</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-sky-500/30 rounded-full flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        ></path>
                      </svg>
                    </div>
                    <span className="font-medium">
                      +591 77000000{" "}
                      <span className="text-sky-200 text-sm font-normal">
                        (WhatsApp)
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-sky-500/30 rounded-full flex items-center justify-center shrink-0">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        ></path>
                      </svg>
                    </div>
                    <span className="font-medium">La Paz, Bolivia</span>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-sky-500/50">
                <p className="text-sm text-sky-100">
                  Soporte técnico 24/7 disponible exclusivamente para clientes
                  activos.
                </p>
              </div>
            </div>

            {/* Panel del Formulario */}
            <div className="p-10 md:p-12">
              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(
                    "En un entorno real, esto enviaría un correo a tu equipo.",
                  );
                }}
              >
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">
                      Nombre Completo del Doctor / Clínica
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                      placeholder="Ej. Dra. Laura Gómez"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">
                        Teléfono / WhatsApp
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                        placeholder="Ej. 77012345"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white"
                        placeholder="correo@ejemplo.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">
                      Mensaje o Consulta
                    </label>
                    <textarea
                      rows={4}
                      className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all bg-slate-50 focus:bg-white resize-none"
                      placeholder="Hola, me gustaría probar la plataforma..."
                      required
                    ></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-sky-600 text-white font-bold py-4 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1"
                >
                  Enviar Mensaje a DentaSync
                </button>
              </form>
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
              <span className="text-slate-500 hover:text-white text-sm transition-colors cursor-pointer">
                Privacidad
              </span>
              <span className="text-slate-500 hover:text-white text-sm transition-colors cursor-pointer">
                Términos de Servicio
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
