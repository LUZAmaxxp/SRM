export const MAIL = {
  host: process.env.SMTP_HOST || "email-smtp.eu-west-3.amazonaws.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // false for STARTTLS, true for direct SSL
  requireTLS: true, // AWS SES requires TLS
  auth: {
    user: process.env.SMTP_USER || "user",
    pass: process.env.SMTP_PASS || "password",
  },
  from: process.env.SMTP_SENDER || "no_reply@notify.fevertokens.io",
  logger: true,
  debug: true,
};

// Log configuration for debugging (remove in production)
console.log("MAIL configuration loaded:", {
  host: MAIL.host,
  port: MAIL.port,
  secure: MAIL.secure,
  requireTLS: MAIL.requireTLS,
  from: MAIL.from,
  authUser: MAIL.auth.user ? "SET" : "NOT SET",
  authPass: MAIL.auth.pass ? "SET" : "NOT SET",
});
