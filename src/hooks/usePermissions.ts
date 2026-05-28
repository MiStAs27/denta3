// src/hooks/usePermissions.ts

export type Rol = 'TENANT_ADMIN' | 'DOCTOR' | 'SECRETARIA';

export const PERMISOS = {
  TENANT_ADMIN: { verFinanzas: true, editarNotas: true, configurarConsultorio: true },
  DOCTOR: { verFinanzas: false, editarNotas: true, configurarConsultorio: false },
  SECRETARIA: { verFinanzas: true, editarNotas: false, configurarConsultorio: false },
};

export const usePermissions = (rol: Rol) => {
  const permisos = PERMISOS[rol] || { verFinanzas: false, editarNotas: false, configurarConsultorio: false };
  
  return {
    ...permisos,
    esAdmin: rol === 'TENANT_ADMIN',
    esDoctor: rol === 'DOCTOR',
    esSecretaria: rol === 'SECRETARIA'
  };
};