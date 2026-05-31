"use client";

import { useState, useEffect } from "react";
import { doc, getDoc, collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

import {
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  Upload,
  ArrowRight,
  ShieldCheck,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function MiSuscripcionPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [cargando, setCargando] = useState(true);
  const [datosClinica, setDatosClinica] = useState<any>(null);
  const [precios, setPrecios] = useState<any>({});

  // Estados para el flujo de pago
  const [modalPagoOpen, setModalPagoOpen] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState<{
    meses: number;
    precio: number;
    nombre: string;
  } | null>(null);
  const [referenciaPago, setReferenciaPago] = useState("");
  const [comprobanteBase64, setComprobanteBase64] = useState<string | null>(
    null,
  );
  const [enviandoPago, setEnviandoPago] = useState(false);

  useEffect(() => {
    const cargarDatos = async () => {
      if (!user?.tenantId) return;

      try {
        const clinicaSnap = await getDoc(doc(db, "usuarios", user.tenantId));
        if (clinicaSnap.exists()) setDatosClinica(clinicaSnap.data());

        const preciosSnap = await getDoc(
          doc(db, "configuracion", "suscripciones"),
        );
        if (preciosSnap.exists()) setPrecios(preciosSnap.data());
      } catch (error) {
        console.error("Error cargando suscripción:", error);
      } finally {
        setCargando(false);
      }
    };

    if (!authLoading) cargarDatos();
  }, [user, authLoading]);

  const calcularDiasRestantes = () => {
    if (!datosClinica?.fechaVencimiento) return 0;
    const vencimiento = new Date(datosClinica.fechaVencimiento);
    const hoy = new Date();
    const diferencia = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 3600 * 24));
  };

  const diasRestantes = calcularDiasRestantes();
  const estadoSuscripcion =
    datosClinica?.estado === "Suspendido"
      ? "Suspendido"
      : diasRestantes <= 5
        ? "Por Vencer"
        : "Activo";

  const iniciarPago = (meses: number, precio: number, nombre: string) => {
    setPlanSeleccionado({ meses, precio, nombre });
    setReferenciaPago("");
    setComprobanteBase64(null);
    setModalPagoOpen(true);
  };

  // Función para procesar la foto del comprobante
  const manejarSubidaArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "La imagen es muy pesada. Máximo 2MB.",
          variant: "destructive",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setComprobanteBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const enviarComprobante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planSeleccionado || !user?.tenantId) return;
    if (!comprobanteBase64) {
      toast({
        title: "Por favor, adjunta la foto del comprobante.",
        variant: "destructive",
      });
      return;
    }

    setEnviandoPago(true);
    try {
      // 🔒 GUARDAMOS EL PAGO PARA QUE EL SUPER ADMIN LO REVISE
      await addDoc(collection(db, "pagos_pendientes"), {
        tenantId: user.tenantId,
        nombreClinica: datosClinica?.nombreClinica || "Clínica",
        emailDoctor: user.email,
        planSolicitado: planSeleccionado.nombre,
        meses: planSeleccionado.meses,
        monto: planSeleccionado.precio,
        numeroReferencia: referenciaPago,
        fotoComprobante: comprobanteBase64, // Enviamos la imagen
        estado: "Pendiente de Aprobación",
        fechaSolicitud: new Date().toISOString(),
      });

      toast({ title: "Pago reportado exitosamente. Lo validaremos en breve." });
      setModalPagoOpen(false);
    } catch (error) {
      console.error("Error enviando pago:", error);
      toast({ title: "Error al enviar comprobante", variant: "destructive" });
    } finally {
      setEnviandoPago(false);
    }
  };

  if (authLoading || cargando)
    return (
      <div className="p-8 text-center text-slate-500">
        Cargando información de facturación...
      </div>
    );

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in">
      <div>
        <h1 className="text-3xl font-bold text-[#2651A3] flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-[#39ACB8]" /> Mi Suscripción
        </h1>
        <p className="text-gray-500 mt-1">
          Gestiona tu plan de DentaSync y realiza renovaciones de servicio.
        </p>
      </div>

      {/* PANEL DE ESTADO */}
      <div
        className={`p-6 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm
        ${
          estadoSuscripcion === "Activo"
            ? "bg-emerald-50 border-emerald-200"
            : estadoSuscripcion === "Por Vencer"
              ? "bg-amber-50 border-amber-200"
              : "bg-red-50 border-red-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white rounded-full shadow-sm">
            {estadoSuscripcion === "Activo" ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            ) : estadoSuscripcion === "Por Vencer" ? (
              <Clock className="w-8 h-8 text-amber-500" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-500" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Estado:{" "}
              <span
                className={
                  estadoSuscripcion === "Activo"
                    ? "text-emerald-600"
                    : estadoSuscripcion === "Por Vencer"
                      ? "text-amber-600"
                      : "text-red-600"
                }
              >
                {estadoSuscripcion.toUpperCase()}
              </span>
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              {estadoSuscripcion === "Suspendido"
                ? "Tu servicio ha sido suspendido por falta de pago. Renueva ahora para recuperar el acceso."
                : datosClinica?.fechaVencimiento
                  ? `Servicio pagado hasta el ${new Date(datosClinica.fechaVencimiento).toLocaleDateString()}. (Quedan ${diasRestantes} días).`
                  : "Estás en periodo de prueba."}
            </p>
          </div>
        </div>
      </div>

      {/* PLANES */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldCheck className="text-[#39ACB8] w-5 h-5" /> Opciones de
          Renovación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wide">
              Mensual
            </p>
            <h4 className="text-3xl font-extrabold text-[#2651A3] my-4">
              Bs. {precios.mes1 || 150}
            </h4>
            <Button
              className="w-full bg-[#2651A3]"
              onClick={() => iniciarPago(1, precios.mes1, "Plan Mensual")}
            >
              Renovar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="bg-white border border-sky-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all relative">
            <p className="text-sm font-bold text-sky-600 uppercase tracking-wide">
              Trimestral
            </p>
            <h4 className="text-3xl font-extrabold text-sky-700 my-4">
              Bs. {precios.mes3 || 400}
            </h4>
            <Button
              className="w-full bg-sky-600 hover:bg-sky-700"
              onClick={() => iniciarPago(3, precios.mes3, "Plan Trimestral")}
            >
              Renovar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 text-center shadow-md relative transform hover:-translate-y-1 transition-all">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white px-3 py-0.5 rounded-full text-[10px] font-bold uppercase">
              Sugerido
            </div>
            <p className="text-sm font-bold text-purple-700 uppercase tracking-wide">
              Semestral
            </p>
            <h4 className="text-3xl font-extrabold text-purple-800 my-4">
              Bs. {precios.mes6 || 750}
            </h4>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => iniciarPago(6, precios.mes6, "Plan Semestral")}
            >
              Renovar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

          <div className="bg-white border border-emerald-200 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all">
            <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide">
              Anual
            </p>
            <h4 className="text-3xl font-extrabold text-emerald-700 my-4">
              Bs. {precios.mes12 || 1400}
            </h4>
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700"
              onClick={() => iniciarPago(12, precios.mes12, "Plan Anual")}
            >
              Renovar <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* MODAL DE PAGO Y CÓDIGO QR */}
      <Dialog open={modalPagoOpen} onOpenChange={setModalPagoOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#2651A3]">
              Realizar Pago
            </DialogTitle>
          </DialogHeader>

          {planSeleccionado && (
            <div className="space-y-4 mt-2">
              <div className="bg-slate-50 p-4 rounded-lg border text-center">
                <p className="text-sm text-slate-500">
                  Monto a cancelar por {planSeleccionado.nombre}:
                </p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  Bs. {planSeleccionado.precio}
                </p>
              </div>

              {/* SECCIÓN DEL CÓDIGO QR */}
              <div className="text-center space-y-2">
                <p className="text-sm font-bold text-slate-700">
                  1. Escanea el código QR con tu aplicación móvil
                </p>
                <div className="bg-white p-2 border-2 border-dashed border-slate-300 rounded-xl inline-block">
                  {/* Aquí el sistema buscará tu imagen qr-pago.png en la carpeta public */}
                  <img
                    src="/qr-pago.png"
                    alt="Código QR de Pago"
                    className="w-40 h-40 object-contain mx-auto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://via.placeholder.com/150?text=Sube+tu+QR+a+la+carpeta+public";
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500">
                  O transfiere a la cuenta BCP:{" "}
                  <strong className="text-sky-700">201-1234567-3-22</strong>
                </p>
              </div>

              <form
                onSubmit={enviarComprobante}
                className="space-y-4 pt-4 border-t"
              >
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">
                    2. Número de Comprobante / Referencia
                  </Label>
                  <Input
                    placeholder="Ej. 9845210"
                    value={referenciaPago}
                    onChange={(e) => setReferenciaPago(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold text-slate-700">
                    3. Foto del Comprobante
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={manejarSubidaArchivo}
                      className="cursor-pointer file:bg-sky-50 file:text-sky-700 file:border-0 file:rounded-md file:px-4 file:py-1 file:mr-4 file:font-semibold"
                    />
                  </div>
                  {comprobanteBase64 && (
                    <div className="mt-2 flex items-center gap-2 text-emerald-600 text-sm font-bold">
                      <ImageIcon className="w-4 h-4" /> Imagen cargada lista
                      para enviar
                    </div>
                  )}
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setModalPagoOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="bg-[#39ACB8] hover:bg-[#2c8892]"
                    disabled={enviandoPago}
                  >
                    {enviandoPago ? (
                      "Procesando..."
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" /> Enviar Comprobante
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
