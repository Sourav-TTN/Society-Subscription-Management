importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyAjPRQHiwg1HE7YJJAODzm2Pu4tbHpEaKo", // gitleaks:allow
  authDomain: "ssm-project-2871c.firebaseapp.com", // gitleaks:allow
  projectId: "ssm-project-2871c", // gitleaks:allow
  messagingSenderId: "792494830068", // gitleaks:allow
  appId: "1:792494830068:web:0a9fa644e7a38f44ba89a1", // gitleaks:allow
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
  });
});
