import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_EMAIL,
    pass: process.env.MAIL_PASS,
  },
});

export const approveMail = async (email) => {
  const mailData = {
    from: process.env.MAIL_EMAIL,
    to: email,
    subject: "Approval Email",
    html: `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>User Authorization Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8f8f8;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            background-color: #ffffff;
            margin: 40px auto;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h2 {
            color: #333333;
        }
        p {
            color: #555555;
        }
        .btn {
            margin: 20px 10px 0 0;
            display: inline-block;
            background-color: #28a745;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .btn.decline {
            background-color: #dc3545;
        }
        .btn:hover {
            opacity: 0.9;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #999999;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>User Authorization Request</h2>
        <p>Hello Admin,</p>
        <p>A new user has requested access to the MatTax dashboard. Please review their details and take the appropriate action.</p>

        <p><strong>Name:</strong> {{user_name}}<br>
           <strong>Email:</strong> {{user_email}}<br>
           <strong>Requested Role:</strong> {{user_role}}</p>

        <p>You can authorize or decline the request by clicking below:</p>
        <a href="{{authorize_link}}" class="btn">Authorize</a>
        <a href="{{decline_link}}" class="btn decline">Decline</a>

        <p>If you have any questions or concerns, please contact the support team.</p>

        <p>Best Regards,<br>The MatTax Admin Team</p>

        <div class="footer">
            &copy; 2025 MatTax. All rights reserved.
        </div>
    </div>
</body>
</html>`,
  };
  sendMail(mailData);
};
export const verifyMail = async (email, data) => {
  const mailData = {
    from: process.env.MAIL_EMAIL,
    to: email,
    subject: "Verify Email",
    html: `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8f8f8;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            background-color: #ffffff;
            margin: 40px auto;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h2 {
            color: #333333;
        }
        p {
            color: #555555;
        }
        .btn {
            margin-top: 20px;
            display: inline-block;
            background-color: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .btn:hover {
            background-color: #0056b3;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #999999;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Verify Your Email Address</h2>
        <p>Hello,</p>
        <p>Thank you for signing up for MatTax! Please verify your email address by clicking the button below:</p>
        <a href="${data}" class="btn">Verify Email</a>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p><a href="${data}">${data}</a></p>
        <p>If you did not create an account, please ignore this email.</p>
        <p>Best Regards,<br>The MatTax Family Team</p>
        <div class="footer">
            &copy; 2025 MatTax. All rights reserved.
        </div>
    </div>
</body>
</html>
`,
  };
  sendMail(mailData);
};
export const sendResetPasswordMail = async (email, data) => {
  const mailData = {
    from: process.env.MAIL_EMAIL,
    to: email,
    subject: "Verify Email",
    html: `
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Reset Password</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f8f8f8;
            margin: 0;
            padding: 0;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            background-color: #ffffff;
            margin: 40px auto;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        h2 {
            color: #333333;
        }
        p {
            color: #555555;
        }
        .btn {
            margin-top: 20px;
            display: inline-block;
            background-color: #dc3545;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
        }
        .btn:hover {
            background-color: #b02a37;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #999999;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Reset Your Password</h2>
        <p>Hello,</p>
        <p>We received a request to reset your password for your MatTax account. Click the button below to proceed:</p>
        <a href="${data}" class="btn">Reset Password</a>
        <p>If the button doesn't work, copy and paste the link below into your browser:</p>
        <p><a href="${data}">${data}</a></p>
        <p>If you didn’t request a password reset, please ignore this email. Your password will remain unchanged.</p>
        <p>Best Regards,<br>The MatTax Family Team</p>
        <div class="footer">
            &copy; 2025 MatTax. All rights reserved.
        </div>
    </div>
</body>
</html>
`,
  };
  sendMail(mailData);
};

function sendMail(mailData) {
  transporter.sendMail(mailData, (error, result) => {
    if (error) return console.error(error);
    return console.log(result);
  });
}
export const sendDeleteConfirmationEmail = async (email, token) => {
  try {
    const confirmationLink = `http://localhost:5173/confirmDeleteAccount?token=${token}`;

    const mailOptions = {
      from: `"MaxTaxPro" <${process.env.MAIL_EMAIL}>`,
      to: email,
      subject: "Confirm Account Deletion",
      html: `
        <p>You requested to delete your MaxTaxPro account.</p>
        <p>Click the button below to confirm deletion:</p>
        <a href="${confirmationLink}" style="padding: 10px 20px; background-color: red; color: white; text-decoration: none; border-radius: 
5px;">Confirm Delete</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (err) {
    console.error("Failed to send email:", err);
    return { success: false, error: err };
  }
};
