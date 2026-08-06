"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import ProtectedPage from "@/components/ProtectedPage";
import WorkspaceNav from "@/components/WorkspaceNav";
import { EmptyState, PageHeader, primaryButtonClass } from "@/components/Ui";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/client";
import { createClient } from "@/lib/supabase/client";
import { getSupabasePublicConfig } from "@/lib/supabase/env";
import type { ConversationSummary, Message } from "@/lib/types";

export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const loadConversations = useCallback(async () => {
    const data = await apiFetch<{ conversations: ConversationSummary[] }>("/api/conversations");
    setConversations(data.conversations);
    const requested = new URLSearchParams(window.location.search).get("conversation");
    setSelectedId((current) => current || requested || data.conversations[0]?.id || "");
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    if (!conversationId) return;
    const data = await apiFetch<{ messages: Message[] }>(`/api/conversations/${conversationId}/messages`);
    setMessages(data.messages);
  }, []);

  useEffect(() => {
    if (!user) return;
    loadConversations().catch((caught) => setError(caught.message));
  }, [user, loadConversations]);

  useEffect(() => {
    if (!selectedId) { setMessages([]); return; }
    loadMessages(selectedId).catch((caught) => setError(caught.message));
    if (!getSupabasePublicConfig()) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${selectedId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedId}`,
        },
        () => {
          void Promise.all([loadMessages(selectedId), loadConversations()]).catch(() => undefined);
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [selectedId, loadMessages, loadConversations]);

  const selected = useMemo(() => conversations.find((item) => item.id === selectedId), [conversations, selectedId]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim() || !selectedId) return;
    setSending(true);
    setError("");
    try {
      await apiFetch(`/api/conversations/${selectedId}/messages`, {
        method: "POST",
        body: JSON.stringify({ body }),
      });
      setBody("");
      await Promise.all([loadMessages(selectedId), loadConversations()]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <ProtectedPage>
      <WorkspaceNav />
      <main className="min-h-[72vh] bg-gray-50 py-10">
        <div className="mx-auto max-w-6xl px-6">
          <PageHeader eyebrow="Private conversations" title="Messages" description="Messages are stored with the tutoring relationship and refresh automatically while this page is open." />
          {error ? <p className="mt-5 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p> : null}
          <div className="mt-8 grid min-h-[580px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[340px_1fr]">
            <aside className="border-b border-gray-200 lg:border-b-0 lg:border-r">
              <div className="border-b border-gray-100 p-5"><p className="text-sm font-semibold text-[#001F3F]">Conversations</p></div>
              <div className="max-h-60 overflow-y-auto lg:max-h-[520px]">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => setSelectedId(conversation.id)}
                    className={`w-full border-b border-gray-100 p-5 text-left transition ${selectedId === conversation.id ? "bg-[#8B1E3F]/5" : "hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-[#001F3F]">{conversation.otherUser.name}</p>
                      {conversation.unreadCount ? <span className="rounded-full bg-[#8B1E3F] px-2 py-0.5 text-xs font-semibold text-white">{conversation.unreadCount}</span> : null}
                    </div>
                    <p className="mt-1 truncate text-sm text-gray-500">{conversation.lastMessage || "Start the conversation"}</p>
                  </button>
                ))}
                {!conversations.length ? <div className="p-5 text-sm text-gray-500">Your inquiries and tutor chats will appear here.</div> : null}
              </div>
            </aside>

            <section className="flex min-h-[500px] flex-col">
              {selected ? (
                <>
                  <header className="border-b border-gray-100 px-6 py-4">
                    <p className="font-semibold text-[#001F3F]">{selected.otherUser.name}</p>
                    <p className="text-xs capitalize text-gray-500">{selected.otherUser.role}</p>
                  </header>
                  <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50/50 p-6">
                    {messages.map((message) => {
                      const mine = message.senderId === user?.id;
                      return (
                        <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-[78%] rounded-2xl px-4 py-3 ${mine ? "bg-[#001F3F] text-white" : "border border-gray-200 bg-white text-gray-700"}`}>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.body}</p>
                            <p className={`mt-1 text-[11px] ${mine ? "text-white/55" : "text-gray-400"}`}>{new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <form onSubmit={submit} className="flex gap-3 border-t border-gray-200 p-4">
                    <input value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} placeholder="Write a message…" className="min-w-0 flex-1 rounded-md border border-gray-300 px-4 py-2.5 outline-none focus:border-[#8B1E3F]" />
                    <button className={primaryButtonClass} disabled={sending || !body.trim()}>{sending ? "Sending…" : "Send"}</button>
                  </form>
                </>
              ) : (
                <div className="m-auto w-full max-w-md p-8"><EmptyState title="Select a conversation" body="Open an existing inquiry or start from a tutor profile." /></div>
              )}
            </section>
          </div>
        </div>
      </main>
    </ProtectedPage>
  );
}
