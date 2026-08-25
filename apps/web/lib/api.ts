const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:3000';

async function apiRequest(
  path: string,
  options: RequestInit = {},
) {
  const token =
    localStorage.getItem('accessToken');

  const response = await fetch(
    `${API_URL}${path}`,
    {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
        ...(options.headers ?? {}),
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.message)
        ? data.message.join(', ')
        : data.message ?? 'Request failed',
    );
  }

  return data;
}

export async function login(
  email: string,
  password: string,
) {
  const response = await fetch(
    `${API_URL}/auth/login`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

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

export async function getMe() {
  return apiRequest('/auth/me');
}

export async function getProjects() {
  return apiRequest('/projects');
}

export async function getProject(
  projectId: string,
) {
  const projects = await getProjects();

  const project = projects.find(
    (item: { id: string }) =>
      item.id === projectId,
  );

  if (!project) {
    throw new Error('Project not found');
  }

  return project;
}

export async function createProject(
  name: string,
  description?: string,
) {
  return apiRequest('/projects', {
    method: 'POST',
    body: JSON.stringify({
      name,
      description,
    }),
  });
}

export async function createTask(
  projectId: string,
  title: string,
  description?: string,
  dueDate?: string,
  priority?: 'LOW' | 'MEDIUM' | 'HIGH',
) {
  return apiRequest(
    `/projects/${projectId}/tasks`,
    {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        dueDate,
        priority,
      }),
    },
  );
}

export async function getTasks(
  projectId: string,
) {
  return apiRequest(
    `/projects/${projectId}/tasks`,
  );
}

export async function updateTask(
  projectId: string,
  taskId: string,
  data: {
    completed?: boolean;
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  },
) {
  return apiRequest(
    `/projects/${projectId}/tasks/${taskId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );
}

export async function deleteTask(
  projectId: string,
  taskId: string,
) {
  return apiRequest(
    `/projects/${projectId}/tasks/${taskId}`,
    {
      method: 'DELETE',
    },
  );
}
