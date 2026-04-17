"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { getCheckoutUrl } from "@/lib/lemonsqueezy";

declare global {
  interface Window {
    LemonSqueezy?: {
      Url: {
        Open: (url: string) => void;
      };
    };
  }
}

type CheckoutButtonProps = {
  label?: string;
};

export function CheckoutButton({ label = "Start 14-day trial" }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadSession = async () => {
      const response = await fetch("/api/access-session");
      const data = (await response.json()) as { sessionId: string };
      setSessionId(data.sessionId);
    };

    void loadSession();
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    const checkoutUrl = getCheckoutUrl(sessionId);
    if (!checkoutUrl) {
      setError("Configure NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID with a checkout link or product checkout identifier.");
      setLoading(false);
      return;
    }

    if (window.LemonSqueezy?.Url?.Open) {
      window.LemonSqueezy.Url.Open(checkoutUrl);
    } else {
      window.location.href = checkoutUrl;
      return;
    }

    setTimeout(() => {
      void fetch("/api/access-status", { method: "GET" }).then(async (res) => {
        const data = (await res.json()) as { access: boolean };
        if (data.access) {
          router.push("/editor");
        }
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="space-y-3">
      <Button type="button" size="lg" onClick={handleCheckout} disabled={loading || !sessionId}>
        {loading ? "Opening checkout..." : label}
      </Button>
      {error ? <p className="text-sm text-red-300">{error}</p> : null}
      <p className="text-sm text-[var(--muted)]">$15/month per developer. Includes unlimited workspace sessions and updates.</p>
    </div>
  );
}
