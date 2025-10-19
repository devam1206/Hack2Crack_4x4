import { auth } from './firebase';
import { 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup, 
    signOut,
    sendPasswordResetEmail,
    updateProfile
} from 'firebase/auth';
import { db } from './firebase';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';

const googleProvider = new GoogleAuthProvider();

export const handleEmailSignup = async (email, password, username) => {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update the user's display name
        await updateProfile(user, {
            displayName: username,
        });

        // Optionally, store the username in Firestore
        await addDoc(collection(db, "accounts"), {
            email: email,
            username: username,
        });

        return {
            success: true,
            user: user,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
};

export const handleGoogleSignup = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if the user already exists in the Firestore 'accounts' collection
        const q = query(collection(db, "accounts"), where("email", "==", user.email));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            // User does not exist, create a new document
            await addDoc(collection(db, "accounts"), {
                email: user.email
            });
        }

        return {
            success: true,
            user: user
        };
    } catch (error) {
        console.error("Error during Google signup:", error);
        return {
            success: false,
            error: error.message
        };
    }
};

export const handleEmailLogin = async (email, password) => {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return {
            success: true,
            user: userCredential.user
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

export const handleLogout = async () => {
    try {
        await signOut(auth);
        return {
            success: true
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};

export const handlePasswordReset = async (email) => {
    try {
        await sendPasswordResetEmail(auth, email);
        return {
            success: true
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
};
