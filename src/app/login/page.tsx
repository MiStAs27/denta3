"use client";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, "usuarios", userCredential.user.uid));

      if (userDoc.exists()) {
        const rolUsuario = userDoc.data().rol;
        if (rolUsuario === "SUPER_ADMIN") {
          router.push("/super-admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error(error);
      setError("Correo o contraseña incorrectos.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans">

      {/* ── Panel izquierdo: branding (se oculta en móvil) ── */}
      <div className="hidden md:flex md:flex-1 flex-col justify-between p-10 lg:p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(145deg,#1a3a75 0%,#2651A3 55%,#39ACB8 100%)" }}>

        {/* Blobs decorativos */}
        <span className="absolute rounded-full opacity-[0.07] bg-white"
          style={{ width: 360, height: 360, top: -100, right: -100 }} />
        <span className="absolute rounded-full opacity-[0.07] bg-white"
          style={{ width: 220, height: 220, bottom: 30, left: -70 }} />
        <span className="absolute rounded-full opacity-[0.07] bg-white"
          style={{ width: 130, height: 130, bottom: 190, right: 60 }} />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center border"
            style={{ background: "rgba(255,255,255,0.18)", borderColor: "rgba(255,255,255,0.3)" }}>
            {/* Ícono diente SVG inline */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2C8 2 4 5 4 9c0 2 .5 3.5 1 5l1 6c.2 1 1 2 2 2s1.8-.8 2-2l.5-3c.2-1 .8-1 .8-1h1.4s.6 0 .8 1l.5 3c.2 1.2 1 2 2 2s1.8-1 2-2l1-6c.5-1.5 1-3 1-5 0-4-4-7-8-7z"/>
            </svg>
          </div>
          <span className="text-white font-medium text-xl tracking-tight">DentaSync</span>
        </div>

        {/* Hero copy */}
        <div className="z-10">
          <h2 className="text-white font-medium text-3xl leading-snug mb-3">
            Gestión clínica inteligente para tu consultorio
          </h2>
          <p className="text-white/70 text-base leading-relaxed">
            Controla citas, pacientes y tu equipo desde un solo lugar — seguro, rápido y siempre disponible.
          </p>
        </div>

        {/* Feature list */}
        <div className="z-10 flex flex-col gap-4">
          {[
            { icon: "📅", label: "Agenda y citas en tiempo real" },
            { icon: "📋", label: "Expedientes clínicos digitales" },
            { icon: "🏥", label: "Multi-sucursal y multi-rol" },
            { icon: "🔒", label: "Datos cifrados y seguros" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border text-sm"
                style={{ background: "rgba(255,255,255,0.14)", borderColor: "rgba(255,255,255,0.2)" }}>
                {f.icon}
              </div>
              <span className="text-white/75 text-sm">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel derecho: formulario ── */}
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-10">
        <div className="w-full max-w-sm">

          {/* Encabezado (solo móvil muestra logo aquí) */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 md:hidden">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: "#2651A3" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2C8 2 4 5 4 9c0 2 .5 3.5 1 5l1 6c.2 1 1 2 2 2s1.8-.8 2-2l.5-3c.2-1 .8-1 .8-1h1.4s.6 0 .8 1l.5 3c.2 1.2 1 2 2 2s1.8-1 2-2l1-6c.5-1.5 1-3 1-5 0-4-4-7-8-7z"/>
                </svg>
              </div>
              <span className="font-medium text-lg" style={{ color: "#2651A3" }}>DentaSync</span>
            </div>
            <h1 className="text-2xl font-medium text-gray-900">Bienvenido de vuelta</h1>
            <p className="text-sm text-gray-500 mt-1">Ingresa a tu portal clínico</p>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 mb-5 p-3 rounded-lg border text-sm"
              style={{ background: "#FFF0F0", borderColor: "#FFCDD2", color: "#B71C1C" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-medium text-gray-500">
                Correo electrónico
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
                <input
                  id="email" type="email" required autoComplete="email"
                  placeholder="nombre@clinica.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border bg-gray-50 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  style={{ borderColor: "#E2E8F0" }}
                />
              </div>
            </div>

            {/* Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-medium text-gray-500">
                  Contraseña
                </label>
                <a href="#" className="text-xs hover:underline" style={{ color: "#39ACB8" }}>
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password" type={showPassword ? "text" : "password"} required autoComplete="current-password"
                  placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border bg-gray-50 text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  style={{ borderColor: "#E2E8F0" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Botón principal */}
            <button type="submit" disabled={cargando}
              className="w-full py-2.5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition disabled:opacity-60"
              style={{ background: cargando ? "#1a3a75" : "#2651A3" }}>
              {cargando ? (
                <>
                  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar sesión
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            ¿Problemas para acceder?{" "}
            <a href="#" className="hover:underline" style={{ color: "#2651A3" }}>Contacta soporte</a>
          </p>
        </div>
      </div>
    </div>
  );
}