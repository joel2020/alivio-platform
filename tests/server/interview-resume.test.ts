import assert from 'node:assert/strict';
import {zipSync,strToU8} from 'npm:fflate@0.8.3';
import {extractResume} from '../../supabase/functions/_shared/interview-resume.ts';
const content='Experienced software engineer building TypeScript applications and PostgreSQL databases. Led API development, automated testing, code reviews and engineering projects.';
function pdf(text:string){
 const stream=`BT /F1 12 Tf 40 700 Td (${text}) Tj ET`;
 const objects=['<< /Type /Catalog /Pages 2 0 R >>','<< /Type /Pages /Kids [3 0 R] /Count 1 >>','<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>','<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`];
 let raw='%PDF-1.4\n';const offsets=[0];
 for(let i=0;i<objects.length;i++){offsets.push(raw.length);raw+=`${i+1} 0 obj\n${objects[i]}\nendobj\n`;}
 const xref=raw.length;raw+='xref\n0 6\n0000000000 65535 f \n'+offsets.slice(1).map(n=>String(n).padStart(10,'0')+' 00000 n \n').join('')+`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
 return new TextEncoder().encode(raw);
}
Deno.test('real PDF and DOCX text extraction; no guessed text for malformed or image-only documents',async()=>{
 assert.match(await extractResume(pdf(content),'resume.pdf'),/TypeScript/);
 const docx=zipSync({'word/document.xml':strToU8(`<w:document><w:p><w:r><w:t>${content}</w:t></w:r></w:p></w:document>`)});
 assert.equal(await extractResume(docx,'resume.docx'),content);
 await assert.rejects(extractResume(pdf(''),'scanned.pdf'),/manual_review/);
 await assert.rejects(extractResume(new Uint8Array([1,2,3]),'bad.pdf'));
 await assert.rejects(extractResume(zipSync({'word/document.xml':strToU8('<!DOCTYPE bad>'+content)}),'bad.docx'));
 await assert.rejects(extractResume(zipSync({'word/document.xml':strToU8('x'.repeat(2_000_001))}),'oversize.docx'));
});
