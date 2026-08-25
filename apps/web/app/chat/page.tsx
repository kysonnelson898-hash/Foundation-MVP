'use client';

import {
  FormEvent,
  useEffect,
  useState,
} from 'react';

import {
  Conversation,
  Message,
  createConversation,
  getConversations,
  getMessages,
  markMessagesRead,
  sendMessage,
} from '../../lib/api';

type User = {
  id: string;
  name: string | null;
  email: string;
};

export default function ChatPage() {
  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] =
    useState<Message[]>([]);

  const [users, setUsers] =
    useState<User[]>([]);

  const [selectedUserId, setSelectedUserId] =
    useState('');

  const [messageText, setMessageText] =
    useState('');

  const [currentUserId, setCurrentUserId] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [messagesLoading, setMessagesLoading] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [creatingConversation, setCreatingConversation] =
    useState(false);

  const [showNewChat, setShowNewChat] =
    useState(false);

  const [error, setError] =
    useState('');

  useEffect(() => {
    const token =
      localStorage.getItem('accessToken');

    if (!token) {
      window.location.href = '/login';
      return;
    }

    const userData =
      localStorage.getItem('user');

    if (userData) {
      try {
        const user = JSON.parse(userData);

        if (user?.id) {
          setCurrentUserId(user.id);
        }
      } catch {
        // Ignore invalid local user data.
      }
    }

    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError('');

      const [conversationData, userData] =
        await Promise.all([
          getConversations(),
          getUsers(),
        ]);

      setConversations(
        conversationData,
      );

      setUsers(userData);

      if (conversationData.length > 0) {
        await selectConversation(
          conversationData[0],
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load chat',
      );
    } finally {
      setLoading(false);
    }
  }

  async function getUsers(): Promise<User[]> {
    const API_URL =
      process.env.NEXT_PUBLIC_API_URL ??
      'http://localhost:3000';

    const token =
      localStorage.getItem('accessToken');

    const response = await fetch(
      `${API_URL}/users`,
      {
        headers: {
          'Content-Type':
            'application/json',
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        },
      },
    );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        Array.isArray(data.message)
          ? data.message.join(', ')
          : data.message ??
              'Unable to load users',
      );
    }

    return data;
  }

  async function selectConversation(
    conversation: Conversation,
  ) {
    try {
      setSelectedConversation(
        conversation,
      );

      setMessagesLoading(true);
      setError('');

      const data =
        await getMessages(
          conversation.id,
        );

      setMessages(data);

      await markMessagesRead(
        conversation.id,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load messages',
      );
    } finally {
      setMessagesLoading(false);
    }
  }

  async function handleCreateConversation() {
    if (
      !selectedUserId ||
      creatingConversation
    ) {
      return;
    }

    try {
      setCreatingConversation(true);
      setError('');

      const conversation =
        await createConversation(
          selectedUserId,
        );

      const refreshed =
        await getConversations();

      setConversations(refreshed);

      const newConversation =
        refreshed.find(
          (item) =>
            item.id ===
            conversation.id,
        ) ?? conversation;

      await selectConversation(
        newConversation,
      );

      setShowNewChat(false);
      setSelectedUserId('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create conversation',
      );
    } finally {
      setCreatingConversation(false);
    }
  }

  async function handleSendMessage(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !selectedConversation ||
      !messageText.trim() ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError('');

      const message =
        await sendMessage(
          selectedConversation.id,
          messageText.trim(),
        );

      setMessages((current) => [
        ...current,
        message,
      ]);

      setMessageText('');

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id ===
          selectedConversation.id
            ? {
                ...conversation,
                updatedAt:
                  message.createdAt,
                messages: [message],
              }
            : conversation,
        ),
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to send message',
      );
    } finally {
      setSending(false);
    }
  }

  function getOtherParticipant(
    conversation: Conversation,
  ) {
    return (
      conversation.participants.find(
        (participant) =>
          participant.userId !==
          currentUserId,
      )?.user ??
      conversation.participants[0]?.user
    );
  }

  function formatTime(
    dateString: string,
  ) {
    return new Date(
      dateString,
    ).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  return (
    <main className="min-h-screen bg-zinc-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-2xl font-bold">
              DevFlow
            </h1>

            <p className="text-sm text-zinc-500">
              Messages
            </p>
          </div>

          <button
            onClick={() => {
              window.location.href =
                '/';
            }}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-zinc-50"
          >
            Dashboard
          </button>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-8">
        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="grid min-h-[650px] md:grid-cols-[300px_1fr]">
            <aside className="border-b md:border-b-0 md:border-r">
              <div className="flex items-center justify-between border-b p-5">
                <div>
                  <h2 className="text-lg font-semibold">
                    Conversations
                  </h2>

                  <p className="mt-1 text-sm text-zinc-500">
                    Your messages
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowNewChat(
                      !showNewChat,
                    )
                  }
                  className="rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-700"
                >
                  + New
                </button>
              </div>

              {showNewChat && (
                <div className="border-b bg-zinc-50 p-4">
                  <label className="text-sm font-medium">
                    Select a user
                  </label>

                  <select
                    value={
                      selectedUserId
                    }
                    onChange={(event) =>
                      setSelectedUserId(
                        event.target
                          .value,
                      )
                    }
                    className="mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm"
                  >
                    <option value="">
                      Choose a user...
                    </option>

                    {users
                      .filter(
                        (user) =>
                          user.id !==
                          currentUserId,
                      )
                      .map((user) => (
                        <option
                          key={user.id}
                          value={user.id}
                        >
                          {user.name ??
                            user.email}
                        </option>
                      ))}
                  </select>

                  <button
                    onClick={
                      handleCreateConversation
                    }
                    disabled={
                      !selectedUserId ||
                      creatingConversation
                    }
                    className="mt-3 w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {creatingConversation
                      ? 'Creating...'
                      : 'Start conversation'}
                  </button>
                </div>
              )}

              {loading ? (
                <div className="p-5 text-sm text-zinc-500">
                  Loading conversations...
                </div>
              ) : conversations.length ===
                0 ? (
                <div className="p-5 text-sm text-zinc-500">
                  No conversations yet.
                  Click <strong>+ New</strong>{' '}
                  to start one.
                </div>
              ) : (
                <div>
                  {conversations.map(
                    (conversation) => {
                      const person =
                        getOtherParticipant(
                          conversation,
                        );

                      const lastMessage =
                        conversation
                          .messages[0];

                      return (
                        <button
                          key={
                            conversation.id
                          }
                          onClick={() =>
                            selectConversation(
                              conversation,
                            )
                          }
                          className={`w-full border-b p-4 text-left transition hover:bg-zinc-50 ${
                            selectedConversation?.id ===
                            conversation.id
                              ? 'bg-zinc-100'
                              : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                              {(
                                person?.name ??
                                person?.email ??
                                '?'
                              )
                                .charAt(0)
                                .toUpperCase()}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">
                                {person?.name ??
                                  person?.email ??
                                  'User'}
                              </p>

                              <p className="truncate text-sm text-zinc-500">
                                {lastMessage
                                  ?.content ??
                                  'No messages yet'}
                              </p>
                            </div>

                            {lastMessage && (
                              <span className="text-xs text-zinc-400">
                                {formatTime(
                                  lastMessage.createdAt,
                                )}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>
              )}
            </aside>

            <section className="flex min-w-0 flex-col">
              {!selectedConversation ? (
                <div className="flex flex-1 items-center justify-center p-8 text-center">
                  <div>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-2xl">
                      💬
                    </div>

                    <h2 className="mt-4 text-xl font-semibold">
                      Your messages
                    </h2>

                    <p className="mt-2 text-sm text-zinc-500">
                      Click{' '}
                      <strong>+ New</strong>{' '}
                      to start chatting.
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="border-b p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white">
                        {(
                          getOtherParticipant(
                            selectedConversation,
                          )?.name ??
                          getOtherParticipant(
                            selectedConversation,
                          )?.email ??
                          '?'
                        )
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <h2 className="font-semibold">
                          {getOtherParticipant(
                            selectedConversation,
                          )?.name ??
                            getOtherParticipant(
                              selectedConversation,
                            )?.email ??
                            'User'}
                        </h2>

                        <p className="text-sm text-zinc-500">
                          {getOtherParticipant(
                            selectedConversation,
                          )?.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto bg-zinc-50 p-6">
                    {messagesLoading ? (
                      <div className="text-center text-sm text-zinc-500">
                        Loading messages...
                      </div>
                    ) : messages.length ===
                      0 ? (
                      <div className="flex h-full items-center justify-center text-center">
                        <div>
                          <p className="font-medium">
                            No messages yet
                          </p>

                          <p className="mt-1 text-sm text-zinc-500">
                            Send the first message.
                          </p>
                        </div>
                      </div>
                    ) : (
                      messages.map(
                        (message) => {
                          const mine =
                            message.senderId ===
                            currentUserId;

                          return (
                            <div
                              key={
                                message.id
                              }
                              className={`flex ${
                                mine
                                  ? 'justify-end'
                                  : 'justify-start'
                              }`}
                            >
                              <div
                                className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                                  mine
                                    ? 'bg-zinc-900 text-white'
                                    : 'border bg-white text-zinc-900'
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words text-sm">
                                  {
                                    message.content
                                  }
                                </p>

                                <p className="mt-1 text-xs text-zinc-400">
                                  {formatTime(
                                    message.createdAt,
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        },
                      )
                    )}
                  </div>

                  <form
                    onSubmit={
                      handleSendMessage
                    }
                    className="border-t bg-white p-4"
                  >
                    <div className="flex gap-3">
                      <input
                        value={
                          messageText
                        }
                        onChange={(event) =>
                          setMessageText(
                            event.target
                              .value,
                          )
                        }
                        placeholder="Type a message..."
                        maxLength={5000}
                        className="flex-1 rounded-xl border px-4 py-3 text-sm outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                      />

                      <button
                        type="submit"
                        disabled={
                          sending ||
                          !messageText.trim()
                        }
                        className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {sending
                          ? 'Sending...'
                          : 'Send'}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </section>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </section>
    </main>
  );
}
