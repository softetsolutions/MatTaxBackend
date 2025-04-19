import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

export const sendMail = async (email) => {
const mailData = {
    from: process.env.MAIL_EMAIL,
    to: email,
    subject: "Approval Email",
    html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 2;
                    margin: 0;
                    padding: 0;
                    background-color: #f8f8f8;
                }
                .container {
                    max-width: 600px;
                    padding: 20px;
                }
                h1, p {
                    margin: 0;
                    padding: 0;
                }
                a {
                    color: #007bff;
                    text-decoration: none;
                    border-radius: 5px;
                    display: inline-block;
                }
                a:hover {
                    color: #37b7f1;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h3>MatTax dashboard Approval Request: </h3>
                <p>Welcome to MatTax!</p>
                <p>Thank you for joining us!</p><br>
                <p>Best Regards,<br>- The MatTax Family Team</p>
            </div>
        </body>
        </html>`
  };

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_EMAIL ,
      pass: process.env.MAIL_PASS
    },
  });

  transporter.sendMail(mailData, (error, result) => {
    if (error) return console.error(error);
    return console.log(result);
  });
}
