import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';

export default function AuthConfirmPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const params = new URLSearchParams();
  for (const [key, val] of Object.entries(searchParams)) {
    if (val) params.set(key, String(val));
  }
  const qs = params.toString();
  redirect(`/auth/callback${qs ? `?${qs}` : ""}`);
}
