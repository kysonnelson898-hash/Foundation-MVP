'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  createProject,
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

  const [creating, setCreating] =
    useState(false);

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [projectName, setProjectName] =
    useState('');

  const [
    projectDescription,
    setProjectDescription,
  ] = useState('');

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

  async function handleCreateProject(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = projectName.trim();

    if (!name) {
      setError('Project name cannot be empty');
      return;
    }

    setCreating(true);
    setError('');

    try {
      const newProject =
        await createProject(
          name,
          projectDescription.trim() ||
            undefined,
        );

      setProjects((current) => [
        newProject,
        ...current,
      ]);

      setProjectName('');
      setProjectDescription('');
      setShowCreateForm(false);

      const dashboardData =
        await getDashboard();

      setDashboard(dashboardData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create project',
      );
    } finally {
      setCreating(false);
    }
  }

  function cancelCreateProject() {
    setProjectName('');
    setProjectDescription('');
    setShowCreateForm(false);
    setError('');
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold">
              Dashboard
            </h2>

            <p className="mt-2 text-zinc-500">
              See your projects and task progress at a glance.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowCreateForm(
                (current) => !current,
              );
              setError('');
            }}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {showCreateForm
              ? 'Close'
              : '+ Create project'}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {showCreateForm && (
          <form
            onSubmit={handleCreateProject}
            className="mb-10 rounded-xl border bg-white p-6 shadow-sm"
          >
            <div className="mb-6">
              <h3 className="text-xl font-semibold">
                Create a project
              </h3>

              <p className="mt-1 text-sm text-zinc-500">
                Start a new project and add tasks to it.
              </p>
            </div>

            <div className="grid gap-5">
              <div>
                <label
                  htmlFor="project-name"
                  className="mb-1 block text-sm font-semibold text-zinc-800"
                >
                  Project name
                </label>

                <input
                  id="project-name"
                  type="text"
                  value={projectName}
                  onChange={(event) =>
                    setProjectName(
                      event.target.value,
                    )
                  }
                  placeholder="e.g. Website redesign"
                  maxLength={100}
                  autoFocus
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="project-description"
                  className="mb-1 block text-sm font-semibold text-zinc-800"
                >
                  Description
                </label>

                <textarea
                  id="project-description"
                  value={projectDescription}
                  onChange={(event) =>
                    setProjectDescription(
                      event.target.value,
                    )
                  }
                  placeholder="Describe what this project is about..."
                  maxLength={2000}
                  rows={4}
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={cancelCreateProject}
                  disabled={creating}
                  className="rounded-lg border px-5 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    creating ||
                    !projectName.trim()
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {creating
                    ? 'Creating...'
                    : 'Create project'}
                </button>
              </div>
            </div>
          </form>
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
              Create your first project to get started.
            </p>

            <button
              type="button"
              onClick={() => {
                setShowCreateForm(true);
                setError('');
              }}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Create your first project
            </button>
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
