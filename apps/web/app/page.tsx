'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getProjects } from '../lib/api';

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProjects() {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const data = await getProjects();
        setProjects(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load projects',
        );
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  function logout() {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <p className="text-zinc-600">Loading projects...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              DevFlow
            </h1>

            <p className="text-sm text-zinc-500">
              Project dashboard
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <h2 className="text-3xl font-bold">
            Your Projects
          </h2>

          <p className="mt-2 text-zinc-500">
            Select a project to view its tasks.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {projects.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-white p-10 text-center">
            <h3 className="text-lg font-semibold">
              No projects yet
            </h3>

            <p className="mt-2 text-sm text-zinc-500">
              You do not have any projects yet.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <h3 className="text-xl font-semibold">
                  {project.name}
                </h3>

                <p className="mt-2 min-h-12 text-sm text-zinc-500">
                  {project.description ||
                    'No project description provided.'}
                </p>

                <div className="mt-6 text-sm font-medium text-blue-600">
                  View project →
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
