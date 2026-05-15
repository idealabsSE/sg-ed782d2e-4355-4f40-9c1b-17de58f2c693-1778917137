/**
 * Security Validation Tests
 * 
 * Run these tests to verify RLS policies, storage access, and authentication boundaries.
 * These are integration tests that should be run against a test Supabase instance.
 */

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const TEST_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const TEST_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
}

/**
 * Test 1: Unauthenticated Access (Default Deny)
 * Verifies that users without a session cannot read private data
 */
export async function testUnauthenticatedAccess(): Promise<TestResult> {
  const supabase = createClient<Database>(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY);

  // Should fail to read verifications without auth
  const { data, error } = await supabase
    .from("verifications")
    .select("*");

  const passed = error !== null && (!data || data.length === 0);

  return {
    testName: "Unauthenticated Access (Default Deny)",
    passed,
    error: passed ? undefined : "Users without session can access private data",
  };
}

/**
 * Test 2: Cross-User Data Access
 * Verifies that User A cannot access User B's private data
 */
export async function testCrossUserAccess(
  userASession: string,
  userBVerificationId: string
): Promise<TestResult> {
  const supabase = createClient<Database>(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${userASession}` } },
  });

  // User A tries to access User B's verification
  const { data, error } = await supabase
    .from("verifications")
    .select("*")
    .eq("id", userBVerificationId);

  const passed = (!data || data.length === 0);

  return {
    testName: "Cross-User Data Access Prevention",
    passed,
    error: passed ? undefined : "User A can access User B's private verification",
  };
}

/**
 * Test 3: Storage Access Without Signed URL
 * Verifies that documents cannot be accessed via direct URL
 */
export async function testStorageDirectAccess(
  userId: string,
  documentPath: string
): Promise<TestResult> {
  const directUrl = `${TEST_SUPABASE_URL}/storage/v1/object/public/verification-documents/${userId}/${documentPath}`;
  
  try {
    const response = await fetch(directUrl);
    
    // Should fail (400, 401, or 403)
    const passed = response.status >= 400 && response.status < 500;

    return {
      testName: "Storage Direct Access Prevention",
      passed,
      error: passed ? undefined : `Document accessible via direct URL (status: ${response.status})`,
    };
  } catch (error) {
    return {
      testName: "Storage Direct Access Prevention",
      passed: false,
      error: `Network error: ${error}`,
    };
  }
}

/**
 * Test 4: Case Party Access
 * Verifies that case parties can access documents in shared cases
 */
export async function testCasePartyAccess(
  userBSession: string,
  sharedPropertyId: string
): Promise<TestResult> {
  const supabase = createClient<Database>(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${userBSession}` } },
  });

  // User B should see ownership documents in shared case
  const { data, error } = await supabase
    .from("ownership_documents")
    .select("*")
    .eq("property_id", sharedPropertyId);

  const passed = error === null && data !== null && data.length > 0;

  return {
    testName: "Case Party Document Access",
    passed,
    error: passed ? undefined : "Case party cannot access shared property documents",
  };
}

/**
 * Test 5: Admin-Only Audit Access
 * Verifies that non-admin users cannot read audit logs
 */
export async function testAuditLogAccess(regularUserSession: string): Promise<TestResult> {
  const supabase = createClient<Database>(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${regularUserSession}` } },
  });

  // Regular user tries to read audit logs
  const { data, error } = await supabase
    .from("access_audit_log")
    .select("*");

  const passed = (!data || data.length === 0);

  return {
    testName: "Admin-Only Audit Log Access",
    passed,
    error: passed ? undefined : "Non-admin user can access audit logs",
  };
}

/**
 * Test 6: Signed URL Generation and Access
 * Verifies that signed URLs work correctly for authorized users
 */
export async function testSignedUrlAccess(
  userSession: string,
  userId: string,
  documentPath: string
): Promise<TestResult> {
  const supabase = createClient<Database>(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${userSession}` } },
  });

  // Generate signed URL (valid for 1 hour)
  const { data, error } = await supabase.storage
    .from("verification-documents")
    .createSignedUrl(`${userId}/${documentPath}`, 3600);

  if (error || !data?.signedUrl) {
    return {
      testName: "Signed URL Generation",
      passed: false,
      error: `Failed to generate signed URL: ${error?.message}`,
    };
  }

  // Try to access via signed URL
  try {
    const response = await fetch(data.signedUrl);
    const passed = response.ok;

    return {
      testName: "Signed URL Access",
      passed,
      error: passed ? undefined : `Cannot access document via signed URL (status: ${response.status})`,
    };
  } catch (error) {
    return {
      testName: "Signed URL Access",
      passed: false,
      error: `Network error: ${error}`,
    };
  }
}

/**
 * Test 7: Document Upload Restriction
 * Verifies that users can only upload to their own folder
 */
export async function testUploadRestriction(
  userASession: string,
  userBId: string
): Promise<TestResult> {
  const supabase = createClient<Database>(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${userASession}` } },
  });

  // User A tries to upload to User B's folder
  const testFile = new Blob(["test content"], { type: "application/pdf" });
  const { error } = await supabase.storage
    .from("verification-documents")
    .upload(`${userBId}/test.pdf`, testFile);

  const passed = error !== null;

  return {
    testName: "Upload to Other User's Folder Prevention",
    passed,
    error: passed ? undefined : "User A can upload to User B's folder",
  };
}

/**
 * Test 8: GDPR Request Creation
 * Verifies that users can only create GDPR requests for their own email
 */
export async function testGDPRRequestCreation(
  userSession: string,
  userEmail: string,
  otherEmail: string
): Promise<TestResult> {
  const supabase = createClient<Database>(TEST_SUPABASE_URL, TEST_SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${userSession}` } },
  });

  // Try to create GDPR request for another user's email
  const { error } = await supabase
    .from("data_subject_requests")
    .insert({
      requester_email: otherEmail,
      request_type: "export",
      status: "pending",
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    });

  const passed = error !== null;

  return {
    testName: "GDPR Request Creation Restriction",
    passed,
    error: passed ? undefined : "User can create GDPR requests for other emails",
  };
}

/**
 * Run all security validation tests
 */
export async function runSecurityValidationSuite(
  testConfig: {
    userASession: string;
    userBSession: string;
    regularUserSession: string;
    userAEmail: string;
    userBId: string;
    userBVerificationId: string;
    sharedPropertyId: string;
    documentPath: string;
    otherEmail: string;
  }
): Promise<{ passed: number; failed: number; results: TestResult[] }> {
  const results: TestResult[] = [];

  // Run all tests
  results.push(await testUnauthenticatedAccess());
  results.push(await testCrossUserAccess(testConfig.userASession, testConfig.userBVerificationId));
  results.push(await testStorageDirectAccess(testConfig.userBId, testConfig.documentPath));
  results.push(await testCasePartyAccess(testConfig.userBSession, testConfig.sharedPropertyId));
  results.push(await testAuditLogAccess(testConfig.regularUserSession));
  results.push(await testSignedUrlAccess(testConfig.userASession, testConfig.userBId, testConfig.documentPath));
  results.push(await testUploadRestriction(testConfig.userASession, testConfig.userBId));
  results.push(await testGDPRRequestCreation(testConfig.userASession, testConfig.userAEmail, testConfig.otherEmail));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  return { passed, failed, results };
}

/**
 * Console reporter for test results
 */
export function reportTestResults(results: TestResult[]): void {
  console.log("\n=== Security Validation Test Results ===\n");
  
  results.forEach((result) => {
    const status = result.passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${status} - ${result.testName}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`\n=== Summary: ${passed}/${total} tests passed ===\n`);

  if (failed > 0) {
    console.error(`⚠️  ${failed} test(s) failed - security baseline not met`);
  } else {
    console.log("✅ All security tests passed - baseline verified");
  }
}