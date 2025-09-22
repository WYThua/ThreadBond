import nodemailer from 'nodemailer';

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  /**
   * 发送欢迎邮件
   */
  async sendWelcomeEmail(email: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@threadbond.com',
        to: email,
        subject: '欢迎加入 ThreadBond！',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1; text-align: center;">欢迎加入 ThreadBond！</h1>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2>🎉 注册成功！</h2>
              <p>恭喜您成功注册 ThreadBond 账户！您现在可以：</p>
              <ul>
                <li>🔍 创建充满悬念的线索卡</li>
                <li>🧩 解密他人的有趣线索</li>
                <li>💬 与解密成功的用户匿名聊天</li>
                <li>🤖 使用 AI 辅助功能增强体验</li>
              </ul>
            </div>
            <div style="background: #e0e7ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3>🎭 您的匿名身份</h3>
              <p>我们已为您自动生成了一个匿名身份，您可以随时在个人设置中自定义您的匿名昵称和头像。</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #64748b;">开始您的神秘社交之旅吧！</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              这是一封自动发送的邮件，请勿回复。<br>
              如有问题，请联系我们的客服团队。
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`欢迎邮件已发送至: ${email}`);
    } catch (error) {
      console.error('发送欢迎邮件失败:', error);
      // 不抛出错误，避免影响注册流程
    }
  }

  /**
   * 发送邮箱验证邮件
   */
  async sendVerificationEmail(email: string, verificationCode: string): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'noreply@threadbond.com',
        to: email,
        subject: 'ThreadBond 邮箱验证',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #6366f1; text-align: center;">邮箱验证</h1>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2>验证您的邮箱地址</h2>
              <p>感谢您注册 ThreadBond！请使用以下验证码完成邮箱验证：</p>
              <div style="text-align: center; margin: 20px 0;">
                <span style="font-size: 24px; font-weight: bold; color: #6366f1; background: #e0e7ff; padding: 10px 20px; border-radius: 8px; letter-spacing: 2px;">
                  ${verificationCode}
                </span>
              </div>
              <p style="color: #64748b; font-size: 14px;">验证码有效期为 10 分钟。</p>
            </div>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;">
            <p style="font-size: 12px; color: #94a3b8; text-align: center;">
              如果您没有注册 ThreadBond 账户，请忽略此邮件。
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`验证邮件已发送至: ${email}`);
    } catch (error) {
      console.error('发送验证邮件失败:', error);
      throw new Error('发送验证邮件失败');
    }
  }
}

export const emailService = new EmailService();