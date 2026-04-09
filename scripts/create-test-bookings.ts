// scripts/create-test-bookings.ts
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import * as fs from "fs";
import * as path from "path";

const serviceAccountPath = path.join(process.cwd(), "service-account.json");

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ service-account.json not found in project root!");
  process.exit(1);
}

const serviceAccount = JSON.parse(
  fs.readFileSync(serviceAccountPath, "utf8")
);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

async function createTestBookings() {
  console.log("Creating test bookings for demo users...");

  try {
    // First, create a test provider if none exist
    const existingProviders = await db.collection("users").where("role", "==", "provider").get();
    let testProvider;

    if (existingProviders.empty) {
      console.log("No providers found, creating a test provider...");
      testProvider = {
        uid: "test-provider-1",
        name: "Test Provider",
        email: "testprovider@example.com",
        phone: "9999999999",
        role: "provider",
        city: "Lucknow",
        pincode: "226001",
        bio: "Test provider for demo",
        experience: 5,
        rating: 4.5,
        totalReviews: 10,
        photoURL: "https://randomuser.me/api/portraits/men/32.jpg",
        createdAt: new Date(),
      };
      await db.collection("users").doc(testProvider.uid).set(testProvider);
      console.log("Created test provider");
    } else {
      testProvider = { uid: existingProviders.docs[0].id, ...existingProviders.docs[0].data() } as any;
      console.log("Using existing provider:", (testProvider as any).name);
    }

    // Get some services and customers
    const servicesSnapshot = await db.collection("services").limit(5).get();
    const customersSnapshot = await db.collection("users").where("role", "==", "customer").limit(5).get();

    const services = servicesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    const customers = customersSnapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as any));

    console.log(`Found ${customers.length} customers and ${services.length} services`);

    // Create some bookings for customers (as customers)
    for (const customer of customers.slice(0, 3)) {
      const randomService = services[Math.floor(Math.random() * services.length)];

      const bookingData = {
        customerId: customer.uid,
        providerId: randomService.providerId,
        serviceId: randomService.id,
        status: ["pending", "accepted", "in-progress", "completed"][Math.floor(Math.random() * 4)],
        bookingDate: new Date(Date.now() + Math.random() * 86400000 * 7),
        address: `${customer.city}, ${customer.pincode}`,
        notes: "Test booking created for demo",
        totalAmount: randomService.price,
        paymentMethod: Math.random() > 0.5 ? "cash" : "online",
        createdAt: new Date(Date.now() - Math.random() * 86400000 * 30),
      };

      await db.collection("bookings").add(bookingData);
      console.log(`Created customer booking for ${customer.name}`);
    }

    // Create some bookings where test provider is the provider (for provider dashboard)
    for (const customer of customers.slice(0, 2)) {
      const randomService = services[Math.floor(Math.random() * services.length)];

      const bookingData = {
        customerId: customer.uid,
        providerId: testProvider.uid,
        serviceId: randomService.id,
        status: "pending", // Keep as pending so provider can see requests
        bookingDate: new Date(Date.now() + Math.random() * 86400000 * 7),
        address: `${customer.city}, ${customer.pincode}`,
        notes: "Test booking request for provider",
        totalAmount: randomService.price,
        paymentMethod: "cash",
        createdAt: new Date(),
      };

      await db.collection("bookings").add(bookingData);
      console.log(`Created provider booking request for ${testProvider.name}`);
    }

    console.log("✅ Test bookings created successfully!");
  } catch (error) {
    console.error("❌ Error creating test bookings:", error);
  }
}

createTestBookings().then(() => process.exit(0));