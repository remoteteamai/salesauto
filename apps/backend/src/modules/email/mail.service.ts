import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import { LoggerService } from '../../common/utils/logger.service';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface WelcomeEmailData {
  firstName: string;
  loginUrl: string;
}

export interface PasswordResetEmailData {
  firstName: string;
  resetUrl: string;
  expiresIn: string;
}

export interface MeetingScheduledEmailData {
  recipientName: string;
  hostName: string;
  title: string;
  startTime: Date;
  timezone: string;
  meetingLink?: string;
  location?: string;
}

export interface CampaignEmailData {
  recipientName: string;
  campaignName: string;
  subject: string;
  previewText?: string;
}

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private readonly fromAddress: string;
  private readonly fromName: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService,
  ) {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT', 587);
    const secure = this.configService.get<boolean>('SMTP_SECURE', false);
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');
    this.fromAddress = this.configService.get<string>('EMAIL_FROM_ADDRESS', 'noreply@melioro.ai');
    this.fromName = this.configService.get<string>('EMAIL_FROM_NAME', 'Melioro AI');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: user && pass ? { user, pass } : undefined,
      pool: true,
      maxConnections: 5,
      rateLimit: 10,
    });

    this.logger.log('MailService initialized', 'MailService');
  }

  async send(options: EmailOptions): Promise<void> {
    try {
      const result = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromAddress}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`Email sent to ${options.to}: ${result.messageId}`, 'MailService');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Failed to send email to ${options.to}: ${errorMessage}`, errorStack, 'MailService');
      throw new InternalServerErrorException(`Failed to send email to ${options.to}: ${errorMessage}`);
    }
  }

  async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const loginUrl = this.configService.get('APP_URL', 'https://app.melioro.ai');
    const data: WelcomeEmailData = { firstName, loginUrl };
    const html = this.compileTemplate('welcome', data);

    await this.send({
      to: email,
      subject: 'Welcome to Melioro AI',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<void> {
    const baseUrl = this.configService.get('APP_URL', 'https://app.melioro.ai');
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    const data: PasswordResetEmailData = {
      firstName,
      resetUrl,
      expiresIn: '1 hour',
    };
    const html = this.compileTemplate('password-reset', data);

    await this.send({
      to: email,
      subject: 'Reset Your Password',
      html,
    });
  }

  async sendMeetingScheduledEmail(
    email: string,
    data: MeetingScheduledEmailData,
  ): Promise<void> {
    const html = this.compileTemplate('meeting-scheduled', {
      ...data,
      startTime: new Date(data.startTime),
      formattedTime: this.formatMeetingTime(data.startTime, data.timezone),
    });

    await this.send({
      to: email,
      subject: `Meeting Scheduled: ${data.title}`,
      html,
    });
  }

  async sendCampaignEmail(
    email: string,
    data: CampaignEmailData,
    content: string,
  ): Promise<void> {
    const html = this.compileTemplate('campaign', {
      ...data,
      content,
    });

    await this.send({
      to: email,
      subject: data.subject,
      html,
    });
  }

  async sendInvitationEmail(
    email: string,
    inviterName: string,
    teamName: string,
    invitationUrl: string,
  ): Promise<void> {
    const html = this.compileTemplate('invitation', {
      inviterName,
      teamName,
      invitationUrl,
    });

    await this.send({
      to: email,
      subject: `You've been invited to join ${teamName}`,
      html,
    });
  }

  async sendTrialEndingEmail(email: string, firstName: string, daysLeft: number): Promise<void> {
    const upgradeUrl = this.configService.get('APP_URL', 'https://app.melioro.ai');
    const html = this.compileTemplate('trial-ending', {
      firstName,
      daysLeft,
      upgradeUrl,
    });

    await this.send({
      to: email,
      subject: `Your trial ends in ${daysLeft} days`,
      html,
    });
  }

  private compileTemplate(name: string, data: any): string {
    const template = this.getTemplate(name);
    const compiled = handlebars.compile(template);
    return compiled({ ...data, appName: 'Melioro AI', currentYear: new Date().getFullYear() });
  }

  private getTemplate(name: string): string {
    const templates: Record<string, string> = {
      welcome: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 40px 20px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to {{appName}}!</h1>
    </div>
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>Thank you for joining {{appName}}! We're excited to have you on board.</p>
      <p>With {{appName}}, you can automate your outreach, book more meetings, and scale your sales pipeline with AI-powered SDR capabilities.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{loginUrl}}" class="button">Get Started</a>
      </p>
      <p>If you have any questions, our support team is here to help.</p>
      <p>Best regards,<br>The {{appName}} Team</p>
    </div>
    <div class="footer">
      <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,

      'password-reset': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1f2937; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 40px 20px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Reset Your Password</h1>
    </div>
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>We received a request to reset your password. Click the button below to create a new password:</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{resetUrl}}" class="button">Reset Password</a>
      </p>
      <div class="warning">
        <strong>Important:</strong> This link expires in {{expiresIn}}. If you didn't request this, please ignore this email.
      </div>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all; font-size: 12px; color: #6b7280;">{{resetUrl}}</p>
    </div>
    <div class="footer">
      <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,

      'meeting-scheduled': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10b981; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 40px 20px; }
    .meeting-details { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .meeting-details h3 { margin-top: 0; color: #1f2937; }
    .detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
    .detail-label { font-weight: 600; width: 120px; color: #6b7280; }
    .detail-value { flex: 1; }
    .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Meeting Scheduled</h1>
    </div>
    <div class="content">
      <p>Hi {{recipientName}},</p>
      <p>{{hostName}} has scheduled a meeting with you!</p>
      <div class="meeting-details">
        <h3>{{title}}</h3>
        <div class="detail-row">
          <span class="detail-label">Date & Time:</span>
          <span class="detail-value">{{formattedTime}}</span>
        </div>
        {{#if location}}
        <div class="detail-row">
          <span class="detail-label">Location:</span>
          <span class="detail-value">{{location}}</span>
        </div>
        {{/if}}
        {{#if meetingLink}}
        <div class="detail-row">
          <span class="detail-label">Meeting Link:</span>
          <span class="detail-value"><a href="{{meetingLink}}">Join Meeting</a></span>
        </div>
        {{/if}}
      </div>
      {{#if meetingLink}}
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{meetingLink}}" class="button">Join Meeting</a>
      </p>
      {{/if}}
      <p>If you need to reschedule, please contact {{hostName}} directly.</p>
    </div>
    <div class="footer">
      <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,

      campaign: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.8; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { padding: 20px 0; border-bottom: 1px solid #e5e7eb; }
    .content { padding: 30px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <p style="margin: 0; color: #6b7280;">{{campaignName}}</p>
    </div>
    <div class="content">
      <p>Hi {{recipientName}},</p>
      {{{content}}}
    </div>
    <div class="footer">
      <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
      <p><a href="{{{unsubscribeUrl}}}">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`,

      invitation: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 40px 20px; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>You've Been Invited!</h1>
    </div>
    <div class="content">
      <p>Hi there,</p>
      <p><strong>{{inviterName}}</strong> has invited you to join <strong>{{teamName}}</strong> on {{appName}}.</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{invitationUrl}}" class="button">Accept Invitation</a>
      </p>
      <p>This invitation will expire in 7 days.</p>
      <p>If you didn't expect this invitation, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,

      'trial-ending': `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #f59e0b; color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 40px 20px; }
    .button { display: inline-block; background: #f59e0b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; }
    .features { background: white; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Your Trial is Ending Soon</h1>
    </div>
    <div class="content">
      <p>Hi {{firstName}},</p>
      <p>Your {{appName}} trial ends in <strong>{{daysLeft}} days</strong>. Don't lose access to your data and settings!</p>
      <p style="text-align: center; margin: 30px 0;">
        <a href="{{upgradeUrl}}" class="button">Upgrade Now</a>
      </p>
      <div class="features">
        <h3>What you'll get with {{appName}}:</h3>
        <ul>
          <li>AI-powered prospect research and personalization</li>
          <li>Automated multi-channel outreach campaigns</li>
          <li>Advanced analytics and pipeline tracking</li>
          <li>Meeting scheduling and calendar integration</li>
        </ul>
      </div>
      <p>Questions? Our team is here to help you succeed.</p>
    </div>
    <div class="footer">
      <p>&copy; {{currentYear}} {{appName}}. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`,
    };

    return templates[name] || `<p>${name} template</p>`;
  }

  private formatMeetingTime(date: Date, timezone: string): string {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timezone || 'UTC',
    });
  }
}
