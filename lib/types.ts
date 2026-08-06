export type UserRole = "student" | "tutor" | "admin";

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Subject {
  id: string;
  slug: string;
  name: string;
  category: string;
}

export interface TutorSummary {
  id: string;
  name: string;
  pronouns: string;
  school: string;
  headline: string;
  bio: string;
  image: string;
  hourlyRate: number;
  timezone: string;
  approved: boolean;
  subjects: Subject[];
}

export interface ConversationSummary {
  id: string;
  otherUser: { id: string; name: string; role: UserRole };
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
}

export interface Booking {
  id: string;
  studentId: string;
  studentName: string;
  tutorId: string;
  tutorName: string;
  subjectId: string;
  subjectName: string;
  startTime: string;
  endTime: string;
  status: "requested" | "confirmed" | "completed" | "cancelled";
  notes: string;
}
