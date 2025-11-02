import type { RoleDefinition } from '@ssojet/authkit-core';

export interface RoleSelectorProps {
  value: string;
  roles: RoleDefinition[];
  onChange: (role: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * RoleSelector - Dropdown for selecting member roles
 */
export function RoleSelector({
  value,
  roles,
  onChange,
  disabled = false,
  className = '',
}: RoleSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={`ak-role-selector ${className}`}
      aria-label="Select role"
    >
      {roles.map((role) => (
        <option key={role.name} value={role.name}>
          {role.name}
        </option>
      ))}
    </select>
  );
}
