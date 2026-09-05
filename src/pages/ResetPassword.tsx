import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '@/components/Layout'
import { SEO } from '@/components/SEO'
import { BRAND } from '@/lib/brand'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [error, setError] = useState('')

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      setStatus('error')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      setStatus('error')
      return
    }
    if (!isSupabaseConfigured()) {
      setError('Staff auth is not configured in this deploy.')
      setStatus('error')
      return
    }
    setStatus('saving')
    setError('')
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setStatus('error')
      return
    }
    setStatus('saved')
  }

  return (
    <Layout hideFooter>
      <SEO
        title="Reset staff password"
        description={`Staff password reset for ${BRAND.org} operations. This is not a public account.`}
      />
      <section className="min-h-[70dvh] flex items-center justify-center px-4 py-24 bg-[#101010]">
        <div className="max-w-sm w-full border border-white/10 rounded-xl p-8 bg-[#161616]/92">
          <h1 className="font-h3 text-one-white mb-2">Set a new password</h1>
          <p className="font-body-small text-muted mb-6">
            Open this page from the reset email. Nothing is confirmed sent until that mail arrives.
            Public listeners do not have accounts here.
          </p>
          {status === 'saved' ? (
            <p className="font-body text-one-white" role="status">
              Password updated.{' '}
              <Link to="/ops" className="text-one-gold underline">
                Sign in to operations
              </Link>
              .
            </p>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
              <label className="block">
                <span className="font-label text-xs text-muted uppercase tracking-wider">New password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-2 w-full bg-one-navy border border-one-border rounded-lg px-4 py-3 text-sm text-one-white"
                />
              </label>
              <label className="block">
                <span className="font-label text-xs text-muted uppercase tracking-wider">Confirm</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="mt-2 w-full bg-one-navy border border-one-border rounded-lg px-4 py-3 text-sm text-one-white"
                />
              </label>
              {status === 'error' && error ? (
                <p className="text-xs text-red-400" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={status === 'saving'}
                className="w-full px-4 py-3 rounded-lg bg-one-gold text-one-navy text-sm font-label font-bold disabled:opacity-60"
              >
                {status === 'saving' ? 'Saving…' : 'Update password'}
              </button>
            </form>
          )}
        </div>
      </section>
    </Layout>
  )
}
