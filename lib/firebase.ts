import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB6YQb3CQ12PUa9n47Vsp7NeyNeMVmtVDw",
  authDomain: "jansahay-f528d.firebaseapp.com",
  projectId: "jansahay-f528d",
  storageBucket: "jansahay-f528d.appspot.com",
  messagingSenderId: "49994249598",
  appId: "1:49994249598:web:7e401e432a284ad8d4af2f",
  measurementId: "G-XR0JH17LY1"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
import { isSupported as analyticsIsSupported } from "firebase/analytics";

export let analytics: ReturnType<typeof getAnalytics> | null = null;
if (typeof window !== "undefined") {
  analyticsIsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export default app;