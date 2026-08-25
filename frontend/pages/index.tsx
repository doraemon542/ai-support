import { useEffect, useState } from "react";
import { getSocket } from "../lib/socket";

const API = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

type Message = {
  id: string;
  sender: "USER" | "AGENT" | "AI";
  content: string;
  aiConfidence?: number;
  createdAt: string;
};

type Conversation = {
  id: string;
  channel: string;
  externalId: string;
  messages: Message[];
};

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const active = conversations.find((c) => c.id === activeId) || null;

  useEffect(() => {
    fetch(`${API}/conversations`)
      .then((r) => r.json())
      .then(setConversations);

    const socket = getSocket();
    socket.on("conversation-updated", () => {
      fetch(`${API}/conversations`)
        .then((r) => r.json())
        .then(setConversations);
    });
    return () => {
      socket.off("conversation-updated");
    };
  }, []);

  useEffect(() => {
    if (activeId) getSocket().emit("join-conversation", activeId);
  }, [activeId]);

  async function sendReply() {
    if (!activeId || !replyText.trim()) return;
    await fetch(`${API}/conversations/${activeId}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: replyText }),
    });
    setReplyText("");
    fetch(`${API}/conversations`)
      .then((r) => r.json())
      .then(setConversations);
  }

  return (
    <div style={{ fontFamily: "sans-serif" }}>
      <div
        style={{
          background: "#0f172a",
          color: "#fff",
          padding: "16px 24px",
          borderBottom: "1px solid #333",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18 }}>
          AI Support Inbox — Live Demo
        </h2>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 14,
            lineHeight: 1.6,
            opacity: 0.9,
          }}
        >
          This dashboard shows conversations happening on Telegram in real time.
          To try it: open Telegram, search for{" "}
          <a
            href="https://t.me/habiba_doraemon_bot"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#7dd3fc", fontWeight: 600 }}
          >
            @habiba_doraemon_bot
          </a>
          , and send it a message. You'll get an AI-generated reply on Telegram,
          and the full conversation will appear live on the left — that's the
          human-agent view of the same interaction.
        </p>
      </div>

      <div style={{ display: "flex", height: "calc(100vh - 84px)" }}>
        <div
          style={{
            width: 280,
            borderRight: "1px solid #333",
            overflowY: "auto",
          }}
        >
          <h3 style={{ padding: 12 }}>Conversations</h3>
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => setActiveId(c.id)}
              style={{
                padding: 12,
                cursor: "pointer",
                background: c.id === activeId ? "#222" : "transparent",
                color: c.id === activeId ? "#fff" : "#000",
              }}
            >
              <b>{c.channel}</b> — {c.externalId}
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {c.messages[c.messages.length - 1]?.content?.slice(0, 40)}
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            padding: 16,
          }}
        >
          {!active && <p>Select a conversation</p>}
          {active && (
            <>
              <div style={{ flex: 1, overflowY: "auto" }}>
                {active.messages.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      textAlign: m.sender === "USER" ? "left" : "right",
                      margin: "8px 0",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "8px 12px",
                        borderRadius: 8,
                        background:
                          m.sender === "USER"
                            ? "#eee"
                            : m.sender === "AI"
                              ? "#d6ecff"
                              : "#c8f7c5",
                      }}
                    >
                      <small style={{ opacity: 0.6 }}>{m.sender}</small>
                      <div>{m.content}</div>
                      {m.aiConfidence != null && (
                        <small style={{ opacity: 0.6 }}>
                          confidence: {(m.aiConfidence * 100).toFixed(0)}%
                        </small>
                      )}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <input
                  style={{ flex: 1, padding: 8 }}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type a reply (or edit the AI draft above and send)..."
                />
                <button onClick={sendReply}>Send</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
