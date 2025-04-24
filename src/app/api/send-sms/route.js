import { NextResponse } from 'next/server';
import { sendSMS } from '@/utils/twilio';

export async function POST(request) {
  try {
    const { to, message } = await request.json();
    
    const result = await sendSMS(to, message);
    
    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 