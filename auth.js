import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
    getFirestore,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import { app } from "./firebase.js";

const auth = getAuth(app);
const db = getFirestore(app);


// ========================================
// REGISTER
// ========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const mobileInput = document.getElementById("mobile");
        const passwordInput = document.getElementById("password");
        const confirmPasswordInput =
            document.getElementById("confirmPassword");

        if (
            !nameInput ||
            !emailInput ||
            !mobileInput ||
            !passwordInput ||
            !confirmPasswordInput
        ) {
            alert("Registration form error. Please refresh the page.");
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const mobile = mobileInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
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

            await setDoc(
                doc(db, "users", user.uid),
                {
                    name: name,
                    email: email,
                    mobile: mobile,
                    createdAt: new Date()
                }
            );

            alert("Registration successful!");

            window.location.href = "login.html";

        } catch (error) {

            console.error("Registration error:", error);

            if (error.code === "auth/email-already-in-use") {
                alert("This email is already registered.");

            } else if (error.code === "auth/weak-password") {
                alert("Password must be at least 6 characters.");

            } else if (error.code === "auth/invalid-email") {
                alert("Please enter a valid email address.");

            } else if (error.code === "auth/operation-not-allowed") {
                alert("Email/Password sign-in is not enabled in Firebase.");

            } else {
                alert("Registration failed: " + error.message);
            }
        }

    });
}


// ========================================
// LOGIN
// ========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const emailInput =
            document.getElementById("loginEmail");

        const passwordInput =
            document.getElementById("loginPassword");

        if (!emailInput || !passwordInput) {
            alert("Login form error. Please refresh the page.");
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            alert("Login successful!");

            window.location.href = "index.html";

        } catch (error) {

            console.error("Login error:", error);

            alert("Login failed: " + error.message);
        }

    });
}


// ========================================
// LOGIN STATUS + LOGOUT
// ========================================

const logoutButton =
    document.getElementById("logoutBtn");

if (logoutButton) {

    onAuthStateChanged(auth, (user) => {

        if (user) {

            // User is logged in
            logoutButton.style.display = "inline-block";

        } else {

            // User is logged out
            logoutButton.style.display = "none";

        }

    });


    logoutButton.addEventListener("click", async function () {

        try {

            await signOut(auth);

            alert("Logged out successfully!");

            window.location.href = "login.html";

        } catch (error) {

            console.error("Logout error:", error);

            alert("Logout failed: " + error.message);
        }

    });

}
