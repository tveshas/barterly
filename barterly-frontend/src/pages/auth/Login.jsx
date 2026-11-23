import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import authService from "../../services/authService";

const GOOGLE_ENABLED = !!import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DEV_LOGIN = import.meta.env.VITE_DEV_LOGIN === "true";
const DEV_USERS = [
  ["alice@test.com", "Alice (test)"],
  ["bob@test.com", "Bob (test)"],
  ["priya@demo.com", "Priya Sharma (React mentor)"],
  ["marco@demo.com", "Marco Rossi (Italian cooking)"],
  ["aisha@demo.com", "Aisha Khan (design)"],
  ["liam@demo.com", "Liam O'Connor (guitar)"],
  ["sofia@demo.com", "Sofia Martinez (Spanish)"],
  ["daniel@demo.com", "Daniel Kim (Python)"],
  ["emma@demo.com", "Emma Wilson (fitness)"],
  ["rahul@demo.com", "Rahul Verma (video editing)"],
];

const Login = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devEmail, setDevEmail] = useState(DEV_USERS[0][0]);
  const [devKey, setDevKey] = useState("");

  const goHome = (response) => {
    navigate(response.data.user.role === "admin" ? "/admin/dashboard" : "/dashboard");
  };

  const handleGoogle = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      goHome(await authService.googleLogin(credentialResponse.credential));
    } catch (err) {
      setError(err?.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDev = async () => {
    setError("");
    setLoading(true);
    try {
      goHome(await authService.devLogin(devEmail, devKey));
    } catch (err) {
      setError(err?.message || "Dev login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light min-h-screen lg:h-screen w-full lg:overflow-hidden flex flex-col lg:flex-row">
      {/* Left Panel: Brand & Features */}
      <div className="w-full lg:w-1/2 bg-background-dark lg:h-full flex flex-col justify-between p-8 md:p-12 lg:p-16 relative overflow-hidden border-r-4 border-border-dark">
        {/* Abstract Background Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffde5c 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Logo */}
        <div className="z-10">
          <h1 className="text-primary text-3xl font-black tracking-tighter uppercase select-none">
            BARTERLY
          </h1>
        </div>

        {/* Main Content */}
        <div className="z-10 flex flex-col gap-8 my-auto">
          <div className="space-y-2">
            <h2 className="text-white text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight">
              JOIN THE
              <br />
              SWAP.
            </h2>
            <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-md">
              Sign in with Google. New here? An account is created for you automatically.
            </p>
          </div>

          {/* Feature List */}
          <ul className="flex flex-col gap-4 mt-4">
            <li className="flex items-center gap-3 text-white text-lg font-bold">
              <span
                className="text-primary material-symbols-outlined"
                style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              Browse 500+ skills
            </li>
            <li className="flex items-center gap-3 text-white text-lg font-bold">
              <span
                className="text-primary material-symbols-outlined"
                style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              Chat with partners
            </li>
            <li className="flex items-center gap-3 text-white text-lg font-bold">
              <span
                className="text-primary material-symbols-outlined"
                style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              Track barters
            </li>
          </ul>
        </div>

        {/* Footer Link */}
        <div className="z-10 pt-8">
          <Link
            to="/"
            className="text-white hover:text-primary transition-colors text-lg font-bold group flex items-center gap-2 w-fit"
          >
            ← Back to home
          </Link>
        </div>
      </div>

      {/* Right Panel: Sign in */}
      <div className="w-full lg:w-1/2 bg-background-light lg:h-full flex flex-col justify-center items-center p-8 md:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md flex flex-col gap-8">
          <div>
            <h2 className="text-black text-6xl font-black uppercase tracking-tighter mb-2">
              Sign in
            </h2>
            <p className="text-neutral-600 font-medium">
              Continue with your Google account. No passwords, no email codes.
            </p>
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 font-bold">
              {error}
            </div>
          )}

          {GOOGLE_ENABLED ? (
            <div className={loading ? "opacity-50 pointer-events-none" : ""}>
              <GoogleLogin
                onSuccess={handleGoogle}
                onError={() => setError("Google sign-in was cancelled or failed.")}
                theme="filled_black"
                shape="rectangular"
                size="large"
                text="continue_with"
                width="360"
              />
            </div>
          ) : (
            <div className="bg-yellow-100 border-2 border-black px-4 py-3 text-sm font-bold">
              Google sign-in isn&apos;t configured yet. Set VITE_GOOGLE_CLIENT_ID in
              barterly-frontend/.env (see DEPLOY.md).
            </div>
          )}

          {DEV_LOGIN && (
            <div className="border-2 border-dashed border-black p-4 flex flex-col gap-3 bg-white">
              <p className="text-xs font-black uppercase tracking-widest text-neutral-500">
                Test login: sign in as a seeded user
              </p>
              <select
                value={devEmail}
                onChange={(e) => setDevEmail(e.target.value)}
                className="w-full bg-white border-2 border-black p-3 font-bold"
              >
                {DEV_USERS.map(([email, label]) => (
                  <option key={email} value={email}>
                    {label}
                  </option>
                ))}
              </select>
              <input
                type="password"
                value={devKey}
                onChange={(e) => setDevKey(e.target.value)}
                placeholder="Test key (not needed locally)"
                className="w-full bg-white border-2 border-black p-3 font-bold"
              />
              <button
                type="button"
                onClick={handleDev}
                disabled={loading}
                className="w-full bg-primary border-2 border-black py-3 font-black uppercase shadow-hard disabled:opacity-50"
              >
                {loading ? "Signing in..." : "Dev sign in →"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
