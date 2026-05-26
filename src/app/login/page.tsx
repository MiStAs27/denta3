"use client";

import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Asegúrate de importar db
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase"; // Importamos la conexión que acabamos de actualizar

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError("");

    try {
      // 1. Iniciamos sesión en Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // 2. Buscamos el rol de esta persona en Firestore
      const userDoc = await getDoc(doc(db, "usuarios", userCredential.user.uid));
      
      if (userDoc.exists()) {
        const rolUsuario = userDoc.data().rol;
        
        // 3. ¡EL SEMÁFORO INTELIGENTE!
        if (rolUsuario === "SUPER_ADMIN") {
          // Si eres el dueño del software, te manda a tu centro de control oscuro
          router.push("/super-admin");
        } else {
          // Si es secretaria, asistente o especialista, van a la clínica
          router.push("/dashboard");
        }
      } else {
        // Por si acaso el usuario no tiene documento en la base de datos
        router.push("/dashboard"); 
      }
      
    } catch (error: any) {
      console.error(error);
      setError("Correo o contraseña incorrectos");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F5F8FA]">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-[#2651A3] mb-2">DentaSync</h1>
          <p className="text-gray-500">Ingresa a tu portal clínico</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md mb-6 text-sm text-center border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input 
              id="email" 
              type="email" 
              placeholder="ejemplo@dentasync.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <a href="#" className="text-sm text-[#39ACB8] hover:underline">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <Input 
              id="password" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-[#2651A3] hover:bg-[#1a3a75] text-white font-semibold py-2"
            disabled={cargando}
          >
            {cargando ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>

      </div>
    </div>
  );
}