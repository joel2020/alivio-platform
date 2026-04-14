import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';

interface BlogRow {
  id: string;
  title: string;
  slug: string;
  published_date: string;
}

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Pick<BlogRow, 'title' | 'slug' | 'published_date'>>({ title: '', slug: '', published_date: '' });

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, slug, published_date')
        .order('published_date', { ascending: false });
      setPosts((data as BlogRow[]) ?? []);
    };

    void load();
  }, []);

  const startEdit = (post: BlogRow) => {
    setEditingId(post.id);
    setDraft({ title: post.title, slug: post.slug, published_date: post.published_date });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    const { error } = await supabase
      .from('blog_posts')
      .update({
        title: draft.title,
        slug: draft.slug,
        published_date: draft.published_date,
      })
      .eq('id', editingId);

    if (error) return;

    setPosts((current) => current.map((post) => (post.id === editingId ? { ...post, ...draft } : post)));
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this blog post?');
    if (!confirmed) return;

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) return;
    setPosts((current) => current.filter((post) => post.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Admin • Blog</h1>
      </div>

      <div className="page-content">
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
                <th className="p-3">Title</th>
                <th className="p-3">Published At</th>
                <th className="p-3">Slug</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => {
                const isEditing = editingId === post.id;
                return (
                  <tr key={post.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-3">
                      {isEditing ? (
                        <input className="input w-full" value={draft.title} onChange={(event) => setDraft((curr) => ({ ...curr, title: event.target.value }))} />
                      ) : (
                        post.title
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <input className="input w-full" type="date" value={draft.published_date.slice(0, 10)} onChange={(event) => setDraft((curr) => ({ ...curr, published_date: event.target.value }))} />
                      ) : (
                        new Date(post.published_date).toLocaleDateString()
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <input className="input w-full" value={draft.slug} onChange={(event) => setDraft((curr) => ({ ...curr, slug: event.target.value }))} />
                      ) : (
                        post.slug
                      )}
                    </td>
                    <td className="p-3">
                      {isEditing ? (
                        <>
                          <button className="btn-secondary mr-2" onClick={() => void saveEdit()}>Save</button>
                          <button className="btn-secondary" onClick={() => setEditingId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button className="btn-secondary mr-2" onClick={() => startEdit(post)}>Edit</button>
                          <button className="btn-secondary" onClick={() => void handleDelete(post.id)}>Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
