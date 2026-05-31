"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";

import { Wallet, CheckCircle, XCircle, Eye, Loader2, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function ValidacionPagosPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [pagos, setPagos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  // Estados para ver el comprobante
  const [modalFotoOpen, setModalFotoOpen] = useState(false);
  const [fotoActual, setFotoActual] = useState<string | null>(null);

  const cargarPagosPendientes = async () => {
    setCargando(true);
    try {
      // 🔒 Solo traemos los que están pendientes de revisión
      const q = query(collection(db, "pagos_pendientes"), where("estado", "==", "Pendiente de Aprobación"));
      const snapshot = await getDocs(q);
      const lista: any[] = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      // Ordenar por fecha de solicitud (los más antiguos primero)
      lista.sort((a, b) => new Date(a.fechaSolicitud).getTime() - new Date(b.fechaSolicitud).getTime());
      setPagos(lista);
    } catch (error) {
      console.error("Error cargando pagos:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.rol !== "SUPER_ADMIN") {
      router.push("/dashboard");
      return;
    }
    if (!authLoading) cargarPagosPendientes();
  }, [user, authLoading, router]);

  const verComprobante = (fotoBase64: string) => {
    setFotoActual(fotoBase64);
    setModalFotoOpen(true);
  };

  // 🔥 LA MAGIA MATEMÁTICA: Aprobar y sumar tiempo
  const aprobarPago = async (pago: any) => {
    if (!window.confirm(`¿Confirmas que recibiste Bs. ${pago.monto} de ${pago.nombreClinica}?`)) return;

    setProcesando(true);
    try {
      // 1. Obtener los datos actuales de la clínica
      const clinicaRef = doc(db, "usuarios", pago.tenantId);
      const clinicaSnap = await getDoc(clinicaRef);
      const clinicaData = clinicaSnap.data();

      // 2. Calcular la nueva fecha de vencimiento
      let fechaBase = new Date(); // Si estaba vencido, empezamos a contar desde HOY
      if (clinicaData?.fechaVencimiento) {
        const fechaVencimientoActual = new Date(clinicaData.fechaVencimiento);
        // Si aún tiene días a favor, le sumamos a partir de su vencimiento futuro
        if (fechaVencimientoActual > fechaBase) {
          fechaBase = fechaVencimientoActual;
        }
      }

      // Sumar los meses que compró
      const nuevaFechaVencimiento = new Date(fechaBase);
      nuevaFechaVencimiento.setMonth(nuevaFechaVencimiento.getMonth() + pago.meses);

      // 3. Actualizar la cuenta del doctor (Le quitamos lo suspendido y actualizamos fecha)
      await updateDoc(clinicaRef, {
        fechaVencimiento: nuevaFechaVencimiento.toISOString(),
        estado: "Activo" // ¡Le quitamos el candado automáticamente!
      });

      // 4. Marcar el pago como Aprobado para que desaparezca de esta bandeja
      await updateDoc(doc(db, "pagos_pendientes", pago.id), {
        estado: "Aprobado",
        fechaAprobacion: new Date().toISOString()
      });

      toast({ title: "¡Pago aprobado! La clínica ya tiene acceso a su sistema." });
      cargarPagosPendientes();
      setModalFotoOpen(false);
    } catch (error) {
      console.error("Error aprobando pago:", error);
      toast({ title: "Error al aprobar pago", variant: "destructive" });
    } finally {
      setProcesando(false);
    }
  };

  const rechazarPago = async (idPago: string) => {
    if (!window.confirm("¿Seguro que deseas rechazar este pago? (Ej. La foto es falsa o borrosa)")) return;
    try {
      await updateDoc(doc(db, "pagos_pendientes", idPago), {
        estado: "Rechazado"
      });
      toast({ title: "Pago rechazado." });
      cargarPagosPendientes();
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (authLoading) return <div className="p-8 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-sky-600"/></div>;

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in">
      
      <div>
        <h1 className="text-3xl font-bold text-[#2651A3] flex items-center gap-2">
          <Wallet className="w-8 h-8 text-[#39ACB8]" /> Validación de Pagos
        </h1>
        <p className="text-gray-500 mt-1">Revisa los comprobantes de transferencia enviados por las clínicas para activar sus planes.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        
        <div className="flex items-center gap-2 mb-6 pb-4 border-b">
          <CalendarClock className="text-amber-500 w-5 h-5" />
          <h2 className="text-lg font-bold text-slate-800">Solicitudes Pendientes ({pagos.length})</h2>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Clínica / Doctor</TableHead>
                <TableHead>Plan Solicitado</TableHead>
                <TableHead>Monto / Ref.</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cargando ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">Cargando pagos...</TableCell>
                </TableRow>
              ) : pagos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <CheckCircle className="w-12 h-12 text-emerald-100" />
                      <p>No hay pagos pendientes de revisión. ¡Estás al día!</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                pagos.map((pago) => (
                  <TableRow key={pago.id}>
                    <TableCell className="text-sm text-slate-600">
                      {new Date(pago.fechaSolicitud).toLocaleDateString()} <br/>
                      <span className="text-xs text-slate-400">{new Date(pago.fechaSolicitud).toLocaleTimeString()}</span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-bold text-[#2651A3]">{pago.nombreClinica}</div>
                      <div className="text-xs text-slate-500">{pago.emailDoctor}</div>
                    </TableCell>
                    
                    <TableCell>
                      <span className="px-2 py-1 bg-sky-50 text-sky-700 font-bold text-xs rounded border border-sky-100 uppercase">
                        {pago.planSolicitado}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="font-bold text-emerald-600">Bs. {pago.monto}</div>
                      <div className="text-xs text-slate-500 font-mono">Ref: {pago.numeroReferencia}</div>
                    </TableCell>
                    
                    <TableCell className="text-right space-x-2">
                      {/* BOTÓN VER FOTO */}
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => verComprobante(pago.fotoComprobante)}
                        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 border-blue-200"
                        title="Ver Comprobante"
                      >
                        <Eye className="w-4 h-4 mr-1" /> Ver Foto
                      </Button>

                      {/* BOTÓN APROBAR */}
                      <Button 
                        size="sm"
                        onClick={() => aprobarPago(pago)}
                        disabled={procesando}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" /> Aprobar
                      </Button>
                      
                      {/* BOTÓN RECHAZAR */}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => rechazarPago(pago.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50"
                        title="Rechazar Pago"
                      >
                        <XCircle className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

      </div>

      {/* MODAL PARA VER LA FOTO DEL COMPROBANTE */}
      <Dialog open={modalFotoOpen} onOpenChange={setModalFotoOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#2651A3]">Comprobante Adjunto</DialogTitle>
          </DialogHeader>
          <div className="mt-4 border rounded-lg overflow-hidden bg-slate-50 flex justify-center items-center min-h-[300px]">
            {fotoActual ? (
              <img src={fotoActual} alt="Comprobante de Pago" className="max-w-full max-h-[60vh] object-contain" />
            ) : (
              <p className="text-slate-400">La imagen no está disponible.</p>
            )}
          </div>
          <DialogFooter className="pt-4">
            <Button variant="outline" onClick={() => setModalFotoOpen(false)}>Cerrar Vista</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}