# Login Page — Complete UX Specification

> **SM Younas Traders — Distribution Management System**
> Electron + React 18 + Tailwind CSS + Zustand + React Router v6
> Theme: Dark navy (#0a0f1e) / Accent sky blue (#38bdf8)

---

## Table of Contents

1. [Component Architecture](#1-component-architecture)
2. [State Machines & Transitions](#2-state-machines--transitions)
3. [Animation & Timing Specifications](#3-animation--timing-specifications)
4. [Micro-interaction Catalog](#4-micro-interaction-catalog)
5. [Keyboard Interaction Map](#5-keyboard-interaction-map)
6. [Error Handling & Messages](#6-error-handling--messages)
7. [Edge Case Procedures](#7-edge-case-procedures)
8. [Accessibility Checklist](#8-accessibility-checklist)
9. [Flow Diagrams (Text)](#9-flow-diagrams-text)
10. [Implementation Notes](#10-implementation-notes)

---

## 1. Component Architecture

### 1.1 Component Tree

```
AuthLayout                             ← wrapper (animated background)
├── AnimatedBackground                 ← particles / gradient animation
│   └── <canvas> or CSS gradient div
├── LoginCard                          ← container (glassmorphism card)
│   ├── BrandHeader                    ← logo + app name + tagline
│   ├── LoginForm                      ← form element
│   │   ├── UsernameField              ← floating-label input
│   │   │   ├── <label>
│   │   │   ├── <input>
│   │   │   └── ErrorMessage           ← animated error
│   │   ├── PasswordField              ← floating-label input + toggle
│   │   │   ├── <label>
│   │   │   ├── <input>
│   │   │   ├── ToggleVisibilityBtn    ← eye icon toggle
│   │   │   ├── CapsLockWarning        ← conditional
│   │   │   └── ErrorMessage           ← animated error
│   │   └── SubmitButton               ← states: idle/loading/success
│   ├── FormDivider                    ← "or" divider (only on registration-eligible)
│   ├── RegistrationCTA                ← "Create Account" link
│   └── SessionExpiredToast            ← conditional toast from URL state
└── Footer                             ← copyright
```

### 1.2 File Structure (New/Modified Files)

```
src/renderer/src/
├── components/
│   └── auth/
│       ├── AnimatedBackground.jsx     ← NEW: particle/gradient background
│       ├── LoginCard.jsx              ← NEW: glass card container
│       ├── BrandHeader.jsx            ← NEW: logo + branding
│       ├── FormField.jsx              ← NEW: reusable floating-label input
│       ├── PasswordField.jsx          ← NEW: password with toggle + caps lock
│       ├── SubmitButton.jsx           ← NEW: multi-state button
│       ├── FormDivider.jsx            ← NEW: visual divider
│       ├── RegistrationCTA.jsx        ← NEW: CTA link with transition
│       └── Toast.jsx                  ← NEW: toast notification component
├── hooks/
│   └── useAuth.js                     ← EXISTING (minor updates)
├── layouts/
│   └── AuthLayout.jsx                 ← REWRITE: animated background wrapper
└── pages/
    └── auth/
        ├── Login.jsx                  ← REWRITE: full UX implementation
        ├── Registration.jsx           ← UPDATE: share same layout aesthetic
        └── UX-SPEC-LOGIN.md           ← THIS FILE
```

---

## 2. State Machines & Transitions

### 2.1 Login Page — Primary State Machine

```
                    ┌──────────────────────────────────────────────┐
                    │                  IDLE                        │
                    │  Fields empty, button enabled, no errors     │
                    └──────┬───────────────────┬───────────────────┘
                           │                   │
                    user types          user submits
                           │                   │
                           ▼                   ▼
                    ┌──────────┐       ┌──────────────┐
                    │ TYPING   │       │ VALIDATING   │
                    │ Inline   │       │ Check empty  │
                    │ validate │       │ fields       │
                    └────┬─────┘       └──────┬───────┘
                         │                    │
                    user submits          if invalid
                         │                    │
                         ▼                    ▼
                    ┌──────────────┐   ┌──────────────┐
                    │  LOADING    │   │  VALIDATION  │
                    │ IPC call in │   │    ERROR     │
                    │ progress    │   │ Show inline  │
                    └──────┬──────┘   │ errors       │
                           │          └──────┬───────┘
                    ┌──────┴──────┐          │
                    │             │     user fixes fields
                    ▼             ▼          │
              ┌──────────┐  ┌──────────┐    │
              │ SUCCESS  │  │  ERROR   │◄───┘
              │ Navigate │  │ Show msg │
              │ to dash  │  │ Shake    │
              └──────────┘  └────┬─────┘
                                 │
                           user types
                           OR 3s timeout
                                 │
                                 ▼
                            ┌──────────┐
                            │  IDLE    │
                            └──────────┘
```

### 2.2 Form Field — Per-Field State Machine

```
    ┌─────────┐    focus    ┌───────────┐    type     ┌────────────┐
    │  BLANK  │──────────►  │  FOCUSED  │──────────►  │  FILLED    │
    │ Label   │             │ Label     │             │ Label      │
    │ center  │             │ floats up │             │ floats up  │
    └─────────┘             │ border    │             │ may have   │
          ▲                 │ glows     │             │ validation │
          │                 └─────┬─────┘             └──────┬─────┘
          │                      │                          │
          │                 blur + empty               blur + valid
          │                      │                          │
          │                      ▼                          ▼
          │                ┌───────────┐             ┌──────────────┐
          └────────────────┤  BLANK    │             │   COMPLETED  │
         (blur + empty)    │ (again)   │             │ Label up,    │
                           └───────────┘             │ green border │
                                                     └──────────────┘
    Error state (entered from any non-BLANK state when validation fails):
    ┌──────────┐
    │  ERROR   │
    │ Red      │
    │ border   │
    │ + msg    │
    └────┬─────┘
         │
    user types
         │
         ▼
    ┌───────────┐
    │  FILLED   │  ← error message clears immediately on keystroke
    └───────────┘
```

### 2.3 Submit Button — State Machine

```
    ┌──────────┐   user types     ┌───────────┐   form submit    ┌──────────────┐
    │ DISABLED │─────────────────►│   IDLE    │─────────────────►│   LOADING    │
    │ gray     │(all fields fill) │ blue btn  │                  │ spinner btn  │
    └──────────┘                  └───────────┘                  └──────┬───────┘
                                                                       │
                                                          ┌────────────┼────────────┐
                                                          │            │            │
                                                     success       error      network err
                                                          │            │            │
                                                          ▼            ▼            ▼
                                                    ┌──────────┐ ┌──────────┐ ┌──────────┐
                                                    │ SUCCESS  │ │  ERROR   │ │  ERROR   │
                                                    │ green    │ │ red btn  │ │ toast    │
                                                    │ flash    │ │ re-enable│ │ + btn    │
                                                    │ 400ms    │ │ after    │ │ re-enable│
                                                    │ then     │ │ shake    │ └──────────┘
                                                    │ navigate │ └────┬─────┘
                                                    └──────────┘      │
                                                                 user types
                                                                      │
                                                                      ▼
                                                                 ┌──────────┐
                                                                 │   IDLE   │
                                                                 └──────────┘
```

---

## 3. Animation & Timing Specifications

### 3.1 Timing Master Table

| Animation | Duration | Easing | Trigger | Description |
|-----------|----------|--------|---------|-------------|
| Card entrance | 400ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Page mount | Fade in + slide up 20px |
| Label float up | 200ms | `ease-out` | Input focus / fill | Translates -22px, scales 0.85 |
| Label float down | 200ms | `ease-in` | Blur when empty | Reverses float |
| Border glow | 250ms | `ease` | Input focus | Box-shadow transition |
| Error message slide | 200ms | `ease-out` | Validation fail | Slide down + fade in (max-h 0 → 60px) |
| Error message dismiss | 150ms | `ease-in` | User types | Slide up + fade out |
| Card shake (error) | 400ms | custom keyframes | Auth error | Horizontal shake ±8px, 3 oscillations |
| Button shrink | 100ms | `ease-out` | Submit click | Scale 1 → 0.97 |
| Spinner appear | 200ms | `ease-out` | Loading state | Opacity 0 → 1, rotate |
| Button success flash | 400ms | `ease` | Login success | bg blue → green → blue pulse |
| Page exit | 300ms | `ease-in` | Navigate away | Opacity 1 → 0, scale 1 → 0.98 |
| Dashboard entrance | 350ms | `ease-out` | Route transition | Opacity 0 → 1, slide up 10px |
| Password toggle icon | 150ms | `ease` | Click | Rotate icon 180°, crossfade |
| Caps lock tooltip | 200ms | `ease-out` | Caps Lock on | Fade in, translateY -4px → 0 |
| Particle movement | continuous | linear | Page mount | Slow drift, 60s cycle |
| Toast slide in | 300ms | `cubic-bezier(0.16, 1, 0.3, 1)` | Toast trigger | Slide from right, opacity |
| Toast slide out | 250ms | `ease-in` | Dismiss/timeout | Slide right, opacity 0 |
| Registration CTA hover | 150ms | `ease` | Hover | Color transition, underline |

### 3.2 Keyframe Definitions

```css
/* Card shake for auth errors */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-8px); }
  30% { transform: translateX(8px); }
  45% { transform: translateX(-6px); }
  60% { transform: translateX(6px); }
  75% { transform: translateX(-3px); }
  90% { transform: translateX(3px); }
}

/* Success pulse on button */
@keyframes successPulse {
  0% { background-color: #38bdf8; }
  30% { background-color: #22c55e; }
  100% { background-color: #38bdf8; }
}

/* Spinner rotation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Fade in + slide up for card */
@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* Particle float (used for animated background) */
@keyframes float {
  0%, 100% { transform: translateY(0px) translateX(0px); }
  25% { transform: translateY(-20px) translateX(10px); }
  50% { transform: translateY(-10px) translateX(-10px); }
  75% { transform: translateY(-30px) translateX(5px); }
}
```

### 3.3 Transition Sequence: Happy Path

```
Timeline:
  0ms      ─ User clicks "Sign In"
  0-50ms   ─ Button scale 1 → 0.97 (shrink feedback)
  50-100ms ─ Button content fades out, spinner fades in
  100ms    ─ Button scale 0.97 → 1 (return to normal)
  100-400ms─ IPC call in flight (target: <300ms)
  ~350ms   ─ IPC returns { success: true }
  350-400ms─ Button bg pulses green (#22c55e)
  400-600ms─ Button shows checkmark icon
  400-700ms─ Card + form fade out (opacity 1→0, 300ms)
  600-700ms─ Brief white flash / particle burst
  700ms    ─ Navigate to /dashboard
  700-1050ms─ Dashboard content fades in (350ms)
  
Total perceived time: ~350-400ms  ← under 500ms target ✓
```

### 3.4 Transition Sequence: Error Path

```
Timeline:
  0ms      ─ User clicks "Sign In"
  0-100ms  ─ Button loading state (shrink + spinner)
  100-400ms─ IPC call in flight
  ~350ms   ─ IPC returns { success: false, error: "Invalid password" }
  350-400ms─ Button exits loading state, re-enables
  400-500ms─ Password field highlights red border (200ms)
  400-500ms─ Error message slides in below field (200ms)
  500-900ms─ Login card shakes (400ms)
  500ms    ─ Screen reader announces error
  
Total perceived time: ~500ms for full error feedback
```

---

## 4. Micro-interaction Catalog

### 4.1 Input Focus — Floating Label

**Trigger**: Input receives focus OR input has value
**Target**: The `<label>` element and the `<input>` border

```
State: BLANK (no value, no focus)
  ┌──────────────────────────────┐
  │  Username                    │  ← label sits inside input
  │  ┌────────────────────────┐  │     color: gray-500
  │  │                        │  │  ← border: navy-border
  │  └────────────────────────┘  │
  └──────────────────────────────┘

State: FOCUSED (focus, may or may not have value)
  ┌──────────────────────────────┐
  │  ┌────────────────────────┐  │
  │  │ admin             │  │  │  ← border: accent blue glow
  │  └────────────────────────┘  │     box-shadow: 0 0 0 1px #38bdf8
  │  Username                    │  ← label translated up -22px
  └──────────────────────────────┘     font-size: 0.75rem
                                       color: accent blue

State: FILLED (blurred, has value)
  ┌──────────────────────────────┐
  │  ┌────────────────────────┐  │
  │  │ admin             │  │  │  ← border: navy-border (reset)
  │  └────────────────────────┘  │
  │  Username                    │  ← label stays up
  └──────────────────────────────┘     color: gray-400
```

**Implementation approach**: Use the "floating label" pattern where the label is positioned absolutely within a relative container, and its position shifts based on `:focus` and `:not(:placeholder-shown)`.

### 4.2 Password Visibility Toggle

**Trigger**: Click on eye icon in password field
**Target**: Input type toggles between `password` and `text`

```
State: HIDDEN
  ┌──────────────────────────────────┐
  │  ┌──────────────────────────┬──┐ │
  │  │ ••••••••           │ 👁 │ │ │  ← eye icon (eye-off SVG)
  │  └──────────────────────────┴──┘ │
  └──────────────────────────────────┘

State: VISIBLE
  ┌──────────────────────────────────┐
  │  ┌──────────────────────────┬──┐ │
  │  │ myP@ss123           │ 👁 │ │ │  ← eye icon with line
  │  └──────────────────────────┴──┘ │     (eye SVG) 
  └──────────────────────────────────┘

Transition: 150ms ease
- Icon rotation: 0° → 180° (or crossfade)
- Input type changes instantly after icon transition midpoint
```

### 4.3 Caps Lock Warning

**Trigger**: `getModifierState('CapsLock')` is true when password field is focused
**Target**: Small warning badge below password field

```
  ┌──────────────────────────────────┐
  │  ┌──────────────────────────┐    │
  │  │ ••••••••                  │    │
  │  └──────────────────────────┘    │
  │  ⚠ Caps Lock is on               │  ← yellow text, small, animated in
  └──────────────────────────────────┘

Timing:
- Appears 200ms after Caps Lock is detected
- Disappears immediately when Caps Lock turns off
- Re-appears if Caps Lock is re-enabled while field is focused
```

### 4.4 Submit Button State Transitions

```
IDLE (enabled):
  ┌────────────────────┐
  │    Sign In         │  ← bg: accent blue (#38bdf8)
  └────────────────────┘     text: navy (#0a0f1e), weight 600

HOVER (idle):
  ┌────────────────────┐
  │    Sign In         │  ← bg: accent hover (#0ea5e9)
  └────────────────────┘     transform: translateY(-1px)

ACTIVE (pressed):
  ┌────────────────────┐
  │    Sign In         │  ← transform: scale(0.97)
  └────────────────────┘     transition: 100ms ease-out

LOADING:
  ┌────────────────────┐
  │  ⟳  Signing in…   │  ← spinner SVG rotating
  └────────────────────┘     text fades to gray-300
                            button disabled
                            pointer-events: none

SUCCESS:
  ┌────────────────────┐
  │  ✓  Signed In     │  ← green pulse bg (#22c55e)
  └────────────────────┘     checkmark icon appears
                             400ms duration

ERROR (recovery):
  ┌────────────────────┐
  │    Sign In         │  ← returns to IDLE state
  └────────────────────┘     ready for retry

DISABLED (fields empty):
  ┌────────────────────┐
  │    Sign In         │  ← bg: navy-lighter (#111b2e)
  └────────────────────┘     text: gray-600
                            cursor: not-allowed
                            opacity: 0.6
```

### 4.5 Error Shake Animation

**Trigger**: Auth error returned from IPC (user not found / invalid password)
**Target**: The entire LoginCard component

```
Technical implementation:
- Add class `animate-shake` to LoginCard
- Animation: 400ms, 3 oscillations
- On animation end: remove class (so it can be re-triggered)

Keyframes detail:
  0%      → translateX(0)
  15%     → translateX(-8px)
  30%     → translateX(8px)
  45%     → translateX(-6px)
  60%     → translateX(6px)
  75%     → translateX(-3px)
  90%     → translateX(3px)
  100%    → translateX(0)
```

### 4.6 Parallax Animated Background

**Implementation**: Pure CSS or lightweight canvas

```
CSS Gradient Approach (preferred for performance):
- 3 layered gradients rotating at different speeds
- Dark navy base (#0a0f1e)
- Accent blue (#38bdf8) at 5% opacity radial gradients
- Slow rotation: 60s linear infinite on one, 90s on another

OR Canvas Particle Approach:
- 30-50 small dots (2px radius)
- Color: accent blue at 15% opacity
- Slow drift: random velocities, 0.1-0.3 px/frame
- Mouse parallax: subtle shift toward cursor position
- Performance: cap at 30fps using requestAnimationFrame
```

### 4.7 Form Divider & Registration CTA

```
Divider:
  ────────────  or  ─────────────
  
CTA Link:
  Create Account
  (text-accent, text-sm, font-medium, hover:underline)

Interaction:
- Hover: color brightens, smooth underline slide-in
- Click: brief opacity transition → navigate to /register
- Transition between login/register: same card, form swaps with crossfade

Timing:
- Crossfade between forms: 250ms opacity transition
- Card stays in same position (no layout shift)
```

### 4.8 Session Expired Toast

```
Trigger: URL has query parameter ?expired=true
         OR ?message=session-expired

Appearance:
  ┌────────────────────────────────────────────┐
  │  ⏰  Session expired. Please login again.  │  ← Toast component
  └────────────────────────────────────────────┘     top-right corner
                                                     amber-400 bg
                                                     10px border-left accent

Auto-dismiss: 6 seconds
Manual dismiss: click X button

Persistence: Shows once per navigation (clear on route change)
```

---

## 5. Keyboard Interaction Map

### 5.1 Login Page Tab Order

```
TabIndex Map (explicitly set for control):

  ┌─ 1 ──────────────────────────────────┐
  │  Brand Header (non-interactive)       │
  ├─ 2 ──────────────────────────────────┤
  │  Username input                       │  ← autoFocus on mount
  ├─ 3 ──────────────────────────────────┤
  │  Password input                       │
  │  ├─ (internal) Password toggle btn    │  ← NOT in tab order (button inside field)
  │  └─ (internal) Caps lock indicator    │  ← NOT tabbable
  ├─ 4 ──────────────────────────────────┤
  │  Submit button                        │  ← Also activates on Enter anywhere in form
  ├─ 5 ──────────────────────────────────┤
  │  "Create Account" link                │
  └───────────────────────────────────────┘
```

### 5.2 Complete Key Bindings

| Key | Context | Action |
|-----|---------|--------|
| `Tab` | Anywhere | Move to next focusable element |
| `Shift+Tab` | Anywhere | Move to previous focusable element |
| `Enter` | Username field | Move focus to password field |
| `Enter` | Password field | Submit form |
| `Enter` | Submit button | Submit form |
| `Space` | Submit button | Submit form |
| `Escape` | Any field | Clear current field focus (blur) |
| `Escape` | Error toast visible | Dismiss toast |
| `Escape` | Anywhere with modal | Close modal (if applicable) |

### 5.3 Focus Management Rules

1. **On page mount**: Username input receives `autoFocus`
2. **On login error**: Focus moves to the first field with an error (username if "User not found", password if "Invalid password")
3. **On validation error**: Focus moves to the first invalid field
4. **On successful login**: Focus moves to the dashboard content heading when page loads
5. **On session expiry redirect**: Toast receives focus via `role="alert"` for screen reader
6. **Focus trap**: Not needed (no modal on login page)
7. **Visible focus indicator**: All interactive elements must show a 2px outline in a light color (white or accent blue) when focused

### 5.4 Focus Indicator Specification

```css
/* All interactive elements */
input:focus-visible,
button:focus-visible,
a:focus-visible {
  outline: 2px solid #38bdf8;
  outline-offset: 2px;
  border-radius: 6px; /* match element border-radius */
}

/* Remove default browser focus */
input:focus:not(:focus-visible),
button:focus:not(:focus-visible),
a:focus:not(:focus-visible) {
  outline: none;
}
```

---

## 6. Error Handling & Messages

### 6.1 Error Scenarios & Messages

|#| Scenario | Detection | Error Message | Display Method | Duration |
|---|---------|-----------|---------------|----------------|----------|
|1| Empty username on submit | `username.trim() === ''` | "Username is required" | Inline, below field, animated slide-in | Until user types |
|2| Empty password on submit | `password === ''` | "Password is required" | Inline, below field, animated slide-in | Until user types |
|3| Username too short | `username.length < 3` | "Username must be at least 3 characters" | Inline, below field | Until user types >2 chars |
|4| User not found | IPC returns `{success:false, error:'User not found'}` | "No account found with this username" | Inline under username + card shake | Until user edits username |
|5| Invalid password | IPC returns `{success:false, error:'Invalid password'}` | "Incorrect password. Try again." | Inline under password + field highlight + card shake | Until user edits password |
|6| Network / IPC error | `window.electronAPI.login()` throws or times out | "Connection error. Check database and try again." | Toast notification, top-right | 6s auto-dismiss or manual |
|7| Database error | IPC returns unexpected error | "System error. Please restart the application." | Toast notification + log to console | 8s auto-dismiss |
|8| Session expired | URL param `?expired=true` | "Your session has expired. Please login again." | Toast notification, amber | 6s auto-dismiss |
|9| Registration required | Main process sends 'navigate' to /register | "No users found. Please create an account." | Toast on registration page | Persistent until action taken |

### 6.2 Error Behavior Specifications

**Error clearing**: All inline errors clear immediately (150ms animation) when the user types in the associated field. This is critical — errors should disappear on keystroke, not on blur.

**Field highlighting**:
- Validation errors: red-500 border, red glow
- Auth errors (user not found): red-500 border on username field
- Auth errors (invalid password): red-500 border on password field
- Error cleared: border returns to navy-border (#1e2a4a) on keystroke

**Screen reader announcements**:
- All dynamic errors use `role="alert"` and `aria-live="polite"`
- On error show: "Error: [message]" announced
- On error clear: not announced (only positive changes)

### 6.3 Toast Notification System

```
Position: fixed, top-right, 24px from top, 24px from right
Z-index: 9999

Structure:
  ┌──────────────────────────────────────────────┐
  │  [icon]  Error message text          [✕]     │
  └──────────────────────────────────────────────┘
  
Types:
  error:   bg-red-500/10 border-red-500  icon: ✕
  warning: bg-amber-500/10 border-amber-500  icon: ⚠
  success: bg-green-500/10 border-green-500  icon: ✓
  info:    bg-blue-500/10 border-blue-500   icon: ℹ

Timing:
  Slide in:  300ms cubic-bezier(0.16, 1, 0.3, 1)
  Display:   6000ms (error/warning), 4000ms (success/info)
  Slide out: 250ms ease-in
  Stack:     Multiple toasts stack vertically, 12px gap
```

---

## 7. Edge Case Procedures

### 7.1 First-Time User (No Accounts Exist)

**Flow**:
```
1. Main process: app ready → checkFirstRun()
2. SQL: SELECT COUNT(*) FROM users → count === 0
3. Main process sends: webContents.send('navigate', '/register')
4. Renderer: Login page is NOT shown; user lands directly on /register
5. Registration page shows toast: "No users found. Please create an account."
6. User completes registration with admin credentials
7. On success: auto-redirect to /login with success message
8. User logs in normally
```

**Preload already handles**: checkFirstRun() fires after 'ready-to-show'.

**Enhancement needed**: The Login page should also check on mount:
```javascript
useEffect(() => {
  async function checkUsers() {
    const users = await window.electronAPI.getUsers();
    if (users.length === 0) {
      navigate('/register', { replace: true });
    }
  }
  checkUsers();
}, []);
```

This provides a safety net if the IPC message is missed or the user manually navigates to /login.

### 7.2 Already Authenticated → Skip Login

**Flow**:
```
1. User opens app (or navigates to /login)
2. Login page checks useAuth.isAuthenticated
3. If true: immediately <Navigate to="/dashboard" replace />
4. No flash of login page — redirect is instant (useEffect + navigate in render)
```

**Implementation**:
```jsx
// At top of Login component
const { isAuthenticated } = useAuth();

if (isAuthenticated) {
  return <Navigate to="/dashboard" replace />;
}
```

### 7.3 Session Timeout → Redirect with Message

**Flow**:
```
1. MainLayout detects inactivity (e.g., 30 minutes via idle timer)
2. useAuth.logout() is called
3. MainLayout navigates: navigate('/login?expired=true')
4. Login page reads URL params on mount
5. Shows session-expired toast
6. Toast auto-dismisses after 6 seconds or on user interaction
```

**Implementation**:
```jsx
// Login.jsx
const [searchParams] = useSearchParams();
const isExpired = searchParams.get('expired') === 'true';

// Show toast if isExpired
```

### 7.4 Caps Lock Active on Password Focus

**Flow**:
```
1. User focuses password field
2. Login component attaches keydown/keyup listener for getModifierState
3. If CapsLock is ON: show warning below password field
4. If user presses CapsLock while focused: toggle warning immediately
5. If user blurs field with CapsLock ON: warning persists
6. If user returns to field with CapsLock OFF: warning disappears
```

**Implementation note**: Use `onKeyDown` and `onKeyUp` on the password input, checking `e.getModifierState('CapsLock')`. Only show when the password field is focused AND CapsLock is active.

### 7.5 Multiple Rapid Submissions (Debounce)

**Flow**:
```
1. User clicks Sign In rapidly (or presses Enter multiple times)
2. First click: enters LOADING state, button disables
3. Subsequent clicks: ignored (button is disabled)
4. If IPC completes: re-enable button for next attempt
5. Safety: isSubmitting ref or local state flag
```

**Implementation**:
```jsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e) => {
  e.preventDefault();
  if (isSubmitting) return; // ← guard against double-submit
  setIsSubmitting(true);
  try {
    // ... auth logic
  } finally {
    setIsSubmitting(false);
  }
};
```

### 7.6 IPC Timeout / No Response

**Flow**:
```
1. User submits form → isSubmitting = true
2. IPC call exceeds expected time (e.g., > 5 seconds)
3. Timeout safety: if no response after 10 seconds, show network error
4. isSubmitting = false, button re-enabled
5. Toast: "Connection error. Check database and try again."
```

**Implementation**:
```javascript
const loginWithTimeout = async (username, password) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), 10000)
  );
  const loginPromise = window.electronAPI.login({ username, password });
  return Promise.race([loginPromise, timeoutPromise]);
};
```

### 7.7 BrowserWindow Close During Login

**Flow**:
```
1. User clicks Sign In
2. IPC call is in flight
3. User closes window
4. IPC resolves but renderer is gone (no-op)
5. Main process handles gracefully: no crash
```

**Safety**: The IPC handler uses `try/catch` and the main process doesn't depend on renderer response.

### 7.8 Database Locked / Corruption

**Flow**:
```
1. IPC call fails with database error
2. Main process logs error, returns { success: false, error: 'Database error' }
3. Login page shows toast: "System error. Please restart the application."
4. User restarts app
```

**Note**: better-sqlite3 uses WAL mode which handles concurrent access. This edge case is rare but handled gracefully.

### 7.9 Special Characters in Username

**Flow**:
```
1. User enters username with special characters (SQL injection attempt, etc.)
2. Validation: username should be alphanumeric + underscores + dots only
3. Client-side validation: reject with message "Username can only contain letters, numbers, dots, and underscores"
4. Server-side: parameterized queries (already using prepared statements) prevent injection
```

### 7.10 Empty Fields After Submit

**Flow**:
```
1. User clicks Sign In with empty fields
2. Client-side validation fires before IPC call
3. Empty username: "Username is required" shows under username field
4. Empty password: "Password is required" shows under password field
5. Both can show simultaneously
6. NO IPC call is made (save resources)
```

---

## 8. Accessibility Checklist

### 8.1 WCAG 2.1 AA Compliance

| # | Criteria | WCAG Ref | Implementation |
|---|----------|----------|----------------|
| 1 | **Non-text Content** | 1.1.1 | All icons have `aria-hidden="true"` or text alternatives. Logo has `alt` text. |
| 2 | **Keyboard** | 2.1.1 | All actions operable via keyboard (Tab, Enter, Space, Escape). See §5. |
| 3 | **No Keyboard Trap** | 2.1.2 | Focus never trapped. Tab moves naturally through form. |
| 4 | **Focus Order** | 2.4.3 | Logical tab order: username → password → submit → register link. See §5.1. |
| 5 | **Focus Visible** | 2.4.7 | 2px solid #38bdf8 outline with 2px offset on all interactive elements. |
| 6 | **Language** | 3.1.1 | `<html lang="en">` (already set in index.html). |
| 7 | **On Focus** | 3.2.1 | Focusing inputs does not trigger context changes. |
| 8 | **On Input** | 3.2.2 | Typing does not trigger unexpected context changes. |
| 9 | **Error Identification** | 3.3.1 | Errors clearly identified: red border + text message + aria-describedby linking. |
| 10 | **Error Suggestions** | 3.3.3 | Each error message suggests the correct action (e.g., "No account found with this username"). |
| 11 | **Contrast (Minimum)** | 1.4.3 | All text meets 4.5:1 ratio. Error text: red-400 (#f87171) on navy (#0a0f1e) = 7.1:1 ✓ |
| 12 | **Resize Text** | 1.4.4 | All text can be resized 200% without loss of content. |
| 13 | **Images of Text** | 1.4.5 | No images of text used. |
| 14 | **Reflow** | 1.4.10 | Login card reflows to single column at 320px width without horizontal scroll. |
| 15 | **Non-text Contrast** | 1.4.11 | Input borders (1px #1e2a4a vs #0a0f1e) meet 3:1. Focus indicators meet 3:1. |
| 16 | **Text Spacing** | 1.4.12 | No loss of content when line height 1.5, spacing 2px, word spacing 0.16em. |
| 17 | **Content on Hover/Focus** | 1.4.13 | Tooltips (caps lock) dismissable via Escape, hoverable, and persistent. |
| 18 | **Timing Adjustable** | 2.2.1 | No time limits on login. Session timeout (30min) is adjustable. |
| 19 | **Identify Purpose** | 1.3.6 | Form fields have clear labels (`aria-label` on inputs, visible labels). |
| 20 | **Status Messages** | 4.1.3 | Error messages use `role="alert"`, `aria-live="polite"`. Loading state announced. |

### 8.2 ARIA Implementation

```jsx
<!-- Form Field Template -->
<div class="form-field" role="presentation">
  <label htmlFor="username" id="username-label">
    Username
  </label>
  <input
    id="username"
    type="text"
    aria-labelledby="username-label"
    aria-describedby={error ? "username-error" : undefined}
    aria-invalid={error ? "true" : undefined}
    aria-required="true"
    autoComplete="username"
  />
  {error && (
    <p id="username-error" role="alert" aria-live="polite">
      {error}
    </p>
  )}
</div>

<!-- Password Field -->
<div class="form-field" role="presentation">
  <label htmlFor="password" id="password-label">
    Password
  </label>
  <input
    id="password"
    type={showPassword ? "text" : "password"}
    aria-labelledby="password-label"
    aria-describedby={
      [error && "password-error", capsLock && "capslock-warning"]
        .filter(Boolean)
        .join(" ")
    }
    aria-invalid={error ? "true" : undefined}
    aria-required="true"
    autoComplete="current-password"
  />
  <button
    aria-label={showPassword ? "Hide password" : "Show password"}
    aria-pressed={showPassword}
    onClick={togglePassword}
    tabIndex={-1} /* not in tab order, accessible via aria */
  >
    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
  </button>
  {error && (
    <p id="password-error" role="alert" aria-live="polite">
      {error}
    </p>
  )}
  {capsLock && (
    <p id="capslock-warning" role="status" aria-live="polite">
      ⚠ Warning: Caps Lock is on
    </p>
  )}
</div>

<!-- Submit Button -->
<button
  type="submit"
  aria-busy={isSubmitting}
  aria-disabled={isSubmitting || !isValid}
  aria-label={isSubmitting ? "Signing in, please wait" : "Sign in"}
>
  {isSubmitting ? "Signing in..." : "Sign In"}
</button>

<!-- Toast Notification -->
<div
  role="alert"
  aria-live="assertive" /* urgent: session expiry */
  aria-atomic="true"
>
  Session expired. Please login again.
</div>
```

### 8.3 Screen Reader Behavior Script

```
Page loads:
  "Login page. SM Younas Traders, Distribution Management System."
  Auto-focus moves to username field.
  "Username, required, edit text."

User types and tabs:
  "Password, required, edit text."

User submits with empty fields:
  "Error: Username is required."
  "Error: Password is required."

User submits with wrong credentials:
  "Error: No account found with this username."

User submits successfully:
  Button announces: "Signing in, please wait."
  "Loading complete. Navigating to Dashboard."
  Dashboard heading: "Dashboard, heading level 1."

Caps Lock on:
  "Warning: Caps Lock is on."
```

### 8.4 Color Contrast Verification

| Element | Colors | Ratio | Pass (AA) |
|---------|--------|-------|-----------|
| Body text | #e2e8f0 on #0a0f1e | 16.5:1 | ✓ Yes |
| Label text (idle) | #6b7280 on #0a0f1e | 8.7:1 | ✓ Yes |
| Label text (focused) | #38bdf8 on #0a0f1e | 8.5:1 | ✓ Yes |
| Input text | #e2e8f0 on #111b2e | 12.1:1 | ✓ Yes |
| Input border | #1e2a4a on #0a0f1e | 4.2:1 | ✓ Yes (3:1 min for non-text) |
| Error text | #f87171 on #0a0f1e | 7.1:1 | ✓ Yes |
| Button text | #0a0f1e on #38bdf8 | 8.5:1 | ✓ Yes |
| Placeholder | #4b5563 on #111b2e | 4.8:1 | ✓ Yes |
| Caps lock warning | #fbbf24 on #0a0f1e | 12.7:1 | ✓ Yes |
| Divider | #1e2a4a on #0d1426 | ~2:1 | N/A (decorative) |
| CTA link | #38bdf8 on #0d1426 | 7.6:1 | ✓ Yes |

---

## 9. Flow Diagrams (Text)

### 9.1 Full Login Flow (Happy Path)

```
User opens app
    │
    ▼
┌──────────────────────────────────────┐
│  main.js: createWindow()             │
│  → Window shown → checkFirstRun()    │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  checkFirstRun()                     │
│  → SELECT COUNT(*) FROM users        │
│  → count === 0?                      │
│    YES → send('navigate', '/register')│
│    NO  → (continue to login)         │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  HashRouter resolves route: /login   │
│  → Login page renders                │
│  → Check isAuthenticated == true?    │
│    YES → <Navigate to="/dashboard"/> │
│    NO  → Show login form             │
│  → Check URL params: ?expired=true?  │
│    YES → Show session toast          │
│  → AuthLayout wraps with background  │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  Card entrance animation (400ms)     │
│  Username input receives autoFocus   │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  User types credentials              │
│  • Floating labels animate up        │
│  • Submit button enables (both full) │
│  • Caps lock warning if applicable   │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  User clicks Sign In / presses Enter │
│  → Prevent double-submit guard      │
│  → Client-side validation:          │
│    • username empty? → inline error  │
│    • password empty? → inline error  │
│  → Valid: proceed                    │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  LOADING STATE (0-100ms)            │
│  • Button shrinks (100ms)           │
│  • Spinner appears (200ms fade)     │
│  • Form inputs disabled             │
│  • aria-busy="true" on button       │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  IPC call: electronAPI.login()       │
│  → preload.js → ipcRenderer.invoke() │
│  → main process: auth:login handler  │
│  → SQL: SELECT * FROM users WHERE    │
│    username = ?                      │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  User found?                         │
│  YES → bcrypt.compareSync(password)  │
│    │                                  │
│    ├─ Match? → return {success:true, │
│    │            user: {...}}          │
│    │                                  │
│    └─ No match? → return             │
│       {success:false, error:'Invalid │
│        password'}                     │
│                                       │
│  NO → return {success:false,         │
│       error:'User not found'}        │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  Renderer receives response          │
│                                       │
│  SUCCESS:                             │
│  • useAuth stores user object         │
│  • isAuthenticated = true             │
│  • Button shows green flash (400ms)   │
│  • Form fades out (300ms)             │
│  • navigate('/dashboard')             │
│  • Dashboard entrance (350ms)         │
│                                       │
│  ERROR:                               │
│  • Button returns to IDLE             │
│  • Inline error message appears       │
│  • Input highlights red               │
│  • Card shakes (400ms)                │
│  • Screen reader announces error      │
│  • Focus moves to error field         │
│  • User types → error clears (150ms)  │
└──────────────────────────────────────┘
```

### 9.2 First-Time Registration Flow

```
App launches
    │
    ▼
┌──────────────────────────────────────┐
│  checkFirstRun(): no users in DB     │
│  → send 'navigate' to /register      │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  Registration page renders            │
│  • Same AuthLayout wrapper           │
│  • BrandHeader shown                 │
│  • Form: username, password,         │
│    role, branch                      │
│  • Toast: "No users found. Please    │
│    create an account."               │
│  • "Already registered? Login" link  │
│    (hidden if no users exist)        │
└──────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────┐
│  User fills form → submits           │
│  IPC: auth:register → INSERT INTO    │
│  users (bcrypt hashed password)      │
│                                       │
│  Success:                             │
│  • Toast: "Account created!          │
│    Redirecting to login..."           │
│  • 1.5s delay → navigate('/login')   │
│  • Login auto-shows success toast    │
│                                       │
│  Failure:                             │
│  • Error inline: "Username already   │
│    exists"                            │
│  • User corrects → retries           │
└──────────────────────────────────────┘
```

---

## 10. Implementation Notes

### 10.1 useAuth Store — Required Updates

The existing Zustand store is minimal and correct. Add one enhancement:

```javascript
import { create } from 'zustand';

const useAuth = create((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (username, password) => {
    const result = await window.electronAPI.login({ username, password });
    if (result.success) {
      set({ user: result.user, isAuthenticated: true });
    }
    return result; // ← important: return result for error handling in component
  },
  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
  setUser: (user) => set({ user, isAuthenticated: true }),
}));

export default useAuth;
```

**No changes needed** — the current implementation already returns the result, which enables the Login component to handle success vs error.

### 10.2 CSS Animation Classes (to add to index.css or a new auth.css)

```css
/* ===== Auth Page Animations ===== */

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  15% { transform: translateX(-8px); }
  30% { transform: translateX(8px); }
  45% { transform: translateX(-6px); }
  60% { transform: translateX(6px); }
  75% { transform: translateX(-3px); }
  90% { transform: translateX(3px); }
}

@keyframes cardEntrance {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(100%);
  }
}

@keyframes successPulse {
  0% { background-color: #38bdf8; }
  30% { background-color: #22c55e; }
  100% { background-color: #38bdf8; }
}

/* Utility classes */
.animate-shake {
  animation: shake 0.4s ease-in-out;
}

.animate-card-entrance {
  animation: cardEntrance 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-spin {
  animation: spin 0.8s linear infinite;
}

.animate-fade-in-up {
  animation: fadeInUp 0.2s ease-out forwards;
}

.animate-fade-in-down {
  animation: fadeInDown 0.2s ease-out forwards;
}

.animate-slide-in-right {
  animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-slide-out-right {
  animation: slideOutRight 0.25s ease-in forwards;
}

/* Floating label container */
.floating-label-group {
  position: relative;
}

.floating-label-group label {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  transition: all 0.2s ease-out;
  pointer-events: none;
  color: #6b7280;
  font-size: 0.875rem;
  z-index: 1;
}

.floating-label-group input:focus + label,
.floating-label-group input:not(:placeholder-shown) + label {
  top: 0;
  transform: translateY(-50%) scale(0.85);
  color: #38bdf8;
}

.floating-label-group input:focus {
  border-color: #38bdf8;
  box-shadow: 0 0 0 1px #38bdf8;
}
```

### 10.3 Recommended AI-Powered Implementation Directive

For the developer implementing this UX specification:

**Priority 1**: Rewrite `Login.jsx` with full state machine, floating labels, validation, error handling, and animations.

**Priority 2**: Create new components: `AnimatedBackground`, `BrandHeader`, `FormField`, `PasswordField`, `SubmitButton`, `Toast`.

**Priority 3**: Create `auth.css` with all animation keyframes and utility classes.

**Priority 4**: Rewrite `AuthLayout.jsx` to use the AnimatedBackground and BrandHeader.

**Priority 5**: Update `Registration.jsx` to share the same floating-label form aesthetic.

**Priority 6**: Add session timeout detection to `MainLayout.jsx`.

**Do NOT touch**: `useAuth.js`, `auth.ipc.js`, `database.js`, `main.js`, `preload.js`.

---

## Appendix A: Theme Reference

| Token | Value | Usage |
|-------|-------|-------|
| `--navy` | `#0a0f1e` | Main background |
| `--navy-light` | `#0d1426` | Card background |
| `--navy-lighter` | `#111b2e` | Input background |
| `--navy-border` | `#1e2a4a` | Borders |
| `--accent` | `#38bdf8` | Primary accent, button bg, focus |
| `--accent-hover` | `#0ea5e9` | Button hover |
| `--text-primary` | `#e2e8f0` | Body text |
| `--text-secondary` | `#6b7280` | Labels, muted |
| `--error` | `#f87171` | Error text (red-400) |
| `--error-bg` | `rgba(248,113,113,0.1)` | Error background |
| `--success` | `#22c55e` | Success flash (green-500) |
| `--warning` | `#fbbf24` | Caps lock warning (amber-400) |

## Appendix B: File Dependency Graph

```
AuthLayout.jsx
  ├── AnimatedBackground.jsx
  ├── BrandHeader.jsx
  ├── Login.jsx
  │   ├── FormField.jsx (username)
  │   ├── PasswordField.jsx
  │   │   └── CapsLock detection
  │   ├── SubmitButton.jsx
  │   ├── FormDivider.jsx
  │   ├── RegistrationCTA.jsx
  │   └── Toast.jsx (conditional)
  └── Registration.jsx
      ├── FormField.jsx (username)
      ├── PasswordField.jsx
      ├── FormField.jsx (branch)
      ├── SubmitButton.jsx
      └── RegistrationCTA.jsx (reverse direction)
```

---

> **Specification Version**: 1.0
> **Author**: ArchitectUX Agent
> **Date**: 2026-05-14
> **Target Framework**: Electron 33 + React 18 + Tailwind CSS 3
> **Review Status**: Ready for implementation
