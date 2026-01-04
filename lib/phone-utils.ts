/**
 * Phone number utilities (client-safe)
 */

/**
 * Format phone number to E.164 if needed
 * Simple US-centric implementation
 */
export function formatPhoneE164(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // If 10 digits, assume US and add +1
  if (digits.length === 10) {
    return `+1${digits}`
  }

  // If 11 digits starting with 1, add +
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }

  // If already starts with +, return as is
  if (phone.startsWith('+')) {
    return phone
  }

  // Otherwise, add +
  return `+${digits}`
}
