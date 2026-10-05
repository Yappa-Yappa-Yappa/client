import {
  ArrowDown,
  Check,
  CheckCheck,
  LoaderCircle,
  MessageCircle,
  ArrowLeft as PanelLeft,
  RefreshCw,
  Send,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { getConversationMessages, getConversations } from "../api/conversation";
import { useAuth } from "../hooks/useAuth";

const socketUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/api\/?$/, "");

const formatTime = (value) =>
  new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });

const getMessageStatus = (message) => {
  if (message.status === "sending") return "sending";
  if (message.seenAt) return "seen";
  if (message.deliveredAt) return "delivered";
  return "sent";
};

export default function Chat() {
  const { accessToken, user: currentUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [showConversationList, setShowConversationList] = useState(
    () => !location.state?.chatRoom,
  );
  const [error, setError] = useState("");
  const socketRef = useRef(null);
  const activeIdRef = useRef(null);
  const bottomRef = useRef(null);

  const loadConversations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getConversations();
      const nextConversations = [...(response.data || [])].sort((a, b) => {
        const aTime = new Date(
          a.lastMessage?.createdAt || a.createdAt,
        ).getTime();
        const bTime = new Date(
          b.lastMessage?.createdAt || b.createdAt,
        ).getTime();
        return bTime - aTime;
      });
      setConversations(nextConversations);
      setActiveId((currentId) => currentId || nextConversations[0]?.id || null);
    } catch {
      setError("Could not load your conversations.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadId = window.setTimeout(loadConversations, 0);
    return () => window.clearTimeout(loadId);
  }, [loadConversations]);

  useEffect(() => {
    if (!location.state?.conversationId) return undefined;
    const selectionId = window.setTimeout(() => {
      setActiveId(location.state.conversationId);
      setShowConversationList(false);
    }, 0);
    return () => window.clearTimeout(selectionId);
  }, [location.state?.conversationId]);

  useEffect(() => {
    if (showConversationList && location.state?.chatRoom) {
      navigate("/chat", { replace: true, state: null });
    }
  }, [location.state?.chatRoom, navigate, showConversationList]);

  useEffect(() => {
    activeIdRef.current = activeId;
    if (!activeId) {
      return undefined;
    }

    let cancelled = false;
    const loadId = window.setTimeout(() => {
      setMessagesLoading(true);
      getConversationMessages(activeId)
        .then((response) => {
          if (!cancelled) {
            setMessages(response.data?.messages || []);
            setConversations((current) =>
              current.map((conversation) =>
                conversation.id === activeId
                  ? { ...conversation, unreadCount: 0 }
                  : conversation,
              ),
            );
            socketRef.current?.emit("conversation:read", {
              conversationId: activeId,
            });
          }
        })
        .catch(() => {
          if (!cancelled) setError("Could not load messages.");
        })
        .finally(() => {
          if (!cancelled) setMessagesLoading(false);
        });
    }, 0);

    if (socketRef.current?.connected) {
      socketRef.current.emit("conversation:join", { conversationId: activeId });
    }
    return () => {
      cancelled = true;
      window.clearTimeout(loadId);
      socketRef.current?.emit("conversation:leave", {
        conversationId: activeId,
      });
    };
  }, [activeId]);

  useEffect(() => {
    if (!accessToken || !socketUrl) return undefined;
    const socket = io(socketUrl, {
      auth: { token: accessToken },
      reconnection: true,
    });
    socketRef.current = socket;
    socket.on("connect", () => {
      setConnected(true);
      if (activeIdRef.current)
        socket.emit("conversation:join", {
          conversationId: activeIdRef.current,
        });
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on(
      "message:status",
      ({ messageId, status, deliveredAt, seenAt }) => {
        setMessages((current) =>
          current.map((message) =>
            message.id === messageId
              ? { ...message, status, deliveredAt, seenAt }
              : message,
          ),
        );
        setConversations((current) =>
          current.map((conversation) =>
            conversation.lastMessage?.id === messageId
              ? {
                  ...conversation,
                  lastMessage: {
                    ...conversation.lastMessage,
                    status,
                    deliveredAt,
                    seenAt,
                  },
                }
              : conversation,
          ),
        );
      },
    );
    socket.on("message:new", (message) => {
      const isActiveConversation =
        message.conversationId === activeIdRef.current;
      const isOwnMessage = message.senderId === currentUser?.id;
      if (!isOwnMessage) {
        socket.emit("message:delivered", { messageId: message.id });
      }
      setConversations((current) =>
        [
          ...current.map((conversation) =>
            conversation.id === message.conversationId
              ? {
                  ...conversation,
                  lastMessage: message,
                  unreadCount:
                    isOwnMessage || isActiveConversation
                      ? 0
                      : (conversation.unreadCount || 0) + 1,
                }
              : conversation,
          ),
        ].sort(
          (a, b) =>
            new Date(b.lastMessage?.createdAt || b.createdAt).getTime() -
            new Date(a.lastMessage?.createdAt || a.createdAt).getTime(),
        ),
      );
      if (isActiveConversation) {
        if (!isOwnMessage) {
          socket.emit("conversation:read", {
            conversationId: message.conversationId,
          });
        }
        setMessages((current) => {
          const pendingIndex = message.clientMessageId
            ? current.findIndex(
                (item) => item.clientMessageId === message.clientMessageId,
              )
            : -1;
          if (pendingIndex >= 0) {
            const next = [...current];
            next[pendingIndex] = message;
            return next;
          }
          return current.some((item) => item.id === message.id)
            ? current
            : [...current, message];
        });
      }
    });
    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, currentUser?.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeConversation = conversations.find(
    (conversation) => conversation.id === activeId,
  );

  const selectConversation = (conversationId) => {
    setActiveId(conversationId);
    setShowConversationList(false);
    navigate("/chat", {
      replace: true,
      state: { conversationId, chatRoom: true },
    });
  };

  const sendMessage = () => {
    const content = input.trim();
    if (!content || !activeId || !socketRef.current?.connected) return;
    const clientMessageId =
      globalThis.crypto?.randomUUID?.() ||
      `local-${Date.now()}-${Math.random()}`;
    const optimisticMessage = {
      id: clientMessageId,
      clientMessageId,
      conversationId: activeId,
      senderId: currentUser?.id,
      content,
      createdAt: new Date().toISOString(),
      status: "sending",
    };
    setMessages((current) => [...current, optimisticMessage]);
    setConversations((current) =>
      [
        ...current.map((conversation) =>
          conversation.id === activeId
            ? {
                ...conversation,
                lastMessage: optimisticMessage,
                unreadCount: 0,
              }
            : conversation,
        ),
      ].sort(
        (a, b) =>
          new Date(b.lastMessage?.createdAt || b.createdAt).getTime() -
          new Date(a.lastMessage?.createdAt || a.createdAt).getTime(),
      ),
    );
    socketRef.current.emit(
      "message:send",
      { conversationId: activeId, content, clientMessageId },
      (response) => {
        if (!response?.ok) {
          setMessages((current) =>
            current.filter(
              (message) => message.clientMessageId !== clientMessageId,
            ),
          );
          loadConversations();
          setError(response?.error || "Could not send message.");
          return;
        }

        if (response.message) {
          setMessages((current) =>
            current.map((message) =>
              message.clientMessageId === clientMessageId
                ? { ...response.message, clientMessageId, status: "sent" }
                : message,
            ),
          );
        }
      },
    );
    setInput("");
  };

  return (
    <div className="relative flex h-full min-h-[420px] w-full overflow-hidden border-y border-black/10 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      <aside
        className={`${showConversationList ? "flex" : "hidden"} absolute inset-0 z-0 min-h-0 w-full shrink-0 flex-col bg-white dark:bg-neutral-900 md:relative md:flex md:w-72 md:bg-transparent md:dark:bg-transparent border-r border-black/10 dark:border-neutral-800`}
      >
        <div className="flex items-center justify-between border-b border-black/10 p-4 dark:border-neutral-800">
          <div>
            <h1 className="font-bold">Messages</h1>
            <p className="text-xs text-neutral-500">
              {connected ? "Live" : "Reconnecting…"}
            </p>
          </div>
          <button
            onClick={loadConversations}
            className="rounded-lg p-2 text-neutral-400 hover:bg-black/5 dark:hover:bg-white/10"
            aria-label="Refresh conversations"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
        <div className="max-h-full overflow-y-auto p-2">
          {loading ? (
            <p className="p-3 text-sm text-neutral-500">
              Loading conversations…
            </p>
          ) : conversations.length === 0 ? (
            <p className="p-3 text-sm text-neutral-500">
              Open someone’s profile to start a chat.
            </p>
          ) : (
            conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => selectConversation(conversation.id)}
                className={`flex w-full items-center gap-3 p-3 text-left transition ${activeId === conversation.id ? "bg-indigo-500/10" : "hover:bg-black/5 dark:hover:bg-white/5"}`}
              >
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-indigo-500/20 text-center font-bold text-indigo-600 dark:text-indigo-300">
                  {conversation.participant?.imageUrl ? (
                    <img
                      src={conversation.participant.imageUrl}
                      alt={conversation.participant.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center">
                      {(conversation.participant?.name || "Y")[0]}
                    </span>
                  )}
                </div>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm">
                    {conversation.participant?.name || "Yapper"}
                  </strong>
                  <span className="block truncate text-xs text-neutral-500">
                    {conversation.lastMessage?.content || "No messages yet"}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </aside>
      <section
        className={`${showConversationList ? "hidden md:flex" : "flex"} min-h-0 min-w-0 flex-1 flex-col`}
      >
        {!activeConversation ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center">
            <MessageCircle className="h-10 w-10 text-indigo-500/60" />
            <h2 className="mt-3 font-semibold">Choose a conversation</h2>
            <p className="mt-1 text-sm text-neutral-500">
              Start a conversation from someone’s profile.
            </p>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 border-b border-black/10 p-4 dark:border-neutral-800">
              <button
                onClick={() => setShowConversationList(true)}
                className="rounded-lg p-2 text-neutral-400 hover:bg-black/5 md:hidden"
                aria-label="Show conversations"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              <div>
                <p className="font-bold">
                  {activeConversation.participant?.name || "Yapper"}
                </p>
                <p className="text-xs text-neutral-500">
                  @{activeConversation.participant?.username || "yapper"}
                </p>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4">
              {messagesLoading ? (
                <p className="text-sm text-neutral-500">Loading messages…</p>
              ) : messages.length === 0 ? (
                <p className="py-10 text-center text-sm text-neutral-500">
                  No messages yet. Say hello.
                </p>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.senderId === currentUser?.id;
                  const status = getMessageStatus(message);
                  return (
                    <div
                      key={message.id}
                      className={`mb-3 flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${isOwnMessage ? "bg-indigo-600 text-white" : "bg-neutral-100 dark:bg-neutral-800"}`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <span className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-60">
                          <span>{formatTime(message.createdAt)}</span>
                          {isOwnMessage &&
                            (status === "sending" ? (
                              <LoaderCircle
                                className="h-3 w-3 animate-spin"
                                aria-label="Sending"
                              />
                            ) : status === "seen" ? (
                              <CheckCheck
                                className="h-3 w-3 text-indigo-200"
                                aria-label="Seen"
                              />
                            ) : status === "delivered" ? (
                              <CheckCheck
                                className="h-3 w-3"
                                aria-label="Delivered"
                              />
                            ) : (
                              <Check className="h-3 w-3" aria-label="Sent" />
                            ))}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                sendMessage();
              }}
              className="flex gap-2 border-t border-black/10 p-3 dark:border-neutral-800"
            >
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                maxLength={2000}
                placeholder={connected ? "Type a message…" : "Reconnecting…"}
                disabled={!connected}
                className="min-w-0 flex-1 rounded-xl border border-black/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-indigo-500 dark:border-neutral-700"
              />
              <button
                type="submit"
                disabled={!input.trim() || !connected}
                className="rounded-xl bg-indigo-600 p-2.5 text-white disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </>
        )}
        {error && (
          <div className="flex items-center justify-between bg-rose-500/10 px-4 py-2 text-xs text-rose-500">
            <span>{error}</span>
            <button onClick={() => setError("")}>
              <ArrowDown className="h-3.5 w-3.5 rotate-45" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
