import { NextResponse } from 'next/server';
import { sendTestEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const { email, subject, html_content } = await request.json();

    if (!email || !subject || !html_content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service not configured. Set RESEND_API_KEY in .env.local' },
        { status: 500 }
      );
    }

    const result = await sendTestEmail(email, subject, html_content);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to send test email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: result.messageId,
    });
  } catch (error) {
    console.error('Failed to send test email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send test email' },
      { status: 500 }
    );
  }
}
