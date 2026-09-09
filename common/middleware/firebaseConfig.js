const admin = require("firebase-admin");
const serviceAccount = require("./harsco-bd9c2-firebase-adminsdk-ljnrv-5253ab63c0.json"); // adjust path

admin.initializeApp({
 credential: admin.credential.cert(serviceAccount),
});

const messaging = admin.messaging();

module.exports = messaging;