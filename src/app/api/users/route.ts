import { NextResponse } from "next/server";
import { adminAuth as auth, adminDb as db } from "@/lib/firebase-admin"; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Ahora la API recibe también el tenantId
    const { email, password, nombreAdmin, nombreClinica, rol, tenantId } = body;

    // 2. Crear el usuario en Firebase Authentication (El Portero)
    const userRecord = await auth.createUser({
      email,
      password,
      displayName: nombreAdmin,
    });

    // 3. LÓGICA INTELIGENTE DE SAAS (La Llave de la Clínica)
    // Si la clínica crea un empleado, usa el tenantId de la clínica.
    // Si el Super Admin crea una nueva Clínica, el propio UID del doctor se convierte en el tenantId maestro.
    const llaveClinica = tenantId ? tenantId : userRecord.uid;

    // 4. Guardar el perfil en Firestore con todos los sellos de seguridad
    await db.collection("usuarios").doc(userRecord.uid).set({
      email: email.toLowerCase(),
      nombre: nombreAdmin,
      nombreClinica: nombreClinica || "",
      rol: rol || "TENANT_ADMIN",
      tenantId: llaveClinica, // 🔒 EL CANDADO SE CIERRA AQUÍ
      estado: "Activo",
      fechaCreacion: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    console.error("Error creando usuario:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}