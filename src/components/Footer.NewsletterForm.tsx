import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight } from "lucide-react";
import { useState, useCallback } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const sendWelcome = useAction(api.emails.sendWelcomeEmail);
  const subscribe = useMutation(api.subscribers.subscribe);

  const onSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      const value = email.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        toast("Please enter a valid email address.");
        return;
      }
      try {
        setLoading(true);
        // Save subscriber first (deduped)
        await subscribe({ email: value });
        // Send welcome email
        await sendWelcome({ to: value });
        toast("Thanks for subscribing! Welcome email sent.");
        setEmail("");
      } catch (err: any) {
        toast(err?.message || "Failed to subscribe. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [email, sendWelcome, subscribe],
  );

  return (
    <>
      <h3 className="text-2xl sm:text-3xl font-extrabold mb-4 sm:mb-6 text-white">
        Subscribe to our emails
      </h3>
      <form onSubmit={onSubmit} className="relative max-w-md mx-auto">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="h-12 sm:h-14 bg-transparent border border-white/30 rounded-full text-white placeholder-gray-400 pr-12 px-6 focus:border-white/50 transition-colors duration-200"
          aria-label="Email address"
        />
        <Button
          type="submit"
          size="icon"
          disabled={loading}
          aria-label="Subscribe"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-white hover:bg-gray-200 text-black transition-colors duration-200"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </form>
    </>
  );
}