import { db } from "./config";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

export type NotificationType =
  | "deposit"
  | "withdrawal"
  | "investment"
  | "kyc"
  | "system"
  | "welcome";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  link?: string;
  createdAt: { seconds: number } | null | any;
}

/**
 * Creates a new notification for a specific user.
 */
export async function createNotification(params: {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  link?: string;
}) {
  try {
    const colRef = collection(db, "notifications");
    const docRef = await addDoc(colRef, {
      userId: params.userId,
      title: params.title,
      message: params.message,
      type: params.type,
      read: false,
      link: params.link || "",
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("Error creating notification:", err);
    return null;
  }
}

/**
 * Marks a single notification as read.
 */
export async function markNotificationAsRead(notificationId: string) {
  try {
    const ref = doc(db, "notifications", notificationId);
    await updateDoc(ref, { read: true });
  } catch (err) {
    console.error("Error marking notification as read:", err);
  }
}

/**
 * Marks all notifications for a user as read.
 */
export async function markAllNotificationsAsRead(userId: string) {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    const batch = writeBatch(db);
    snap.docs.forEach((d) => {
      if (!d.data().read) {
        batch.update(d.ref, { read: true });
      }
    });
    await batch.commit();
  } catch (err) {
    console.error("Error marking all notifications as read:", err);
  }
}

/**
 * Deletes a notification.
 */
export async function deleteNotification(notificationId: string) {
  try {
    const ref = doc(db, "notifications", notificationId);
    await deleteDoc(ref);
  } catch (err) {
    console.error("Error deleting notification:", err);
  }
}

/**
 * Subscribes to real-time notification changes for a user.
 */
export function subscribeNotifications(
  userId: string,
  onUpdate: (notifications: AppNotification[]) => void
) {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: AppNotification[] = snapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...(docSnap.data() as Omit<AppNotification, "id">),
      }));

      // Sort in memory by createdAt descending
      list.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      onUpdate(list);
    },
    (err) => {
      console.error("Error subscribing to notifications:", err);
    }
  );
}

/**
 * Seeds a friendly initial welcome notification if the user has none.
 */
export async function seedWelcomeNotificationIfEmpty(
  userId: string,
  userName?: string
) {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      await createNotification({
        userId,
        title: "Welcome to Vestra Capital!",
        message: `Welcome${
          userName ? `, ${userName}` : ""
        }! Your portfolio is ready. Deposit funds or activate an investment plan to start generating returns.`,
        type: "welcome",
        link: "/dashboard",
      });
    }
  } catch (err) {
    console.error("Error seeding welcome notification:", err);
  }
}
