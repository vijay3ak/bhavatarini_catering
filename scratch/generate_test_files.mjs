import fs from "node:fs";
import path from "node:path";

const SCRATCH_DIR = path.resolve("./scratch");

// 1. Valid PNG File (10x10 valid PNG image)
const pngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9QzwAEjDAGNYAAAI4UB/5h9i34AAAAAElFTkSuQmCC";
const pngPath = path.join(SCRATCH_DIR, "sample_canteen_slip.png");
fs.writeFileSync(pngPath, Buffer.from(pngBase64, "base64"));
console.log("Created valid PNG:", pngPath, `(${fs.statSync(pngPath).size} bytes)`);

// 2. Valid PDF File
const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 200] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 64 >>
stream
BT
/F1 14 Tf
30 100 Td
(BHAVATARINI CATERING - SAMPLE REGISTER) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000244 00000 n 
0000000359 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
436
%%EOF`;
const pdfPath = path.join(SCRATCH_DIR, "sample_canteen_register.pdf");
fs.writeFileSync(pdfPath, pdfContent, "utf-8");
console.log("Created valid PDF:", pdfPath, `(${fs.statSync(pdfPath).size} bytes)`);

// 3. Invalid Text File
const txtPath = path.join(SCRATCH_DIR, "invalid_notes.txt");
fs.writeFileSync(txtPath, "This is an unapproved text format document.", "utf-8");
console.log("Created invalid TXT:", txtPath, `(${fs.statSync(txtPath).size} bytes)`);
