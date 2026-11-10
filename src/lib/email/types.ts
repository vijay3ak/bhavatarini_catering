import "server-only";

export interface SendEmailOptions {
  to: string | string[];
  from?: string;
  replyTo?: string;
  subject: string;
  html: string;
  text: string;
  messageId?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isPermanentFailure?: boolean;
}

export interface EmailProvider {
  readonly id: string;
  sendEmail(options: SendEmailOptions): Promise<SendEmailResult>;
}
