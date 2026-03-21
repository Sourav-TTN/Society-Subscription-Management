import admin, { type ServiceAccount } from "firebase-admin";
import serviceAccount from "../../service-key.json" with { type: "json" };

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as ServiceAccount),
  });
}

export default admin;
