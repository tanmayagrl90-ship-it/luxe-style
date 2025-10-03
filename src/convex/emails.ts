"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

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
    });

    if (error) {
      throw new Error(
        typeof error === "string" ? error : "Failed to send email"
      );
    }

    return { ok: true };
  },
});
