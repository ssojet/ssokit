import { WebhookEvent } from '@ssojet/ssokit-core';
import { parseEvent } from './parser.js';
import { verifySignature } from './verify.js';

/**
 * Webhook event handler function type
 */
export type WebhookEventHandler = (event: WebhookEvent) => Promise<void> | void;

/**
 * Webhook handler options
 */
export interface WebhookHandlerOptions {
  /**
   * Secret key for verifying webhook signatures
   */
  secret: string;

  /**
   * Event handlers for different webhook events
   */
  handlers?: {
    // User events
    'user.created'?: WebhookEventHandler;
    'user.updated'?: WebhookEventHandler;
    'user.deleted'?: WebhookEventHandler;

    // Group events
    'group.created'?: WebhookEventHandler;
    'group.updated'?: WebhookEventHandler;
    'group.deleted'?: WebhookEventHandler;

    // User-group membership events
    'user.group.added'?: WebhookEventHandler;
    'user.group.removed'?: WebhookEventHandler;

    // Invitation events
    'invitation.sent'?: WebhookEventHandler;
    'invitation.accepted'?: WebhookEventHandler;
    'invitation.revoked'?: WebhookEventHandler;

    // Tenant events
    'tenant.created'?: WebhookEventHandler;

    // Legacy team events
    'team.member.added'?: WebhookEventHandler;
    'team.member.removed'?: WebhookEventHandler;
    'team.member.role_updated'?: WebhookEventHandler;

    // Catch-all handler for events without specific handlers
    '*'?: WebhookEventHandler;
  };

  /**
   * Optional callback for handling errors
   */
  onError?: (error: Error, event?: WebhookEvent) => void;
}

/**
 * Create a webhook handler that can be used in API routes
 * 
 * @example
 * ```typescript
 * // In your Next.js API route: app/api/webhooks/ssojet/route.ts
 * import { createWebhookHandler } from '@ssojet/ssokit-webhooks';
 * 
 * const handler = createWebhookHandler({
 *   secret: process.env.SSOJET_WEBHOOK_SECRET!,
 *   handlers: {
 *     'user.created': async (event) => {
 *       console.log('New user created:', event.data.user);
 *       // Your custom logic here
 *     },
 *     'invitation.accepted': async (event) => {
 *       console.log('Invitation accepted:', event.data);
 *       // Your custom logic here
 *     },
 *     '*': async (event) => {
 *       console.log('Unhandled event:', event.event);
 *     }
 *   },
 * });
 * 
 * export async function POST(request: Request) {
 *   return handler(request);
 * }
 * ```
 */
export function createWebhookHandler(options: WebhookHandlerOptions) {
  return async (request: Request): Promise<Response> => {
    try {
      // Get the raw body
      const body = await request.text();
      
      // Get the signature from headers
      const signature = request.headers.get('x-ssojet-signature') ||
                       request.headers.get('x-webhook-signature');
      
      if (!signature) {
        return new Response('Missing signature', { status: 401 });
      }

      // Verify the signature
      const isValid = verifySignature({
        rawBody: body,
        header: signature,
        secret: options.secret,
      });

      if (!isValid) {
        return new Response('Invalid signature', { status: 401 });
      }

      // Parse the event
      const event = parseEvent(body);

      // Find and execute the appropriate handler
      const handler = options.handlers?.[event.event as keyof typeof options.handlers] || options.handlers?.['*'];

      if (handler) {
        try {
          await handler(event);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          if (options.onError) {
            options.onError(err, event);
          } else {
            console.error(`Error handling webhook event ${event.event}:`, err);
          }
          return new Response('Webhook handler error', { status: 500 });
        }
      }

      return new Response('Webhook received', { status: 200 });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (options.onError) {
        options.onError(err);
      } else {
        console.error('Error processing webhook:', err);
      }
      return new Response('Webhook processing error', { status: 500 });
    }
  };
}

/**
 * Helper function to create a webhook handler for Express.js
 * 
 * @example
 * ```typescript
 * import express from 'express';
 * import { createExpressWebhookHandler } from '@ssojet/ssokit-webhooks';
 * 
 * const app = express();
 * 
 * app.post('/webhooks/ssojet',
 *   express.raw({ type: 'application/json' }),
 *   createExpressWebhookHandler({
 *     secret: process.env.SSOJET_WEBHOOK_SECRET!,
 *     handlers: {
 *       'user.created': async (event) => {
 *         console.log('New user:', event.data.user);
 *       },
 *     },
 *   })
 * );
 * ```
 */
export function createExpressWebhookHandler(options: WebhookHandlerOptions) {
  return async (req: any, res: any) => {
    try {
      // Get the raw body
      const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      
      // Get the signature from headers
      const signature = req.headers['x-ssojet-signature'] ||
                       req.headers['x-webhook-signature'];
      
      if (!signature) {
        return res.status(401).json({ error: 'Missing signature' });
      }

      // Verify the signature
      const isValid = verifySignature({
        rawBody: body,
        header: signature,
        secret: options.secret,
      });

      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      // Parse the event
      const event = parseEvent(body);

      // Find and execute the appropriate handler
      const handler = options.handlers?.[event.event as keyof typeof options.handlers] || options.handlers?.['*'];

      if (handler) {
        try {
          await handler(event);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          if (options.onError) {
            options.onError(err, event);
          } else {
            console.error(`Error handling webhook event ${event.event}:`, err);
          }
          return res.status(500).json({ error: 'Webhook handler error' });
        }
      }

      return res.status(200).json({ received: true });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      if (options.onError) {
        options.onError(err);
      } else {
        console.error('Error processing webhook:', err);
      }
      return res.status(500).json({ error: 'Webhook processing error' });
    }
  };
}
