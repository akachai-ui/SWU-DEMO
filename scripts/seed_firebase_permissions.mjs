import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

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

console.log("🔥 Initializing Firebase Cloud Firestore for project: swu-demo-b20f8...");

// 1. Roles Definition (นิยามบทบาทมาตรฐาน)
const ROLES_DEFINITION = [
  {
    roleId: "super_admin",
    nameTh: "ผู้ดูแลระบบสูงสุด (Super Admin)",
    description: "มีสิทธิ์เต็มทุกส่วน จัดการโครงสร้างข้อมูล และกำหนดสิทธิ์ผู้ใช้งานทั้งหมด",
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
    }
  },
  {
    roleId: "approver",
    nameTh: "หัวหน้างาน / ผู้อนุมัติ (Approver)",
    description: "มีสิทธิ์อนุมัติใบขอเบิกพัสดุ ตรวจสอบทะเบียนครุภัณฑ์ และรายงานสรุป",
    permissions: {
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
  {
    roleId: "inventory_officer",
    nameTh: "เจ้าหน้าที่พัสดุและคลัง (Inventory Officer)",
    description: "จัดการสต็อกวัสดุ เพิ่ม/แก้ไขรายการพัสดุ บันทึกจ่ายของ และปรับปรุงทะเบียนครุภัณฑ์",
    permissions: {
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
  {
    roleId: "technician",
    nameTh: "ช่างซ่อมบำรุง / ผู้ปฏิบัติงาน (Technician)",
    description: "ขอเบิกพัสดุงานช่าง อุปกรณ์ และวัสดุซ่อมแซมอาคารสถานที่",
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
    }
  },
  {
    roleId: "staff",
    nameTh: "บุคลากรทั่วไป / อาจารย์ (Staff)",
    description: "ขอเบิกวัสดุสำนักงาน และดูสถานะคำขอเบิกของตนเอง",
    permissions: {
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
  {
    roleId: "viewer",
    nameTh: "ผู้ตรวจสอบ / ผู้ดูรายงาน (Viewer / Auditor)",
    description: "สิทธิ์อ่านและสืบค้นข้อมูลเพียงอย่างเดียว ไม่สามารถแก้ไขหรือเบิกได้",
    permissions: {
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
];

// 2. Initial User Accounts & Permissions (ข้อมูลสิทธิ์ผู้ใช้งานเริ่มต้น)
const INITIAL_USERS = [
  {
    uid: "director_phys_g_swu_ac_th",
    email: "director.phys@g.swu.ac.th",
    name: "ผู้อำนวยการส่วนพัฒนากายภาพ",
    department: "ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ",
    position: "ผู้อำนวยการส่วนพัฒนากายภาพ",
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
    }
  },
  {
    uid: "pichai_head_g_swu_ac_th",
    email: "pichai.head@g.swu.ac.th",
    name: "นายพิชัย คุมงาน",
    department: "ฝ่ายงานพัฒนาและบำรุงรักษา ส่วนพัฒนากายภาพ",
    position: "หัวหน้างานซ่อมบำรุงและอาคารสถานที่",
    role: "approver",
    roleNameTh: "หัวหน้างาน / ผู้อนุมัติ (Approver)",
    status: "active",
    permissions: {
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
  {
    uid: "wipawan_admin_g_swu_ac_th",
    email: "wipawan.admin@g.swu.ac.th",
    name: "น.ส.วิภาวรรณ สุขสำราญ",
    department: "งานบริหารงานทั่วไปและสารบรรณ ส่วนพัฒนากายภาพ",
    position: "เจ้าหน้าที่บริหารงานทั่วไป (พัสดุและคลัง)",
    role: "inventory_officer",
    roleNameTh: "เจ้าหน้าที่พัสดุและคลัง (Inventory Officer)",
    status: "active",
    permissions: {
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
  {
    uid: "somsak_elec_g_swu_ac_th",
    email: "somsak.elec@g.swu.ac.th",
    name: "นายสมศักดิ์ สายตรวจ",
    department: "ฝ่ายงานพัฒนาและบำรุงรักษา ส่วนพัฒนากายภาพ",
    position: "ช่างไฟฟ้าชำนาญการ",
    role: "technician",
    roleNameTh: "ช่างซ่อมบำรุง / ผู้ปฏิบัติงาน (Technician)",
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
    }
  }
];

// 3. Granular Permission Modules Metadata
const PERMISSION_MODULES = [
  { id: "canViewAssets", name: "ดูทะเบียนครุภัณฑ์", category: "Assets" },
  { id: "canEditAssets", name: "แก้ไข/จำหน่ายครุภัณฑ์", category: "Assets" },
  { id: "canExportAssets", name: "ส่งออกรายงานครุภัณฑ์ CSV", category: "Assets" },
  { id: "canViewConsumables", name: "ดูรายการวัสดุสิ้นเปลือง", category: "Consumables" },
  { id: "canRequestConsumables", name: "ทำรายการขอเบิกพัสดุ", category: "Consumables" },
  { id: "canAddConsumables", name: "จัดการสต็อกวัสดุในคลัง", category: "Consumables" },
  { id: "canApproveRequisitions", name: "อนุมัติใบขอเบิกพัสดุ", category: "Approval" },
  { id: "canManageUsers", name: "กำหนดสิทธิ์ผู้ใช้งาน (RBAC)", category: "System" },
  { id: "canAccessDevPortal", name: "เข้าถึงพิมพ์เขียวระบบ (/dev)", category: "System" }
];

async function seedFirebase() {
  try {
    console.log("1️⃣ Seeding Collection: roles_definition...");
    for (const r of ROLES_DEFINITION) {
      await setDoc(doc(db, "roles_definition", r.roleId), {
        ...r,
        updatedAt: serverTimestamp()
      });
      console.log(`   ✓ Role: ${r.roleId} (${r.nameTh})`);
    }

    console.log("2️⃣ Seeding Collection: users_permissions...");
    for (const u of INITIAL_USERS) {
      await setDoc(doc(db, "users_permissions", u.uid), {
        ...u,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp()
      });
      console.log(`   ✓ User Permission: ${u.email} -> ${u.role}`);
    }

    console.log("3️⃣ Seeding Collection: permission_modules...");
    for (const m of PERMISSION_MODULES) {
      await setDoc(doc(db, "permission_modules", m.id), {
        ...m,
        updatedAt: serverTimestamp()
      });
      console.log(`   ✓ Module: ${m.id}`);
    }

    console.log("\n🎉 All RBAC collections created successfully in Firebase Firestore (swu-demo-b20f8)!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding Firebase:", error);
    process.exit(1);
  }
}

seedFirebase();
