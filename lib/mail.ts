import nodemailer from "nodemailer";
import path from "path";

interface PurchaseItem {
  title: string;
  priceEur: number;
}

const emailSender = '"GameShop Support" <jomorohope@gmail.com>';
const imagePath = path.join(process.cwd(), "lib", "Logo.webp"); 
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false, 
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD, 
  },
});

// --------------------------------------------------------
// 1. Purchase Receipt Email
// --------------------------------------------------------
export const sendPurchaseReceiptEmail = async (email: string, orderId: string, items: PurchaseItem[]) => {
  const totalAmount = items.reduce((sum, item) => sum + item.priceEur, 0);
  
  const itemsHtml = items.map(item => `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 12px 8px; color: #111827; font-weight: 600; font-size: 14px;">${item.title}</td>
      <td style="padding: 12px 8px; text-align: right; color: #8B5CF6; font-weight: 800; font-size: 14px;">${item.priceEur.toFixed(2)} €</td>
    </tr>
  `).join('');

  try {
    await transporter.sendMail({
      from: emailSender,
      to: email,
      subject: `Thank you for your purchase! Order #${orderId} — GameShop`,
      html: `
        <div style="background-color: #f9fafb; padding: 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
            
            <div style="width: 100%;">
              <img src="cid:logo" alt="GameShop Banner" style="width: 100%; height: auto; display: block;" />
            </div>

            <div style="padding: 30px 20px;">
              <div style="text-align: center;">
                <h1 style="color: #4F46E5; font-size: 24px; font-weight: 800; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                  Payment Successful!
                </h1>
                <p style="color: #4b5563; font-size: 15px; margin-bottom: 5px;">
                  Thank you for your purchase! Your order is ready.
                </p>
                <p style="color: #9ca3af; font-size: 12px; font-weight: 600; margin: 0 0 25px 0; word-break: break-all; line-height: 1.4;">
                  Order Number: <span style="color: #111827; font-weight: 500;">#${orderId}</span>
                </p>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                  <tr style="border-bottom: 2px solid #8B5CF6;">
                    <th style="text-align: left; padding: 8px; color: #4F46E5; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Game Title</th>
                    <th style="text-align: right; padding: 8px; color: #4F46E5; font-weight: 800; text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin: 25px 0; text-align: center;">
                <div style="
                  display: inline-block;
                  padding: 10px 20px;
                  background-color: #111827;
                  border: 2px solid #8B5CF6;
                  box-shadow: 0 0 10px rgba(139, 92, 246, 0.25);
                  border-radius: 10px;
                ">
                  <span style="font-size: 12px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 700; display: inline-block; vertical-align: middle;">
                    Total Paid:
                  </span>
                  <strong style="font-size: 18px; color: #ffffff; margin-left: 8px; font-weight: 900; text-shadow: 0 0 6px rgba(139, 92, 246, 0.5); display: inline-block; vertical-align: middle;">
                    ${totalAmount.toFixed(2)} €
                  </strong>
                </div>
              </div>

              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 25px;">
                <tr>
                  <td align="center" style="text-align: center;">
                    <a href="${baseUrl}/library" style="
                      display: inline-block; 
                      padding: 12px 30px; 
                      background-color: #4F46E5; 
                      color: #ffffff; 
                      border-radius: 12px; 
                      text-decoration: none; 
                      font-weight: bold;
                      font-size: 15px;
                      box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
                    ">
                      Go to Library
                    </a>
                  </td>
                </tr>
              </table>

              <div style="margin-top: 35px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
                <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; text-align: center;">
                  🛡️ <strong>Security Notice:</strong> If you did not make this purchase, please contact our support team immediately.
                </p>
              </div>
            </div>

            <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Team <strong>Jomoro GameShop</strong> 🎮
              </p>
              <div style="margin-top: 10px;">
                <a href="${baseUrl}/support" style="color: #4F46E5; text-decoration: none; font-size: 12px; margin: 0 10px;">Support</a>
                <a href="${baseUrl}/privacy" style="color: #4F46E5; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      `,
      attachments: [{
        filename: 'Logo.webp',
        path: imagePath,
        cid: 'logo' 
      }]
    });
    console.log("Purchase receipt sent successfully! 📧");
  } catch (error) {
    console.error("Failed to send purchase receipt ❌:", error);
  }
};
// --------------------------------------------------------
// 2. Verification Email
// --------------------------------------------------------
export const sendVerificationEmail = async (email: string, token: string) => {
  try {
    await transporter.sendMail({
      from: emailSender,
      to: email,
      subject: "Your Verification Code — GameShop",
      html: `
        <div style="background-color: #f9fafb; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
            
            <div style="width: 100%;">
              <img src="cid:logo" alt="GameShop Banner" style="width: 100%; height: auto; display: block;" />
            </div>

            <div style="padding: 40px 30px; text-align: center;">
              <h1 style="color: #4F46E5; font-size: 28px; font-weight: 800; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                Welcome to GameShop!
              </h1>
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px;">
                We are excited to have you with us. Use this verification code to complete your registration:
              </p>

              <div style="margin: 30px 0;">
                <div style="
                  display: inline-block;
                  padding: 20px 40px;
                  background-color: #111827;
                  border: 3px solid #8B5CF6;
                  box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
                  border-radius: 12px;
                  font-size: 30px;
                  font-weight: 900;
                  color: #ffffff;
                  letter-spacing: 12px;
                  text-shadow: 0 0 10px rgba(139, 92, 246, 0.8);
                ">
                  ${token}
                </div>
              </div>

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
                <p style="color: #9ca3af; font-size: 13px; line-height: 1.5;">
                  🛡️ <strong>Security Notice:</strong> If you did not request this code, please ignore this email. Your account remains safe as long as the code is not entered.
                </p>
              </div>
            </div>

            <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Team <strong>Jomoro GameShop</strong> 🎮
              </p>
              <div style="margin-top: 10px;">
                <a href="${baseUrl}/support" style="color: #4F46E5; text-decoration: none; font-size: 12px; margin: 0 10px;">Support</a>
                <a href="${baseUrl}/privacy" style="color: #4F46E5; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      `,
      attachments: [{
        filename: 'Logo.webp',
        path: imagePath,
        cid: 'logo' 
      }]
    });
    console.log("Verification email sent successfully! 📧");
  } catch (error) {
    console.error("Failed to send verification email ❌:", error);
  }
};


// --------------------------------------------------------
// 3. Account Deletion Confirmation Email
// --------------------------------------------------------
export const sendDeletionConfirmationEmail = async (email: string, token: string) => {
  try {
    await transporter.sendMail({
      from: emailSender,
      to: email,
      subject: "Confirm Account Deletion — GameShop",
      html: `
        <div style="background-color: #f9fafb; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
            
            <div style="width: 100%;">
              <img src="cid:logo" alt="GameShop Banner" style="width: 100%; height: auto; display: block;" />
            </div>

            <div style="padding: 40px 30px; text-align: center;">
              <h1 style="color: #4F46E5; font-size: 28px; font-weight: 800; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                Delete Account Request
              </h1>
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px;">
                We received a request to permanently delete your account. Use this confirmation code to finalize the action:
              </p>

              <div style="margin: 30px 0;">
                <div style="
                  display: inline-block;
                  padding: 20px 40px;
                  background-color: #111827;
                  border: 3px solid #8B5CF6;
                  box-shadow: 0 0 15px rgba(139, 92, 246, 0.4);
                  border-radius: 12px;
                  font-size: 30px;
                  font-weight: 900;
                  color: #ffffff;
                  letter-spacing: 12px;
                  text-shadow: 0 0 10px rgba(139, 92, 246, 0.8);
                ">
                  ${token}
                </div>
              </div>

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
                <p style="color: #9ca3af; font-size: 13px; line-height: 1.5;">
                  ⚠️ <strong>Security Notice:</strong> If you did not request to delete your account, please ignore this email. Your account is completely safe, and no actions will be taken unless this code is entered.
                </p>
              </div>
            </div>

            <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Team <strong>Jomoro GameShop</strong> 🎮
              </p>
              <div style="margin-top: 10px;">
                <a href="${baseUrl}/support" style="color: #4F46E5; text-decoration: none; font-size: 12px; margin: 0 10px;">Support</a>
                <a href="${baseUrl}/privacy" style="color: #4F46E5; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      `,
      attachments: [{
        filename: 'Logo.webp',
        path: imagePath,
        cid: 'logo' 
      }]
    });
    console.log("Account deletion confirmation email sent successfully! 📧");
  } catch (error) {
    console.error("Failed to send account deletion email ❌:", error);
  }
};

// --------------------------------------------------------
// 4. Account Deleted Notification Email (GDPR Compliance)
// --------------------------------------------------------
export const sendAccountDeletedEmail = async (email: string) => {
  try {
    await transporter.sendMail({
      from: emailSender,
      to: email,
      subject: "Account Successfully Deleted — GameShop",
      html: `
        <div style="background-color: #f9fafb; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); border: 1px solid #e5e7eb;">
            
            <div style="width: 100%;">
              <img src="cid:logo" alt="GameShop Banner" style="width: 100%; height: auto; display: block;" />
            </div>

            <div style="padding: 40px 30px; text-align: center;">
              <h1 style="color: #4F46E5; font-size: 28px; font-weight: 800; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                Account Deleted
              </h1>
              <p style="color: #4b5563; font-size: 16px; margin-bottom: 30px; line-height: 1.6;">
                Your GameShop account has been successfully removed from our platform. In accordance with the <strong>General Data Protection Regulation (GDPR)</strong>, all of your personal data, including your profile information, saved preferences, and system logs, has been permanently erased from our servers and cannot be recovered.
              </p>

              <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f3f4f6;">
                <p style="color: #9ca3af; font-size: 13px; line-height: 1.5;">
                  ℹ️ <strong>Important Notice:</strong> Thank you for being a part of our gaming community. Since your data has been completely wiped out, if you ever decide to play with us again, you will need to register a brand new account.
                </p>
              </div>
            </div>

            <div style="background-color: #f3f4f6; padding: 20px; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Team <strong>Jomoro GameShop</strong> 🎮
              </p>
              <div style="margin-top: 10px;">
                <a href="${baseUrl}/support" style="color: #4F46E5; text-decoration: none; font-size: 12px; margin: 0 10px;">Support</a>
                <a href="${baseUrl}/privacy" style="color: #4F46E5; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      `,
      attachments: [{
        filename: 'Logo.webp',
        path: imagePath,
        cid: 'logo' 
      }]
    });
    console.log("Account deleted notification email sent successfully! 📧");
  } catch (error) {
    console.error("Failed to send account deletion notification email ❌:", error);
  }
};