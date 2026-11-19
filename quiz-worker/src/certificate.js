import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

const ACCENT = rgb(0.85, 0.2, 0.2); // Mainroad's red highlight
const TEXT = rgb(0.13, 0.13, 0.13);
const MUTED = rgb(0.45, 0.45, 0.45);

/**
 * Standard PDF fonts only cover WinAnsi (Latin-1). Portuguese accents are fine,
 * but anything else (emoji, CJK, ...) would make pdf-lib throw, so we degrade it.
 */
function toWinAnsi(font, text) {
  const supported = new Set(font.getCharacterSet());
  return [...text]
    .map((ch) => {
      if (supported.has(ch.codePointAt(0))) return ch;
      const stripped = ch.normalize("NFD").replace(/\p{M}/gu, "");
      return [...stripped].every((c) => supported.has(c.codePointAt(0))) ? stripped : "?";
    })
    .join("");
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "America/Sao_Paulo",
  });
}

/**
 * @param {{id: string, name: string, quizTitle: string, score: number, issuedAt: string,
 *          blogUrl: string, verifyUrl: string}} cert
 * @returns {Promise<Uint8Array>}
 */
export async function renderCertificate(cert) {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`Certificado - ${cert.quizTitle}`);
  pdf.setAuthor("Blog do Ely");

  const page = pdf.addPage([842, 595]); // A4 landscape
  const { width, height } = page.getSize();
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const centered = (text, y, font, size, color = TEXT, maxWidth = width - 120) => {
    const safe = toWinAnsi(font, text);
    let s = size;
    while (s > 10 && font.widthOfTextAtSize(safe, s) > maxWidth) s -= 1;
    const w = font.widthOfTextAtSize(safe, s);
    page.drawText(safe, { x: (width - w) / 2, y, size: s, font, color });
  };

  page.drawRectangle({ x: 24, y: 24, width: width - 48, height: height - 48, borderColor: ACCENT, borderWidth: 3 });
  page.drawRectangle({ x: 32, y: 32, width: width - 64, height: height - 64, borderColor: MUTED, borderWidth: 0.5 });

  centered("Blog do Ely", height - 90, bold, 16, ACCENT);
  centered("Certificado de Conclusão", height - 150, bold, 36);
  centered("Certificamos que", height - 210, regular, 16, MUTED);
  centered(cert.name, height - 260, bold, 32);
  centered("concluiu com sucesso o quiz", height - 310, regular, 16, MUTED);
  centered(cert.quizTitle, height - 350, bold, 22);
  centered(
    `com aproveitamento de ${Math.round(cert.score * 100)}% em ${formatDate(cert.issuedAt)}.`,
    height - 390,
    regular,
    16,
    MUTED,
  );

  centered(cert.blogUrl, 90, regular, 12, ACCENT);
  centered(`Código de verificação: ${cert.id}`, 70, regular, 10, MUTED);
  centered(cert.verifyUrl, 56, regular, 8, MUTED);

  return pdf.save();
}
