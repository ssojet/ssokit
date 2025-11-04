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
  const [role, setRole] = useState('member');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

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
      className="ak-dialog-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invite-dialog-title"
    >
      <div ref={dialogRef} className="ak-dialog">
        <div className="ak-dialog__header">
          <h2 id="invite-dialog-title" className="ak-dialog__title">
            Invite Team Member
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="ak-dialog__close"
            aria-label="Close dialog"
            disabled={submitting}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="ak-dialog__content">
          <div className="ak-form-field">
            <label htmlFor="invite-email" className="ak-label">
              Email address
            </label>
            <input
              ref={emailInputRef}
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ak-input"
              placeholder="colleague@example.com"
              required
              disabled={submitting || isLoading}
              aria-required="true"
              aria-invalid={!!error}
              aria-describedby={error ? 'invite-error' : undefined}
            />
          </div>

          <div className="ak-form-field">
            <label htmlFor="invite-role" className="ak-label">
              Role
            </label>
            <select
              id="invite-role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="ak-select"
              disabled={submitting || isLoading}
            >
              {roles.map((r) => (
                <option key={r.name} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
            <p className="ak-help-text">
              {roles.find((r) => r.name === role)?.description}
            </p>
          </div>

          {error && (
            <div id="invite-error" className="ak-error" role="alert">
              {error}
            </div>
          )}

          <div className="ak-dialog__footer">
            <button
              type="button"
              onClick={onClose}
              className="ak-button ak-button--secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ak-button ak-button--primary"
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
