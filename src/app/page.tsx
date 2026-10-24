"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type FormErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function Home() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Keep the controlled email field in sync with each input event.
  function handleEmailChange(value: string) {
    setEmail(value);
    setErrors((current) => ({ ...current, email: undefined }));
  }

  // Keep the controlled password field in sync with each input event.
  function handlePasswordChange(value: string) {
    setPassword(value);
    setErrors((current) => ({ ...current, password: undefined }));
  }

  function handleModeChange() {
    setIsSignUp((current) => !current);
    setErrors({});
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  function handleConfirmPasswordChange(value: string) {
    setConfirmPassword(value);
    setErrors((current) => ({ ...current, confirmPassword: undefined }));
  }

  // Validate the selected form before creating the browser session.
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: FormErrors = {};
    if (!email.trim()) {
      nextErrors.email = "Enter your email address.";
    } else if (!/^[^\s@]+@gmail\.com$/i.test(email.trim())) {
      nextErrors.email = "Use a valid @gmail.com address.";
    }

    if (!password) {
      nextErrors.password = "Enter your password.";
    } else if (password.length <= 6) {
      nextErrors.password = "Your password must be more than 6 characters.";
    }

    if (isSignUp && !confirmPassword) {
      nextErrors.confirmPassword = "Confirm your password.";
    } else if (isSignUp && password !== confirmPassword) {
      nextErrors.confirmPassword = "Your passwords do not match.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    sessionStorage.setItem("notes-user", email.trim());
    router.push("/notes");
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Sign in to Papertrail">
        <aside className="login-aside">
          <Link className="brand brand-light" href="/" aria-label="Papertrail home">
            <span className="brand-mark" aria-hidden="true">p.</span>
            <span>papertrail</span>
          </Link>
          <div className="aside-copy">
            <span className="eyebrow">A little room to think</span>
            <h1>Make space<br />for your ideas.</h1>
            <p>Gather the small thoughts, passing plans, and bright sparks worth keeping.</p>
          </div>
          <div className="paper-stack" aria-hidden="true">
            <div className="paper paper-back"><span>today, maybe</span></div>
            <div className="paper paper-middle"><i /><i /><i /></div>
            <div className="paper paper-front">
              <span className="paper-date">A NOTE TO SELF</span>
              <strong>Good things<br />take a little<br />space.</strong>
              <span className="paper-scribble">keep going ↗</span>
            </div>
            <span className="sun-stamp">✳</span>
          </div>
          <span className="aside-footer">YOUR THOUGHTS, IN GOOD COMPANY</span>
        </aside>

        <div className="login-panel">
          <div className="login-panel-top">
            <span className="mobile-brand brand"><span className="brand-mark" aria-hidden="true">p.</span>papertrail</span>
            <span className="top-note">A quieter place to write</span>
          </div>
          <div className="login-form-wrap">
            <span className="eyebrow eyebrow-dark">{isSignUp ? "A FRESH PAGE, JUST FOR YOU" : "WELCOME BACK"}</span>
            <h2>{isSignUp ? <>Start with a<br className="desktop-break" /> clean page.</> : <>Pick up where<br className="desktop-break" /> you left off.</>}</h2>
            <p className="form-intro">{isSignUp ? "Create your Papertrail notebook and make room for new ideas." : "Sign in to find your thoughts right where you left them."}</p>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@gmail.com"
                value={email}
                onChange={(event) => handleEmailChange(event.target.value)}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
              />
              {errors.email && <span className="field-error" id="email-error">{errors.email}</span>}

              <label htmlFor="password">Password</label>
              <div className="password-input-wrap">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  placeholder="At least 7 characters"
                  value={password}
                  onChange={(event) => handlePasswordChange(event.target.value)}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  className="password-visibility"
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-controls="password"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={17} strokeWidth={1.8} /> : <Eye size={17} strokeWidth={1.8} />}
                </button>
              </div>
              {errors.password && <span className="field-error" id="password-error">{errors.password}</span>}

              {isSignUp && (
                <>
                  <label htmlFor="confirm-password">Confirm password</label>
                  <div className="password-input-wrap">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Enter your password again"
                      value={confirmPassword}
                      onChange={(event) => handleConfirmPasswordChange(event.target.value)}
                      aria-invalid={Boolean(errors.confirmPassword)}
                      aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                    />
                    <button
                      className="password-visibility"
                      type="button"
                      aria-label={showConfirmPassword ? "Hide confirmation password" : "Show confirmation password"}
                      aria-controls="confirm-password"
                      onClick={() => setShowConfirmPassword((current) => !current)}
                    >
                      {showConfirmPassword ? <EyeOff size={17} strokeWidth={1.8} /> : <Eye size={17} strokeWidth={1.8} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="field-error" id="confirm-password-error">{errors.confirmPassword}</span>}
                </>
              )}

              <button className="primary-button login-button" type="submit">
                {isSignUp ? "Create my account" : "Open my notes"} <span aria-hidden="true">→</span>
              </button>
              {Object.keys(errors).length > 0 && (
                <div className="error-summary" role="alert" aria-live="polite">
                  <strong>Please check your details.</strong>
                  <span>Please fix the highlighted fields.</span>
                </div>
              )}
            </form>
            <p className="account-switch">
              {isSignUp ? "Already have a notebook?" : "New to Papertrail?"}
              <button type="button" onClick={handleModeChange}>
                {isSignUp ? "Sign in" : "Create an account"}
              </button>
            </p>
            <p className="privacy-note"><span aria-hidden="true">✳</span> Your notes stay in this browser, just for you.</p>
          </div>
          <footer className="login-footer"><span>© 2026 PAPERTRAIL</span><span>MADE FOR YOUR MIND</span></footer>
        </div>
      </section>
    </main>
  );
}
