"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore"; // 🔒 IMPORTAMOS updateDoc
import { auth, db } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { RolUsuario } from "@/types/roles";

// Interfaz extendida
export interface AuthUser extends User {
  nombre?: string;
  rol?: RolUsuario;
  tenantId: string | null;
  estado?: string;
  fechaVencimiento?: string; // 🔒 Añadimos esta variable para saber cuándo expira
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, "usuarios", firebaseUser.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            let estadoActual = userData.estado || "Activo";
            const fechaVencimiento = userData.fechaVencimiento;

            // 🚨 EL RELOJ INCOMPASIVO (Verificación Automática de Fecha)
            if (userData.rol === "TENANT_ADMIN" && fechaVencimiento) {
              const vencimiento = new Date(fechaVencimiento);
              const hoy = new Date();

              // Si la fecha de hoy superó la fecha de vencimiento y seguía "Activo"
              if (hoy > vencimiento && estadoActual !== "Suspendido") {
                estadoActual = "Suspendido";
                // Lo marcamos como Suspendido en la base de datos automáticamente
                await updateDoc(docRef, { estado: "Suspendido" });
              }
            }

            const idDelConsultorio =
              userData.rol === "SUPER_ADMIN"
                ? "GLOBAL"
                : userData.rol === "TENANT_ADMIN"
                  ? firebaseUser.uid
                  : userData.tenantId;

            setUser({
              ...firebaseUser,
              nombre: userData.nombre,
              rol: userData.rol,
              estado: estadoActual,
              fechaVencimiento: fechaVencimiento,
              tenantId: idDelConsultorio,
            });
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error("Error crítico recuperando contexto SaaS:", error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- ENRUTADOR INTELIGENTE (EL CORRALITO) ---
  useEffect(() => {
    if (!loading) {
      const isPublicRoute =
        pathname === "/" || pathname === "/login" || pathname === "/registro";
      const isSuperAdminRoute = pathname.startsWith("/super-admin");
      const isSubscriptionRoute = pathname === "/suscripcion";

      if (!user && !isPublicRoute) {
        // Forzar login si no hay token de autenticación
        router.push("/login");
      } else if (user) {
        // 🚨 REGLA DEL CORRALITO: Si está suspendido y NO es SuperAdmin
        if (user.estado === "Suspendido" && user.rol !== "SUPER_ADMIN") {
          // Si intenta ir a cualquier lado que NO sea la página de suscripción o salida pública, ¡lo regresamos!
          if (!isSubscriptionRoute && !isPublicRoute) {
            router.push("/suscripcion");
            return; // Detenemos la ejecución para que no evalúe más reglas
          }
        }

        // Redirección normal si está activo
        if (isPublicRoute && user.estado !== "Suspendido") {
          if (user.rol === "SUPER_ADMIN") {
            router.push("/super-admin");
          } else if (user.tenantId) {
            router.push("/dashboard");
          } else {
            alert("Error: Tu cuenta no posee un Tenant ID activo configurado.");
            signOut(auth);
          }
        } else if (isSuperAdminRoute && user.rol !== "SUPER_ADMIN") {
          alert(
            "Acceso denegado: Área restringida exclusivamente para soporte global.",
          );
          router.push("/dashboard");
        } else if (
          !isPublicRoute &&
          !isSuperAdminRoute &&
          user.rol !== "SUPER_ADMIN" &&
          !user.tenantId
        ) {
          alert(
            "Acceso inválido: El sistema no detecta un consultorio activo asignado.",
          );
          router.push("/login");
        }
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
