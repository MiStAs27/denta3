// src/types/roles.ts

// 1. Definimos los roles exactos que existirán en tu base de datos (Firebase)
export type RolUsuario = 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'ESPECIALISTA' | 'SECRETARIA';

// 2. Definimos una lista de permisos (acciones específicas que se pueden hacer en el sistema)
export type Permiso = 
  | 'ver_dashboard_global'
  | 'gestionar_clinicas'
  | 'configurar_consultorio'
  | 'ver_reportes_financieros'
  | 'gestionar_pacientes'
  | 'gestionar_agenda'
  | 'gestionar_historia_clinica'
  | 'gestionar_cobros';

// 3. Mapeamos qué permisos tiene cada rol
export const PERMISOS_POR_ROL: Record<RolUsuario, Permiso[]> = {
  SUPER_ADMIN: [
    'ver_dashboard_global',
    'gestionar_clinicas'
  ],
  TENANT_ADMIN: [
    'configurar_consultorio',
    'ver_reportes_financieros',
    'gestionar_pacientes',
    'gestionar_agenda',
    'gestionar_cobros'
  ],
  ESPECIALISTA: [
    'gestionar_agenda',
    'gestionar_pacientes',
    'gestionar_historia_clinica'
  ],
  SECRETARIA: [
    'gestionar_agenda',
    'gestionar_pacientes',
    'gestionar_cobros'
  ]
};

// 4. Función de ayuda para verificar si un rol tiene un permiso
export const tienePermiso = (rol: RolUsuario, permiso: Permiso): boolean => {
  return PERMISOS_POR_ROL[rol]?.includes(permiso) ?? false;
};
export interface UsuarioApp {
  uid: string;
  email: string;
  nombre: string;
  rol: RolUsuario;
  clinicId?: string; // Es opcional porque el SUPER_ADMIN no tiene clínica
  activo: boolean; 
}