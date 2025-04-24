import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

// Initialize the client with proper authentication
const client = twilio(authToken, undefined, {
  accountSid: accountSid
});

export const sendSMS = async (to, message) => {
  try {
    const result = await client.messages.create({
      body: message,
      from: twilioPhoneNumber,
      to: to
    });
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('Error sending SMS:', error);
    return { success: false, error: error.message };
  }
}; 