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

export async function getDashboard() {
  return apiRequest('/projects/dashboard');
}

export async function getProject(
  projectId: string,
) {
  return apiRequest(
    `/projects/${projectId}`,
  );
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

export async function updateProject(
  projectId: string,
  data: {
    name?: string;
    description?: string;
  },
) {
  return apiRequest(
    `/projects/${projectId}`,
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );
}

export async function deleteProject(
  projectId: string,
) {
  return apiRequest(
    `/projects/${projectId}`,
    {
      method: 'DELETE',
    },
  );
}

export async function createTask(
  projectId: string,
  title: string,
  description?: string,
  dueDate?: string,
  priority?: 'LOW' | 'MEDIUM' | 'HIGH',
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE',
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
        status,
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
    status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
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

/* =========================
   Messaging
========================= */

export type MessageUser = {
  id: string;
  name: string | null;
  email: string;
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  sender: MessageUser;
};

export type ConversationParticipant = {
  id: string;
  conversationId: string;
  userId: string;
  createdAt: string;
  user: MessageUser;
};

export type Conversation = {
  id: string;
  createdAt: string;
  updatedAt: string;
  participants: ConversationParticipant[];
  messages: Message[];
};

export async function getConversations() {
  return apiRequest(
    '/messages/conversations',
  ) as Promise<Conversation[]>;
}

export async function createConversation(
  userId: string,
) {
  return apiRequest(
    `/messages/conversations/${userId}`,
    {
      method: 'POST',
    },
  ) as Promise<Conversation>;
}

export async function getMessages(
  conversationId: string,
) {
  return apiRequest(
    `/messages/conversations/${conversationId}`,
  ) as Promise<Message[]>;
}

export async function sendMessage(
  conversationId: string,
  content: string,
) {
  return apiRequest(
    `/messages/conversations/${conversationId}`,
    {
      method: 'POST',
      body: JSON.stringify({
        content,
      }),
    },
  ) as Promise<Message>;
}

export async function markMessagesRead(
  conversationId: string,
) {
  return apiRequest(
    `/messages/conversations/${conversationId}/read`,
    {
      method: 'PATCH',
    },
  ) as Promise<{ success: boolean }>;
}
