import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, deleteDoc, getDocs, collection, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAqBaqZunbkRgeER_iK18OI2rgumx0XIoQ",
  authDomain: "swu-demo-b20f8.firebaseapp.com",
  projectId: "swu-demo-b20f8",
  storageBucket: "swu-demo-b20f8.firebasestorage.app",
  messagingSenderId: "894523011470",
  appId: "1:894523011470:web:a25ad209f62ddb425b74df",
  measurementId: "G-61B0JP12C4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("🔥 Updating real user permissions in Cloud Firestore (swu-demo-b20f8)...");

async function updateRealUsers() {
  try {
    // 1. Delete all existing mock/demo users from users_permissions
    console.log("1️⃣ Cleaning up old mock users...");
    const usersCol = collection(db, "users_permissions");
    const snapshot = await getDocs(usersCol);
    for (const docSnap of snapshot.docs) {
      await deleteDoc(doc(db, "users_permissions", docSnap.id));
      console.log(`   ✕ Deleted mock user doc: ${docSnap.id}`);
    }

    // 2. Add real user 1: akachaiha@gmail.com (Super Admin)
    console.log("\n2️⃣ Adding Super Admin: akachaiha@gmail.com...");
    const superAdminData = {
      uid: "akachaiha_gmail_com",
      email: "akachaiha@gmail.com",
      name: "Akachai Ha",
      department: "ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ",
      position: "ผู้ดูแลระบบสูงสุด (Super Admin)",
      role: "super_admin",
      roleNameTh: "ผู้ดูแลระบบสูงสุด (Super Admin)",
      status: "active",
      permissions: {
        canViewAssets: true,
        canEditAssets: true,
        canExportAssets: true,
        canViewConsumables: true,
        canRequestConsumables: true,
        canAddConsumables: true,
        canApproveRequisitions: true,
        canManageUsers: true,
        canAccessDevPortal: true
      },
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    await setDoc(doc(db, "users_permissions", superAdminData.uid), superAdminData);
    console.log("   ✓ Added akachaiha@gmail.com (Super Admin - สิทธิ์เต็ม 100%)");

    // 3. Add real user 2: Komeen090@gmail.com (Technician / ช่างทั่วไป)
    console.log("\n3️⃣ Adding Technician: komeen090@gmail.com...");
    const technicianData = {
      uid: "komeen090_gmail_com",
      email: "komeen090@gmail.com",
      name: "Komeen",
      department: "ฝ่ายงานพัฒนาและบำรุงรักษา ส่วนพัฒนากายภาพ",
      position: "ช่างทั่วไป",
      role: "technician",
      roleNameTh: "ช่างทั่วไป / ผู้ปฏิบัติงาน (Technician)",
      status: "active",
      permissions: {
        canViewAssets: true,
        canEditAssets: false,
        canExportAssets: false,
        canViewConsumables: true,
        canRequestConsumables: true,
        canAddConsumables: false,
        canApproveRequisitions: false,
        canManageUsers: false,
        canAccessDevPortal: false
      },
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    };
    await setDoc(doc(db, "users_permissions", technicianData.uid), technicianData);
    console.log("   ✓ Added komeen090@gmail.com (ช่างทั่วไป - Technician)");

    console.log("\n🎉 Real users database setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating users in Firestore:", error);
    process.exit(1);
  }
}

updateRealUsers();
