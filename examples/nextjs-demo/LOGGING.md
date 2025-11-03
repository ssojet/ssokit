# Enhanced Debug Logging System

This document describes the improved logging system that provides better formatted and organized logs for API requests and responses.

## Features

### 🎨 **Visual Distinction**
- **Color-coded output** to distinguish between different log types
- **Unique request IDs** to correlate requests and responses
- **Structured formatting** with clear borders and sections
- **Request timing** with performance metrics

### 📊 **Log Categories**

#### 1. API Route Logs (Cyan)
```
╭─────────────────────────────────────────────────────────────────────────────────╮
│ [A1B2C3D4] API Route 2025-11-02 10:30:15.123                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│ → GET /api/authkit/orgs/123/members                                              │
│ 📦 Params: {"orgId":"123"}                                                       │
│ ✓ SUCCESS (245ms)                                                                │
│ 📤 Result: Array[5]                                                             │
╰─────────────────────────────────────────────────────────────────────────────────╯
```

#### 2. SSOJet API Client Logs (Magenta)
```
╭─────────────────────────────────────────────────────────────────────────────────╮
│ [E5F6G7H8] SSOJet API 2025-11-02 10:30:15.456                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 🚀 GET https://api.ssojet.com/api/v1/tenants/123/users                          │
│ 🔑 Auth: Bearer sk_live_abcd...                                                 │
│ ✓ 200 OK (189ms)                                                                │
│ 📥 Data: Array[5]                                                               │
╰─────────────────────────────────────────────────────────────────────────────────╯
```

#### 3. Authentication Logs (Yellow)
```
🔐 [AUTH] 2025-11-02 10:30:15.123 Session validated { userId: 'user123', email: 'user@example.com', organizations: 3 }
```

#### 4. General Debug Logs (Gray)
```
🔍 [DEBUG] 2025-11-02 10:30:15.123 Custom debug message { data: 'example' }
```

## Configuration

### Environment Variables
```bash
# Enable debug logging (required)
SSOJET_DEBUG=true

# OR enable for development automatically
NODE_ENV=development
```

### Usage Examples

#### In API Routes
```typescript
import { Logger } from '@/lib/logger';

// Automatic logging with withAuth wrapper
export async function GET(request: NextRequest, { params }: { params: { orgId: string } }) {
  return withAuth(request, params, async (session, { orgId }) => {
    const client = createSSOJetClient(session);
    return await client.listMembers(orgId);
  });
}
```

#### Manual Logging
```typescript
import { Logger } from '@/lib/logger';

// Authentication events
Logger.authLog('User login attempt', { userId: 'user123' });

// Custom debug logs
Logger.debug('VALIDATION', 'Input validation passed', { input: data });
```

## Request Correlation

Each API request gets a unique 8-character ID (e.g., `A1B2C3D4`) that allows you to:

1. **Track request flow**: Follow a single request from API route through to SSOJet API
2. **Performance monitoring**: See timing for each step in the request chain
3. **Error debugging**: Correlate errors with specific requests

### Example Flow
```
╭─────────────────────────────────────────────────────────────────────────────────╮
│ [REQ12345] API Route 2025-11-02 10:30:15.100                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│ → GET /api/authkit/orgs/123/members                                              │
╰─────────────────────────────────────────────────────────────────────────────────╯

🔐 [AUTH] 2025-11-02 10:30:15.105 Session validated { userId: 'user123' }

╭─────────────────────────────────────────────────────────────────────────────────╮
│ [API67890] SSOJet API 2025-11-02 10:30:15.110                                   │
├─────────────────────────────────────────────────────────────────────────────────┤
│ 🚀 GET https://api.ssojet.com/api/v1/tenants/123/users                          │
│ ✓ 200 OK (180ms)                                                                │
╰─────────────────────────────────────────────────────────────────────────────────╯

╭─────────────────────────────────────────────────────────────────────────────────╮
│ [REQ12345] API Route (continued)                                                 │
│ ✓ SUCCESS (200ms)                                                                │
╰─────────────────────────────────────────────────────────────────────────────────╯
```

## Performance Insights

The logging system provides detailed performance metrics:

- **Request duration** in milliseconds or seconds
- **Individual step timing** for debugging bottlenecks
- **Data size indicators** (Array length, Object key count)
- **HTTP status codes** with success/error indicators

## Error Handling

Errors are clearly highlighted with:

- **Red indicators** (✘) for failed requests
- **Error messages** with full context
- **Stack traces** in development mode
- **Correlation IDs** to trace error sources

## Benefits

1. **Easier Debugging**: Clear separation from Next.js framework logs
2. **Performance Monitoring**: Built-in timing and metrics
3. **Request Tracing**: Follow requests through the entire stack
4. **Production Ready**: Controlled by environment variables
5. **Visual Clarity**: Color-coded, structured output

## Troubleshooting

### No Logs Appearing
- Ensure `SSOJET_DEBUG=true` is set in your `.env.local`
- Check that you're running in development mode (`NODE_ENV=development`)

### Logs Too Verbose
- Set `SSOJET_DEBUG=false` to disable debug logging
- Logs are automatically disabled in production unless explicitly enabled

### Colors Not Working
- Ensure your terminal supports ANSI color codes
- Most modern terminals (VS Code terminal, iTerm2, etc.) support colors by default