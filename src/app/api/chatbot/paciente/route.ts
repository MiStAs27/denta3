import { NextResponse } from 'next/server';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Asegúrate de que esta ruta apunte a tu archivo de configuración

export async function POST(request: Request) {
  try {
    // 1. Recibir los datos que envía n8n (el JSON que armó la IA)
    const body = await request.json();
    const { nombre, celular, motivo, tenantId } = body;

    // 2. Validar que vengan los datos mínimos obligatorios
    if (!nombre || !celular) {
      return NextResponse.json(
        { error: 'Faltan datos obligatorios (nombre o celular)' },
        { status: 400 }
      );
    }

    // 3. Estructurar el nuevo paciente
    const nuevoPaciente = {
      tenantId: tenantId || "CLINICA_DEFAULT", // Llave para el Multi-Tenant
      nombre: nombre,
      celular: celular,
      motivoConsulta: motivo || "No especificado",
      fechaRegistroVirtual: new Date().toISOString(),
      origen: "WhatsApp_Chatbot"
    };

    // 4. Guardar en la colección "pacientes" de Firestore
    const docRef = await addDoc(collection(db, 'pacientes'), nuevoPaciente);

    // 5. Responderle a n8n que todo salió bien
    return NextResponse.json({ 
      success: true, 
      mensaje: 'Paciente registrado correctamente',
      pacienteId: docRef.id 
    });

  } catch (error) {
    console.error('Error al guardar paciente desde el chatbot:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al guardar en Firebase' },
      { status: 500 }
    );
  }
}