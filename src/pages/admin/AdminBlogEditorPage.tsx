import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createBlogPost, fetchAdminBlogPostById, slugify, updateBlogPost, type BlogPostUpsert } from '../../lib/blog';
import { renderMarkdownToHtml } from '../../lib/markdown';
import { supabase } from '../../lib/supabase';

const DEFAULT_FORM: BlogPostUpsert = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  published_date: new Date().toISOString().slice(0, 10),
  meta_description: '',
  meta_keywords: '',
  author_name: 'Alivio Editorial Team',
  category: 'Healthcare Recruiting',
  cover_image_url: null,
  status: 'draft',
};

export default function AdminBlogEditorPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState<BlogPostUpsert>(DEFAULT_FORM);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [slugEdited, setSlugEdited] = useState(false);

  useEffect(() => {
    if (!isEdit || !id) return;

    async function loadPost() {
      setLoading(true);
      setError(null);
      try {
        const post = await fetchAdminBlogPostById(id);
        if (!post) {
          setError('Post not found.');
          return;
        }
        setForm({
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          published_date: post.published_date,
          meta_description: post.meta_description,
          meta_keywords: post.meta_keywords,
          author_name: post.author_name,
          category: post.category,
          cover_image_url: post.cover_image_url,
          status: post.status,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load post.');
      } finally {
        setLoading(false);
      }
    }

    void loadPost();
  }, [id, isEdit]);

  const previewHtml = useMemo(() => renderMarkdownToHtml(form.content), [form.content]);

  const onTitleChange = (value: string) => {
    setForm((prev) => ({ ...prev, title: value, slug: slugEdited ? prev.slug : slugify(value) }));
  };

  const uploadCoverImage = async (file: File) => {
    const fileExt = file.name.split('.').pop() ?? 'jpg';
    const path = `blog-covers/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('blog-covers').upload(path, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('blog-covers').getPublicUrl(path);
    setForm((prev) => ({ ...prev, cover_image_url: data.publicUrl }));
  };

  const save = async (status: 'draft' | 'published') => {
    setSaving(true);
    setError(null);

    const payload: BlogPostUpsert = {
      ...form,
      status,
      slug: slugify(form.slug || form.title),
      meta_description: form.meta_description || form.excerpt,
      published_date: form.published_date || new Date().toISOString().slice(0, 10),
    };

    try {
      if (isEdit && id) {
        await updateBlogPost(id, payload);
      } else {
        await createBlogPost(payload);
      }
      navigate('/admin/blog');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save post.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header"><h1 style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{isEdit ? 'Edit Blog Post' : 'New Blog Post'}</h1></div>
      <div className="page-content space-y-4">
        <div className="flex items-center justify-between">
          <Link to="/admin/blog" className="btn-secondary">← Back to blog admin</Link>
          <button className="btn-secondary" onClick={() => setPreviewMode((prev) => !prev)}>{previewMode ? 'Edit mode' : 'Preview mode'}</button>
        </div>

        {error ? <div className="card" style={{ borderColor: 'var(--error)', color: 'var(--error)', padding: '12px' }}>{error}</div> : null}

        {loading ? <div className="card" style={{ padding: '16px' }}>Loading...</div> : (
          <div className="card" style={{ padding: '18px' }}>
            <div className="grid md:grid-cols-2 gap-3">
              <input className="input" placeholder="Title" value={form.title} onChange={(e) => onTitleChange(e.target.value)} />
              <input className="input" placeholder="Author" value={form.author_name} onChange={(e) => setForm((prev) => ({ ...prev, author_name: e.target.value }))} />
              <input className="input" placeholder="Slug" value={form.slug} onChange={(e) => { setSlugEdited(true); setForm((prev) => ({ ...prev, slug: e.target.value })); }} />
              <input className="input" placeholder="Category" value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
              <input className="input" type="date" value={form.published_date} onChange={(e) => setForm((prev) => ({ ...prev, published_date: e.target.value }))} />
              <input className="input" placeholder="Meta keywords" value={form.meta_keywords} onChange={(e) => setForm((prev) => ({ ...prev, meta_keywords: e.target.value }))} />
            </div>

            <textarea className="input w-full mt-3" rows={3} placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))} />
            <textarea className="input w-full mt-3" rows={2} placeholder="Meta description" value={form.meta_description} onChange={(e) => setForm((prev) => ({ ...prev, meta_description: e.target.value }))} />

            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <input className="input" placeholder="Cover image URL" value={form.cover_image_url ?? ''} onChange={(e) => setForm((prev) => ({ ...prev, cover_image_url: e.target.value || null }))} />
              <input type="file" accept="image/*" onChange={(e) => { const file = e.target.files?.[0]; if (file) void uploadCoverImage(file).catch((err) => setError(err instanceof Error ? err.message : 'Image upload failed.')); }} />
            </div>

            {!previewMode ? (
              <textarea className="input w-full mt-3" rows={18} placeholder="Write markdown content..." value={form.content} onChange={(e) => setForm((prev) => ({ ...prev, content: e.target.value }))} />
            ) : (
              <div className="blog-markdown mt-3" dangerouslySetInnerHTML={{ __html: previewHtml }} />
            )}

            <div className="mt-4 flex gap-2">
              <button className="btn-secondary" disabled={saving} onClick={() => void save('draft')}>Save Draft</button>
              <button className="btn-primary" disabled={saving} onClick={() => void save('published')}>Publish</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
