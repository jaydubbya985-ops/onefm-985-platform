/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // ── ONE FM V3 Brand System (source: brand_system_v3) ──
        "one-navy":    "#071D3A",   // Deep Broadcast Navy
        "one-blue":    "#1B458F",   // ONE FM Blue (core identity)
        "one-blue-bright": "#0A5EB7",
        "one-deep-blue": "#0A2A5E",
        "one-midnight": "#020A18",
        "one-electric": ({ opacityValue }) =>
          opacityValue === undefined
            ? 'var(--one-electric)'
            : `rgba(var(--one-electric-rgb), ${opacityValue})`,
        "one-neon-sky": "#38BDF8",  // Neon Sky Blue (daily UI accent)
        "one-gold":    "#D4AF37",   // Heritage Gold (premium accent only)
        "one-champagne": "#F4D27A",
        "one-red":     "#E51636",   // 98.5 Red (core identity)
        "one-white":   "#FFFFFF",
        "one-muted":   "#9EA6AE",
        "one-border":  "#1A2A42",
        "one-neon-orange": "#FF6A00", // Sport/event alert only
        "one-fluoro-lime": "#B6FF00", // Specialist accent only
        "one-magenta": "#FF2BD6",     // Specialist accent only
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        "data-teal": "#2EC4B6",
        "data-coral": "#FF6B6B",
        "data-violet": "#9B5DE5",
        "data-ice": "#00BBF9",
        "sage": "#74BF8A",
        // ── Design system aliases (MediaKit, AuthModal, etc.) ──
        "gold": "#D4AF37",       // same as one-gold; used by MediaKit/Auth
        "onyx": "#0A1628",       // deep navy-black (input bg, dialog bg)
        "chalk": "#C4CFDB",      // muted blue-white body text
        "ivory": "#EEE8DC",      // warm off-white text on dark surfaces
        "signal-red": "#E51636", // alias for one-red
        "border-dark": "#1A2A42", // alias for one-border
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        heading: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        glass: "0 8px 32px rgba(0,0,0,0.3)",
        glow: "0 0 24px rgba(212,168,75,0.25)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "pulse-dot": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(227,30,36,0.7)" },
          "50%": { boxShadow: "0 0 0 8px rgba(227,30,36,0)" },
        },
        "signal-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(212,168,75,0.6)" },
          "50%": { boxShadow: "0 0 0 6px rgba(212,168,75,0)" },
        },
        "waveform": {
          "0%, 100%": { transform: "scaleY(0.5)" },
          "50%": { transform: "scaleY(1)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "gradient-rotate": {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        /* ── NEW ── */
        "marquee": {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0%)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(212,168,75,0.15), 0 0 40px rgba(212,168,75,0.05)" },
          "50%": { boxShadow: "0 0 40px rgba(212,168,75,0.35), 0 0 80px rgba(212,168,75,0.12)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "slide-in-left": {
          from: { opacity: "0", transform: "translateX(-24px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        "ken-burns": {
          "0%":   { transform: "scale(1) translate(0, 0)" },
          "50%":  { transform: "scale(1.08) translate(-1%, -1%)" },
          "100%": { transform: "scale(1) translate(0, 0)" },
        },
        "scan-line": {
          "0%":   { transform: "translateY(-4px)", opacity: "0" },
          "5%":   { opacity: "1" },
          "95%":  { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        "border-glow": {
          "0%, 100%": { borderColor: "rgba(212,168,75,0.3)" },
          "50%":      { borderColor: "rgba(212,168,75,0.7)" },
        },
      },
      animation: {
        "accordion-down":  "accordion-down 0.2s ease-out",
        "accordion-up":    "accordion-up 0.2s ease-out",
        "caret-blink":     "caret-blink 1.25s ease-out infinite",
        "pulse-dot":       "pulse-dot 2s ease-in-out infinite",
        "signal-pulse":    "signal-pulse 2s ease-in-out infinite",
        "waveform":        "waveform 1.2s ease-in-out infinite",
        "float":           "float 3s ease-in-out infinite",
        "gradient-rotate": "gradient-rotate 6s ease infinite",
        /* ── NEW ── */
        "marquee":         "marquee 32s linear infinite",
        "marquee-fast":    "marquee 16s linear infinite",
        "marquee-slow":    "marquee 60s linear infinite",
        "marquee-reverse": "marquee-reverse 32s linear infinite",
        "shimmer":         "shimmer 2.4s linear infinite",
        "glow-pulse":      "glow-pulse 3s ease-in-out infinite",
        "fade-up":         "fade-up 0.5s ease-out forwards",
        "fade-in":         "fade-in 0.4s ease-out forwards",
        "scale-in":        "scale-in 0.4s ease-out forwards",
        "slide-in-right":  "slide-in-right 0.5s ease-out forwards",
        "slide-in-left":   "slide-in-left 0.5s ease-out forwards",
        "ken-burns":       "ken-burns 24s ease-in-out infinite",
        "scan-line":       "scan-line 6s linear infinite",
        "border-glow":     "border-glow 2.5s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
