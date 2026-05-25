"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import { RolUsuario } from "@/types/roles";

// Definimos cómo se ve nuestro usuario combinado (Firebase + Firestore)
interface AppUser {
  uid: string;
  email: string | null;
  rol: RolUsuario | null;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Escuchamos cambios en la sesión de Firebase
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // El usuario inició sesión. Vamos a buscar su rol a Firestore.
        try {
          const userDoc = await getDoc(doc(db, "usuarios", firebaseUser.uid));
          const rol = userDoc.exists() ? (userDoc.data().rol as RolUsuario) : null;

          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            rol: rol,
          });
        } catch (error) {
          console.error("Error al obtener el rol del usuario:", error);
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email, rol: null });
        }
      } else {
        // No hay sesión activa
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Proteger rutas privadas
  useEffect(() => {
    if (!loading) {
      const isPublicRoute = pathname === "/" || pathname === "/login";
      if (!user && !isPublicRoute) {
        // Si no hay usuario y quiere entrar a una ruta privada, lo mandamos al login
        router.push("/login");
      } else if (user && isPublicRoute) {
        // Si hay usuario y está en el login, lo mandamos al sistema
        router.push("/dashboard");
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);