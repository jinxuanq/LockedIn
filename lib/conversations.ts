import "server-only";

import { ApiError } from "@/lib/api";
import { createClient } from "@/lib/supabase/server";
import { throwIfSupabaseError } from "@/lib/supabase/errors";
import type { ConversationSummary, Message, SafeUser, UserRole } from "@/lib/types";

interface MemberRow {
  conversation_id: string;
  user_id: string;
  last_read_at: string | null;
  profile?: { id: string; name: string; role: UserRole } | null;
}

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender?: { name: string } | null;
}

export async function listConversations(user: SafeUser): Promise<ConversationSummary[]> {
  const supabase = await createClient();
  const { data: ownMemberships, error: ownError } = await supabase
    .from("conversation_members")
    .select("conversation_id, user_id, last_read_at")
    .eq("user_id", user.id);
  throwIfSupabaseError(ownError);
  const ownRows = (ownMemberships ?? []) as MemberRow[];
  const conversationIds = ownRows.map((item) => item.conversation_id);
  if (!conversationIds.length) return [];

  const [{ data: memberships, error: memberError }, { data: messages, error: messageError }] =
    await Promise.all([
      supabase
        .from("conversation_members")
        .select("conversation_id, user_id, last_read_at, profile:profiles!conversation_members_user_id_fkey(id, name, role)")
        .in("conversation_id", conversationIds),
      supabase
        .from("messages")
        .select("id, conversation_id, sender_id, body, created_at")
        .in("conversation_id", conversationIds)
        .order("created_at", { ascending: false })
        .limit(1000),
    ]);
  throwIfSupabaseError(memberError);
  throwIfSupabaseError(messageError);

  const allMembers = (memberships ?? []) as unknown as MemberRow[];
  const allMessages = (messages ?? []) as MessageRow[];
  const ownByConversation = new Map(ownRows.map((row) => [row.conversation_id, row]));

  const summaries: ConversationSummary[] = [];
  for (const conversationId of conversationIds) {
    const other = allMembers.find(
      (member) => member.conversation_id === conversationId && member.user_id !== user.id,
    );
    if (!other?.profile) continue;
    const conversationMessages = allMessages.filter(
      (message) => message.conversation_id === conversationId,
    );
    const latest = conversationMessages[0];
    const lastReadAt = ownByConversation.get(conversationId)?.last_read_at;
    summaries.push({
      id: conversationId,
      otherUser: other.profile,
      lastMessage: latest?.body ?? null,
      lastMessageAt: latest?.created_at ?? null,
      unreadCount: conversationMessages.filter(
        (message) =>
          message.sender_id !== user.id &&
          (!lastReadAt || message.created_at > lastReadAt),
      ).length,
    });
  }
  return summaries.sort((first, second) =>
    (second.lastMessageAt ?? "").localeCompare(first.lastMessageAt ?? ""),
  );
}

export async function assertConversationMember(
  conversationId: string,
  userId: string,
): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("conversation_members")
    .select("conversation_id")
    .eq("conversation_id", conversationId)
    .eq("user_id", userId)
    .maybeSingle();
  throwIfSupabaseError(error);
  if (!data) throw new ApiError(404, "Conversation not found.");
}

export async function getMessages(user: SafeUser, conversationId: string): Promise<Message[]> {
  await assertConversationMember(conversationId, user.id);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, created_at, sender:profiles!messages_sender_id_fkey(name)")
    .eq("conversation_id", conversationId)
    .order("created_at")
    .order("id")
    .limit(500);
  throwIfSupabaseError(error);

  const { error: readError } = await supabase
    .from("conversation_members")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("user_id", user.id);
  throwIfSupabaseError(readError);

  return ((data ?? []) as unknown as MessageRow[]).map((message) => ({
    id: message.id,
    conversationId: message.conversation_id,
    senderId: message.sender_id,
    senderName: message.sender?.name ?? "User",
    body: message.body,
    createdAt: message.created_at,
  }));
}

export async function sendMessage(
  user: SafeUser,
  conversationId: string,
  body: string,
): Promise<Message> {
  const supabase = await createClient();
  const { data: messageId, error } = await supabase.rpc("send_message", {
    target_conversation_id: conversationId,
    message_body: body,
  });
  throwIfSupabaseError(error);
  if (typeof messageId !== "string") throw new ApiError(500, "Could not send message.");

  const { data, error: selectError } = await supabase
    .from("messages")
    .select("id, conversation_id, sender_id, body, created_at")
    .eq("id", messageId)
    .single();
  throwIfSupabaseError(selectError);
  if (!data) throw new ApiError(500, "Could not load the sent message.");
  return {
    id: data.id as string,
    conversationId: data.conversation_id as string,
    senderId: data.sender_id as string,
    senderName: user.name,
    body: data.body as string,
    createdAt: data.created_at as string,
  };
}

export async function createConversation(
  user: SafeUser,
  otherUserId: string,
): Promise<ConversationSummary> {
  if (user.id === otherUserId) throw new ApiError(422, "You cannot message yourself.");
  const supabase = await createClient();
  const { data: conversationId, error } = await supabase.rpc("create_conversation", {
    other_user_id: otherUserId,
  });
  throwIfSupabaseError(error);
  if (typeof conversationId !== "string") throw new ApiError(500, "Could not create conversation.");
  const conversation = (await listConversations(user)).find((item) => item.id === conversationId);
  if (!conversation) throw new ApiError(500, "Could not create conversation.");
  return conversation;
}
