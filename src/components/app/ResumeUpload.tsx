import { useMemo, useRef, useState, type DragEvent } from 'react';
import { parseResume, scoreCandidate, type ParsedResumeOutput } from '../../lib/ai';
import { supabase } from '../../lib/supabase';

interface ResumeUploadProps {
  candidateId: string;
  accountId: string;
  onParsed: (data: ParsedResumeOutput) => void;
}

type UploadStatus = 'idle' | 'dragging' | 'uploading' | 'parsing' | 'success' | 'error';

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_EXTENSIONS = ['pdf', 'txt', 'doc', 'docx'] as const;

const SUPPORTED_MIME_TYPES = new Set<string>([
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

async function extractPdfText(file: File) {
  const pdfjs = await import('pdfjs-dist');
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const pages: string[] = [];

  for (let pageIndex = 1; pageIndex <= doc.numPages; pageIndex += 1) {
    const page = await doc.getPage(pageIndex);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .trim();
    if (pageText) {
      pages.push(pageText);
    }
  }

  return pages.join('\n');
}

async function readTextFile(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
    reader.onerror = () => reject(new Error('Could not read file contents.'));
    reader.readAsText(file);
  });
}

function getExtension(fileName: string) {
  const parts = fileName.toLowerCase().split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

function isSupportedFile(file: File) {
  const extension = getExtension(file.name);
  return ACCEPTED_EXTENSIONS.includes(extension as (typeof ACCEPTED_EXTENSIONS)[number])
    || SUPPORTED_MIME_TYPES.has(file.type);
}

async function extractResumeText(file: File) {
  const extension = getExtension(file.name);

  if (extension === 'pdf' || file.type === 'application/pdf') {
    return { text: await extractPdfText(file), warning: null as string | null };
  }

  if (extension === 'txt' || file.type === 'text/plain') {
    return { text: await readTextFile(file), warning: null as string | null };
  }

  if (extension === 'doc' || extension === 'docx') {
    const raw = await file.arrayBuffer();
    const fallbackText = new TextDecoder('utf-8', { fatal: false }).decode(raw);
    return {
      text: fallbackText,
      warning: 'For best results, upload a PDF or TXT file.',
    };
  }

  throw new Error('Unsupported file type. Upload PDF, TXT, DOC, or DOCX.');
}

function formatBytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ResumeUpload({ candidateId, accountId, onParsed }: ResumeUploadProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [lastParsed, setLastParsed] = useState<ParsedResumeOutput | null>(null);

  const statusLabel = useMemo(() => {
    if (status === 'parsing') return 'Parsing resume with AI...';
    if (status === 'uploading') return 'Uploading resume file...';
    return null;
  }, [status]);

  async function performUpload(file: File) {
    if (!isSupportedFile(file)) {
      throw new Error('Unsupported file type. Upload PDF, TXT, DOC, or DOCX.');
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error('File is too large. Maximum size is 10MB.');
    }

    setError(null);
    setWarning(null);
    setSelectedFile(file);
    setStatus('parsing');
    setProgress(0);

    const { text, warning: extractionWarning } = await extractResumeText(file);
    if (!text.trim()) {
      throw new Error('We could not extract readable text from that file.');
    }

    if (extractionWarning) {
      setWarning(extractionWarning);
    }

    const parsed = await parseResume(text.trim());

    const safeFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const timestamp = Date.now();
    const filePath = `${accountId}/${candidateId}/${timestamp}-${safeFilename}`;

    setStatus('uploading');
    setProgress(5);

    const progressTimer = window.setInterval(() => {
      setProgress((current: number) => (current >= 90 ? current : current + 7));
    }, 180);

    const { error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, file, { upsert: true, contentType: file.type || 'application/octet-stream' });

    window.clearInterval(progressTimer);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    setProgress(100);

    const { error: resumeFileError } = await supabase.from('resume_files').insert({
      candidate_id: candidateId,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      uploaded_at: new Date().toISOString(),
    });

    if (resumeFileError) {
      throw new Error(`Could not save resume file record: ${resumeFileError.message}`);
    }

    const { error: parseJobError } = await supabase.from('resume_parse_jobs').insert({
      candidate_id: candidateId,
      status: 'complete',
      parsed_data: parsed.data,
      created_at: new Date().toISOString(),
    });

    if (parseJobError) {
      throw new Error(`Could not save parse job: ${parseJobError.message}`);
    }

    const { data: existingCandidate, error: candidateFetchError } = await supabase
      .from('candidates')
      .select('full_name, email, phone, location, current_title, experience_years, skills, role_id')
      .eq('id', candidateId)
      .single();

    if (candidateFetchError) {
      throw new Error(`Could not load candidate profile: ${candidateFetchError.message}`);
    }

    const latestRole = parsed.data.recentRoles[0];
    const existingSkills = Array.isArray(existingCandidate.skills) ? existingCandidate.skills : [];
    const updates = {
      skills: existingSkills.length > 0 ? existingSkills : parsed.data.skills,
      experience_years: existingCandidate.experience_years ?? parsed.data.yearsExperience,
      current_title: existingCandidate.current_title ?? latestRole?.title ?? null,
      full_name: existingCandidate.full_name?.trim() ? existingCandidate.full_name : parsed.data.fullName,
      email: existingCandidate.email?.trim() ? existingCandidate.email : parsed.data.email,
      phone: existingCandidate.phone?.trim() ? existingCandidate.phone : parsed.data.phone,
      location: existingCandidate.location?.trim() ? existingCandidate.location : parsed.data.location,
    };

    const { error: updateError } = await supabase.from('candidates').update(updates).eq('id', candidateId);
    if (updateError) {
      throw new Error(`Could not update candidate fields: ${updateError.message}`);
    }

    if (existingCandidate.role_id) {
      try {
        await scoreCandidate(candidateId, existingCandidate.role_id);
      } catch (scoreError) {
        setWarning(
          scoreError instanceof Error
            ? `Resume parsed, but AI scoring failed: ${scoreError.message}`
            : 'Resume parsed, but AI scoring failed.',
        );
      }
    }

    setLastParsed(parsed.data);
    setStatus('success');
    onParsed(parsed.data);
  }

  async function handleFile(file: File) {
    try {
      await performUpload(file);
    } catch (uploadError) {
      setStatus('error');
      setProgress(0);
      setError(uploadError instanceof Error ? uploadError.message : 'Unexpected error while parsing resume.');
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setStatus('idle');
    const file = event.dataTransfer.files?.[0];
    if (file) {
      void handleFile(file);
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (status === 'idle') {
      setStatus('dragging');
    }
  }

  function handleDragLeave() {
    if (status === 'dragging') {
      setStatus('idle');
    }
  }

  return (
    <div
      className="p-5 rounded-xl border"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: status === 'dragging' ? 'var(--accent)' : 'var(--border)',
      }}
    >
      <div
        role="button"
        tabIndex={0}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        className="rounded-xl border px-6 py-8 text-center cursor-pointer"
        style={{
          borderColor: status === 'dragging' ? 'var(--accent)' : 'var(--border)',
          backgroundColor: 'var(--bg-surface)',
        }}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
          Drag and drop a resume
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          PDF, TXT, DOC, or DOCX (max 10MB)
        </p>
        <button
          type="button"
          className="mt-4 px-4 py-2 rounded-lg text-sm font-semibold"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-surface)' }}
          onClick={(event) => {
            event.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          Browse files
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.txt,.doc,.docx"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
          event.currentTarget.value = '';
        }}
      />

      {selectedFile && (
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
          Selected: {selectedFile.name} ({formatBytes(selectedFile.size)})
        </p>
      )}

      {statusLabel && (
        <div className="mt-4">
          <p className="text-xs mb-2" style={{ color: 'var(--text-primary)' }}>{statusLabel}</p>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }}
            />
          </div>
        </div>
      )}

      {warning && (
        <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>{warning}</p>
      )}

      {status === 'success' && lastParsed && (
        <div
          className="mt-4 p-3 rounded-lg border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--success)' }}
        >
          <p className="text-sm font-semibold" style={{ color: 'var(--success)' }}>Resume parsed successfully</p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-primary)' }}>
            Name: {lastParsed.fullName || 'Not detected'}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-primary)' }}>
            Skills extracted: {lastParsed.skills.length}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-primary)' }}>
            Years experience: {lastParsed.yearsExperience ?? 'Not detected'}
          </p>
        </div>
      )}

      {status === 'error' && (
        <div
          className="mt-4 p-3 rounded-lg border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--error)' }}
        >
          <p className="text-xs" style={{ color: 'var(--error)' }}>{error ?? 'Parsing failed.'}</p>
          <button
            type="button"
            className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{ backgroundColor: 'var(--error)', color: 'var(--bg-surface)' }}
            onClick={() => {
              if (selectedFile) {
                void handleFile(selectedFile);
              }
            }}
            disabled={!selectedFile}
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
}
