export type UserRole = "customer" | "provider";

export interface User {
  uid: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  city: string;
  pincode: string;
  photoURL?: string;
  bio?: string;
  experience?: number;
  rating?: number;
  totalReviews?: number;
}

export interface Service {
  id: string;
  providerId: string;
  category: string;
  title: string;
  description: string;
  price: number;
  priceType: "fixed" | "hourly";
  duration: string;
  city: string;
  pincode: string;
  createdAt: any;           // Firestore Timestamp or Date
  rating?: number;          // ← Added
  totalReviews?: number;    // ← Added
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  status: "pending" | "accepted" | "in-progress" | "completed" | "cancelled";
  bookingDate: Date;
  address: string;
  notes?: string;
  totalAmount: number;
  paymentMethod?: "cash" | "online";
  createdAt?: any;
}

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;           // Firestore Timestamp
  read?: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  serviceId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment: string;
  createdAt: any;
  customerName: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "booking" | "status" | "chat" | "system";
  bookingId?: string;
  read: boolean;
  createdAt: Date;
}

export interface PincodeCoords {
  [pincode: string]: { lat: number; lng: number };
}
