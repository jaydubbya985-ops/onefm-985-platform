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
import {
  Loader2,
  Mail,
  Lock,
  User,
  ArrowLeft,
  CheckCircle2,
  Chrome,
  Facebook,
} from 'lucide-react'

interface AuthModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'login' | 'signup' | 'reset'
}

export function AuthModal({
  open,
  onOpenChange,
  defaultTab = 'login',
}: AuthModalProps) {
  const { login, signup, resetPassword, loading } = useAuth()
  const [tab, setTab] = useState<'login' | 'signup' | 'reset'>(defaultTab)

  // Form states
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
      toast.success('Account created! Please check your email to verify.')
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
      toast.success('Password reset link sent to your email')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset link')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate border-border-dark text-ivory max-w-md">
        <DialogHeader>
          <DialogTitle className="font-h3 text-ivory text-center">
            {tab === 'login' && 'Welcome Back'}
            {tab === 'signup' && 'Create Account'}
            {tab === 'reset' && 'Reset Password'}
          </DialogTitle>
          <DialogDescription className="font-body-small text-muted text-center">
            {tab === 'login' && 'Sign in to access your proposals and donations'}
            {tab === 'signup' && 'Join ONE FM to save proposals and track donations'}
            {tab === 'reset' && "We'll send you a link to reset your password"}
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
              className="font-label text-xs data-[state=active]:bg-amber data-[state=active]:text-onyx"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="font-label text-xs data-[state=active]:bg-amber data-[state=active]:text-onyx"
            >
              Sign Up
            </TabsTrigger>
            <TabsTrigger
              value="reset"
              className="font-label text-xs data-[state=active]:bg-amber data-[state=active]:text-onyx"
            >
              Reset
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
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
                  placeholder="you@example.com"
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
                className="w-full bg-amber text-onyx hover:bg-gold font-label text-xs rounded-full"
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

            {/* Social login placeholders */}
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border-dark" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-slate px-2 font-label text-muted">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="font-label text-xs border-border-dark text-ivory hover:bg-onyx"
                  onClick={() => toast.info('Google OAuth integration coming soon')}
                >
                  <Chrome size={14} className="mr-1" /> Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="font-label text-xs border-border-dark text-ivory hover:bg-onyx"
                  onClick={() => toast.info('Facebook OAuth integration coming soon')}
                >
                  <Facebook size={14} className="mr-1" /> Facebook
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Signup Tab */}
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
                  placeholder="you@example.com"
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
                className="w-full bg-amber text-onyx hover:bg-gold font-label text-xs rounded-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin mr-1" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </TabsContent>

          {/* Reset Tab */}
          <TabsContent value="reset">
            {resetSent ? (
              <div className="text-center py-8">
                <CheckCircle2 size={48} className="text-data-teal mx-auto mb-4" />
                <h3 className="font-h4 text-ivory mb-2">Check your email</h3>
                <p className="font-body-small text-chalk mb-6">
                  We've sent a password reset link to {email}
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
                    placeholder="you@example.com"
                    className="bg-onyx border-border-dark text-ivory mt-1"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || loading}
                  className="w-full bg-amber text-onyx hover:bg-gold font-label text-xs rounded-full"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin mr-1" />
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </Button>
              </form>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
