
'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  getProject,
  getTasks,
  updateTask,
  createTask,
} from '../../../lib/api';

type Project = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
};

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [projectId, setProjectId] = useState('');
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updatingTaskId, setUpdatingTaskId] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProject() {
      try {
        const { id } = await params;

        setProjectId(id);

        const token = localStorage.getItem('accessToken');

        if (!token) {
          window.location.href = '/login';
          return;
        }

        const [projectData, taskData] = await Promise.all([
          getProject(id),
          getTasks(id),
        ]);

        setProject(projectData);
        setTasks(taskData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load project',
        );
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [params]);

  async function handleCreateTask(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    setCreating(true);
    setError('');

    try {
      const newTask = await createTask(
        projectId,
        title.trim(),
        description.trim() || undefined,
      );

      setTasks((current) => [newTask, ...current]);

      setTitle('');
      setDescription('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create task',
      );
    } finally {
      setCreating(false);
    }
  }

  async function toggleTask(task: Task) {
    setUpdatingTaskId(task.id);
    setError('');

    try {
      const updatedTask = await updateTask(
        projectId,
        task.id,
        !task.completed,
      );

      setTasks((current) =>
        current.map((item) =>
          item.id === updatedTask.id
            ? updatedTask
            : item,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update task',
      );
    } finally {
      setUpdatingTaskId('');
    }
  }

  function goBack() {
    window.location.href = '/';
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm font-medium text-zinc-700">
            Loading project...
          </p>
        </div>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white">
        <div className="rounded-2xl border border-blue-100 bg-white p-10 text-center shadow-lg">
          <h1 className="bg-gradient-to-r from-zinc-950 via-blue-900 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
            Project not found
          </h1>

          <p className="mt-2 text-zinc-600">
            {error || 'This project could not be found.'}
          </p>

          <button
            onClick={goBack}
            className="mt-5 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-3 font-medium text-white shadow-lg shadow-blue-500/20"
          >
            Back to Projects
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.12),transparent_32%),radial-gradient(circle_at_top_right,rgba(147,197,253,0.10),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.10),transparent_35%)] text-zinc-900">

      <header className="border-b border-blue-100/70 bg-white/90 shadow-[0_1px_20px_rgba(59,130,246,0.08)] backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-6">

          <button
            onClick={goBack}
            className="mb-5 text-sm font-medium text-zinc-600 transition hover:text-blue-700"
          >
            ← Back to projects
          </button>

          <h1 className="bg-gradient-to-r from-zinc-950 via-blue-900 to-blue-600 bg-clip-text text-4xl font-bold tracking-tight text-transparent">
            {project.name}
          </h1>

          <p className="mt-3 max-w-2xl text-zinc-700">
            {project.description ||
              'No project description provided.'}
          </p>

        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-10">

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-sm">
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-3">

          <div className="rounded-2xl border border-blue-100 bg-white/90 p-6 shadow-[0_8px_30px_rgba(59,130,246,0.08)] backdrop-blur-sm">

            <div className="mb-6">
              <h2 className="bg-gradient-to-r from-zinc-950 to-blue-700 bg-clip-text text-2xl font-bold text-transparent">
                Add Task
              </h2>

              <p className="mt-1 text-sm text-zinc-600">
                Add a new task to this project.
              </p>
            </div>

            <form
              onSubmit={handleCreateTask}
              className="space-y-5"
            >

              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-semibold text-zinc-800"
                >
                  Task title
                </label>

                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  placeholder="Build login page"
                  required
                  className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-semibold text-zinc-800"
                >
                  Description
                </label>

                <textarea
                  id="description"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                  placeholder="Describe the task..."
                  rows={4}
                  className="w-full resize-none rounded-xl border border-blue-100 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 px-5 py-3 font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 disabled:opacity-50"
              >
                {creating
                  ? 'Creating...'
                  : 'Create Task'}
              </button>

            </form>
          </div>

          <div className="lg:col-span-2">

            <div className="mb-6 flex items-center justify-between">

              <div>
                <h2 className="bg-gradient-to-r from-zinc-950 via-blue-900 to-blue-600 bg-clip-text text-2xl font-bold text-transparent">
                  Tasks
                </h2>

                <p className="mt-1 text-sm text-zinc-600">
                  Manage tasks for this project.
                </p>
              </div>

              <span className="rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm">
                {tasks.length} task
                {tasks.length === 1 ? '' : 's'}
              </span>

            </div>

            {tasks.length === 0 ? (

              <div className="rounded-2xl border border-dashed border-blue-200 bg-white/80 p-10 text-center shadow-sm">
                <h3 className="font-semibold text-zinc-900">
                  No tasks yet
                </h3>

                <p className="mt-2 text-sm text-zinc-600">
                  Create your first task for this project.
                </p>
              </div>

            ) : (

              <div className="space-y-4">

                {tasks.map((task) => (

                  <div
                    key={task.id}
                    className="rounded-2xl border border-blue-100/80 bg-white/95 p-5 shadow-[0_6px_24px_rgba(59,130,246,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(59,130,246,0.12)]"
                  >

                    <div className="flex items-start gap-4">

                      <input
                        type="checkbox"
                        checked={task.completed}
                        disabled={
                          updatingTaskId === task.id
                        }
                        onChange={() =>
                          toggleTask(task)
                        }
                        className="mt-1 h-5 w-5 cursor-pointer accent-blue-600 disabled:cursor-wait"
                      />

                      <div className="flex-1">

                        <h3
                          className={`text-lg font-semibold ${
                            task.completed
                              ? 'text-zinc-400 line-through'
                              : 'text-zinc-900'
                          }`}
                        >
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="mt-2 text-sm leading-6 text-zinc-700">
                            {task.description}
                          </p>
                        )}

                        <p className="mt-3 text-xs font-medium text-zinc-500">
                          Created{' '}
                          {new Date(
                            task.createdAt,
                          ).toLocaleDateString()}
                        </p>

                      </div>

                      {updatingTaskId === task.id && (
                        <span className="text-xs font-medium text-blue-600">
                          Saving...
                        </span>
                      )}

                    </div>
                  </div>

                ))}

              </div>

            )}

          </div>
        </div>
      </section>
    </main>
  );
}


