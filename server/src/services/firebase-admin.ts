import admin, { type ServiceAccount } from "firebase-admin";

const raw = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT as string);

const serviceAccount: ServiceAccount = {
  projectId: raw.project_id,
  clientEmail: raw.client_email,
  privateKey: raw.private_key.replace(/\\n/g, "\n"),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
