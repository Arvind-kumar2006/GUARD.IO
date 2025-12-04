const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set, get } = require("firebase/database");

const firebaseConfig = {
      apiKey: "AIzaSyBBJUuBH5aCmHTVWemGBDEtzP-GUDt4fA4",
      authDomain: "guardio-f6f26.firebaseapp.com",
      databaseURL: "https://guardio-f6f26-default-rtdb.firebaseio.com",
      projectId: "guardio-f6f26",
      storageBucket: "guardio-f6f26.firebasestorage.app",
      messagingSenderId: "905975977884",
      appId: "1:905975977884:web:2ec3de1c754cf74f035a59"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function testConnection() {
      console.log("Testing Realtime Database connection...");
      try {
            const testRef = ref(db, 'test_connection');
            await set(testRef, {
                  message: "Hello from test script",
                  timestamp: Date.now()
            });
            console.log("✅ Write successful!");

            const snapshot = await get(testRef);
            console.log("✅ Read successful:", snapshot.val());
      } catch (error) {
            console.error("❌ Connection failed:", error.message);
      }
      process.exit();
}

testConnection();
