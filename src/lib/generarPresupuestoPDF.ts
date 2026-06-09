// src/lib/generarPresupuestoPDF.ts
import jsPDF from "jspdf";
import type { Presupuesto } from "@/types/cobros";
export function generarPresupuestoPDF(presupuesto: Presupuesto, nombreClinica = "Clínica Odontológica DentaSync") {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();
  // ── Encabezado ──
  doc.setFillColor(38, 81, 163);
  doc.rect(0, 0, pageW, 38, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(nombreClinica, 14, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Sistema de Gestión Dental DentaSync", 14, 24);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("PRESUPUESTO", pageW - 14, 16, { align: "right" });
  doc.setFontSize(10);
  doc.text(presupuesto.numero, pageW - 14, 24, { align: "right" });
  // ── Datos del presupuesto ──
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  const fechaEmision = new Date(presupuesto.fecha).toLocaleDateString("es-ES");
  const fechaVence = new Date(presupuesto.fechaVencimiento).toLocaleDateString("es-ES");
  doc.setFillColor(245, 248, 250);
  doc.rect(14, 44, pageW - 28, 28, "F");
  doc.setFont("helvetica", "bold");
  doc.text("Paciente:", 18, 52);
  doc.setFont("helvetica", "normal");
  doc.text(presupuesto.pacienteNombre, 44, 52);
  doc.setFont("helvetica", "bold");
  doc.text("Fecha de emisión:", 18, 59);
  doc.setFont("helvetica", "normal");
  doc.text(fechaEmision, 60, 59);
  doc.setFont("helvetica", "bold");
  doc.text("Válido hasta:", 18, 66);
  doc.setFont("helvetica", "normal");
  doc.text(`${fechaVence} (${presupuesto.vigenciaDias} días)`, 47, 66);
  doc.setFont("helvetica", "bold");
  doc.text("Estado:", pageW - 60, 52);
  doc.setFont("helvetica", "normal");
  doc.text(presupuesto.estado, pageW - 40, 52);
  // ── Tabla de procedimientos ──
  let y = 82;
  doc.setFillColor(38, 81, 163);
  doc.rect(14, y - 6, pageW - 28, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("Código", 18, y);
  doc.text("Procedimiento", 50, y);
  doc.text("Cant.", 130, y);
  doc.text("P. Unit.", 148, y);
  doc.text("Subtotal", 170, y);
  y += 8;
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "normal");
  let altBg = false;
  presupuesto.items.forEach((item) => {
    if (altBg) {
      doc.setFillColor(245, 248, 250);
      doc.rect(14, y - 5, pageW - 28, 8, "F");
    }
    altBg = !altBg;
    doc.text(item.codigo || "—", 18, y);
    const nombreLines = doc.splitTextToSize(item.nombre, 75);
    doc.text(nombreLines, 50, y);
    doc.text(String(item.cantidad), 134, y, { align: "right" });
    doc.text(`Bs. ${item.precio.toFixed(2)}`, 163, y, { align: "right" });
    doc.text(`Bs. ${item.subtotalItem.toFixed(2)}`, pageW - 14, y, { align: "right" });
    y += nombreLines.length > 1 ? nombreLines.length * 5 + 3 : 8;
  });
  // ── Totales ──
  y += 4;
  doc.setDrawColor(200, 210, 220);
  doc.line(14, y, pageW - 14, y);
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", 130, y);
  doc.text(`Bs. ${presupuesto.subtotal.toFixed(2)}`, pageW - 14, y, { align: "right" });
  y += 7;
  if (presupuesto.descuento > 0) {
    doc.text(
      `Descuento (${presupuesto.descuentoTipo === "porcentaje" ? presupuesto.descuentoValor + "%" : "fijo"}):`,
      130,
      y
    );
    doc.setTextColor(200, 0, 0);
    doc.text(`- Bs. ${presupuesto.descuento.toFixed(2)}`, pageW - 14, y, { align: "right" });
    doc.setTextColor(0, 0, 0);
    y += 7;
  }
  doc.setFillColor(38, 81, 163);
  doc.rect(120, y - 5, pageW - 134, 10, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", 125, y + 1);
  doc.text(`Bs. ${presupuesto.total.toFixed(2)}`, pageW - 14, y + 1, { align: "right" });
  // ── Notas y pie ──
  if (presupuesto.notas) {
    y += 18;
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.text("Notas:", 14, y);
    doc.setFont("helvetica", "normal");
    const notasLines = doc.splitTextToSize(presupuesto.notas, pageW - 28);
    doc.text(notasLines, 14, y + 5);
  }
  const pieY = doc.internal.pageSize.getHeight() - 18;
  doc.setTextColor(150, 150, 150);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text(
    "Este presupuesto no constituye una factura. Tiene validez por los días indicados desde la fecha de emisión.",
    pageW / 2,
    pieY,
    { align: "center" }
  );
  doc.text(
    `Generado por DentaSync — ${new Date().toLocaleString("es-ES")}`,
    pageW / 2,
    pieY + 5,
    { align: "center" }
  );
  doc.save(
    `Presupuesto_${presupuesto.numero}_${presupuesto.pacienteNombre.replace(/\s+/g, "_")}.pdf`
  );
}
