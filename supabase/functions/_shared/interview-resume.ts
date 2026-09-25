import { getDocumentProxy } from 'npm:unpdf@1.8.1';
import { unzipSync } from 'npm:fflate@0.8.3';

export async function extractResume(bytes: Uint8Array, filename: string): Promise<string> {
  if (bytes.byteLength > 5 * 1024 * 1024) throw new Error('resume_too_large');
  let result = '';
  if (filename.toLowerCase().endsWith('.pdf')) {
    const pdf = await getDocumentProxy(bytes, { useSystemFonts: false });
    try {
      if (pdf.numPages > 20) throw new Error('resume_requires_manual_review');
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i), content = await page.getTextContent();
        result += content.items.map(item => 'str' in item ? item.str : '').join(' ') + '\n';
        if (result.length > 60000) throw new Error('resume_requires_manual_review');
      }
    } finally { await pdf.loadingTask.destroy(); }
  } else if (filename.toLowerCase().endsWith('.docx')) {
    const files = unzipSync(bytes, { filter: entry => entry.name === 'word/document.xml' && entry.originalSize <= 2_000_000 });
    if (!files['word/document.xml'] || files['word/document.xml'].byteLength > 2_000_000) throw new Error('unreadable_resume');
    const xml = new TextDecoder().decode(files['word/document.xml']);
    if (/<!DOCTYPE|<!ENTITY/i.test(xml)) throw new Error('invalid_document');
    result = [...xml.matchAll(/<w:t(?:\s[^>]*)?>([\s\S]*?)<\/w:t>/g)].map(match => match[1]).join(' ')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, '&');
  } else throw new Error('unsupported_resume');
  result = result.replace(/\s+/g, ' ').trim();
  if (result.length < 100 || result.length > 60000) throw new Error('resume_requires_manual_review');
  return result;
}
