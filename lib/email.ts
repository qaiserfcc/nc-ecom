import { Resend } from 'resend';

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }
  return new Resend(apiKey);
};

const FROM_EMAIL = process.env.FROM_EMAIL || 'hello@ncecom.com';
const FROM_NAME = process.env.FROM_NAME || 'NC Ecom';

export async function sendCampaignEmail(
  to: string,
  subject: string,
  html: string,
  campaignId: string | number
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      tags: [
        {
          name: 'type',
          value: 'campaign',
        },
        {
          name: 'campaign_id',
          value: String(campaignId),
        },
      ],
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending campaign email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendTestEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const resend = getResendClient();
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: `[TEST] ${subject}`,
      html,
      tags: [
        {
          name: 'type',
          value: 'test',
        },
      ],
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending test email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendAbandonedCartReminder(
  to: string,
  name: string,
  cartValue: number,
  reminderNumber: number,
  cartUrl: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    let subject = '';
    let html = '';
    let discountCode = '';
    let discountPercent = 0;

    if (reminderNumber === 1) {
      subject = "You left items in your cart!";
      discountCode = '';
      html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Hi ${name},</h2>
            <p>We noticed you left some items in your cart. Don't miss out on these great products!</p>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Cart Total: $${cartValue.toFixed(2)}</strong></p>
              <a href="${cartUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px;">
                Complete Your Purchase
              </a>
            </div>
            <p style="color: #666; font-size: 12px;">This is your first reminder. Check back soon for exclusive offers!</p>
          </div>
        </div>
      `;
    } else if (reminderNumber === 2) {
      subject = "Don't miss out - Save 5% on your cart!";
      discountCode = 'CART5';
      discountPercent = 5;
      html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2c3e50;">Hi ${name},</h2>
            <p>Your cart is still waiting for you! We've added an exclusive offer just for you.</p>
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="font-size: 14px; margin: 0;">EXCLUSIVE OFFER</p>
              <h3 style="font-size: 32px; margin: 10px 0;">Save 5%</h3>
              <p style="font-size: 18px; margin: 10px 0;">Use code: <strong>${discountCode}</strong></p>
              <p style="font-size: 12px; margin: 20px 0 0 0; opacity: 0.9;">on your cart of $${cartValue.toFixed(2)}</p>
            </div>
            <a href="${cartUrl}" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin-top: 10px; width: 100%; text-align: center; box-sizing: border-box;">
              Complete Your Purchase Now
            </a>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">This offer expires soon. Don't wait too long!</p>
          </div>
        </div>
      `;
    } else {
      subject = "Last chance - Save 10% on your cart!";
      discountCode = 'CART10';
      discountPercent = 10;
      html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #d32f2f;">⏰ FINAL REMINDER - Your Cart Expires Soon!</h2>
            <p style="color: #d32f2f; font-weight: bold;">Hi ${name},</p>
            <p>This is your last chance to get an amazing deal on the items in your cart!</p>
            <div style="background: linear-gradient(135deg, #f44336 0%, #e91e63 100%); color: white; padding: 30px; border-radius: 8px; margin: 20px 0; text-align: center; border: 3px dashed #fff;">
              <p style="font-size: 14px; margin: 0; text-transform: uppercase;">URGENT: Last chance savings</p>
              <h3 style="font-size: 40px; margin: 10px 0;">Save 10%</h3>
              <p style="font-size: 20px; margin: 10px 0;">Use code: <strong>${discountCode}</strong></p>
              <p style="font-size: 12px; margin: 20px 0 0 0;">Save $${((cartValue * discountPercent) / 100).toFixed(2)} on your order of $${cartValue.toFixed(2)}</p>
            </div>
            <a href="${cartUrl}" style="display: inline-block; background: #d32f2f; color: white; padding: 15px 30px; text-decoration: none; border-radius: 4px; margin-top: 10px; width: 100%; text-align: center; box-sizing: border-box; font-weight: bold;">
              Claim Your Discount & Complete Purchase
            </a>
            <p style="color: #999; font-size: 11px; margin-top: 20px;">Offer expires in 24 hours. Complete your purchase now to secure your discount.</p>
          </div>
        </div>
      `;
    }

    const resend = getResendClient();
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
      tags: [
        {
          name: 'type',
          value: 'abandoned_cart',
        },
        {
          name: 'reminder_number',
          value: String(reminderNumber),
        },
      ],
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending abandoned cart reminder:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

export async function sendWelcomeEmail(
  to: string,
  name: string,
  welcomeCode?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50;">Welcome to ${FROM_NAME}!</h2>
          <p>Hi ${name},</p>
          <p>We're excited to have you join our community! Get ready to discover amazing skincare and beauty products.</p>
          
          ${
            welcomeCode
              ? `
            <div style="background: #f0f0f0; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0 0 10px 0; color: #666;">Welcome gift for new members:</p>
              <div style="background: #fff; padding: 20px; border-radius: 4px; margin: 10px 0;">
                <p style="font-size: 14px; margin: 0; color: #666;">Use this code at checkout:</p>
                <p style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #2c3e50;">${welcomeCode}</p>
                <p style="font-size: 12px; margin: 0; color: #999;">Valid on your first purchase</p>
              </div>
            </div>
          `
              : ''
          }
          
          <div style="margin: 30px 0;">
            <h3 style="color: #2c3e50;">What to explore:</h3>
            <ul style="color: #666;">
              <li>Our complete skincare collection</li>
              <li>Personalized product recommendations</li>
              <li>Exclusive member-only offers</li>
              <li>Beauty tips and tutorials</li>
            </ul>
          </div>
          
          <a href="https://ncecom.com/shop" style="display: inline-block; background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">
            Start Shopping Now
          </a>
          
          <p style="color: #999; font-size: 12px; margin-top: 30px;">If you have any questions, feel free to reply to this email.</p>
        </div>
      </div>
    `;

    const resend = getResendClient();
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject: `Welcome to ${FROM_NAME}!`,
      html,
      tags: [
        {
          name: 'type',
          value: 'welcome',
        },
      ],
    });

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error sending welcome email:', errorMessage);
    return { success: false, error: errorMessage };
  }
}
