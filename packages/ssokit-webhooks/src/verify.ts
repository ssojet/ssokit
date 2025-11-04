import { createHmac, timingSafeEqual } from 'crypto';
import { WebhookVerificationError } from '@ssojet/ssokit-core/errors';

export interface VerifySignatureOptions {
  rawBody: Buffer | string;
  header: string;
  secret: string;
  tolerance?: number; // Time tolerance in seconds (default: 300 = 5 minutes)
}

/**
 * Verify SSOJet webhook signature
 * 
 * Header format: t=<timestamp>,v1=<signature>
 * Signed payload: ${timestamp}.${rawBody}
 * 
 * @throws {WebhookVerificationError} if signature is invalid or timestamp is outside tolerance
 */
export function verifySignature({
  rawBody,
  header,
  secret,
  tolerance = 300,
}: VerifySignatureOptions): boolean {
  const body = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
  
  // Parse header: t=<timestamp>,v1=<signature>
  const parts = header.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=');
    if (key && value) {
      acc[key.trim()] = value.trim();
    }
    return acc;
  }, {} as Record<string, string>);

  const timestamp = parts['t'];
  const signature = parts['v1'];

  if (!timestamp || !signature) {
    throw new WebhookVerificationError(
      'Invalid webhook signature header format. Expected: t=<timestamp>,v1=<signature>'
    );
  }

  // Check timestamp tolerance
  const now = Math.floor(Date.now() / 1000);
  const webhookTime = parseInt(timestamp, 10);

  if (isNaN(webhookTime)) {
    throw new WebhookVerificationError('Invalid timestamp in webhook signature header');
  }

  if (Math.abs(now - webhookTime) > tolerance) {
    throw new WebhookVerificationError(
      `Webhook timestamp outside tolerance window. ` +
      `Timestamp: ${webhookTime}, Current: ${now}, Tolerance: ${tolerance}s`
    );
  }

  // Compute expected signature
  const signedPayload = `${timestamp}.${body}`;
  const expectedSignature = createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  // Timing-safe comparison
  try {
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      throw new WebhookVerificationError('Webhook signature mismatch');
    }

    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) {
      throw new WebhookVerificationError('Webhook signature mismatch');
    }

    return true;
  } catch (err) {
    if (err instanceof WebhookVerificationError) {
      throw err;
    }
    throw new WebhookVerificationError('Invalid webhook signature format');
  }
}
