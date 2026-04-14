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

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Delete this blog post?');
    if (!confirmed) return;

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) return;
    setPosts((current) => current.filter((post) => post.id !== id));
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
              {posts.map((post) => (
                <tr key={post.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <td className="p-3">{post.title}</td>
                  <td className="p-3">{new Date(post.published_date).toLocaleDateString()}</td>
                  <td className="p-3">{post.slug}</td>
                  <td className="p-3">
                    <button className="btn-secondary mr-2" onClick={() => window.alert('Edit workflow can be wired to your existing CMS editor.')}>Edit</button>
                    <button className="btn-secondary" onClick={() => void handleDelete(post.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
