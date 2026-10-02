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

export interface ConsumableItem {
  id?: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  minStock: number;
  unitPrice: number;
  location: string;
  imageUrl: string;
  description?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface DigitalSignature {
  name: string;
  email?: string;
  role?: string;
  signedAt: any;
  signatureImage?: string; // base64 canvas drawing if signed on touch/screen
  verificationToken?: string;
  status?: "APPROVED" | "REJECTED" | "DISPENSED" | "RECEIVED";
  remarks?: string;
}

export interface RequisitionItem {
  code: string;
  name: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
}

export interface RequisitionOrder {
  id?: string;
  reqNo: string;
  requesterEmail?: string;
  requesterName: string;
  department: string;
  purpose: string;
  urgency?: string;
  items: RequisitionItem[];
  totalItems: number;
  totalAmount: number;
  status: "รออนุมัติ" | "อนุมัติแล้ว" | "จ่ายพัสดุแล้ว" | "ปฏิเสธ";
  
  // 4-Party Digital Signatures (100% Paperless E-Signatures)
  requesterSignature?: DigitalSignature;
  approverSignature?: DigitalSignature;
  dispenserSignature?: DigitalSignature;
  receiverSignature?: DigitalSignature;

  // Legacy fallback fields for backward compatibility
  approverName?: string;
  approvedAt?: any;
  dispensedAt?: any;
  rejectReason?: string;
  createdAt?: any;
  updatedAt?: any;
}

const STOCK_COLLECTION = "consumables_stock";
const REQ_COLLECTION = "requisitions";

/**
 * Fetch all consumable items from Firestore
 */
export async function getConsumablesFromFirestore(): Promise<ConsumableItem[]> {
  try {
    const q = query(collection(db, STOCK_COLLECTION), orderBy("code", "asc"));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return [];
    }
    
    const items: ConsumableItem[] = [];
    snapshot.forEach((docSnap) => {
      items.push({
        id: docSnap.id,
        ...(docSnap.data() as Omit<ConsumableItem, "id">)
      });
    });
    return items;
  } catch (error) {
    console.error("Firestore getConsumables error:", error);
    throw error;
  }
}

/**
 * Realtime listener for consumables stock from Firestore
 */
export function subscribeToConsumables(
  onData: (items: ConsumableItem[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const q = query(collection(db, STOCK_COLLECTION), orderBy("code", "asc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const items: ConsumableItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<ConsumableItem, "id">)
          });
        });
        onData(items);
      },
      (err) => {
        console.warn("Firestore subscription warning:", err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn("Error setting up Firestore subscription:", err);
    return () => {};
  }
}

/**
 * Add a new consumable item directly to Firestore
 */
export async function addConsumableToFirestore(item: ConsumableItem): Promise<string> {
  try {
    const docId = item.code.trim() || undefined;
    const itemData = {
      ...item,
      stock: Number(item.stock) || 0,
      minStock: Number(item.minStock) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    if (docId) {
      const docRef = doc(db, STOCK_COLLECTION, docId);
      await setDoc(docRef, itemData, { merge: true });
      return docId;
    } else {
      const colRef = collection(db, STOCK_COLLECTION);
      const docRef = await addDoc(colRef, itemData);
      return docRef.id;
    }
  } catch (error) {
    console.error("Firestore addConsumable error:", error);
    throw error;
  }
}

/**
 * Update an existing consumable item in Firestore
 */
export async function updateConsumableInFirestore(
  docId: string,
  data: Partial<ConsumableItem>
): Promise<void> {
  try {
    const docRef = doc(db, STOCK_COLLECTION, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Firestore updateConsumable error:", error);
    throw error;
  }
}

/**
 * Delete a consumable item from Firestore
 */
export async function deleteConsumableFromFirestore(docId: string): Promise<void> {
  try {
    const docRef = doc(db, STOCK_COLLECTION, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Firestore deleteConsumable error:", error);
    throw error;
  }
}

/**
 * Save requisition order to Firestore
 */
export async function saveRequisitionToFirestore(order: Omit<RequisitionOrder, "id" | "createdAt">): Promise<string> {
  try {
    const colRef = collection(db, REQ_COLLECTION);
    const docRef = await addDoc(colRef, {
      ...order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Firestore saveRequisition error:", error);
    throw error;
  }
}

/**
 * Realtime listener for requisition orders from Firestore
 */
export function subscribeToRequisitions(
  onData: (orders: RequisitionOrder[]) => void,
  onError?: (err: Error) => void
) {
  try {
    const q = query(collection(db, REQ_COLLECTION), orderBy("createdAt", "desc"));
    return onSnapshot(
      q,
      (snapshot) => {
        const orders: RequisitionOrder[] = [];
        snapshot.forEach((docSnap) => {
          orders.push({
            id: docSnap.id,
            ...(docSnap.data() as Omit<RequisitionOrder, "id">)
          });
        });
        onData(orders);
      },
      (err) => {
        console.warn("Firestore requisitions subscription warning:", err);
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn("Error setting up requisitions subscription:", err);
    return () => {};
  }
}

/**
 * Update Requisition Status in Firestore (Approve, Dispense, Reject)
 */
export async function updateRequisitionStatusInFirestore(
  orderId: string,
  status: RequisitionOrder["status"],
  approverInfo?: { approverName?: string; rejectReason?: string }
): Promise<void> {
  try {
    const docRef = doc(db, REQ_COLLECTION, orderId);
    const updatePayload: any = {
      status,
      updatedAt: serverTimestamp()
    };

    if (approverInfo?.approverName) {
      updatePayload.approverName = approverInfo.approverName;
    }

    if (status === "อนุมัติแล้ว") {
      updatePayload.approvedAt = serverTimestamp();
      updatePayload.approverSignature = {
        name: approverInfo?.approverName || "ผู้อนุมัติ",
        signedAt: new Date().toISOString(),
        status: "APPROVED",
        verificationToken: `APV-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      };
    } else if (status === "จ่ายพัสดุแล้ว") {
      updatePayload.dispensedAt = serverTimestamp();
      updatePayload.dispenserSignature = {
        name: approverInfo?.approverName || "เจ้าหน้าที่คลังพัสดุ",
        signedAt: new Date().toISOString(),
        status: "DISPENSED",
        verificationToken: `DSP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      };
    } else if (status === "ปฏิเสธ" && approverInfo?.rejectReason) {
      updatePayload.rejectReason = approverInfo.rejectReason;
      updatePayload.approverSignature = {
        name: approverInfo?.approverName || "ผู้อนุมัติ",
        signedAt: new Date().toISOString(),
        status: "REJECTED",
        remarks: approverInfo.rejectReason
      };
    }

    await updateDoc(docRef, updatePayload);
  } catch (error) {
    console.error("Firestore updateRequisitionStatus error:", error);
    throw error;
  }
}

/**
 * 100% Paperless E-Sign: Approver Signs & Approves
 */
export async function signApproveRequisitionInFirestore(
  orderId: string,
  approver: { name: string; email?: string; role?: string },
  signatureImage?: string
): Promise<void> {
  try {
    const docRef = doc(db, REQ_COLLECTION, orderId);
    const verificationToken = `SWU-APV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const approverSig: any = {
      name: approver.name,
      email: approver.email || "",
      role: approver.role || "หัวหน้าส่วนงาน / ผู้อนุมัติ",
      signedAt: new Date().toISOString(),
      status: "APPROVED",
      verificationToken
    };
    if (signatureImage) {
      approverSig.signatureImage = signatureImage;
    }

    await updateDoc(docRef, {
      status: "อนุมัติแล้ว",
      approvedAt: serverTimestamp(),
      approverName: approver.name,
      approverSignature: approverSig,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Firestore signApproveRequisition error:", error);
    throw error;
  }
}

/**
 * 100% Paperless E-Sign: Approver Rejects with Reason
 */
export async function signRejectRequisitionInFirestore(
  orderId: string,
  approver: { name: string; email?: string; role?: string },
  rejectReason: string
): Promise<void> {
  try {
    const docRef = doc(db, REQ_COLLECTION, orderId);
    await updateDoc(docRef, {
      status: "ปฏิเสธ",
      rejectReason,
      approverName: approver.name,
      approverSignature: {
        name: approver.name,
        email: approver.email || "",
        role: approver.role || "ผู้อนุมัติ",
        signedAt: new Date().toISOString(),
        status: "REJECTED",
        remarks: rejectReason
      },
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Firestore signRejectRequisition error:", error);
    throw error;
  }
}

/**
 * 100% Paperless E-Sign: Store Officer Dispenses Items
 */
export async function signDispenseRequisitionInFirestore(
  orderId: string,
  dispenser: { name: string; email?: string }
): Promise<void> {
  try {
    const docRef = doc(db, REQ_COLLECTION, orderId);
    const verificationToken = `SWU-DSP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    await updateDoc(docRef, {
      dispensedAt: serverTimestamp(),
      dispenserSignature: {
        name: dispenser.name,
        email: dispenser.email || "",
        role: "เจ้าหน้าที่ผู้จ่ายพัสดุ",
        signedAt: new Date().toISOString(),
        status: "DISPENSED",
        verificationToken
      },
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Firestore signDispenseRequisition error:", error);
    throw error;
  }
}

/**
 * 100% Paperless E-Sign: Receiver Signs for Acknowledgement
 */
export async function signReceiveRequisitionInFirestore(
  orderId: string,
  receiver: { name: string; email?: string },
  signatureImage?: string
): Promise<void> {
  try {
    const docRef = doc(db, REQ_COLLECTION, orderId);
    const verificationToken = `SWU-RCV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    const receiverSig: any = {
      name: receiver.name,
      email: receiver.email || "",
      role: "ผู้รับพัสดุ",
      signedAt: new Date().toISOString(),
      status: "RECEIVED",
      verificationToken
    };
    if (signatureImage) {
      receiverSig.signatureImage = signatureImage;
    }

    await updateDoc(docRef, {
      status: "จ่ายพัสดุแล้ว",
      receiverSignature: receiverSig,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Firestore signReceiveRequisition error:", error);
    throw error;
  }
}

