import { onMessage, type Messaging } from "firebase/messaging";
import toast from "react-hot-toast";

export const setupForegroundListener = (messaging: Messaging) => {
  onMessage(messaging, (payload) => {
    console.log("Foreground message:", payload);

    const title = payload.notification?.title || payload.data?.title;
    const body = payload.notification?.body || payload.data?.body;

    toast.success(`${title} - ${body}`);
  });
};
