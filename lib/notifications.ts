import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: "booking" | "status" | "chat" | "system",
  bookingId?: string
) {
  try {
    await addDoc(collection(db, "notifications"), {
      userId,
      title,
      message,
      type,
      bookingId,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Failed to send notification:", error);
  }
}