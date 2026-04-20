import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteBlogPost, fetchAdminBlogPosts, formatPublicationDate, type BlogPost } from '../../lib/blog';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAdminBlogPosts();
        setPosts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load posts.');
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this blog post?')) return;

    try {
      await deleteBlogPost(id);
      setPosts((current) => current.filter((post) => post.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed.');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-base)' }}>
      <div className="page-header">
        <h1 style={{ fontSize: '0.9375rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Admin • Blog</h1>
      </div>

      <div className="page-content space-y-4">
        <div className="flex justify-end">
          <Link to="/admin/blog/new" className="btn-primary">New Post</Link>
        </div>

        {error ? <div className="card" style={{ borderColor: 'var(--error)', color: 'var(--error)', padding: '12px' }}>{error}</div> : null}
        {loading ? <div className="card" style={{ padding: '16px' }}>Loading...</div> : null}

        {!loading ? (
          <div className="card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left" style={{ color: 'var(--text-muted)' }}>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Published</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id} className="border-t" style={{ borderColor: 'var(--border)' }}>
                    <td className="p-3">
                      <div className="font-medium">{post.title}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>/blog/{post.slug}</div>
                    </td>
                    <td className="p-3">{post.category}</td>
                    <td className="p-3"><span className="badge-neutral">{post.status}</span></td>
                    <td className="p-3">{formatPublicationDate(post.published_date)}</td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Link to={`/admin/blog/${post.id}/edit`} className="btn-secondary">Edit</Link>
                        <button className="btn-secondary" onClick={() => void handleDelete(post.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}
