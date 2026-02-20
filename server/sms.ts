/**
 * SMS Service for sending personalized text messages to students
 * Currently implements placeholder logging - actual SMS integration can be added later
 */

import { StudentRecord, PostingRecord } from "./storage";

/**
 * Personalize a message template by replacing variables with student/posting data
 */
export function personalizeMessage(
  template: string,
  student: StudentRecord,
  posting: PostingRecord
): string {
  let message = template;

  // Replace {firstName} with student's first name
  const firstName = student.name?.split(" ")[0] || "there";
  message = message.replace(/\{firstName\}/g, firstName);

  // Replace {eventName} with posting title
  message = message.replace(/\{eventName\}/g, posting.title);

  // Replace {matchReason} with top matching topic
  const matchReason = student.topics.length > 0 ? student.topics[0] : "your interests";
  message = message.replace(/\{matchReason\}/g, matchReason);

  return message;
}

/**
 * Calculate SMS count based on message length
 * Standard SMS: 160 characters = 1 SMS
 * Long SMS: 160-320 characters = 2 SMS, etc.
 */
export function calculateSmsCount(message: string): number {
  if (message.length === 0) return 0;
  return Math.ceil(message.length / 160);
}

/**
 * Send SMS to a phone number
 * Currently logs to console - actual SMS integration can be added here
 * 
 * For OCI Notifications Service integration:
 * - Create notification topic
 * - Add SMS subscription for phone number
 * - Publish message to topic
 * 
 * For Twilio integration:
 * - Use Twilio SDK to send SMS
 */
export async function sendSms(
  phoneNumber: string,
  message: string
): Promise<void> {
  // Validate phone number format (basic check)
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    throw new Error("Phone number is required");
  }

  // Log SMS (placeholder implementation)
  console.log(`[SMS] Sending to ${phoneNumber}:`);
  console.log(`[SMS] Message (${message.length} chars, ${calculateSmsCount(message)} SMS):`);
  console.log(`[SMS] ${message}`);
  console.log(`[SMS] ---`);

  // TODO: Integrate with actual SMS provider
  // Example for OCI Notifications Service:
  // const notificationClient = new oci.ons.NotificationDataPlaneClient({...});
  // await notificationClient.publishMessage({...});
  
  // Example for Twilio:
  // const twilioClient = require('twilio')(accountSid, authToken);
  // await twilioClient.messages.create({
  //   body: message,
  //   to: phoneNumber,
  //   from: twilioPhoneNumber
  // });

  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 100));
}
