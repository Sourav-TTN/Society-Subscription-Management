import toast from "react-hot-toast";
import { onMessage, type Messaging } from "firebase/messaging";

export const setupForegroundListener = (
  messaging: Messaging,
  updateNotification: () => void,
) => {
  onMessage(messaging, (payload) => {
    console.log("Foreground message:", payload);

    const title = payload.notification?.title || payload.data?.title;
    const body = payload.notification?.body || payload.data?.body;

    updateNotification();
    toast.success(`${title} - ${body}`);
  });
};
