import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

/**
 * Safely retrieves the server session, handling JWT decryption errors gracefully.
 * This is useful when NEXTAUTH_SECRET has changed or cookies are corrupted.
 * 
 * IMPORTANT: NextAuth logs JWT decryption errors internally before throwing them.
 * This function catches the error and returns null, preventing app crashes.
 * However, you may still see error logs in the console - these are harmless
 * and indicate that invalid session cookies need to be cleared.
 * 
 * To fix: Clear browser cookies or use incognito mode. The error will stop
 * appearing once invalid cookies are cleared.
 * 
 * @returns The session object or null if session cannot be decrypted
 */
export async function getSafeServerSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error: any) {
    // Handle JWT decryption errors gracefully
    // This happens when NEXTAUTH_SECRET changes or cookies are corrupted
    const errorName = error?.name || '';
    const errorMessage = error?.message || '';
    const errorStack = error?.stack || '';
    
    // Check for various JWT decryption error indicators
    const isJWTError = 
      errorName === 'JWEDecryptionFailed' ||
      errorName === 'JWT_SESSION_ERROR' ||
      errorMessage.includes('decryption') ||
      errorMessage.includes('decryption operation failed') ||
      errorMessage.includes('JWT') ||
      errorStack.includes('jwtDecrypt') ||
      errorStack.includes('decrypt.js');
    
    if (isJWTError) {
      // Silently return null - NextAuth already logged the error
      // The user will need to clear cookies and log in again
      return null;
    }
    
    // Re-throw other errors that we don't know how to handle
    throw error;
  }
}

