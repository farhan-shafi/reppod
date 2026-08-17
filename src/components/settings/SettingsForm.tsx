"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { Check, Loader2 } from "lucide-react";

import CloudinaryAvatar from "./CloudinaryAvatar";

type Props = {
  role: "trainer" | "client";
  initial: {
    name: string;
    email: string;
    bio: string;
    image: string;
    unitPreference: "kg" | "lb";
    businessName: string;
  };
};

export default function SettingsForm({ role, initial }: Props) {
  const router = useRouter();
  const { update } = useSession();

  const [name, setName] = useState(initial.name);
  const [bio, setBio] = useState(initial.bio);
  const [image, setImage] = useState(initial.image);
  const [unit, setUnit] = useState<"kg" | "lb">(initial.unitPreference);
  const [businessName, setBusinessName] = useState(initial.businessName);

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);
  const [profileErr, setProfileErr] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<string | null>(null);
  const [pwErr, setPwErr] = useState<string | null>(null);

  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileErr(null);
    setProfileMsg(null);
    setSavingProfile(true);
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          bio,
          image,
          unitPreference: unit,
          ...(role === "trainer" ? { businessName } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setProfileErr(data.error ?? "Could not save.");
        return;
      }
      await update({ name, image });
      setProfileMsg("Saved!");
      router.refresh();
      setTimeout(() => setProfileMsg(null), 2500);
    } catch {
      setProfileErr("Network error. Try again.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwErr(null);
    setPwMsg(null);
    setSavingPw(true);
    try {
      const res = await fetch("/api/me/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPwErr(data.error ?? "Could not change password.");
        return;
      }
      setPwMsg("Password updated.");
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPwMsg(null), 2500);
    } catch {
      setPwErr("Network error. Try again.");
    } finally {
      setSavingPw(false);
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-white/60">
          Manage your profile and account preferences.
        </p>
      </div>

      <form
        onSubmit={saveProfile}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-white">Profile</h2>

        <CloudinaryAvatar
          value={image}
          fallbackInitials={initials}
          onChange={setImage}
        />

        <Field label="Name" value={name} onChange={setName} required />
        <Field label="Email" value={initial.email} onChange={() => {}} disabled />

        {role === "trainer" && (
          <Field
            label="Business name"
            value={businessName}
            onChange={setBusinessName}
            placeholder="Shown to your clients"
          />
        )}

        <label className="block">
          <span className="text-xs uppercase tracking-wider text-white/50">
            Bio
          </span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="A short intro…"
            className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-fuchsia-500/50 transition resize-none"
          />
        </label>

        <label className="block">
          <span className="text-xs uppercase tracking-wider text-white/50">
            Preferred units
          </span>
          <div className="mt-2 inline-flex p-1 rounded-full border border-white/10 bg-white/5">
            {(["kg", "lb"] as const).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setUnit(u)}
                className={`relative px-4 py-1 rounded-full text-sm transition ${
                  unit === u ? "text-black" : "text-white/70"
                }`}
              >
                {unit === u && (
                  <motion.span
                    layoutId="unit-pill"
                    className="absolute inset-0 rounded-full bg-white"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative uppercase">{u}</span>
              </button>
            ))}
          </div>
        </label>

        {profileErr && <p className="text-sm text-red-400">{profileErr}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition disabled:opacity-60"
          >
            {savingProfile && <Loader2 className="size-3.5 animate-spin" />}
            Save profile
          </button>
          {profileMsg && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-1 text-sm text-emerald-300"
            >
              <Check className="size-4" />
              {profileMsg}
            </motion.span>
          )}
        </div>
      </form>

      <form
        onSubmit={changePassword}
        className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-5"
      >
        <h2 className="text-lg font-semibold text-white">Change password</h2>

        <Field
          label="Current password"
          type="password"
          value={currentPassword}
          onChange={setCurrentPassword}
          autoComplete="current-password"
          required
        />
        <Field
          label="New password"
          type="password"
          value={newPassword}
          onChange={setNewPassword}
          autoComplete="new-password"
          placeholder="10+ chars, upper/lowercase and number"
          required
        />

        {pwErr && <p className="text-sm text-red-400">{pwErr}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={savingPw}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium hover:bg-white/15 transition disabled:opacity-60"
          >
            {savingPw && <Loader2 className="size-3.5 animate-spin" />}
            Update password
          </button>
          {pwMsg && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-1 text-sm text-emerald-300"
            >
              <Check className="size-4" />
              {pwMsg}
            </motion.span>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  ...rest
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-white/50">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder-white/30 outline-none focus:border-fuchsia-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </label>
  );
}
