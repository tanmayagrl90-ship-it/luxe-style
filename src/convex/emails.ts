"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import { internal } from "./_generated/api";

export const sendWelcomeEmail = action({
  args: {
    to: v.string(),
  },
  handler: async (ctx, { to }) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured. Add it in Integrations > Resend.");
    }

    const resend = new Resend(apiKey);

    // Prefer a configured sender; fall back to Resend's onboarding domain
    const from =
      process.env.RESEND_FROM_EMAIL?.trim() ||
      "LUXE <onboarding@resend.dev>";

    // NEW: Set Reply-To so responses go to your Gmail address
    const replyTo = process.env.RESEND_REPLY_TO?.trim() || "luxe.premium.in@gmail.com";

    const subject = "Welcome to LUXE — Thanks for subscribing!";
    const html = `
      <div style="font-family: Helvetica Neue, Arial, sans-serif; color: #111; line-height: 1.6;">
        <h1 style="margin:0 0 12px; font-size: 24px;">Welcome to LUXE</h1>
        <p style="margin:0 0 12px;">Thanks for subscribing to our updates. You'll be the first to know about new arrivals, drops, and deals.</p>
        <p style="margin:0 0 12px;">— Team LUXE</p>
      </div>
    `;

    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      // NEW: ensure replies reach your Gmail inbox
      replyTo: replyTo,
    });

    if (error) {
      throw new Error(
        typeof error === "string" ? error : "Failed to send email"
      );
    }

    return { ok: true };
  },
});

export const sendNewsletterToAll = action({
  args: {
    subject: v.optional(v.string()),
    html: v.optional(v.string()),
    text: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured. Add it in Integrations > Resend.");
    }
    const resend = new Resend(apiKey);

    const from =
      process.env.RESEND_FROM_EMAIL?.trim() || "LUXE <onboarding@resend.dev>";
    const replyTo =
      process.env.RESEND_REPLY_TO?.trim() || "luxe.premium.in@gmail.com";

    const subscribers = await ctx.runQuery(internal.subscribers.all, {});

    if (!subscribers || subscribers.length === 0) {
      return { ok: true, sent: 0 };
    }

    const subject =
      (args.subject ?? "LUXE — New Update") as string;
    const html =
      (args.html ??
        `<div style="font-family: Helvetica Neue, Arial, sans-serif; color:#111; line-height:1.6;">
           <h1 style="margin:0 0 12px; font-size:22px;">Latest from LUXE</h1>
           <p style="margin:0 0 12px;">Thank you for subscribing. We've got fresh drops and deals—reply if you want early access.</p>
           <p style="margin:0 0 12px;">— Team LUXE</p>
         </div>`) as string;

    let sent = 0;
    for (const batch of chunk(subscribers.map(s => s.email), 50)) {
      const { error } = await resend.emails.send({
        from,
        to: batch,
        subject,
        html,
        replyTo,
      });
      if (error) {
        // Continue sending to the rest; surface a generic error if all fail
        // but we won't throw to avoid stopping halfway.
        // You can inspect logs in Resend dashboard if needed.
      } else {
        sent += batch.length;
      }
      // minimal pacing
      await wait(150);
    }

    return { ok: true, sent };
  },
});

// Helpers
function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function chunk<T>(arr: Array<T>, size: number): Array<Array<T>> {
  const out: Array<Array<T>> = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}