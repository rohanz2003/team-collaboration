const nodemailer = require('nodemailer');
const logger = require('./loggerService');

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else if (process.env.EMAIL_SERVICE === 'sendgrid') {
    transporter = nodemailer.createTransport({
      service: 'SendGrid',
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    });
  } else {
    const testAccount = null;
    try {
      logger.warn('No email provider configured — emails will be logged only');
    } catch {}
    return null;
  }

  return transporter;
}

const FROM_ADDRESS = process.env.FROM_EMAIL || 'noreply@teamcollab.app';

async function sendInviteEmail({ email, invitedByName, workspaceName, inviteLink }) {
  const transport = getTransporter();
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 32px;">
      <h1 style="color: #1a202c; font-size: 24px; margin-bottom: 16px;">You're Invited!</h1>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
        <strong>${invitedByName}</strong> has invited you to join <strong>${workspaceName}</strong> on TeamCollab.
      </p>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
        Click the button below to accept the invitation and start collaborating.
      </p>
      <div style="text-align: center; margin: 32px 0;">
        <a href="${inviteLink}"
           style="display: inline-block; padding: 14px 32px; background-color: #3182ce; color: #fff;
                  text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
          Accept Invitation
        </a>
      </div>
      <p style="color: #a0aec0; font-size: 14px;">
        This invitation expires in 7 days. If you didn't expect this invitation, you can ignore this email.
      </p>
    </div>
  `;

  const mailOptions = {
    from: FROM_ADDRESS,
    to: email,
    subject: `You're invited to ${workspaceName} on TeamCollab`,
    html,
  };

  logger.info(`Sending invite email to ${email} for workspace ${workspaceName}`);

  if (!transport) {
    logger.info(`[EMAIL LOG] To: ${email} | Subject: ${mailOptions.subject} | Link: ${inviteLink}`);
    return { sent: false, logged: true };
  }

  try {
    await transport.sendMail(mailOptions);
    logger.info(`Invite email sent to ${email}`);
    return { sent: true };
  } catch (error) {
    logger.error(`Failed to send invite email to ${email}: ${error.message}`);
    throw error;
  }
}

async function sendNotificationEmail({ email, subject, html }) {
  const transport = getTransporter();

  const mailOptions = {
    from: FROM_ADDRESS,
    to: email,
    subject,
    html,
  };

  logger.info(`Sending notification email to ${email}: ${subject}`);

  if (!transport) {
    logger.info(`[EMAIL LOG] To: ${email} | Subject: ${subject}`);
    return { sent: false, logged: true };
  }

  try {
    await transport.sendMail(mailOptions);
    logger.info(`Notification email sent to ${email}`);
    return { sent: true };
  } catch (error) {
    logger.error(`Failed to send notification email to ${email}: ${error.message}`);
    throw error;
  }
}

module.exports = { sendInviteEmail, sendNotificationEmail };
