import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { app } from "./firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);


// ==========================
// REGISTER
// ==========================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const mobile = document.getElementById("mobile").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword =
            document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
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

            await setDoc(doc(db, "users", user.uid), {
                name: name,
                email: email,
                mobile: mobile,
                createdAt: new Date()
            });

            alert("Registration successful!");

            window.location.href = "login.html";

        } catch (error) {

            console.error(error);

            if (error.code === "auth/email-already-in-use") {
                alert("This email is already registered.");
            } else if (error.code === "auth/weak-password") {
                alert("Password must be at least 6 characters.");
            } else if (error.code === "auth/invalid-email") {
                alert("Please enter a valid email address.");
            } else {
                alert("Registration failed: " + error.message);
            }
        }

    });
}


// ==========================
// LOGIN
// ==========================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password =
            document.getElementById("loginPassword").value;

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

            alert("Login failed: " + error.message);
        }

    });
}


// ==========================
// LOGOUT
// ==========================

const logoutButton = document.getElementById("logoutBtn");

if (logoutButton) {

    logoutButton.addEventListener("click", async function () {

        try {

            await signOut(auth);

            alert("Logged out successfully.");

            window.location.href = "index.html";

        } catch (error) {

            console.error(error);

            alert("Logout failed.");
        }

    });
}
