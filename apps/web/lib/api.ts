const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message ?? 'Login failed',
    );
  }

  return data;
}
