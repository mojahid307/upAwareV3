"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { IS_MOCK, toApiError } from "@/lib/api";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  ward: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => (v === "" || v == null ? undefined : Number(v)))
    .refine((v) => v === undefined || (v >= 1 && v <= 92), {
      message: "Ward must be between 1 and 92",
    }),
});

type FormState = {
  name: string;
  email: string;
  password: string;
  ward: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    ward: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof FormState, string>> = {};
      for (const issue of parsed.error.issues) {
        fieldErrors[issue.path[0] as keyof FormState] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      await register({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        ward: parsed.data.ward,
      });
      router.push("/");
      router.refresh();
    } catch (err) {
      setSubmitError(toApiError(err).error);
    } finally {
      setLoading(false);
    }
  };

  const update = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <AuthShell
      title="Create your account"
      subtitle="Join your Dhaka ward community on UpAware."
    >
      {IS_MOCK && (
        <Card className="mb-4 border-active/30 bg-active/10 px-3 py-2 text-xs text-[#a06b00]">
          Demo mode: registration is simulated — any valid-looking details work.
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Ayesha Rahman"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            aria-invalid={!!errors.name}
          />
          {errors.name && <p className="text-xs text-emergency">{errors.name}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            aria-invalid={!!errors.email}
          />
          {errors.email && <p className="text-xs text-emergency">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            aria-invalid={!!errors.password}
          />
          {errors.password && (
            <p className="text-xs text-emergency">{errors.password}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="ward">
            Ward{" "}
            <span className="font-normal text-muted">(optional, 1–92)</span>
          </Label>
          <Input
            id="ward"
            type="number"
            min={1}
            max={92}
            inputMode="numeric"
            placeholder="e.g. 33"
            value={form.ward}
            onChange={(e) => update("ward", e.target.value)}
            aria-invalid={!!errors.ward}
          />
          {errors.ward && <p className="text-xs text-emergency">{errors.ward}</p>}
        </div>

        {submitError && (
          <Card className="border-emergency/30 bg-emergency/5 px-3 py-2 text-sm text-emergency">
            {submitError}
          </Card>
        )}

        <Button type="submit" className="w-full" isLoading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}
