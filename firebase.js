// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs,
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    onSnapshot,
    addDoc,
    serverTimestamp,
    increment,
    arrayUnion,
    arrayRemove,
    writeBatch
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { 
    getStorage, 
    ref, 
    uploadBytes, 
    uploadBytesResumable, 
    getDownloadURL, 
    deleteObject,
    listAll,
    getMetadata
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyASv2BbNq3ki5HfDowL_tMntqOT9-TmsEM",
    authDomain: "kbtv-59002.firebaseapp.com",
    projectId: "kbtv-59002",
    storageBucket: "kbtv-59002.firebasestorage.app",
    messagingSenderId: "1025817799349",
    appId: "1:1025817799349:web:54a437762aea2c9971acfc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// ============================================
// EXPORT ALL SERVICES AND FUNCTIONS
// ============================================

// Core services
export { 
    app, 
    auth, 
    db, 
    storage 
};

// Authentication functions
export { 
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    sendPasswordResetEmail,
    updateProfile
};

// Firestore functions
export { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs,
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    onSnapshot,
    addDoc,
    serverTimestamp,
    increment,
    arrayUnion,
    arrayRemove,
    writeBatch
};

// Storage functions
export { 
    ref, 
    uploadBytes, 
    uploadBytesResumable, 
    getDownloadURL, 
    deleteObject,
    listAll,
    getMetadata
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get current user
export function getCurrentUser() {
    return auth.currentUser;
}

// Check if user is admin
export async function isAdmin(userId) {
    if (!userId) return false;
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.exists() && userDoc.data().role === 'admin';
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
}

// Get user data
export async function getUserData(userId) {
    if (!userId) return null;
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
        console.error('Error getting user data:', error);
        return null;
    }
}

// Create user document
export async function createUserDocument(userId, userData) {
    try {
        await setDoc(doc(db, 'users', userId), {
            ...userData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error creating user document:', error);
        return false;
    }
}

// Update user document
export async function updateUserDocument(userId, userData) {
    try {
        await updateDoc(doc(db, 'users', userId), {
            ...userData,
            updatedAt: serverTimestamp()
        });
        return true;
    } catch (error) {
        console.error('Error updating user document:', error);
        return false;
    }
}

// Check if user has active rental
export async function hasActiveRental(userId, movieId) {
    if (!userId) return false;
    try {
        const rentalsQuery = query(
            collection(db, 'rentals'),
            where('userId', '==', userId),
            where('movieId', '==', movieId),
            where('status', '==', 'active')
        );
        const snapshot = await getDocs(rentalsQuery);
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking rental:', error);
        return false;
    }
}

// Upload file to storage
export async function uploadFile(path, file, onProgress) {
    try {
        const storageRef = ref(storage, path);
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
            uploadTask.on('state_changed',
                (snapshot) => {
                    if (onProgress) {
                        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                        onProgress(progress);
                    }
                },
                (error) => {
                    reject(error);
                },
                async () => {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    resolve({
                        ref: uploadTask.snapshot.ref,
                        downloadURL: downloadURL,
                        metadata: uploadTask.snapshot.metadata
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}

// Delete file from storage
export async function deleteFile(path) {
    try {
        const storageRef = ref(storage, path);
        await deleteObject(storageRef);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
}

// Get all files from a storage folder
export async function listFiles(folderPath) {
    try {
        const storageRef = ref(storage, folderPath);
        const result = await listAll(storageRef);
        return result.items.map(item => item.name);
    } catch (error) {
        console.error('Error listing files:', error);
        return [];
    }
}

// Get download URL for a file
export async function getFileUrl(path) {
    try {
        const storageRef = ref(storage, path);
        return await getDownloadURL(storageRef);
    } catch (error) {
        console.error('Error getting file URL:', error);
        return null;
    }
}

// Create a new rental
export async function createRental(userId, userEmail, movieId, movieTitle, paymentId) {
    try {
        const rentalData = {
            userId: userId,
            userEmail: userEmail,
            movieId: movieId,
            movieTitle: movieTitle,
            paymentId: paymentId,
            startsAt: serverTimestamp(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            status: 'active',
            createdAt: serverTimestamp()
        };
        
        const docRef = await addDoc(collection(db, 'rentals'), rentalData);
        return docRef.id;
    } catch (error) {
        console.error('Error creating rental:', error);
        throw error;
    }
}

// Get active rental for user and movie
export async function getActiveRental(userId, movieId) {
    try {
        const rentalsQuery = query(
            collection(db, 'rentals'),
            where('userId', '==', userId),
            where('movieId', '==', movieId),
            where('status', '==', 'active')
        );
        const snapshot = await getDocs(rentalsQuery);
        if (snapshot.empty) return null;
        return {
            id: snapshot.docs[0].id,
            ...snapshot.docs[0].data()
        };
    } catch (error) {
        console.error('Error getting rental:', error);
        return null;
    }
}

// Create a payment record
export async function createPayment(paymentData) {
    try {
        const docRef = await addDoc(collection(db, 'payments'), {
            ...paymentData,
            status: 'pending',
            submittedAt: serverTimestamp()
        });
        return docRef.id;
    } catch (error) {
        console.error('Error creating payment:', error);
        throw error;
    }
}

// Get all payments for a user
export async function getUserPayments(userId) {
    try {
        const paymentsQuery = query(
            collection(db, 'payments'),
            where('userId', '==', userId),
            orderBy('submittedAt', 'desc')
        );
        const snapshot = await getDocs(paymentsQuery);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting user payments:', error);
        return [];
    }
}

// Get all pending payments (admin only)
export async function getPendingPayments() {
    try {
        const paymentsQuery = query(
            collection(db, 'payments'),
            where('status', '==', 'pending'),
            orderBy('submittedAt', 'asc')
        );
        const snapshot = await getDocs(paymentsQuery);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error('Error getting pending payments:', error);
        return [];
    }
}

// Approve payment (admin only)
export async function approvePayment(paymentId, adminEmail) {
    try {
        const paymentRef = doc(db, 'payments', paymentId);
        await updateDoc(paymentRef, {
            status: 'approved',
            approvedAt: serverTimestamp(),
            approvedBy: adminEmail
        });
        return true;
    } catch (error) {
        console.error('Error approving payment:', error);
        return false;
    }
}

// Reject payment (admin only)
export async function rejectPayment(paymentId, adminEmail) {
    try {
        const paymentRef = doc(db, 'payments', paymentId);
        await updateDoc(paymentRef, {
            status: 'rejected',
            rejectedAt: serverTimestamp(),
            rejectedBy: adminEmail
        });
        return true;
    } catch (error) {
        console.error('Error rejecting payment:', error);
        return false;
    }
}

// ============================================
// LOGGING
// ============================================
console.log('🔥 Firebase initialized successfully!');
console.log('📁 Project ID:', firebaseConfig.projectId);
console.log('👤 Auth:', auth ? '✅' : '❌');
console.log('📊 Firestore:', db ? '✅' : '❌');
console.log('💾 Storage:', storage ? '✅' : '❌');
