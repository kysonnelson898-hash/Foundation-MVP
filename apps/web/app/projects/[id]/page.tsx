'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  createTask,
  deleteTask,
  getProject,
  getTasks,
  updateTask,
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
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  createdAt: string;
  updatedAt?: string;
  projectId: string;
};

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [projectId, setProjectId] = useState('');
  const [project, setProject] =
    useState<Project | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [title, setTitle] = useState('');
  const [description, setDescription] =
    useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] =
    useState<'LOW' | 'MEDIUM' | 'HIGH'>(
      'MEDIUM',
    );

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] =
    useState(false);

  const [updatingTaskId, setUpdatingTaskId] =
    useState('');

  const [editingTaskId, setEditingTaskId] =
    useState('');

  const [editingTitle, setEditingTitle] =
    useState('');

  const [editingDescription, setEditingDescription] =
    useState('');

  const [editingDueDate, setEditingDueDate] =
    useState('');

  const [editingPriority, setEditingPriority] =
    useState<'LOW' | 'MEDIUM' | 'HIGH'>(
      'MEDIUM',
    );

  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProject() {
      try {
        const { id } = await params;

        setProjectId(id);

        const token =
          localStorage.getItem('accessToken');

        if (!token) {
          window.location.href = '/login';
          return;
        }

        const [projectData, tasksData] =
          await Promise.all([
            getProject(id),
            getTasks(id),
          ]);

        setProject(projectData);
        setTasks(tasksData);
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

  async function createNewTask(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!title.trim()) {
      return;
    }

    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    setCreating(true);
    setError('');

    try {
      const newTask = await createTask(
        projectId,
        title.trim(),
        description.trim() || undefined,
        dueDate || undefined,
        priority,
      );

      setTasks((current) => [
        newTask,
        ...current,
      ]);

      setTitle('');
      setDescription('');
      setDueDate('');
      setPriority('MEDIUM');
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
        {
          completed: !task.completed,
        },
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

  function startEditing(task: Task) {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
    setEditingDescription(
      task.description ?? '',
    );

    setEditingDueDate(
      task.dueDate
        ? new Date(task.dueDate)
            .toISOString()
            .slice(0, 10)
        : '',
    );

    setEditingPriority(task.priority);

    setError('');
  }

  function cancelEditing() {
    setEditingTaskId('');
    setEditingTitle('');
    setEditingDescription('');
    setEditingDueDate('');
    setEditingPriority('MEDIUM');
  }

  async function saveTask(task: Task) {
    if (!editingTitle.trim()) {
      setError('Task title cannot be empty');
      return;
    }

    setUpdatingTaskId(task.id);
    setError('');

    try {
      const updatedTask = await updateTask(
        projectId,
        task.id,
        {
          title: editingTitle.trim(),
          description:
            editingDescription.trim(),
          dueDate:
            editingDueDate || '',
          priority: editingPriority,
        },
      );

      setTasks((current) =>
        current.map((item) =>
          item.id === updatedTask.id
            ? updatedTask
            : item,
        ),
      );

      cancelEditing();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to save task',
      );
    } finally {
      setUpdatingTaskId('');
    }
  }

  async function removeTask(task: Task) {
    const confirmed = window.confirm(
      `Delete "${task.title}"? This cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setUpdatingTaskId(task.id);
    setError('');

    try {
      await deleteTask(
        projectId,
        task.id,
      );

      setTasks((current) =>
        current.filter(
          (item) => item.id !== task.id,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to delete task',
      );
    } finally {
      setUpdatingTaskId('');
    }
  }

  function goBack() {
    window.location.href = '/';
  }

  function formatDueDate(
    value: string | null,
  ) {
    if (!value) {
      return null;
    }

    return new Date(value).toLocaleDateString(
      undefined,
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      },
    );
  }

  function isOverdue(task: Task) {
    if (!task.dueDate || task.completed) {
      return false;
    }

    const due = new Date(task.dueDate);
    const now = new Date();

    due.setHours(23, 59, 59, 999);

    return due < now;
  }

  function priorityLabel(
    value: 'LOW' | 'MEDIUM' | 'HIGH',
  ) {
    if (value === 'HIGH') {
      return 'High';
    }

    if (value === 'LOW') {
      return 'Low';
    }

    return 'Medium';
  }

  function priorityClass(
    value: 'LOW' | 'MEDIUM' | 'HIGH',
  ) {
    if (value === 'HIGH') {
      return 'bg-red-50 text-red-700';
    }

    if (value === 'LOW') {
      return 'bg-zinc-100 text-zinc-600';
    }

    return 'bg-amber-50 text-amber-700';
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
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900">
            Project not found
          </h1>

          <p className="mt-2 text-zinc-500">
            {error ||
              'This project could not be found.'}
          </p>

          <button
            onClick={goBack}
            className="mt-5 rounded-lg bg-black px-5 py-3 font-medium text-white transition hover:bg-zinc-800"
          >
            Back to Projects
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <div className="min-h-screen border-t-4 border-blue-200 bg-gradient-to-b from-blue-50/60 via-white to-white">
        <header className="border-b border-blue-100/80 bg-white/90 shadow-[0_4px_20px_rgba(59,130,246,0.06)] backdrop-blur">
          <div className="mx-auto max-w-6xl px-6 py-6">
            <button
              onClick={goBack}
              className="mb-5 text-sm font-medium text-zinc-500 transition hover:text-blue-600"
            >
              ← Back to projects
            </button>

            <h1 className="bg-gradient-to-r from-zinc-950 via-blue-800 to-blue-500 bg-clip-text text-3xl font-bold text-transparent">
              {project.name}
            </h1>

            <p className="mt-2 text-zinc-600">
              {project.description ||
                'No project description provided.'}
            </p>
          </div>
        </header>

        <section className="mx-auto max-w-6xl px-6 py-10">
          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-2xl border border-blue-100/80 bg-white/95 p-6 shadow-[0_8px_30px_rgba(59,130,246,0.08)]">
              <h2 className="mb-5 bg-gradient-to-r from-zinc-950 to-blue-700 bg-clip-text text-xl font-bold text-transparent">
                Add Task
              </h2>

              <form
                onSubmit={createNewTask}
                className="space-y-4"
              >
                <div>
                  <label
                    htmlFor="title"
                    className="mb-1 block text-sm font-semibold text-zinc-800"
                  >
                    Task title
                  </label>

                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) =>
                      setTitle(
                        event.target.value,
                      )
                    }
                    placeholder="Build login page"
                    required
                    className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="mb-1 block text-sm font-semibold text-zinc-800"
                  >
                    Description
                  </label>

                  <textarea
                    id="description"
                    value={description}
                    onChange={(event) =>
                      setDescription(
                        event.target.value,
                      )
                    }
                    placeholder="Describe the task..."
                    rows={4}
                    className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="priority"
                    className="mb-1 block text-sm font-semibold text-zinc-800"
                  >
                    Priority
                  </label>

                  <select
                    id="priority"
                    value={priority}
                    onChange={(event) =>
                      setPriority(
                        event.target.value as
                          | 'LOW'
                          | 'MEDIUM'
                          | 'HIGH',
                      )
                    }
                    className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="LOW">
                      Low
                    </option>
                    <option value="MEDIUM">
                      Medium
                    </option>
                    <option value="HIGH">
                      High
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="dueDate"
                    className="mb-1 block text-sm font-semibold text-zinc-800"
                  >
                    Due date
                  </label>

                  <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(event) =>
                      setDueDate(
                        event.target.value,
                      )
                    }
                    className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full rounded-xl bg-gradient-to-r from-blue-700 to-blue-500 px-5 py-3 font-semibold text-white shadow-[0_6px_18px_rgba(37,99,235,0.22)] transition hover:from-blue-800 hover:to-blue-600 disabled:cursor-wait disabled:opacity-50"
                >
                  {creating
                    ? 'Creating...'
                    : 'Create Task'}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="bg-gradient-to-r from-zinc-950 to-blue-700 bg-clip-text text-xl font-bold text-transparent">
                  Tasks
                </h2>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700">
                  {tasks.length} task
                  {tasks.length === 1
                    ? ''
                    : 's'}
                </span>
              </div>

              {tasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-blue-200 bg-white p-10 text-center shadow-sm">
                  <h3 className="font-semibold text-zinc-900">
                    No tasks yet
                  </h3>

                  <p className="mt-2 text-sm text-zinc-500">
                    Create your first task for
                    this project.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => {
                    const updating =
                      updatingTaskId ===
                      task.id;

                    const editing =
                      editingTaskId ===
                      task.id;

                    const formattedDueDate =
                      formatDueDate(
                        task.dueDate,
                      );

                    const overdue =
                      isOverdue(task);

                    return (
                      <div
                        key={task.id}
                        className={`rounded-2xl border border-blue-100/80 bg-white/95 p-5 shadow-[0_6px_24px_rgba(59,130,246,0.07)] transition ${
                          updating
                            ? 'opacity-70'
                            : 'hover:-translate-y-0.5 hover:shadow-[0_10px_30px_rgba(59,130,246,0.12)]'
                        }`}
                      >
                        {editing ? (
                          <div className="space-y-4">
                            <div>
                              <label
                                htmlFor={`edit-title-${task.id}`}
                                className="mb-1 block text-sm font-semibold text-zinc-800"
                              >
                                Task title
                              </label>

                              <input
                                id={`edit-title-${task.id}`}
                                type="text"
                                value={editingTitle}
                                onChange={(event) =>
                                  setEditingTitle(
                                    event.target
                                      .value,
                                  )
                                }
                                className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`edit-description-${task.id}`}
                                className="mb-1 block text-sm font-semibold text-zinc-800"
                              >
                                Description
                              </label>

                              <textarea
                                id={`edit-description-${task.id}`}
                                value={
                                  editingDescription
                                }
                                onChange={(event) =>
                                  setEditingDescription(
                                    event.target
                                      .value,
                                  )
                                }
                                rows={3}
                                className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`edit-priority-${task.id}`}
                                className="mb-1 block text-sm font-semibold text-zinc-800"
                              >
                                Priority
                              </label>

                              <select
                                id={`edit-priority-${task.id}`}
                                value={
                                  editingPriority
                                }
                                onChange={(event) =>
                                  setEditingPriority(
                                    event.target
                                      .value as
                                      | 'LOW'
                                      | 'MEDIUM'
                                      | 'HIGH',
                                  )
                                }
                                className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              >
                                <option value="LOW">
                                  Low
                                </option>
                                <option value="MEDIUM">
                                  Medium
                                </option>
                                <option value="HIGH">
                                  High
                                </option>
                              </select>
                            </div>

                            <div>
                              <label
                                htmlFor={`edit-due-date-${task.id}`}
                                className="mb-1 block text-sm font-semibold text-zinc-800"
                              >
                                Due date
                              </label>

                              <input
                                id={`edit-due-date-${task.id}`}
                                type="date"
                                value={
                                  editingDueDate
                                }
                                onChange={(event) =>
                                  setEditingDueDate(
                                    event.target
                                      .value,
                                  )
                                }
                                className="w-full rounded-xl border border-blue-100 bg-white px-4 py-3 text-zinc-900 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                              />

                              {editingDueDate && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditingDueDate(
                                      '',
                                    )
                                  }
                                  className="mt-2 text-xs font-medium text-zinc-500 hover:text-red-600"
                                >
                                  Clear due date
                                </button>
                              )}
                            </div>

                            <div className="flex gap-3">
                              <button
                                type="button"
                                onClick={() =>
                                  saveTask(
                                    task,
                                  )
                                }
                                disabled={updating}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                              >
                                {updating
                                  ? 'Saving...'
                                  : 'Save'}
                              </button>

                              <button
                                type="button"
                                onClick={
                                  cancelEditing
                                }
                                disabled={updating}
                                className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-4">
                            <input
                              type="checkbox"
                              checked={
                                task.completed
                              }
                              disabled={updating}
                              onChange={() =>
                                toggleTask(
                                  task,
                                )
                              }
                              className="mt-1 h-5 w-5 cursor-pointer accent-blue-600 disabled:cursor-wait"
                            />

                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3
                                  className={`text-lg font-semibold ${
                                    task.completed
                                      ? 'text-zinc-400 line-through'
                                      : 'text-zinc-900'
                                  }`}
                                >
                                  {task.title}
                                </h3>

                                <span
                                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClass(
                                    task.priority,
                                  )}`}
                                >
                                  {priorityLabel(
                                    task.priority,
                                  )}
                                </span>
                              </div>

                              {task.description && (
                                <p className="mt-2 text-sm leading-6 text-zinc-700">
                                  {
                                    task.description
                                  }
                                </p>
                              )}

                              <div className="mt-3 flex flex-wrap items-center gap-2">
                                {formattedDueDate && (
                                  <span
                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                      overdue
                                        ? 'bg-red-50 text-red-600'
                                        : task.completed
                                          ? 'bg-zinc-100 text-zinc-500'
                                          : 'bg-blue-50 text-blue-700'
                                    }`}
                                  >
                                    {overdue
                                      ? 'Overdue · '
                                      : 'Due · '}
                                    {
                                      formattedDueDate
                                    }
                                  </span>
                                )}

                                <span className="text-xs font-medium text-zinc-500">
                                  Created{' '}
                                  {new Date(
                                    task.createdAt,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                              {updating && (
                                <span className="text-xs font-medium text-blue-600">
                                  Saving...
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  startEditing(
                                    task,
                                  )
                                }
                                disabled={updating}
                                className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 disabled:opacity-50"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeTask(
                                    task,
                                  )
                                }
                                disabled={updating}
                                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
