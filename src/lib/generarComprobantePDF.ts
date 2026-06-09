// src/lib/generarComprobantePDF.ts
import jsPDF from "jspdf";
import type { Pago } from "@/types/cobros";
export function generarComprobantePDF(
  pago: Pago,
  nombreClinica = "Clínica Odontológica DentaSync"
) {
  const doc = new jsPDF({ format: "a5" }); // A5 = tamaño comprobante
  const pageW = doc.internal.pageSize.getWidth();
  // ── Encabezado ──
  doc.setFillColor(38, 81, 163);
  doc.rect(0, 0, pageW, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(nombreClinica, pageW / 2, 12, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("COMPROBANTE DE PAGO", pageW / 2, 21, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(pago.numero, pageW / 2, 28, { align: "center" });
  // ── Datos del pago ──
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const fechaFormato = new Date(pago.fecha).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  let y = 40;
  const row = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 10, y);
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.text(value, 55, y);
    y += 7;
  };
  doc.setFillColor(245, 248, 250);
  doc.rect(8, y - 5, pageW - 16, 56, "F");
  row("Paciente:", pago.pacienteNombre);
  row("Fecha:", fechaFormato);
  row("Concepto:", pago.concepto);
  if (pago.presupuestoNumero) row("Presupuesto ref.:", pago.presupuestoNumero);
  row("Método de pago:", pago.metodoPago);
  if (pago.nota) row("Nota:", pago.nota);
  // ── Detalle de montos ──
  y += 5;
  doc.setFillColor(230, 240, 255);
  doc.rect(8, y - 5, pageW - 16, pago.descuento > 0 ? 36 : 28, "F");
  doc.setFont("helvetica", "normal");
  doc.text("Monto bruto:", 10, y);
  doc.text(`Bs. ${pago.montoBruto.toFixed(2)}`, pageW - 10, y, { align: "right" });
  y += 7;
  if (pago.descuento > 0) {
    doc.text(
      `Descuento (${pago.descuentoTipo === "porcentaje" ? pago.descuentoValor + "%" : "fijo"}):`,
      10,
      y
    );
    doc.setTextColor(200, 0, 0);
    doc.text(`- Bs. ${pago.descuento.toFixed(2)}`, pageW - 10, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += 7;
  }
  doc.setDrawColor(38, 81, 163);
  doc.line(10, y, pageW - 10, y);
  y += 5;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(38, 81, 163);
  doc.text("TOTAL PAGADO:", 10, y);
  doc.text(`Bs. ${pago.montoNeto.toFixed(2)}`, pageW - 10, y, { align: "right" });
  // ── Sello / Leyenda ──
  y += 14;
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text(
    "Este documento es un comprobante de pago interno y no tiene valor fiscal.",
    pageW / 2,
    y,
    { align: "center" }
  );
  y += 5;
  doc.text(
    `Generado por DentaSync — ${new Date().toLocaleString("es-ES")}`,
    pageW / 2,
    y,
    { align: "center" }
  );
  // ── Firma ──
  y += 16;
  doc.setTextColor(0, 0, 0);
  doc.setDrawColor(0, 0, 0);
  doc.line(pageW / 2 - 30, y, pageW / 2 + 30, y);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text("Firma del responsable", pageW / 2, y + 5, { align: "center" });
  doc.save(
    `Comprobante_${pago.numero}_${pago.pacienteNombre.replace(/\s+/g, "_")}.pdf`
  );
}
