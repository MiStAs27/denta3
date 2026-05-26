// src/app/api/users/route.ts
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase-admin';

export async function POST(request: Request) {
  try {
    // 1. Recibimos los datos que envía el formulario
    const body = await request.json();
    const { nombre, email, rol } = body;

    if (!email || !nombre || !rol) {
      return NextResponse.json({ error: 'Faltan datos obligatorios' }, { status: 400 });
    }

    // 2. Usamos el poder de Admin para crear la cuenta de acceso (Authentication)
    const userRecord = await adminAuth.createUser({
      email: email,
      password: 'dentasync', // Contraseña por defecto
      displayName: nombre,
    });

    // 3. Guardamos los datos en la base de datos (Firestore) usando el MISMO ID que nos dio Authentication
    await adminDb.collection('usuarios').doc(userRecord.uid).set({
      nombre: nombre,
      email: email,
      rol: rol,
      fechaCreacion: new Date().toISOString(),
    });

    // Respondemos que todo salió perfecto
    return NextResponse.json({ success: true, message: 'Usuario creado exitosamente' });
    
  } catch (error: any) {
    console.error('Error en API de usuarios:', error);
    // Si Firebase nos dice que el correo ya existe, enviamos ese error
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}