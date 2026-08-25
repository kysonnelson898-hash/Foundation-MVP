'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getDashboard,
  getProjects,
} from '../lib/api';

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

type Dashboard = {
  projects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  overdueTasks: number;
  highPriorityTasks: number;
};

export default function DashboardPage() {
  const [projects, setProjects] = useState<
    Project[]
  >([]);

  const [dashboard, setDashboard] =
    useState<Dashboard | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  useEffect(() => {
    async function loadDashboard() {
      const token =
        localStorage.getItem('accessToken');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const [
          projectsData,
          dashboardData,
        ] = await Promise.all([
          getProjects(),
          getDashboard(),
        ]);

        setProjects(projectsData);
        setDashboard(dashboardData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load dashboard',
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  function logout() {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-100">
        <p className="text-zinc-600">
          Loading dashboard...
        </p>
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
            Dashboard
          </h2>

          <p className="mt-2 text-zinc-500">
            See your projects and task progress at a glance.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {dashboard && (
          <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-zinc-500">
                Projects
              </p>

              <p className="mt-2 text-3xl font-bold">
                {dashboard.projects}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-zinc-500">
                Total tasks
              </p>

              <p className="mt-2 text-3xl font-bold">
                {dashboard.totalTasks}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-zinc-500">
                In progress
              </p>

              <p className="mt-2 text-3xl font-bold text-blue-600">
                {dashboard.inProgressTasks}
              </p>
            </div>

            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-zinc-500">
                Completed
              </p>

              <p className="mt-2 text-3xl font-bold text-green-600">
                {dashboard.completedTasks}
              </p>
            </div>
          </div>
        )}

        {dashboard && dashboard.totalTasks > 0 && (
          <div className="mb-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-zinc-500">
                To do
              </p>

              <p className="mt-2 text-2xl font-bold">
                {dashboard.todoTasks}
              </p>
            </div>

            <div className="rounded-xl border border-red-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-zinc-500">
                Overdue
              </p>

              <p className="mt-2 text-2xl font-bold text-red-600">
                {dashboard.overdueTasks}
              </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-zinc-500">
                High priority
              </p>

              <p className="mt-2 text-2xl font-bold text-orange-600">
                {dashboard.highPriorityTasks}
              </p>
            </div>
          </div>
        )}

        <div className="mb-8">
          <h2 className="text-2xl font-bold">
            Your Projects
          </h2>

          <p className="mt-2 text-zinc-500">
            Select a project to view and manage its tasks.
          </p>
        </div>

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
