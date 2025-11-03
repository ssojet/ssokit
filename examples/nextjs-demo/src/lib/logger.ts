import crypto from 'crypto';

const isDebugEnabled = process.env.SSOJET_DEBUG === 'true' || process.env.NODE_ENV === 'development';

// ANSI color codes for better visual distinction
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',
};

// Generate short unique ID for request correlation
function generateRequestId(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase();
}

export class Logger {
  private static activeRequests = new Map<string, { startTime: number; method: string; url: string }>();

  static formatTimestamp(): string {
    return new Date().toISOString().replace('T', ' ').replace('Z', '');
  }

  static formatDuration(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  // API Route Logging
  static apiRouteStart(method: string, url: string, params?: any): string {
    if (!isDebugEnabled) return '';
    
    const requestId = generateRequestId();
    const timestamp = this.formatTimestamp();
    
    console.log(
      `\n${colors.cyan}╭─────────────────────────────────────────────────────────────────────────────────╮${colors.reset}`
    );
    console.log(
      `${colors.cyan}│${colors.reset} ${colors.bright}${colors.blue}[${requestId}]${colors.reset} ${colors.bright}API Route${colors.reset} ${colors.gray}${timestamp}${colors.reset} ${colors.cyan}│${colors.reset}`
    );
    console.log(
      `${colors.cyan}├─────────────────────────────────────────────────────────────────────────────────┤${colors.reset}`
    );
    console.log(
      `${colors.cyan}│${colors.reset} ${colors.green}→${colors.reset} ${colors.bright}${method}${colors.reset} ${url} ${colors.cyan}│${colors.reset}`
    );
    
    if (params && Object.keys(params).length > 0) {
      console.log(
        `${colors.cyan}│${colors.reset} ${colors.yellow}📦${colors.reset} Params: ${JSON.stringify(params)} ${colors.cyan}│${colors.reset}`
      );
    }
    
    this.activeRequests.set(requestId, { 
      startTime: Date.now(), 
      method, 
      url: url.split('?')[0] // Remove query params for cleaner display
    });
    
    return requestId;
  }

  static apiRouteEnd(requestId: string, result?: any, error?: any): void {
    if (!isDebugEnabled || !requestId) return;
    
    const request = this.activeRequests.get(requestId);
    if (!request) return;
    
    const duration = Date.now() - request.startTime;
    const durationStr = this.formatDuration(duration);
    
    if (error) {
      console.log(
        `${colors.cyan}│${colors.reset} ${colors.red}✘${colors.reset} ${colors.red}ERROR${colors.reset} (${durationStr}) ${error.message || error} ${colors.cyan}│${colors.reset}`
      );
    } else {
      console.log(
        `${colors.cyan}│${colors.reset} ${colors.green}✓${colors.reset} ${colors.green}SUCCESS${colors.reset} (${durationStr}) ${colors.cyan}│${colors.reset}`
      );
      
      if (result && typeof result === 'object') {
        const resultInfo = Array.isArray(result) 
          ? `Array[${result.length}]`
          : `Object{${Object.keys(result).length} keys}`;
        console.log(
          `${colors.cyan}│${colors.reset} ${colors.blue}📤${colors.reset} Result: ${resultInfo} ${colors.cyan}│${colors.reset}`
        );
      }
    }
    
    console.log(
      `${colors.cyan}╰─────────────────────────────────────────────────────────────────────────────────╯${colors.reset}\n`
    );
    
    this.activeRequests.delete(requestId);
  }

  static apiRouteLog(requestId: string, message: string, data?: any): void {
    if (!isDebugEnabled || !requestId) return;
    
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    console.log(
      `${colors.cyan}│${colors.reset} ${colors.blue}ℹ${colors.reset} ${message}${dataStr} ${colors.cyan}│${colors.reset}`
    );
  }

  // SSOJet API Client Logging
  static ssojetRequestStart(method: string, url: string, headers?: any, body?: any): string {
    if (!isDebugEnabled) return '';
    
    const requestId = generateRequestId();
    const timestamp = this.formatTimestamp();
    
    console.log(
      `\n${colors.magenta}╭─────────────────────────────────────────────────────────────────────────────────╮${colors.reset}`
    );
    console.log(
      `${colors.magenta}│${colors.reset} ${colors.bright}${colors.magenta}[${requestId}]${colors.reset} ${colors.bright}SSOJet API${colors.reset} ${colors.gray}${timestamp}${colors.reset} ${colors.magenta}│${colors.reset}`
    );
    console.log(
      `${colors.magenta}├─────────────────────────────────────────────────────────────────────────────────┤${colors.reset}`
    );
    console.log(
      `${colors.magenta}│${colors.reset} ${colors.yellow}🚀${colors.reset} ${colors.bright}${method}${colors.reset} ${url} ${colors.magenta}│${colors.reset}`
    );
    
    if (headers && headers.Authorization) {
      console.log(
        `${colors.magenta}│${colors.reset} ${colors.blue}🔑${colors.reset} Auth: ${headers.Authorization.substring(0, 20)}... ${colors.magenta}│${colors.reset}`
      );
    }
    
    if (body) {
      const bodyPreview = typeof body === 'string' ? body.substring(0, 100) : JSON.stringify(body).substring(0, 100);
      console.log(
        `${colors.magenta}│${colors.reset} ${colors.yellow}📦${colors.reset} Body: ${bodyPreview}${body.length > 100 ? '...' : ''} ${colors.magenta}│${colors.reset}`
      );
    }
    
    this.activeRequests.set(requestId, { 
      startTime: Date.now(), 
      method, 
      url
    });
    
    return requestId;
  }

  static ssojetRequestEnd(requestId: string, status: number, statusText: string, data?: any, error?: any): void {
    if (!isDebugEnabled || !requestId) return;
    
    const request = this.activeRequests.get(requestId);
    if (!request) return;
    
    const duration = Date.now() - request.startTime;
    const durationStr = this.formatDuration(duration);
    
    if (error || status >= 400) {
      console.log(
        `${colors.magenta}│${colors.reset} ${colors.red}✘${colors.reset} ${colors.red}${status} ${statusText}${colors.reset} (${durationStr}) ${colors.magenta}│${colors.reset}`
      );
      if (error) {
        const errorMsg = error.message || error;
        console.log(
          `${colors.magenta}│${colors.reset} ${colors.red}🚨${colors.reset} ${errorMsg} ${colors.magenta}│${colors.reset}`
        );
      }
    } else {
      console.log(
        `${colors.magenta}│${colors.reset} ${colors.green}✓${colors.reset} ${colors.green}${status} ${statusText}${colors.reset} (${durationStr}) ${colors.magenta}│${colors.reset}`
      );
    }
    
    if (data && typeof data === 'object') {
      const dataInfo = Array.isArray(data) 
        ? `Array[${data.length}]`
        : `Object{${Object.keys(data).length} keys}`;
      console.log(
        `${colors.magenta}│${colors.reset} ${colors.blue}📥${colors.reset} Data: ${dataInfo} ${colors.magenta}│${colors.reset}`
      );
    }
    
    console.log(
      `${colors.magenta}╰─────────────────────────────────────────────────────────────────────────────────╯${colors.reset}\n`
    );
    
    this.activeRequests.delete(requestId);
  }

  // Session & Auth Logging
  static authLog(message: string, data?: any): void {
    if (!isDebugEnabled) return;
    
    const timestamp = this.formatTimestamp();
    console.log(
      `${colors.yellow}🔐 [AUTH] ${colors.gray}${timestamp}${colors.reset} ${message}`,
      data ? data : ''
    );
  }

  // General Debug Logging
  static debug(category: string, message: string, data?: any): void {
    if (!isDebugEnabled) return;
    
    const timestamp = this.formatTimestamp();
    console.log(
      `${colors.gray}🔍 [${category.toUpperCase()}] ${timestamp}${colors.reset} ${message}`,
      data ? data : ''
    );
  }
}