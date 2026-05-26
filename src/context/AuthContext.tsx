"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";

// Extendemos el tipo de usuario para incluir el rol
interface AuthUser extends User {
  rol?: string;
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
        // EL TRUCO: Cuando detecta sesión, va a Firestore y busca tu rol real
        try {
          const docRef = doc(db, "usuarios", firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            // Guardamos al usuario CON su rol
            setUser({ ...firebaseUser, rol: userData.rol });
          } else {
            setUser(firebaseUser); // Si no hay documento, entra normal
          }
        } catch (error) {
          console.error("Error al buscar rol del usuario:", error);
          setUser(firebaseUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading) {
      const isPublicRoute = pathname === "/" || pathname === "/login";
      const isSuperAdminRoute = pathname.startsWith("/super-admin");

      if (!user && !isPublicRoute) {
        // No hay sesión -> pa' fuera
        router.push("/login");
      } else if (user && isPublicRoute) {
        // Hay sesión y está en el login -> REDIRECCIÓN INTELIGENTE
        if (user.rol === "SUPER_ADMIN") {
          router.push("/super-admin");
        } else {
          router.push("/dashboard");
        }
      } else if (user && isSuperAdminRoute && user.rol !== "SUPER_ADMIN") {
        // Es ruta de super admin pero el usuario no tiene el rol
        alert("Acceso denegado: Área exclusiva de administración SaaS.");
        router.push("/dashboard");
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