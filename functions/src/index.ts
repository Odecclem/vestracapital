import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as nodemailer from "nodemailer";

admin.initializeApp();

// Read credentials from environment or Firebase functions config
// To set config: firebase functions:config:set smtp.email="your-email" smtp.password="your-password"
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_EMAIL || functions.config().smtp?.email,
    pass: process.env.SMTP_PASSWORD || functions.config().smtp?.password,
  },
});

export const onUserCreated = functions.firestore
  .document("users/{userId}")
  .onCreate(async (snap, context) => {
    const user = snap.data();
    if (!user.email) return null;

    const mailOptions = {
      from: '"Vestra Capital" <noreply@vestracapital.com>',
      to: user.email,
      subject: "Welcome to Vestra Capital!",
      html: `
        <h1>Welcome, ${user.fullName}!</h1>
        <p>Thank you for registering at Vestra Capital.</p>
        <p>Your journey to smart investing starts now.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Welcome email sent to:", user.email);
    } catch (error) {
      console.error("Error sending welcome email:", error);
    }
    return null;
  });

export const onTransactionUpdate = functions.firestore
  .document("transactions/{transactionId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Only trigger if status changed
    if (before.status === after.status) return null;

    const mailOptions = {
      from: '"Vestra Capital" <noreply@vestracapital.com>',
      to: after.userEmail,
      subject: `Transaction ${after.status.toUpperCase()}`,
      html: `
        <h2>Transaction Update</h2>
        <p>Your ${after.type} of $${after.amount} has been <strong>${after.status}</strong>.</p>
        ${after.status === "approved" ? "<p>Funds have been updated in your wallet.</p>" : ""}
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Transaction update email sent to: ${after.userEmail}`);
    } catch (error) {
      console.error("Error sending transaction email:", error);
    }
    return null;
  });

export const send2FACode = functions.firestore
  .document("2fa_codes/{docId}")
  .onCreate(async (snap, context) => {
    const data = snap.data();
    if (!data.email || !data.code) return null;

    const mailOptions = {
      from: '"Vestra Capital Security" <noreply@vestracapital.com>',
      to: data.email,
      subject: "Your 2FA Verification Code",
      html: `
        <h2>Two-Factor Authentication</h2>
        <p>Your verification code is: <strong>${data.code}</strong></p>
        <p>This code will expire in 5 minutes.</p>
        <p>If you did not request this, please contact support immediately.</p>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`2FA email sent to: ${data.email}`);
    } catch (error) {
      console.error("Error sending 2FA email:", error);
    }
    return null;
  });
