import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyASv2BbNq3ki5HfDowL_tMntqOT9-TmsEM",
  authDomain: "kbtv-59002.firebaseapp.com",
  projectId: "kbtv-59002",
  storageBucket: "kbtv-59002.firebasestorage.app",
  messagingSenderId: "1025817799349",
  appId: "1:1025817799349:web:54a437762aea2c9971acfc"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
