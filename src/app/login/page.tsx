"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

// Usamos Lucide React para iconos más limpios y consistentes
import { 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  AlertCircle,
  Stethoscope
} from "lucide-react";

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
      setError("Correo o contraseña incorrectos. Verifica tus credenciales.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full font-sans bg-white">
      
      {/* ── Panel izquierdo: Branding Premium (oculto en móvil) ── */}
      <div 
        className="hidden md:flex md:flex-1 flex-col justify-between p-10 lg:p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #162B54 0%, #2651A3 50%, #39ACB8 100%)" }}
      >
        {/* Patrón de fondo (Dots) para darle textura */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
        />

        {/* Blobs decorativos de luz */}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-white/10 blur-3xl rounded-full mix-blend-overlay" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#39ACB8]/40 blur-3xl rounded-full mix-blend-overlay" />

        {/* Logo */}
        <div className="flex items-center gap-3 z-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-white/10 border border-white/20 backdrop-blur-md shadow-lg">
            <Stethoscope className="text-white w-6 h-6" />
          </div>
          <span className="text-white font-bold text-2xl tracking-tight">DentaSync</span>
        </div>

        {/* Hero copy */}
        <div className="z-10 max-w-md animate-in fade-in slide-in-from-left-4 duration-700 delay-150">
          <h2 className="text-white font-extrabold text-4xl leading-tight mb-4">
            La evolución de tu clínica dental comienza aquí.
          </h2>
          <p className="text-blue-100 text-lg leading-relaxed font-light">
            Controla citas, pacientes, ingresos y a todo tu equipo desde una plataforma unificada, rápida y segura.
          </p>
        </div>

        {/* Feature list */}
        <div className="z-10 flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          {[
            { icon: "📅", label: "Agenda y citas en tiempo real" },
            { icon: "📋", label: "Expedientes clínicos digitales" },
            { icon: "🏥", label: "Multi-sucursal y multi-rol" },
            { icon: "🔒", label: "Datos cifrados en la nube" },
          ].map((f) => (
            <div key={f.label} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/10 border border-white/20 backdrop-blur-sm shadow-sm text-lg">
                {f.icon}
              </div>
              <span className="text-blue-50 font-medium">{f.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Panel derecho: Formulario de Login ── */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 md:bg-white px-6 py-12 sm:px-10 relative">
        
        {/* Contenedor principal del formulario */}
        <div className="w-full max-w-sm">
          
          {/* BOTÓN VOLVER (Mejorado y animado) */}
          <button 
            onClick={() => router.push('/')}
            className="group flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#2651A3] transition-colors mb-10 bg-white md:bg-transparent px-3 py-1.5 rounded-full border border-slate-200 md:border-transparent hover:bg-slate-50 md:hover:bg-transparent w-fit"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            Volver al inicio
          </button>

          {/* Encabezado */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6 md:hidden">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#2651A3] shadow-md">
                <Stethoscope className="text-white w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-[#2651A3]">DentaSync</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Bienvenido de vuelta</h1>
            <p className="text-sm text-slate-500 mt-2 font-medium">Ingresa tus credenciales para acceder a tu portal.</p>
          </div>

          {/* Mensaje de Error */}
          {error && (
            <div className="flex items-start gap-3 mb-6 p-4 rounded-xl border bg-red-50 border-red-100 text-red-600 text-sm animate-in fade-in zoom-in-95 duration-300">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="font-medium leading-relaxed">{error}</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleLogin} className="space-y-5">
            
            {/* Input Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                Correo Electrónico
              </label>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#39ACB8] transition-colors">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  id="email" 
                  type="email" 
                  required 
                  autoComplete="email"
                  placeholder="nombre@clinica.com"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-[#39ACB8] focus:ring-4 focus:ring-[#39ACB8]/10 shadow-sm"
                />
              </div>
            </div>

            {/* Input Contraseña */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Contraseña
                </label>
                <button type="button" className="text-xs font-bold text-[#39ACB8] hover:text-[#2651A3] transition-colors hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <div className="relative group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#39ACB8] transition-colors">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 text-sm rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-[#39ACB8] focus:ring-4 focus:ring-[#39ACB8]/10 shadow-sm"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                  aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botón de Submit */}
            <button 
              type="submit" 
              disabled={cargando}
              className={`w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed ${cargando ? 'bg-[#1a3a75]' : 'bg-[#2651A3] hover:bg-[#1f438a] hover:-translate-y-0.5'}`}
            >
              {cargando ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <LogIn className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer del form */}
          <div className="mt-8 text-center text-sm">
            <p className="text-slate-500">
              ¿No tienes una cuenta aún?{" "}
              <button onClick={() => router.push('/registro')} className="font-bold text-[#2651A3] hover:text-[#39ACB8] transition-colors hover:underline">
                Registra tu clínica
              </button>
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}