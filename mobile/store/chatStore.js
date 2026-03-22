import { create } from "zustand";
import { io } from "socket.io-client";
import { BASE_URL, SOCKET_URL } from "../assets/constants/baseApi.js";

let socketInstance = null;

const mergeConversation = (conversations, incomingConversation) => {
  const remaining = conversations.filter(
    (conversation) => conversation._id !== incomingConversation._id
  );

  return [incomingConversation, ...remaining].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
  );
};

export const useChatStore = create((set) => ({
  conversations: [],
  messagesByConversation: {},
  loadingConversations: false,
  loadingMessages: false,
  socketConnected: false,

  connectSocket: (token) => {
    if (!token || socketInstance) {
      return;
    }

    socketInstance = io(SOCKET_URL, {
      transports: ["websocket"],
      auth: { token },
    });

    socketInstance.on("connect", () => {
      set({ socketConnected: true });
    });

    socketInstance.on("disconnect", () => {
      set({ socketConnected: false });
    });

    socketInstance.on("chat:message:new", ({ conversation, message }) => {
      set((state) => {
        const existingMessages = state.messagesByConversation[conversation._id] || [];
        const alreadyExists = existingMessages.some((item) => item._id === message._id);

        return {
          conversations: mergeConversation(state.conversations, conversation),
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversation._id]: alreadyExists
              ? existingMessages
              : [...existingMessages, message].sort(
                  (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
                ),
          },
        };
      });
    });

    socketInstance.on("chat:message:deleted", ({ conversationId, messageId, lastMessage }) => {
      set((state) => ({
        conversations: state.conversations.map((conversation) =>
          conversation._id === conversationId
            ? {
                ...conversation,
                lastMessage,
                updatedAt: new Date().toISOString(),
              }
            : conversation
        ),
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: (state.messagesByConversation[conversationId] || []).filter(
            (message) => message._id !== messageId
          ),
        },
      }));
    });

    socketInstance.on("chat:conversation:deleted", ({ conversationId }) => {
      set((state) => {
        const nextMessages = { ...state.messagesByConversation };
        delete nextMessages[conversationId];

        return {
          conversations: state.conversations.filter(
            (conversation) => conversation._id !== conversationId
          ),
          messagesByConversation: nextMessages,
        };
      });
    });
  },

  disconnectSocket: () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }

    set({ socketConnected: false });
  },

  fetchConversations: async (token) => {
    set({ loadingConversations: true });
    try {
      const response = await fetch(`${BASE_URL}/api/chat/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load conversations");
      }

      set({ conversations: data });
      return data;
    } finally {
      set({ loadingConversations: false });
    }
  },

  ensureConversation: async (token, participantId) => {
    const response = await fetch(`${BASE_URL}/api/chat/conversations/with/${participantId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to open conversation");
    }

    set((state) => ({
      conversations: mergeConversation(state.conversations, data),
    }));

    return data;
  },

  fetchMessages: async (token, conversationId) => {
    set({ loadingMessages: true });
    try {
      const response = await fetch(`${BASE_URL}/api/chat/conversations/${conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to load messages");
      }

      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: data,
        },
      }));

      return data;
    } finally {
      set({ loadingMessages: false });
    }
  },

  sendMessage: async (token, participantId, text) => {
    const response = await fetch(`${BASE_URL}/api/chat/conversations/${participantId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to send message");
    }

    set((state) => ({
      conversations: mergeConversation(state.conversations, data.conversation),
      messagesByConversation: {
        ...state.messagesByConversation,
        [data.conversation._id]: [
          ...(state.messagesByConversation[data.conversation._id] || []).filter(
            (message) => message._id !== data.message._id
          ),
          data.message,
        ].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
      },
    }));

    return data;
  },

  deleteMessage: async (token, messageId) => {
    const response = await fetch(`${BASE_URL}/api/chat/messages/${messageId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete message");
    }

    set((state) => ({
      conversations: state.conversations.map((conversation) =>
        conversation._id === data.conversationId
          ? {
              ...conversation,
              lastMessage: data.lastMessage,
              updatedAt: new Date().toISOString(),
            }
          : conversation
      ),
      messagesByConversation: {
        ...state.messagesByConversation,
        [data.conversationId]: (state.messagesByConversation[data.conversationId] || []).filter(
          (message) => message._id !== data.messageId
        ),
      },
    }));

    return data;
  },

  deleteConversation: async (token, conversationId) => {
    const response = await fetch(`${BASE_URL}/api/chat/conversations/${conversationId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Failed to delete conversation");
    }

    set((state) => {
      const nextMessages = { ...state.messagesByConversation };
      delete nextMessages[conversationId];

      return {
        conversations: state.conversations.filter(
          (conversation) => conversation._id !== conversationId
        ),
        messagesByConversation: nextMessages,
      };
    });

    return data;
  },
}));
