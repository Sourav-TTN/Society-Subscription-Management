import { initializeApp } from "firebase/app";
import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { axiosIns } from "./axios";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const getMessagingInstance = async () => {
  const supported = await isSupported();
  if (!supported) return null;

  return getMessaging(app);
};

export const messagingInstance = await getMessagingInstance();

export const requestPermission = async (societyId: string, userId: string) => {
  if (!messagingInstance) return null;

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    const token = await getToken(messagingInstance, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    await axiosIns.post(`/api/society/${societyId}/firebase/save-token`, {
      token,
      userId,
    });

    return token;
  }

  return null;
};

export const getMessagingSafe = async () => {
  return await getMessagingInstance();
};
