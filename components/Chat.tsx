"use client";

import { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Message } from "@/types";
import { Send } from "lucide-react";

interface ChatProps {
  bookingId: string;
  otherUserName: string;
}

export default function Chat({ bookingId, otherUserName }: ChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time listener
  useEffect(() => {
    if (!bookingId) return;

    const q = query(
      collection(db, "messages"),
      where("bookingId", "==", bookingId),
      orderBy("timestamp", "asc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [bookingId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      await addDoc(collection(db, "messages"), {
        bookingId,
        senderId: user.uid,
        senderName: user.name,
        text: newMessage.trim(),
        timestamp: serverTimestamp(),
        read: false,
      });

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white border rounded-3xl overflow-hidden shadow">
      {/* Chat Header */}
      <div className="bg-orange-600 text-white p-5 flex items-center gap-3">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          💬
        </div>
        <div>
          <p className="font-semibold">Chat with {otherUserName}</p>
          <p className="text-xs opacity-75">Booking #{bookingId.slice(0, 8)}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div
        className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-4"
        id="chat-container"
      >
        {loading ? (
          <p className="text-center text-gray-500 py-10">
            Loading conversation...
          </p>
        ) : messages.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>No messages yet.</p>
            <p className="text-sm mt-2">Say hello to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === user?.uid;
            return (
              <div
                key={msg.id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] px-5 py-3 rounded-3xl ${
                    isMe
                      ? "bg-orange-600 text-white rounded-br-none"
                      : "bg-white border rounded-bl-none"
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs opacity-75 mb-1">{msg.senderName}</p>
                  )}
                  <p className="text-[15px] leading-relaxed">{msg.text}</p>
                  <p
                    className={`text-[10px] mt-1 text-right ${isMe ? "text-orange-200" : "text-gray-400"}`}
                  >
                    {msg.timestamp
                      ? new Date(
                          msg.timestamp.seconds * 1000,
                        ).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : ""}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={sendMessage} className="border-t p-4 bg-white flex gap-3">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border rounded-full px-6 py-3 focus:outline-none focus:border-orange-500"
          disabled={!user}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white p-3 rounded-full transition"
        >
          <Send className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
}
