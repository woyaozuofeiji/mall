"use client";

import { useActionState } from "react";
import { loginAdminAction, type AdminLoginActionState } from "@/app/admin/actions";
import type { Locale } from "@/lib/types";

const initialState: AdminLoginActionState = undefined;

export function AdminLoginForm({
  locale,
  nextPath,
}: {
  locale: Locale;
  nextPath?: string;
}) {
  const [state, action, pending] = useActionState(loginAdminAction, initialState);

  const copy =
    locale === "zh"
      ? {
          email: "管理员邮箱",
          password: "登录密码",
          submit: pending ? "登录中..." : "登录后台",
          hint: "使用数据库中的管理员邮箱和密码登录后台。",
        }
      : {
          email: "Admin email",
          password: "Password",
          submit: pending ? "Signing in..." : "Sign in",
          hint: "Use an administrator email and password stored in the database.",
        };

  const inputClass =
    "mt-2 h-12 w-full rounded-[1rem] border border-white/10 bg-white/10 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-rose-300/60";

  return (
    <form action={action} className="mt-8 space-y-4">
      <input type="hidden" name="locale" value={locale} />
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      <div>
        <label className="text-sm text-white/75">
          {copy.email}
          <input className={inputClass} name="email" type="email" placeholder="admin@example.com" />
        </label>
        {state?.fieldErrors?.email ? <p className="mt-2 text-xs text-rose-300">{state.fieldErrors.email[0]}</p> : null}
      </div>

      <div>
        <label className="text-sm text-white/75">
          {copy.password}
          <input className={inputClass} name="password" type="password" placeholder="••••••••" />
        </label>
        {state?.fieldErrors?.password ? <p className="mt-2 text-xs text-rose-300">{state.fieldErrors.password[0]}</p> : null}
      </div>

      <p className="text-xs leading-6 text-white/45">{copy.hint}</p>
      {state?.message ? <p className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{state.message}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center rounded-full bg-white px-5 text-sm font-medium text-slate-950 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {copy.submit}
      </button>
    </form>
  );
}

