import {
  collection,
  doc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
  onSnapshot
} from "firebase/firestore";
import { db } from "./firebase";

export interface UserPermissions {
  canViewAssets: boolean;          // ดูทะเบียนครุภัณฑ์
  canEditAssets: boolean;          // แก้ไข/จำหน่ายครุภัณฑ์
  canExportAssets: boolean;        // ส่งออกไฟล์ CSV/รายงานครุภัณฑ์
  canViewConsumables: boolean;     // ดูรายการวัสดุสิ้นเปลือง
  canRequestConsumables: boolean;  // ส่งใบขอเบิกพัสดุ
  canAddConsumables: boolean;      // เพิ่ม/แก้ไข/ลบสต็อกวัสดุในคลัง
  canApproveRequisitions: boolean; // อนุมัติใบขอเบิกพัสดุ
  canManageUsers: boolean;         // จัดการสิทธิ์และบัญชีผู้ใช้งาน
  canAccessDevPortal: boolean;     // เข้าถึงพิมพ์เขียวและ API (/dev)
}

export type UserRole = "super_admin" | "approver" | "inventory_officer" | "technician" | "staff" | "viewer";

export interface UserAccount {
  id?: string;
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  roleNameTh: string;
  department: string;
  position?: string;
  status: "active" | "inactive" | "suspended";
  permissions: UserPermissions;
  avatarUrl?: string;
  lastLogin?: any;
  createdAt?: any;
  updatedAt?: any;
}

export interface RolePreset {
  role: UserRole;
  roleNameTh: string;
  description: string;
  color: string;
  defaultPermissions: UserPermissions;
}

export const ROLE_PRESETS: Record<UserRole, RolePreset> = {
  super_admin: {
    role: "super_admin",
    roleNameTh: "ผู้ดูแลระบบสูงสุด (Super Admin)",
    description: "มีสิทธิ์เต็มทุกส่วน จัดการโครงสร้างข้อมูล และกำหนดสิทธิ์ผู้ใช้งานทั้งหมด",
    color: "red",
    defaultPermissions: {
      canViewAssets: true,
      canEditAssets: true,
      canExportAssets: true,
      canViewConsumables: true,
      canRequestConsumables: true,
      canAddConsumables: true,
      canApproveRequisitions: true,
      canManageUsers: true,
      canAccessDevPortal: true
    }
  },
  approver: {
    role: "approver",
    roleNameTh: "หัวหน้างาน / ผู้อนุมัติ (Approver)",
    description: "มีสิทธิ์อนุมัติใบขอเบิกพัสดุ ตรวจสอบทะเบียนครุภัณฑ์ และรายงานสรุป",
    color: "purple",
    defaultPermissions: {
      canViewAssets: true,
      canEditAssets: false,
      canExportAssets: true,
      canViewConsumables: true,
      canRequestConsumables: true,
      canAddConsumables: false,
      canApproveRequisitions: true,
      canManageUsers: false,
      canAccessDevPortal: false
    }
  },
  inventory_officer: {
    role: "inventory_officer",
    roleNameTh: "เจ้าหน้าที่พัสดุและคลัง (Inventory Officer)",
    description: "จัดการสต็อกวัสดุ เพิ่ม/แก้ไขรายการพัสดุ บันทึกจ่ายของ และปรับปรุงทะเบียนครุภัณฑ์",
    color: "amber",
    defaultPermissions: {
      canViewAssets: true,
      canEditAssets: true,
      canExportAssets: true,
      canViewConsumables: true,
      canRequestConsumables: true,
      canAddConsumables: true,
      canApproveRequisitions: false,
      canManageUsers: false,
      canAccessDevPortal: false
    }
  },
  technician: {
    role: "technician",
    roleNameTh: "ช่างซ่อมบำรุง / ผู้ปฏิบัติงาน (Technician)",
    description: "ขอเบิกพัสดุงานช่าง อุปกรณ์ และวัสดุซ่อมแซมอาคารสถานที่",
    color: "blue",
    defaultPermissions: {
      canViewAssets: true,
      canEditAssets: false,
      canExportAssets: false,
      canViewConsumables: true,
      canRequestConsumables: true,
      canAddConsumables: false,
      canApproveRequisitions: false,
      canManageUsers: false,
      canAccessDevPortal: false
    }
  },
  staff: {
    role: "staff",
    roleNameTh: "บุคลากรทั่วไป / อาจารย์ (Staff)",
    description: "ขอเบิกวัสดุสำนักงาน และดูสถานะคำขอเบิกของตนเอง",
    color: "emerald",
    defaultPermissions: {
      canViewAssets: false,
      canEditAssets: false,
      canExportAssets: false,
      canViewConsumables: true,
      canRequestConsumables: true,
      canAddConsumables: false,
      canApproveRequisitions: false,
      canManageUsers: false,
      canAccessDevPortal: false
    }
  },
  viewer: {
    role: "viewer",
    roleNameTh: "ผู้ตรวจสอบ / ผู้ดูรายงาน (Viewer / Auditor)",
    description: "สิทธิ์อ่านและสืบค้นข้อมูลเพียงอย่างเดียว ไม่สามารถแก้ไขหรือเบิกได้",
    color: "slate",
    defaultPermissions: {
      canViewAssets: true,
      canEditAssets: false,
      canExportAssets: true,
      canViewConsumables: true,
      canRequestConsumables: false,
      canAddConsumables: false,
      canApproveRequisitions: false,
      canManageUsers: false,
      canAccessDevPortal: false
    }
  }
};

const PERMISSIONS_COLLECTION = "users_permissions";

/**
 * Fetch all user permissions from Cloud Firestore
 */
export async function getUsersFromFirestore(): Promise<UserAccount[]> {
  try {
    const q = query(collection(db, PERMISSIONS_COLLECTION), orderBy("name", "asc"));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
    }
    
    const users: UserAccount[] = [];
    snapshot.forEach((docSnap) => {
      users.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<UserAccount, "id">)
      });
    });
    return users;
  } catch (error) {
    console.error("Firestore getUsers error:", error);
    throw error;
  }
}

/**
 * Realtime listener for user permissions in Firestore
 */
export function subscribeToUsers(
  onData: (users: UserAccount[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const q = query(collection(db, PERMISSIONS_COLLECTION), orderBy("name", "asc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const users: UserAccount[] = [];
        snapshot.forEach((docSnap) => {
          users.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<UserAccount, "id">)
          });
        });
        onData(users);
      },
      (err) => {
        console.warn("Firestore user permissions subscription warning:", err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn("Error setting up user permissions subscription:", err);
    return () => {};
  }
}

/**
 * Add or overwrite user permission record in Cloud Firestore
 */
export async function saveUserPermissionToFirestore(user: UserAccount): Promise<string> {
  try {
    const docId = user.uid.trim() || user.email.trim().replace(/[@.]/g, "_");
    const userData = {
      ...user,
      uid: docId,
      updatedAt: serverTimestamp(),
      createdAt: user.createdAt || serverTimestamp()
    };

    const docRef = doc(db, PERMISSIONS_COLLECTION, docId);
    await setDoc(docRef, userData, { merge: true });
    return docId;
  } catch (error) {
    console.error("Firestore saveUserPermission error:", error);
    throw error;
  }
}

/**
 * Update partial user permission data
 */
export async function updateUserPermissionInFirestore(
  docId: string,
  data: Partial<UserAccount>
): Promise<void> {
  try {
    const docRef = doc(db, PERMISSIONS_COLLECTION, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Firestore updateUserPermission error:", error);
    throw error;
  }
}

/**
 * Delete user permission from Firestore
 */
export async function deleteUserPermissionFromFirestore(docId: string): Promise<void> {
  try {
    const docRef = doc(db, PERMISSIONS_COLLECTION, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Firestore deleteUserPermission error:", error);
    throw error;
  }
}
