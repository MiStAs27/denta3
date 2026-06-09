import { NextResponse } from "next/server";
import { Resend } from "resend";
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

    try {
      const resendApiKey = process.env.RESEND_API_KEY;
      const resendFrom = process.env.RESEND_FROM || "DentaSync <onboarding@resend.dev>";

      if (resendApiKey) {
        const resend = new Resend(resendApiKey);

        await resend.emails.send({
          from: resendFrom,
          to: [emailNorm],
          subject: "Confirmación de tu consultorio en DentaSync",
          html: `
            <div style="font-family: Arial, sans-serif; color: #1f2937; line-height: 1.5;">
              <h2 style="color: #2651A3;">¡Bienvenido a DentaSync!</h2>
              <p>Hemos creado tu consultorio con éxito.</p>
              <p><strong>Responsable:</strong> ${nombreAdmin}</p>
              <p><strong>Consultorio:</strong> ${nombreClinica || "Sin nombre"}</p>
              <p>Tu cuenta quedó registrada y ya puede iniciar sesión en la plataforma.</p>
              <p>Si tienes dudas, responde a este correo o contacta al equipo de soporte.</p>
              <p style="margin-top: 16px; color: #6b7280; font-size: 12px;">Este mensaje es automático, por favor no responda a esta dirección.</p>
            </div>
          `,
        });
      } else {
        console.warn("RESEND_API_KEY no configurado; se omite el envío de correo de confirmación.");
      }
    } catch (emailError) {
      console.error("Error enviando correo de confirmación del consultorio:", emailError);
      // El flujo principal no se revierte si falla el envío.
    }

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error: any) {
    console.error("Error creando usuario:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
