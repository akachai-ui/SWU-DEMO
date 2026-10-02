"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  User as FirebaseUser
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";
import { auth, db } from "./firebase";
import { UserPermissions, UserRole, ROLE_PRESETS } from "./permissionService";

export interface UserProfile {
  id: string;
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  roleNameTh: string;
  department: string;
  position?: string;
  permissions: UserPermissions;
  avatarUrl?: string;
  status?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  loginWithGooglePopup: () => Promise<{ success: boolean; message?: string }>;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: Query Firestore `users_permissions` collection strictly
async function findUserPermissionInFirestore(email: string, uid?: string): Promise<{ docId: string; data: any } | null> {
  const cleanEmail = email.toLowerCase().trim();
  if (!cleanEmail) return null;

  try {
    // 1. Check by UID directly
    if (uid) {
      const uidRef = doc(db, "users_permissions", uid);
      const uidSnap = await getDoc(uidRef);
      if (uidSnap.exists()) {
        return { docId: uidSnap.id, data: uidSnap.data() };
      }
    }

    // 2. Check by sanitized email key (e.g., akachaiha_gmail_com)
    const sanitizedEmailKey = cleanEmail.replace(/[@.]/g, "_");
    const sanitizedRef = doc(db, "users_permissions", sanitizedEmailKey);
    const sanitizedSnap = await getDoc(sanitizedRef);
    if (sanitizedSnap.exists()) {
      return { docId: sanitizedSnap.id, data: sanitizedSnap.data() };
    }

    // 3. Check by raw email key
    const rawEmailRef = doc(db, "users_permissions", cleanEmail);
    const rawEmailSnap = await getDoc(rawEmailRef);
    if (rawEmailSnap.exists()) {
      return { docId: rawEmailSnap.id, data: rawEmailSnap.data() };
    }

    // 4. Query collection where email == cleanEmail
    const q = query(
      collection(db, "users_permissions"),
      where("email", "==", cleanEmail)
    );
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const foundDoc = querySnap.docs[0];
      return { docId: foundDoc.id, data: foundDoc.data() };
    }
  } catch (err) {
    console.error("Error querying users_permissions:", err);
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper: Verify user permission strictly against Firestore `users_permissions`
  const verifyAndLoadUserProfile = async (fbUser: FirebaseUser): Promise<UserProfile | null> => {
    const userEmail = (fbUser.email || "").toLowerCase().trim();
    if (!userEmail) return null;

    const record = await findUserPermissionInFirestore(userEmail, fbUser.uid);

    // If NOT found in users_permissions -> STRICTLY DENY ACCESS
    if (!record) {
      console.warn(`Access Denied: ${userEmail} is not found in users_permissions collection.`);
      return null;
    }

    const { docId, data } = record;

    // If user status is inactive or suspended
    if (data.status === "inactive" || data.status === "suspended" || data.status === "disabled") {
      console.warn(`Access Denied: ${userEmail} account status is ${data.status}.`);
      return null;
    }

    const role: UserRole = data.role || "staff";
    const rolePreset = ROLE_PRESETS[role] || ROLE_PRESETS.staff;

    const photo =
      fbUser.photoURL ||
      (fbUser.providerData && fbUser.providerData[0]?.photoURL) ||
      data.avatarUrl ||
      undefined;

    const userProfile: UserProfile = {
      id: docId,
      uid: fbUser.uid,
      name: data.name || fbUser.displayName || userEmail.split("@")[0],
      email: userEmail,
      role: role,
      roleNameTh: data.roleNameTh || rolePreset.roleNameTh,
      department: data.department || "ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ",
      position: data.position || "เจ้าหน้าที่",
      permissions: data.permissions || { ...rolePreset.defaultPermissions },
      avatarUrl: photo,
      status: data.status || "active"
    };

    // Update lastLogin, UID & avatarUrl in Firestore
    try {
      const targetDocRef = doc(db, "users_permissions", docId);
      await setDoc(targetDocRef, {
        uid: fbUser.uid,
        avatarUrl: photo || null,
        lastLogin: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (err) {
      console.warn("Could not update lastLogin / avatarUrl:", err);
    }

    return userProfile;
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    if (typeof window !== "undefined") {
      setPersistence(auth, browserLocalPersistence).catch((err) => {
        console.warn("Could not set auth persistence:", err);
      });
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        try {
          const profile = await verifyAndLoadUserProfile(fbUser);
          if (profile) {
            setFirebaseUser(fbUser);
            setUser(profile);
            localStorage.setItem("swu_auth_user", JSON.stringify(profile));
          } else {
            // User not authorized in users_permissions
            await signOut(auth);
            setFirebaseUser(null);
            setUser(null);
            localStorage.removeItem("swu_auth_user");
          }
        } catch (err) {
          console.error("Error verifying user session:", err);
          await signOut(auth);
          setFirebaseUser(null);
          setUser(null);
          localStorage.removeItem("swu_auth_user");
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        localStorage.removeItem("swu_auth_user");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 1. Google Sign-In (Firebase Auth) - Checked against users_permissions
  const loginWithGooglePopup = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email || "";

      // Strict check against Firestore users_permissions
      const profile = await verifyAndLoadUserProfile(result.user);
      if (!profile) {
        await signOut(auth);
        setUser(null);
        setFirebaseUser(null);
        localStorage.removeItem("swu_auth_user");
        return {
          success: false,
          message: `บัญชี Google (${email}) ไม่มีสิทธิ์เข้าใช้งานระบบ โปรดติดต่อผู้ดูแลระบบ`
        };
      }

      setUser(profile);
      setFirebaseUser(result.user);
      localStorage.setItem("swu_auth_user", JSON.stringify(profile));
      return { success: true };
    } catch (error: any) {
      console.error("Google Auth error:", error);
      const currentHost = typeof window !== "undefined" ? window.location.hostname : "";
      let message = "ไม่สามารถเข้าสู่ระบบด้วย Google ได้";
      if (error.code === "auth/popup-closed-by-user") {
        message = "หน้าต่างเข้าสู่ระบบถูกปิดก่อนทำรายการสำเร็จ";
      } else if (error.code === "auth/unauthorized-domain") {
        message = `โดเมนหรือ IP (${currentHost}) ยังไม่ได้เพิ่มใน Authorized Domains ของ Firebase Console โปรดเพิ่ม "${currentHost}" ใน Authentication > Settings หรือใช้งานด้วย อีเมล/รหัสผ่าน ด้านล่างได้ทันที`;
      } else if (error.message) {
        message = error.message;
      }
      return { success: false, message };
    }
  };

  // 2. Email & Password Sign-In (Firebase Auth) - Checked against users_permissions
  const loginWithEmail = async (email: string, password: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();

      // Step A: Pre-check in Firestore users_permissions first
      const record = await findUserPermissionInFirestore(cleanEmail);
      if (!record) {
        return {
          success: false,
          message: `อีเมล (${cleanEmail}) ไม่มีสิทธิ์เข้าใช้งานระบบ โปรดติดต่อผู้ดูแลระบบ`
        };
      }

      // Step B: Authenticate with Firebase
      const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const profile = await verifyAndLoadUserProfile(result.user);

      if (!profile) {
        await signOut(auth);
        setUser(null);
        setFirebaseUser(null);
        localStorage.removeItem("swu_auth_user");
        return {
          success: false,
          message: `บัญชีของท่านไม่มีสิทธิ์เข้าใช้งานระบบ โปรดติดต่อผู้ดูแลระบบ`
        };
      }

      setUser(profile);
      setFirebaseUser(result.user);
      localStorage.setItem("swu_auth_user", JSON.stringify(profile));
      return { success: true };
    } catch (error: any) {
      console.error("Email Login error:", error);
      let message = "อีเมลหรือรหัสผ่านไม่ถูกต้อง";
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-credential") {
        message = "ไม่พบบัญชีผู้ใช้งาน หรือรหัสผ่านไม่ถูกต้อง";
      } else if (error.code === "auth/wrong-password") {
        message = "รหัสผ่านไม่ถูกต้อง";
      } else if (error.code === "auth/invalid-email") {
        message = "รูปแบบอีเมลไม่ถูกต้อง";
      } else if (error.code === "auth/too-many-requests") {
        message = "พยายามเข้าสู่ระบบผิดหลายครั้งเกินไป โปรดลองใหม่อีกครั้งในภายหลัง";
      }
      return { success: false, message };
    }
  };

  // 3. Register with Email & Password (Only allowed if email already exists in users_permissions)
  const registerWithEmail = async (email: string, password: string, name: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();

      // Check if this email was pre-registered/authorized by Admin in users_permissions
      const record = await findUserPermissionInFirestore(cleanEmail);
      if (!record) {
        return {
          success: false,
          message: `อีเมลนี้ไม่มีสิทธิ์ลงทะเบียนเข้าใช้งานระบบ โปรดติดต่อผู้ดูแลระบบ`
        };
      }

      const result = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const profile = await verifyAndLoadUserProfile(result.user);

      if (!profile) {
        await signOut(auth);
        return {
          success: false,
          message: "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์ผู้ใช้งาน"
        };
      }

      setUser(profile);
      setFirebaseUser(result.user);
      localStorage.setItem("swu_auth_user", JSON.stringify(profile));
      return { success: true };
    } catch (error: any) {
      console.error("Registration error:", error);
      let message = "ไม่สามารถสร้างบัญชีผู้ใช้ได้";
      if (error.code === "auth/email-already-in-use") {
        message = "อีเมลนี้มีผู้ใช้งานในระบบแล้ว ท่านสามารถกดเข้าสู่ระบบได้ทันที";
      } else if (error.code === "auth/weak-password") {
        message = "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร";
      }
      return { success: false, message };
    }
  };

  // 4. Sign Out
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn("SignOut error:", e);
    }
    setUser(null);
    setFirebaseUser(null);
    localStorage.removeItem("swu_auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        loginWithGooglePopup,
        loginWithEmail,
        registerWithEmail,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
