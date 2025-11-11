# Pending Invites Implementation Update

## Overview

Updated the `TeamManager` component to properly display pending invitations based on the `status` field in the user's tenant relationship, rather than maintaining a separate invites list.

## Changes Made

### 1. Updated Data Fetching Logic

**Before:**
- Made separate API calls to `listMembers()` and `listInvites()`
- Maintained two separate data structures

**After:**
- Single API call to `listMembers()` 
- Filters users based on their tenant `status` field
- Separates users into:
  - **Active members**: `status === 'active'` or no status
  - **Pending invites**: `status === 'pending'`, `'expired'`, or `'revoked'`

### 2. Status-Based Filtering

The component now processes the API response and separates users by status:

```typescript
if (member.status === 'pending') {
  pendingInvites.push(member);
} else if (member.status === 'active' || !member.status) {
  allMembers.push(member);
} else if (member.status === 'expired' || member.status === 'revoked') {
  pendingInvites.push(member);
}
```

### 3. Type Safety Improvements

Changed invite state from `any[]` to `UIMember[]`:

```typescript
// Before
const [invites, setInvites] = useState<any[]>([]);

// After
const [invites, setInvites] = useState<UIMember[]>([]);
```

### 4. Simplified Invites Display

The invites tab now directly displays the filtered members without transformation:

```typescript
// Before - manual mapping
<MembersTable
  members={invites.map((inv: any) => ({
    id: inv.id,
    userId: inv.id,
    // ... manual mapping
  }))}
/>

// After - direct use
<MembersTable
  members={invites}
/>
```

## API Response Format

The component now expects the following response format from `listMembers()`:

```json
{
  "users": [
    {
      "id": "6910c7e5f89925dfe41035cf",
      "email": "user@example.com",
      "tenants": [
        {
          "tenant_id": "6912df61974098fdf0d0fb48",
          "tenant_name": "Organization Name",
          "roles": [
            {
              "role_id": "68ff5da7f5ae473a1afe27e7",
              "role_name": "Owner"
            }
          ],
          "status": "pending"  // ← Key field for filtering
        }
      ],
      "created_at": "2025-11-09T16:57:09.996Z",
      "is_active": true
    }
  ]
}
```

## Status Values

The component handles the following status values:

| Status | Tab | Description |
|--------|-----|-------------|
| `active` | Members | Active team member |
| `pending` | Pending Invites | Invitation sent, awaiting acceptance |
| `expired` | Pending Invites | Invitation expired |
| `revoked` | Pending Invites | Invitation cancelled |
| `undefined` | Members | Defaults to active (backward compatibility) |

## Benefits

1. **Single Source of Truth**: No need to sync separate members and invites lists
2. **Simpler API**: Reduces API calls from 3 to 2 (removed `listInvites()`)
3. **Type Safety**: Consistent `UIMember` type throughout
4. **Better UX**: Status badges automatically show in both tabs
5. **Less Code**: Removed manual data transformation for invites

## Status Badge Display

The existing status badge implementation in `MembersTable.tsx` now works for both tabs:

- **Members tab**: Shows "active" status (green)
- **Pending Invites tab**: Shows "pending", "expired", or "revoked" status with appropriate colors

## Migration Notes

If you have custom code that relies on the old `listInvites()` API:

### Before
```typescript
const invites = await client.listInvites(organizationId);
```

### After
```typescript
const response = await client.listMembers(organizationId);
const pendingInvites = response.users.filter(user => {
  const tenant = user.tenants.find(t => t.tenant_id === organizationId);
  return tenant?.status === 'pending';
});
```

## Testing Checklist

- [x] Build succeeds with no TypeScript errors
- [ ] Members tab shows only active users
- [ ] Pending Invites tab shows users with status "pending"
- [ ] Status badges display correctly in both tabs
- [ ] Resend invite button works for pending invitations
- [ ] Count badges on tabs show correct numbers

## Files Modified

1. **`packages/ssokit-team/src/TeamManager.tsx`**
   - Updated `fetchData()` to filter by status
   - Changed invites state type from `any[]` to `UIMember[]`
   - Simplified invites tab rendering
   - Updated `handleResendInvite()` documentation

## Backward Compatibility

The changes maintain backward compatibility:
- Users without a `status` field default to "active"
- Existing `transformUserToMember()` function already handles the status field
- No breaking changes to component props or API

---

**Updated**: November 11, 2025
