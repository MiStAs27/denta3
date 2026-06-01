import { NextResponse } from "next/server";
import { adminAuth as auth, adminDb as db } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, nombreAdmin, nombreClinica, rol, tenantId } =
      body;

    const emailNorm = email.toLowerCase().trim();

    // Verificar duplicado en Firestore
    const existente = await db
      .collection("usuarios")
      .where("email", "==", emailNorm)
      .limit(1)
      .get();
    if (!existente.empty) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese correo electrónico." },
        { status: 409 }
      );
    }

    // Verificar duplicado en Firebase Auth
    try {
      await auth.getUserByEmail(emailNorm);
      return NextResponse.json(
        { error: "Ya existe una cuenta con ese correo electrónico." },
        { status: 409 }
      );
    } catch {
      // getUserByEmail lanza error si no existe — continuar
    }

    const userRecord = await auth.createUser({
      email: emailNorm,
      password,
      displayName: nombreAdmin,
    });

    const llaveClinica = tenantId ? tenantId : userRecord.uid;

    await db.collection("usuarios").doc(userRecord.uid).set({
      email: emailNorm,
      nombre: nombreAdmin,
      nombreClinica: nombreClinica || "",
      rol: rol || "TENANT_ADMIN",
      tenantId: llaveClinica,
      estado: "Activo",
      fechaCreacion: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    console.error("Error creando usuario:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
