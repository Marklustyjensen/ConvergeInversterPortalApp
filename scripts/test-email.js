/**
 * Test script to verify email service configuration
 * Run this from the project root: node scripts/test-email.js
 */

import {
  sendDocumentUploadNotifications,
  validateEmailConfig,
} from "../lib/emailService.js";

async function testEmailService() {
  console.log("🧪 Testing Email Service Configuration...\n");

  // Test 1: Check configuration
  console.log("1. Checking environment variables...");
  const isConfigured = validateEmailConfig();

  if (!isConfigured) {
    console.log("❌ Email service is not properly configured.");
    console.log(
      "Please set RESEND_API_KEY and RESEND_FROM_EMAIL in your .env file"
    );
    console.log("See EMAIL_SERVICE_README.md for setup instructions");
    return;
  }

  console.log("✅ Email service configuration looks good");

  // Test 2: Check if we can test with a real property
  console.log("\n2. To test actual email sending:");
  console.log("   - Upload a document through the admin interface");
  console.log("   - Check the console logs for email sending status");
  console.log("   - Verify that users assigned to the property receive emails");

  console.log("\n3. Manual test example:");
  console.log(
    "   If you want to test with a specific property ID, you can call:"
  );
  console.log("   sendDocumentUploadNotifications({");
  console.log("     propertyId: 'your-property-id',");
  console.log("     documentCount: 1,");
  console.log("     documentType: 'financial',");
  console.log("     year: 2025,");
  console.log("     month: 1");
  console.log("   })");

  console.log("\n✅ Email service test completed!");
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmailService().catch(console.error);
}
