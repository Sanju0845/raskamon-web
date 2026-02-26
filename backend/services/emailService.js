import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  pool: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (email, otp, name = "User") => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Raska Mon" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify Your Email | Raska Mon",
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
        
        <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); color: #ffffff; padding: 22px; text-align: center;">
          <h1 style="margin: 0;">Email Verification 🔐</h1>
          <p style="margin: 8px 0 0; font-size: 0.95em;">
            One step away from joining Raska Mon
          </p>
        </div>

        <div style="padding: 22px;">
          <p>Hi <strong>${name}</strong>,</p>

          <p>
            Thank you for signing up with Raska Mon! Please use the verification code below to complete your registration:
          </p>

          <div style="background: linear-gradient(135deg, #f3e8ff, #faf5ff); padding: 20px; border-radius: 12px; margin: 24px 0; text-align: center; border: 2px dashed #a855f7;">
            <p style="margin: 0 0 8px 0; color: #6b21a8; font-size: 0.9em;">Your verification code is:</p>
            <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #7c3aed;">${otp}</p>
          </div>

          <p style="color: #6b7280; font-size: 0.9em;">
            ⏰ This code will expire in <strong>10 minutes</strong>.
          </p>

          <p style="color: #6b7280; font-size: 0.9em;">
            If you didn't request this verification, please ignore this email.
          </p>

          <p style="margin-top: 20px;">
            Welcome to your wellness journey! 🌱
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 12px; text-align: center; font-size: 0.8em; color: #6b7280;">
          © ${new Date().getFullYear()} Raska Mon. All rights reserved.
        </div>
      </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`OTP email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw error;
  }
};

/**
 * Send password reset OTP email
 * @param {string} email - The recipient's email address
 * @param {string} otp - The OTP code to send
 * @param {string} name - The recipient's name
 */
export const sendPasswordResetEmail = async (email, otp, name = "User") => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Raska Mon" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Password Reset Request | Raska Mon",
      html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f4f4f5; padding: 40px 20px;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); overflow: hidden;">
                
                <!-- Header -->
                <tr>
                  <td style="background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%); padding: 30px 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">Raska Mon</h1>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px;">
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">Hello,</p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                      You are receiving this email because a password reset was requested for your <strong style="color: #7c3aed;">Raska Mon</strong> account.
                    </p>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                      To choose a new password, please use the verification code below:
                    </p>

                    <!-- OTP Box -->
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td align="center">
                          <div style="background: linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%); border: 2px solid #e9d5ff; border-radius: 12px; padding: 30px 40px; display: inline-block;">
                            <p style="color: #6b21a8; font-size: 13px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0; font-weight: 600;">Verification Code</p>
                            <p style="color: #7c3aed; font-size: 42px; font-weight: 700; letter-spacing: 12px; margin: 0; font-family: 'Courier New', monospace;">${otp}</p>
                          </div>
                        </td>
                      </tr>
                    </table>

                    <!-- Note -->
                    <div style="background-color: #fefce8; border-left: 4px solid #eab308; padding: 16px 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                      <p style="color: #713f12; font-size: 14px; line-height: 1.5; margin: 0;">
                        <strong>Note:</strong> For your security, this code will expire in <strong>10 minutes</strong>. If you did not request a password reset, no further action is required.
                      </p>
                    </div>

                    <!-- Signature -->
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 30px 0 5px 0;">Stay grounded,</p>
                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0;">
                      <strong style="color: #7c3aed;">Team Raska Mon</strong>
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 25px 40px; border-top: 1px solid #e5e7eb;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="text-align: center;">
                          <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">
                            Need help? Contact our support team
                          </p>
                          <p style="color: #7c3aed; font-size: 16px; font-weight: 600; margin: 0;">
                            📞 9452155154
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Copyright -->
                <tr>
                  <td style="padding: 20px; text-align: center; background-color: #1f2937;">
                    <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                      © ${new Date().getFullYear()} Raska Mon. All rights reserved.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent successfully to ${email}`);
    return true;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};


export const sendAppointmentConfirmationEmail = async (appointment) => {
  try {
    console.log(
      "Preparing to send confirmation emails. Appointment data:",
      JSON.stringify(appointment, null, 2),
    );

    const {
      userData = {},
      docData = {},
      slotDate,
      slotTime,
      meetingLink,
      sessionType,
      communicationMethod,
    } = appointment;

    const userName = userData.name || "Patient";
    const userEmail = userData.email;
    const doctorName = docData.name || "Doctor";
    const doctorEmail = docData.email;

    if (!userEmail || !doctorEmail) {
      console.error("Missing email addresses for confirmation mail", {
        userEmail,
        doctorEmail,
      });
      return;
    }

    const patientMailOptions = {
      from: process.env.EMAIL_FROM || `"Raska Mon" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Your Appointment Is Confirmed | Raska Mon",
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
        
        <div style="background: #4f46e5; color: #ffffff; padding: 22px; text-align: center;">
          <h1 style="margin: 0;">Appointment Confirmed 🎉</h1>
          <p style="margin: 8px 0 0; font-size: 0.95em;">
            We're glad to have you with Raska Mon
          </p>
        </div>

        <div style="padding: 22px;">
          <p>Hi <strong>${userName}</strong>,</p>

          <p>
            Your session with <strong>Dr. ${doctorName}</strong> has been successfully scheduled.
            Below are the details of your appointment:
          </p>

          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 6px 0;"><strong>📅 Date:</strong> ${slotDate}</p>
            <p style="margin: 6px 0;"><strong>⏰ Time:</strong> ${slotTime}</p>
            <p style="margin: 6px 0;"><strong>💻 Session Type:</strong> ${sessionType}</p>
            ${sessionType === "Online"
          ? `<p style="margin: 6px 0;"><strong>🔗 Mode:</strong> ${communicationMethod}</p>`
          : ""
        }
          </div>

          ${meetingLink
          ? `
          <div style="text-align: center; margin: 28px 0;">
            <p>Your session link is ready:</p>
            <a href="${meetingLink}" style="background: #4f46e5; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Join Session
            </a>
            <p style="margin-top: 12px; font-size: 0.85em; color: #6b7280;">
              Or copy this link:<br/>
              <a href="${meetingLink}">${meetingLink}</a>
            </p>
          </div>`
          : ""
        }

          <p>
            Please try to join at least <strong>5 minutes early</strong> for a smooth experience.
          </p>

          <p>
            If you need any assistance, our Raska Mon support team is always here to help.
          </p>

          <p style="margin-top: 20px;">
            Wishing you a calm and meaningful session 🌱
          </p>
        </div>

        <div style="background: #f3f4f6; padding: 12px; text-align: center; font-size: 0.8em; color: #6b7280;">
          © ${new Date().getFullYear()} Raska Mon. All rights reserved.
        </div>
      </div>
      `,
    };

    /* =======================
       Email to Doctor
    ======================= */
    const doctorMailOptions = {
      from: process.env.EMAIL_FROM || `"Raska Mon" <${process.env.EMAIL_USER}>`,
      to: doctorEmail,
      subject: "New Appointment Scheduled | Raska Mon",
      html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 10px; overflow: hidden;">
        
        <div style="background: #10b981; color: #ffffff; padding: 22px; text-align: center;">
          <h1 style="margin: 0;">New Appointment Scheduled</h1>
          <p style="margin: 8px 0 0; font-size: 0.95em;">
            Raska Mon Notification
          </p>
        </div>

        <div style="padding: 22px;">
          <p>Dear <strong>Dr. ${doctorName}</strong>,</p>

          <p>
            A new appointment has been booked by <strong>${userName}</strong>.
            Please find the session details below:
          </p>

          <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 6px 0;"><strong>📅 Date:</strong> ${slotDate}</p>
            <p style="margin: 6px 0;"><strong>⏰ Time:</strong> ${slotTime}</p>
            <p style="margin: 6px 0;"><strong>💻 Session Type:</strong> ${sessionType}</p>
            ${sessionType === "Online"
          ? `<p style="margin: 6px 0;"><strong>🔗 Mode:</strong> ${communicationMethod}</p>`
          : ""
        }
          </div>

          ${meetingLink
          ? `
          <div style="text-align: center; margin: 28px 0;">
            <p>Session access link:</p>
            <a href="${meetingLink}" style="background: #10b981; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Open Meeting
            </a>
            <p style="margin-top: 12px; font-size: 0.85em; color: #6b7280;">
              Direct link:<br/>
              <a href="${meetingLink}">${meetingLink}</a>
            </p>
          </div>`
          : ""
        }

          <p>Please ensure availability at the scheduled time.</p>
        </div>

        <div style="background: #f3f4f6; padding: 12px; text-align: center; font-size: 0.8em; color: #6b7280;">
          © ${new Date().getFullYear()} Raska Mon. All rights reserved.
        </div>
      </div>
      `,
    };

    await Promise.all([
      transporter.sendMail(patientMailOptions),
      transporter.sendMail(doctorMailOptions),
    ]);

    console.log(`Confirmation emails sent for appointment ${appointment._id}`);
  } catch (error) {
    console.error("Error sending appointment confirmation email:", error);
  }
};
