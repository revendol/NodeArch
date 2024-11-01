import nodemailer, { Transporter, SendMailOptions } from "nodemailer";
import envVars from "../shared/env-vars";
import logger from "@util/logger";

interface IAttachments {
  filename: string;
  path: string;
  contentType: string;
}

class Mailer {
  private transport: Transporter;

  constructor() {
    // Initialize transporter with error handling for missing environment variables
    if (!envVars.mailer.mailtrap.host ||
      !envVars.mailer.mailtrap.auth.user ||
      !envVars.mailer.mailtrap.auth.pass) {
      throw new Error("Missing Mailtrap configuration in environment variables");
    }

    this.transport = nodemailer.createTransport({
      host: envVars.mailer.mailtrap.host,
      port: Number(envVars.mailer.mailtrap.port),
      secure: false, // Set to true for SSL/TLS
      auth: {
        user: envVars.mailer.mailtrap.auth.user,
        pass: envVars.mailer.mailtrap.auth.pass,
      },
    });
  }

  async mail(
    to: string,
    subject: string,
    html: string,
    attachments: IAttachments[] = [],
    cc?: string,
    bcc?: string
  ): Promise<void> {
    // Validate required fields
    if (!to || !subject || !html) {
      throw new Error("Missing required mail options (to, subject, or html)");
    }

    const mailOptions: SendMailOptions = {
      from: envVars.mailer.from,
      to,
      subject,
      html,
      attachments,
      ...(cc && { cc }), // Dynamically add 'cc' if provided
      ...(bcc && { bcc }), // Dynamically add 'bcc' if provided
    };

    try {
      await this.transport.sendMail(mailOptions);
      logger.info(`Email sent to ${to}`);
    } catch (error) {
      logger.error("Failed to send email:", error instanceof Error ? error.message : error);
      throw new Error("Failed to send email");
    }
  }
}

export default new Mailer();
