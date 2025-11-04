'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { RoleDefinition } from '@ssojet/ssokit-core';

export interface InviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onInvite: (email: string, role: string) => Promise<void>;
  roles: RoleDefinition[];
  isLoading?: boolean;
}

/**
 * InviteDialog - Modal for inviting new team members
 */
export function InviteDialog({
  isOpen,
  onClose,
  onInvite,
  roles,
  isLoading = false,
}: InviteDialogProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Set default role when roles are available
  useEffect(() => {
    if (roles && roles.length > 0 && !roles.find(r => r.name === role) && roles[0]) {
      setRole(roles[0].name);
    }
  }, [roles, role]);

  // Focus management
  useEffect(() => {
    if (isOpen) {
      emailInputRef.current?.focus();
    }
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');

      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      setSubmitting(true);
      try {
        await onInvite(email, role);
        setEmail('');
        setRole('member');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send invite');
      } finally {
        setSubmitting(false);
      }
    },
    [email, role, onInvite]
  );

  if (!isOpen) return null;

  return (
    <div
      className="sk-dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-dialog-title"
    >
      <div ref={dialogRef} className="sk-dialog">
        <div className="sk-dialog__header">
          <h2 id="invite-dialog-title" className="sk-dialog__title">
            Invite Team Member
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="sk-dialog__close"
            aria-label="Close dialog"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sk-dialog__content">
          <div className="sk-form-field">
            <label htmlFor="invite-email" className="sk-label">
              Email address
            </label>
            <input
              ref={emailInputRef}
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="sk-input"
              placeholder="colleague@example.com"
              required
              disabled={submitting || isLoading}
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? 'invite-error' : undefined}
            />
          </div>

          <div className="sk-form-field">
            <label htmlFor="invite-role" className="sk-label">
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="sk-select"
              disabled={submitting || isLoading}
            >
              {roles.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            <p className="sk-help-text">
              {roles.find((r) => r.name === role)?.description}
            </p>
          </div>

          {error && (
            <div id="invite-error" className="sk-error" role="alert">
              {error}
            </div>
          )}

          <div className="sk-dialog__footer">
            <button
              type="button"
              onClick={onClose}
              className="sk-button sk-button--secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="sk-button sk-button--primary"
              disabled={submitting || isLoading || !email}
            >
              {submitting ? 'Sending...' : 'Send Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
