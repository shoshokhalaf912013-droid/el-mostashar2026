import { PDFDocument, StandardFonts } from 'pdf-lib';
import { getDownloadURL, ref } from "firebase/storage";
import { storage } from "../firebase";

export async function generateCertificate(userData) {
  const templateRef = ref(storage, "certificates/certificate_template.pdf");
  const templateUrl = await getDownloadURL(templateRef);

  const existingPdfBytes = await fetch(templateUrl).then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  firstPage.drawText(userData.studentName, { x: 250, y: 350, size: 22, font });
  firstPage.drawText(userData.subjectName, { x: 250, y: 310, size: 18, font });
  firstPage.drawText(userData.gradeLevel, { x: 250, y: 270, size: 18, font });
  firstPage.drawText(`التاريخ: ${userData.completionDate}`, { x: 250, y: 230, size: 14, font });

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });

  const url = URL.createObjectURL(blob);
  window.open(url);
}
