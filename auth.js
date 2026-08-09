import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";

import { app } from "./firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);

// ===============================
// REGISTER
// ===============================

const registerForm = document.querySelector("#registerForm");

if (registerForm) {

  registerForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const name = document.querySelector("#name")?.value.trim();
    const email = document.querySelector("#email")?.value.trim();
    const password = document.querySelector("#password")?.value;
    const mobile = document.querySelector("#mobile")?.value.trim();

    if (!name || !email || !password) {
      alert("Please fill in all required fields.");
      return;
    }

    try {

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user = userCredential.user;

      // Save user information in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: name,
        email: email,
        mobile: mobile || "",
        createdAt: new Date()
      });

      alert("Registration successful!");

      window.location.href = "login.html";

    } catch (error) {

      console.error(error);

      if (error.code === "auth/email-already-in-use") {
        alert("This email is already registered.");
      } else if (error.code === "auth/weak-password") {
        alert("Password should be at least 6 characters.");
      } else if (error.code === "auth/invalid-email") {
        alert("Please enter a valid email address.");
      } else {
        alert("Registration failed: " + error.message);
      }

    }

  });

}


// ===============================
// LOGIN
// ===============================

const loginForm = document.querySelector("#loginForm");

if (loginForm) {

  loginForm.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = document.querySelector("#email")?.value.trim();
    const password = document.querySelector("#password")?.value;

    if (!email || !password) {
      alert("Please enter your email and password.");
      return;
    }

    try {

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      alert("Login successful!");

      window.location.href = "index.html";

    } catch (error) {

      console.error(error);

      if (
        error.code === "auth/invalid-credential" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/user-not-found"
      ) {
        alert("Incorrect email or password.");
      } else {
        alert("Login failed: " + error.message);
      }

    }

  });

}


// ===============================
// LOGOUT
// ===============================

const logoutButton = document.querySelector("#logoutBtn");

if (logoutButton) {

  logoutButton.addEventListener("click", async () => {

    try {

      await signOut(auth);

      alert("You have been logged out.");

      window.location.href = "index.html";

    } catch (error) {

      console.error(error);

      alert("Logout failed.");

    }

  });

}
