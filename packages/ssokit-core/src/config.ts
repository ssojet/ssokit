import { ConfigError } from './errors.js';

/**
 * Server-side configuration for SSOJet API client
 */
export interface SSOJetServerConfig {
  baseUrl: string;
  apiKey: string;
}

/**
 * Server-side configuration for SCIM client
 */
export interface ScimServerConfig {
  baseUrl: string;
  token: string;
}

/**
 * Server-side webhook configuration
 */
export interface WebhookServerConfig {
  secret: string;
}

/**
 * Client-safe configuration (no secrets)
 */
export interface AuthKitPublicConfig {
  baseUrl: string; // Base URL for AuthKit API routes in the host app
  defaultTheme?: string | Record<string, string>;
}

/**
 * Read SSOJet server configuration from environment variables
 * @throws {ConfigError} if required env vars are missing
 */
export function readSSOJetServerConfig(): SSOJetServerConfig {
  const baseUrl = process.env.SSOJET_BASE;
  const apiKey = process.env.SSOJET_API_KEY;

  if (!baseUrl) {
    throw new ConfigError(
      'Missing required environment variable: SSOJET_BASE. ' +
        'Set it to your SSOJet API base URL (e.g., https://api.ssojet.com)'
    );
  }

  if (!apiKey) {
    throw new ConfigError(
      'Missing required environment variable: SSOJET_API_KEY. ' +
        'Get your API key from the SSOJet dashboard.'
    );
  }

  return { baseUrl, apiKey };
}

/**
 * Read SCIM server configuration from environment variables
 * @throws {ConfigError} if required env vars are missing
 */
export function readScimServerConfig(): ScimServerConfig {
  const baseUrl = process.env.SCIM_BASE_URL;
  const token = process.env.SCIM_TOKEN;

  if (!baseUrl) {
    throw new ConfigError(
      'Missing required environment variable: SCIM_BASE_URL. ' +
        'Set it to your SCIM 2.0 service provider endpoint.'
    );
  }

  if (!token) {
    throw new ConfigError(
      'Missing required environment variable: SCIM_TOKEN. ' +
        'Provide a bearer token for SCIM authentication.'
    );
  }

  return { baseUrl, token };
}

/**
 * Read webhook configuration from environment variables
 * @throws {ConfigError} if required env vars are missing
 */
export function readWebhookServerConfig(): WebhookServerConfig {
  const secret = process.env.SSOJET_WEBHOOK_SECRET;

  if (!secret) {
    throw new ConfigError(
      'Missing required environment variable: SSOJET_WEBHOOK_SECRET. ' +
        'Get your webhook secret from the SSOJet dashboard.'
    );
  }

  return { secret };
}

/**
 * Read public (client-safe) configuration
 */
export function readPublicConfig(): AuthKitPublicConfig {
  const baseUrl = process.env.NEXT_PUBLIC_AUTHKIT_BASE_URL || '/api/authkit';
  const themeEnv = process.env.NEXT_PUBLIC_AUTHKIT_THEME;

  let defaultTheme: string | Record<string, string> | undefined;

  if (themeEnv) {
    try {
      defaultTheme = JSON.parse(themeEnv);
    } catch {
      defaultTheme = themeEnv; // Treat as preset name
    }
  }

  return { baseUrl, defaultTheme };
}
