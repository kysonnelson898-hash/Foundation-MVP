'use client';

import { useEffect, useState } from 'react';

type User = {
  id: string;
  email: string;
  name: string;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const response = await fetch('http://localhost:3000/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem('accessToken');
          window.location.href = '/login';
          return;
        }

        const users = await response.json();

        const currentUser = users.find(
          (item: User) => item.email === 'test@devflow.local',
        );

        setUser(currentUser ?? null);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, []);

  function logout() {
    localStorage.removeItem('accessToken');
    window.location.href = '/login';
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>Loading DevFlow...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between border-b pb-6 dark:border-zinc-800">
          <div>
            <h1 className="text-3xl font-bold">DevFlow</h1>
            <p className="text-zinc-500">
              Developer workflow dashboard
            </p>
          </div>

          <button
            onClick={logout}
            className="rounded-lg border px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            Log out
          </button>
        </header>

        <section className="mt-8">
          <h2 className="text-2xl font-semibold">
            Welcome{user ? `, ${user.name}` : ''}
          </h2>

          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            You are successfully authenticated.
          </p>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-950">
            <h3 className="font-semibold">Projects</h3>
            <p className="mt-2 text-3xl font-bold">0</p>
            <p className="text-sm text-zinc-500">
              Active projects
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-950">
            <h3 className="font-semibold">Tasks</h3>
            <p className="mt-2 text-3xl font-bold">0</p>
            <p className="text-sm text-zinc-500">
              Open tasks
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm dark:bg-zinc-950">
            <h3 className="font-semibold">Account</h3>
            <p className="mt-2 text-sm">{user?.email ?? 'Authenticated user'}</p>
            <p className="mt-1 text-sm text-green-600">
              Authenticated
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
