import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Loader2, Mail, Lock, User, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { resetPendingCopy, resetRequestedToast, signupRequestedToast } from '@/lib/authCopy'
import { BANK_ACCOUNT, BANK_ACCOUNT_NAME, BANK_BSB } from '@/lib/bankDetails'
import { BRAND } from '@/lib/brand'
import { formatCoverageShort } from '@/lib/coverageCopy'
import { STATION_PHOTOS } from '@/lib/stationPhotos'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'login' | 'signup' | 'reset'
}

/** Unused GVL archive still — celebration, not a named presenter portrait. */
function AuthModalStill() {
  return (
    <div className="relative mb-1 h-28 overflow-hidden rounded-md">
      <img
        src={STATION_PHOTOS.gvlTownersWin}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-one-navy via-one-navy/40 to-transparent"
      />
    </div>
  )
}

export function AuthModal({
  open,
  onOpenChange,
  defaultTab = 'login',
}: AuthModalProps) {
  const { login, signup, resetPassword, loading } = useAuth()
  const [tab, setTab] = useState<'login' | 'signup' | 'reset'>(defaultTab)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [resetSent, setResetSent] = useState(false)

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setName('')
    setResetSent(false)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }
    setIsSubmitting(true)
    try {
      await login(email, password)
      toast.success('Signed in successfully')
      resetForm()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to sign in')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !name) {
      toast.error('Please fill in all fields')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setIsSubmitting(true)
    try {
      await signup(email, password, { full_name: name })
      toast.success(signupRequestedToast())
      resetForm()
      onOpenChange(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast.error('Please enter your email')
      return
    }
    setIsSubmitting(true)
    try {
      await resetPassword(email)
      setResetSent(true)
      toast.success(resetRequestedToast())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset link')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-one-navy border-border-dark text-ivory max-w-md">
        <AuthModalStill />
        <DialogHeader>
          <DialogTitle className="font-h3 text-gold-gradient text-center">
            {tab === 'login' && 'Staff sign-in'}
            {tab === 'signup' && 'Staff account'}
            {tab === 'reset' && 'Reset password'}
          </DialogTitle>
          <DialogDescription className="font-body-small text-muted text-center">
            {tab === 'login' &&
              'Station staff only — email and password. This is not a public donations or proposals login.'}
            {tab === 'signup' &&
              'Accounts are issued by the station. Listeners support ONE FM by NAB transfer, not a member dashboard.'}
            {tab === 'reset' &&
              'If this email has a staff account, we will send a reset link.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v as 'login' | 'signup' | 'reset')
            resetForm()
          }}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-3 bg-onyx">
            <TabsTrigger
              value="login"
              className="font-label text-xs data-[state=active]:bg-one-gold data-[state=active]:text-onyx"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="font-label text-xs data-[state=active]:bg-one-gold data-[state=active]:text-onyx"
            >
              Sign Up
            </TabsTrigger>
            <TabsTrigger
              value="reset"
              className="font-label text-xs data-[state=active]:bg-one-gold data-[state=active]:text-onyx"
            >
              Reset
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin} className="space-y-4 mt-4">
              <div>
                <Label className="font-label text-muted text-xs flex items-center gap-1">
                  <Mail size={12} /> Email
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@fm985.com.au"
                  className="bg-onyx border-border-dark text-ivory mt-1"
                  required
                />
              </div>
              <div>
                <Label className="font-label text-muted text-xs flex items-center gap-1">
                  <Lock size={12} /> Password
                </Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Your password"
                  className="bg-onyx border-border-dark text-ivory mt-1"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-one-gold text-onyx hover:bg-gold font-label text-xs rounded-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup">
            <form onSubmit={handleSignup} className="space-y-4 mt-4">
              <div>
                <Label className="font-label text-muted text-xs flex items-center gap-1">
                  <User size={12} /> Full Name
                </Label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="bg-onyx border-border-dark text-ivory mt-1"
                  required
                />
              </div>
              <div>
                <Label className="font-label text-muted text-xs flex items-center gap-1">
                  <Mail size={12} /> Email
                </Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@fm985.com.au"
                  className="bg-onyx border-border-dark text-ivory mt-1"
                  required
                />
              </div>
              <div>
                <Label className="font-label text-muted text-xs flex items-center gap-1">
                  <Lock size={12} /> Password
                </Label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="bg-onyx border-border-dark text-ivory mt-1"
                  required
                />
              </div>
              <div>
                <Label className="font-label text-muted text-xs flex items-center gap-1">
                  <Lock size={12} /> Confirm Password
                </Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="bg-onyx border-border-dark text-ivory mt-1"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-one-gold text-onyx hover:bg-gold font-label text-xs rounded-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1" />
                    Creating account...
                  </>
                ) : (
                  'Create staff account'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="reset">
            {resetSent ? (
              <div className="text-center py-8">
                <CheckCircle2 size={48} className="text-data-teal mx-auto mb-4" />
                <h3 className="font-h4 text-ivory mb-2">Reset requested</h3>
                <p className="font-body-small text-chalk mb-6">
                  {resetPendingCopy(email)}
                </p>
                <Button
                  variant="outline"
                  className="font-label text-xs border-ivory/40 rounded-full"
                  onClick={() => {
                    setTab('login')
                    resetForm()
                  }}
                >
                  <ArrowLeft size={12} className="mr-1" /> Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4 mt-4">
                <div>
                  <Label className="font-label text-muted text-xs flex items-center gap-1">
                    <Mail size={12} /> Email
                  </Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@fm985.com.au"
                    className="bg-onyx border-border-dark text-ivory mt-1"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full bg-one-gold text-onyx hover:bg-gold font-label text-xs rounded-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1" />
                      Requesting...
                    </>
                  ) : (
                    'Request reset link'
                  )}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>

        <p className="mt-5 text-center font-body-small text-[11px] text-muted leading-relaxed">
          Public support is NAB transfer to {BANK_ACCOUNT_NAME}, BSB {BANK_BSB},
          account {BANK_ACCOUNT} — see Support. Not Stripe, not a logged-in
          donations account.{' '}
          <a href={`mailto:${BRAND.email}`} className="text-one-gold hover:underline">
            {BRAND.email}
          </a>
        </p>
        <p className="mt-2 text-center text-[11px] text-one-muted/80">
          {formatCoverageShort()} — ABS 2021 via townData
        </p>
      </DialogContent>
    </Dialog>
  )
}
