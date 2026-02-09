/**
 * Authentication Context
 * Provides Google OAuth sign-in with role management via Firebase Custom Claims.
 * Roles are read from JWT token claims (not Firestore) for performance and security.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    getIdTokenResult,
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, googleProvider, db, isFirebaseConfigured } from '../lib/firebase';

type Role = 'user' | 'admin';

interface AuthContextType {
    user: User | null;
    role: Role;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
    refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<Role>('user');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isFirebaseConfigured()) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            try {
                setUser(firebaseUser);

                if (firebaseUser) {
                    try {
                        // LOCAL ADMIN LIST - Add your email here!
                        // This grants admin access without needing Cloud Functions
                        const LOCAL_ADMIN_EMAILS = [
                            'shairaz102938@gmail.com', // Your admin email
                            'raviraj.sashank@gmail.com', // Additional admin
                            // Add more admin emails as needed
                        ];

                        // Check if user is a local admin
                        const isLocalAdmin = firebaseUser.email &&
                            LOCAL_ADMIN_EMAILS.includes(firebaseUser.email.toLowerCase());

                        if (isLocalAdmin) {
                            setRole('admin');
                        } else {
                            // Read role from JWT Custom Claims (NOT Firestore)
                            const tokenResult = await getIdTokenResult(firebaseUser);
                            const claimRole = tokenResult.claims.role as Role;
                            setRole(claimRole || 'user');
                        }

                        // Create/update user profile in Firestore (for preferences, etc.)
                        // Run this in background, don't block the auth flow
                        setDoc(
                            doc(db, 'users', firebaseUser.uid),
                            {
                                email: firebaseUser.email,
                                displayName: firebaseUser.displayName,
                                photoURL: firebaseUser.photoURL,
                                lastActive: serverTimestamp(),
                            },
                            { merge: true }
                        ).catch(err => console.warn('Failed to update user profile:', err));
                    } catch (error) {
                        console.error('Error loading user data:', error);
                        setRole('user');
                    }
                } else {
                    setRole('user');
                }
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const signInWithGoogle = async () => {
        if (!isFirebaseConfigured()) {
            console.warn('Firebase not configured. Sign-in disabled.');
            return;
        }
        await signInWithPopup(auth, googleProvider);
    };

    const signOut = async () => {
        await firebaseSignOut(auth);
        setRole('user');
    };

    // Force token refresh (call after role change via Cloud Function)
    const refreshToken = async () => {
        if (user) {
            await user.getIdToken(true);
            const tokenResult = await getIdTokenResult(user);
            setRole((tokenResult.claims.role as Role) || 'user');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                role,
                loading,
                isAuthenticated: !!user,
                isAdmin: role === 'admin',
                signInWithGoogle,
                signOut,
                refreshToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
