// scripts/seed.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import * as fs from "fs";
import * as path from "path";

const serviceAccountPath = path.join(process.cwd(), "service-account.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ service-account.json not found in project root!");
  console.error("Download it from Firebase Console > Project Settings > Service Accounts");
  process.exit(1);
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();   // or getFirestore('(default)')
console.log("🔥 Connected to Firestore database ID:", db.databaseId || "(default)");
const auth = getAuth();
/**
 * Helper to split an array into chunks of a specific size
 */
const chunkArray = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

const lucknowPincodes = ["226001", "226002", "226003", "226010", "226016", "226017", "226018", "226024", "226025"];

async function seedData() {
  console.log("🌱 Seeding JanSahay with rich demo data...\n");

  try {
    // ====================== 1. SEED USERS ======================
    console.log("Creating Users (Batches of 15)...");
    
    const providers = [
      { uid: "p1", name: "Rahul Sharma", email: "rahul.plumber@gmail.com", phone: "9876543210", role: "provider", city: "Lucknow", pincode: "226001", bio: "Expert plumber with 8+ years. Leakage, installation & repair.", experience: 8, rating: 4.8, totalReviews: 42, photoURL: "https://randomuser.me/api/portraits/men/32.jpg" },
      { uid: "p2", name: "Vikas Yadav", email: "vikas.plumber@gmail.com", phone: "8765432109", role: "provider", city: "Lucknow", pincode: "226010", bio: "Specialist in bathroom & kitchen plumbing.", experience: 6, rating: 4.6, totalReviews: 29, photoURL: "https://randomuser.me/api/portraits/men/33.jpg" },
      { uid: "p3", name: "Amit Kumar", email: "amit.plumber@gmail.com", phone: "7654321098", role: "provider", city: "Lucknow", pincode: "226002", bio: "24x7 emergency plumbing service.", experience: 5, rating: 4.7, totalReviews: 35, photoURL: "https://randomuser.me/api/portraits/men/34.jpg" },
      { uid: "p4", name: "Priya Verma", email: "priya.electric@gmail.com", phone: "6543210987", role: "provider", city: "Lucknow", pincode: "226016", bio: "Certified electrician - wiring, fans, inverters.", experience: 7, rating: 4.9, totalReviews: 51, photoURL: "https://randomuser.me/api/portraits/women/44.jpg" },
      { uid: "p5", name: "Sunil Gupta", email: "sunil.electric@gmail.com", phone: "5432109876", role: "provider", city: "Lucknow", pincode: "226003", bio: "All types of electrical repair & installation.", experience: 9, rating: 4.5, totalReviews: 38, photoURL: "https://randomuser.me/api/portraits/men/35.jpg" },
      { uid: "p6", name: "Neha Singh", email: "neha.tutor@gmail.com", phone: "9123456789", role: "provider", city: "Lucknow", pincode: "226017", bio: "Maths & Science tutor for Class 6-12.", experience: 6, rating: 4.8, totalReviews: 27, photoURL: "https://randomuser.me/api/portraits/women/45.jpg" },
      { uid: "p7", name: "Rohit Mehta", email: "rohit.tutor@gmail.com", phone: "9988776655", role: "provider", city: "Lucknow", pincode: "226018", bio: "English & SST home tuition.", experience: 4, rating: 4.4, totalReviews: 19, photoURL: "https://randomuser.me/api/portraits/men/36.jpg" },
      { uid: "p8", name: "Sneha Gupta", email: "sneha.delivery@gmail.com", phone: "8877665544", role: "provider", city: "Lucknow", pincode: "226010", bio: "Fast same-day delivery within Lucknow.", experience: 3, rating: 4.7, totalReviews: 22, photoURL: "https://randomuser.me/api/portraits/women/46.jpg" },
      { uid: "p9", name: "Arjun Patel", email: "arjun.delivery@gmail.com", phone: "7766554433", role: "provider", city: "Lucknow", pincode: "226024", bio: "Reliable parcel & document delivery.", experience: 5, rating: 4.6, totalReviews: 15, photoURL: "https://randomuser.me/api/portraits/men/37.jpg" },
      { uid: "p10", name: "Kavita Sharma", email: "kavita.cleaner@gmail.com", phone: "6655443322", role: "provider", city: "Lucknow", pincode: "226001", bio: "Professional home & deep cleaning services.", experience: 4, rating: 4.9, totalReviews: 33, photoURL: "https://randomuser.me/api/portraits/women/47.jpg" },
      { uid: "p11", name: "Manoj Kumar", email: "manoj.cleaner@gmail.com", phone: "5544332211", role: "provider", city: "Lucknow", pincode: "226025", bio: "Office & sofa cleaning specialists.", experience: 7, rating: 4.5, totalReviews: 28, photoURL: "https://randomuser.me/api/portraits/men/38.jpg" },
      { uid: "p12", name: "Shalini Mishra", email: "shalini.cleaner@gmail.com", phone: "9988771122", role: "provider", city: "Lucknow", pincode: "226017", bio: "Home cleaning and sanitization expert.", experience: 5, rating: 4.7, totalReviews: 21, photoURL: "https://randomuser.me/api/portraits/women/48.jpg" },
      { uid: "p13", name: "Deepak Singh", email: "deepak.delivery@gmail.com", phone: "8877661122", role: "provider", city: "Lucknow", pincode: "226018", bio: "Express delivery for all needs.", experience: 4, rating: 4.6, totalReviews: 18, photoURL: "https://randomuser.me/api/portraits/men/39.jpg" },
      { uid: "p14", name: "Meena Joshi", email: "meena.tutor@gmail.com", phone: "7766551122", role: "provider", city: "Lucknow", pincode: "226025", bio: "Experienced English tutor.", experience: 8, rating: 4.8, totalReviews: 30, photoURL: "https://randomuser.me/api/portraits/women/49.jpg" },
      { uid: "p15", name: "Suresh Rawat", email: "suresh.electric@gmail.com", phone: "6655441122", role: "provider", city: "Lucknow", pincode: "226003", bio: "Electrical repairs and installations.", experience: 10, rating: 4.9, totalReviews: 40, photoURL: "https://randomuser.me/api/portraits/men/40.jpg" },
    ];

    const customerNames = ["Anuj Kumar", "Neha Sharma", "Rohit Verma", "Pooja Singh", "Aarav Gupta", "Simran Kaur", "Vikram Singh", "Aditi Mehta", "Rajesh Yadav", "Saanvi Patel", "Karan Malhotra", "Divya Agarwal", "Nitin Saxena", "Priya Tiwari", "Siddharth Jain", "Megha Kapoor", "Yash Dubey", "Tanvi Sinha", "Harshita Srivastava", "Rajat Tripathi"];
    const customerImages = ["https://randomuser.me/api/portraits/men/41.jpg", "https://randomuser.me/api/portraits/women/50.jpg", "https://randomuser.me/api/portraits/men/42.jpg", "https://randomuser.me/api/portraits/women/51.jpg", "https://randomuser.me/api/portraits/men/43.jpg", "https://randomuser.me/api/portraits/women/52.jpg", "https://randomuser.me/api/portraits/men/44.jpg", "https://randomuser.me/api/portraits/women/53.jpg", "https://randomuser.me/api/portraits/men/45.jpg", "https://randomuser.me/api/portraits/women/54.jpg", "https://randomuser.me/api/portraits/men/46.jpg", "https://randomuser.me/api/portraits/women/55.jpg", "https://randomuser.me/api/portraits/men/47.jpg", "https://randomuser.me/api/portraits/women/56.jpg", "https://randomuser.me/api/portraits/men/48.jpg", "https://randomuser.me/api/portraits/women/57.jpg", "https://randomuser.me/api/portraits/men/49.jpg", "https://randomuser.me/api/portraits/women/58.jpg", "https://randomuser.me/api/portraits/women/59.jpg", "https://randomuser.me/api/portraits/men/50.jpg"];

    // Test user for easy testing
    const testUser = {
      uid: "testuser1",
      name: "Test User",
      email: "user1@gmail.com",
      phone: "9999999999",
      role: "customer" as const,
      city: "Lucknow",
      pincode: "226001",
      photoURL: "https://randomuser.me/api/portraits/men/1.jpg",
    };

    const customers = [
      testUser,
      ...Array.from({ length: 40 }, (_, i) => ({
        uid: `c${i + 1}`,
        name: customerNames[i % customerNames.length] + (i >= customerNames.length ? ` ${i}` : ""),
        email: `customer${i + 1}@gmail.com`,
        phone: `9${Math.floor(Math.random() * 900000000) + 100000000}`,
        role: "customer" as const,
        city: "Lucknow",
        pincode: lucknowPincodes[Math.floor(Math.random() * lucknowPincodes.length)],
        photoURL: customerImages[i % customerImages.length],
      })),
    ];

    const allUsers = [...providers, ...customers];
    const userChunks = chunkArray(allUsers, 15);

    for (const chunk of userChunks) {
      await Promise.all(chunk.map(async (user) => {
        try {
          await auth.createUser({
            uid: user.uid,
            email: user.email,
            password: "Password123!",
            displayName: user.name,
          });
        } catch (e: any) {
          if (e.code !== "auth/uid-already-exists") {
            console.error(`User error ${user.name}:`, e.message);
          }
        }
        await db.collection("users").doc(user.uid).set({
          ...user,
          createdAt: new Date(),
        });
      }));
      console.log(`Processed batch of ${chunk.length} users...`);
    }
    console.log(`✅ Created ${providers.length} providers + ${customers.length} customers`);
    
// ====================== 2. SEED 60 SERVICES ======================
    console.log("\nSeeding 60 Services (Batches of 15)...");
    const serviceTemplates = [
      { category: "plumbing", basePrice: 450, titlePrefix: "Plumbing Repair" },
      { category: "plumbing", basePrice: 699, titlePrefix: "Bathroom Fitting" },
      { category: "plumbing", basePrice: 899, titlePrefix: "Kitchen Sink Installation" },
      { category: "plumbing", basePrice: 499, titlePrefix: "Water Tank Cleaning" },
      { category: "electrical", basePrice: 399, titlePrefix: "Fan Installation" },
      { category: "electrical", basePrice: 599, titlePrefix: "Full Wiring Repair" },
      { category: "electrical", basePrice: 349, titlePrefix: "Switch Board Repair" },
      { category: "tutoring", basePrice: 800, titlePrefix: "Maths Tuition" },
      { category: "tutoring", basePrice: 1200, titlePrefix: "Science Home Tuition" },
      { category: "tutoring", basePrice: 1000, titlePrefix: "English Tuition" },
      { category: "delivery", basePrice: 150, titlePrefix: "Same Day Delivery" },
      { category: "delivery", basePrice: 200, titlePrefix: "Parcel Delivery" },
      { category: "cleaning", basePrice: 999, titlePrefix: "Deep Home Cleaning" },
      { category: "cleaning", basePrice: 799, titlePrefix: "Sofa Cleaning" },
    ];

    // FIX: Changed 'let' to 'const' to satisfy ESLint
    const allServiceData = [];
    let serviceCount = 0;
    
    for (const provider of providers) {
      const numServices = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < numServices && serviceCount < 60; i++) {
        const template = serviceTemplates[Math.floor(Math.random() * serviceTemplates.length)];
        allServiceData.push({
          providerId: provider.uid,
          category: template.category,
          title: `${template.titlePrefix} - ${provider.name.split(" ")[0]}`,
          description: `Professional ${template.category} service by experienced provider in Lucknow.`,
          price: template.basePrice + Math.floor(Math.random() * 600),
          priceType: Math.random() > 0.5 ? "fixed" : "hourly",
          duration: ["1 hour", "1-2 hours", "2-3 hours", "Same day"][Math.floor(Math.random() * 4)],
          city: "Lucknow",
          pincode: provider.pincode,
          createdAt: new Date(Date.now() - Math.random() * 8640000000),
          rating: 4.3 + Math.random() * 0.6,
          totalReviews: Math.floor(Math.random() * 40) + 10,
        });
        serviceCount++;
      }
    }

    const serviceIds: string[] = [];
    const serviceChunks = chunkArray(allServiceData, 15);
    for (const chunk of serviceChunks) {
      const ids = await Promise.all(chunk.map(async (s) => {
        const ref = await db.collection("services").add(s);
        return ref.id;
      }));
      serviceIds.push(...ids);
      console.log(`Uploaded ${serviceIds.length} / 60 services...`);
    }
    console.log(`✅ Seeded ${serviceCount} services`);

    // ====================== 3. SEED BOOKINGS & REVIEWS ======================
    console.log("\nSeeding bookings and reviews (Batches of 15)...");
    
    const bookingStatuses = ["pending", "accepted", "in-progress", "completed", "cancelled"];
    const addresses = ["45, Gomti Nagar, Lucknow", "12, Aliganj, Lucknow", "88, Indira Nagar, Lucknow", "23, Hazratganj, Lucknow", "67, Mahanagar, Lucknow"];
    
    const bookingsData = Array.from({ length: 30 }, (_, i) => ({
      customerId: `c${(i % customers.length) + 1}`,
      providerId: providers[i % providers.length].uid,
      status: bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)],
      totalAmount: Math.floor(Math.random() * 2000) + 200,
      serviceId: serviceIds[Math.floor(Math.random() * serviceIds.length)] || "demo-id",
      bookingDate: new Date(Date.now() - Math.random() * 8640000000),
      address: addresses[Math.floor(Math.random() * addresses.length)],
      notes: "Please call before arriving",
      createdAt: new Date(),
    }));

    for (const chunk of chunkArray(bookingsData, 15)) {
      await Promise.all(chunk.map(b => db.collection("bookings").add(b)));
    }

    const reviewComments = ["Very professional and quick service!", "Good work but took slightly longer than expected.", "Excellent cleaning.", "Highly recommended!", "Would book again.", "Friendly and punctual.", "Solved my problem efficiently.", "Affordable and reliable.", "Great communication.", "Service exceeded expectations."];
    
    const reviewsData = Array.from({ length: 20 }, (_, i) => {
      const cust = customers[(i + 3) % customers.length];
      return {
        providerId: providers[i % providers.length].uid,
        rating: Math.floor(Math.random() * 2) + 4,
        comment: reviewComments[Math.floor(Math.random() * reviewComments.length)],
        customerId: cust.uid,
        customerName: cust.name,
        bookingId: "demo-booking",
        serviceId: serviceIds[Math.floor(Math.random() * serviceIds.length)] || "demo-id",
        createdAt: new Date(),
      };
    });

    for (const chunk of chunkArray(reviewsData, 15)) {
      await Promise.all(chunk.map(r => db.collection("reviews").add(r)));
    }

    console.log("🎉 Seeding completed successfully!");
    console.log("\nLogin Credentials: Password: Password123!");
  } catch (error) {
    console.error("❌ Seeding error:", error);
  }
}

seedData().then(() => process.exit(0));