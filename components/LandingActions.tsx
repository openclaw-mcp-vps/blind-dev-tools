"use client";

import Script from "next/script";
import { useMemo, useState } from "react";
import UnlockForm from "@/components/UnlockForm";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    LemonSqueezy?: {
      Url?: {
        Open?: (url: string) => void;
      };
    };
  }
}

export default function LandingActions() {
  const [checkoutMessage, setCheckoutMessage] = useState<string | null>(null);

  const checkoutUrl = useMemo(() => {
    const id = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID;
    if (!id) {
      return "";
    }

    return `https://checkout.lemonsqueezy.com/buy/${id}?embed=1&media=0&logo=0`;
  }, []);

  const storeId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID;

  function openCheckoutOverlay() {
    if (!checkoutUrl) {
      setCheckoutMessage("Set NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID to enable checkout.");
      return;
    }

    const opener = window.LemonSqueezy?.Url?.Open;
    if (opener) {
      opener(checkoutUrl);
      setCheckoutMessage("Checkout opened. Complete payment, then unlock with your billing email.");
      return;
    }

    window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    setCheckoutMessage("Checkout opened in a new tab.");
  }

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-[#151b23] p-6">
      <Script src="https://app.lemonsqueezy.com/js/lemon.js" strategy="afterInteractive" />

      <h3 className="text-xl font-semibold text-white">Launch Blind Dev Tools</h3>
      <p className="mt-2 text-sm text-slate-300">
        Start a secure Lemon Squeezy checkout and unlock your screen reader optimized editor instantly.
      </p>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button
          onClick={openCheckoutOverlay}
          className="h-auto bg-cyan-400 px-4 py-2 text-sm font-semibold text-[#0d1117] hover:bg-cyan-300"
        >
          Start $15/mo Checkout
        </Button>
        <a
          href="/editor"
          className="rounded-md border border-white/20 px-4 py-2 text-center text-sm font-semibold text-slate-100 hover:bg-white/10"
        >
          Open Editor
        </a>
      </div>

      {storeId ? (
        <p className="mt-2 text-xs text-slate-400">Configured Lemon Squeezy store: {storeId}</p>
      ) : (
        <p className="mt-2 text-xs text-amber-300">Set NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID in your environment.</p>
      )}

      {checkoutMessage ? <p className="mt-3 text-sm text-slate-200">{checkoutMessage}</p> : null}

      <UnlockForm className="mt-6 rounded-xl border border-white/10 bg-[#0d1117] p-4" />
    </div>
  );
}
