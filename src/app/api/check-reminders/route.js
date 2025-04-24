import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import { sendSMS } from '@/utils/twilio';

export async function POST(request) {
  try {
    const { userId } = await request.json();
    
    // Get all scheduled reminders for this user
    const { data: reminders, error } = await supabase
      .from('reminders')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'scheduled')
      .lte('scheduled_time', new Date().toISOString());

    if (error) throw error;

    // Process each reminder
    for (const reminder of reminders) {
      try {
        // Send SMS
        const result = await sendSMS(reminder.phone_number, reminder.message);
        
        if (result.success) {
          // Update reminder status
          const { error: updateError } = await supabase
            .from('reminders')
            .update({ 
              status: 'sent',
              message_id: result.messageId,
              updated_at: new Date().toISOString()
            })
            .eq('id', reminder.id);

          if (updateError) throw updateError;
        }
      } catch (error) {
        console.error('Error processing reminder:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error checking reminders:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
} 