"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const crypto = require("node:crypto");

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const allowedOrigins = [
  "http://127.0.0.1:5500",
  "http://localhost:5500",
  "https://techglowsolutionsindia.github.io",
];

if (process.env.FRONTEND_ORIGIN) {
  allowedOrigins.push(process.env.FRONTEND_ORIGIN.replace(/\/$/, ""));
}

app.disable("x-powered-by");

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("CORS origin not allowed"));
    },
    methods: ["GET", "POST"],
  }),
);

app.use(express.json({ limit: "20kb" }));

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;
const NAME_PATTERN =
  /^[A-Za-zÀ-ÿ\u0900-\u097F][A-Za-zÀ-ÿ\u0900-\u097F\s.'-]{1,59}$/;

const cleanText = (value, maxLength = 1000) =>
  typeof value === "string" ? value.trim().slice(0, maxLength + 1) : "";

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const emailConfig = () => {
  const required = ["BREVO_API_KEY", "BREVO_SENDER_EMAIL", "OWNER_EMAIL"];

  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`${key} is not configured`);
    }
  }
};

async function brevoRequest(path, payload) {
  if (!process.env.BREVO_API_KEY) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  const response = await fetch(`https://api.brevo.com/v3${path}`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "api-key": process.env.BREVO_API_KEY,
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    console.error("Brevo API error:", {
      status: response.status,
      body: errorBody,
    });

    throw new Error(`Brevo API request failed: HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
}

async function sendEmail({ to, subject, text, html, replyTo }) {
  emailConfig();

  const payload = {
    sender: {
      name: process.env.BREVO_SENDER_NAME || "FitCore Fitness",
      email: process.env.BREVO_SENDER_EMAIL,
    },
    to,
    subject,
    textContent: text,
    htmlContent: html,
  };

  if (replyTo) {
    payload.replyTo = { email: replyTo };
  }

  return brevoRequest("/smtp/email", payload);
}

// Basic in-memory request limiting.
// This resets when the server restarts.
const requestCounts = new Map();

function rateLimit(request, response, next) {
  const now = Date.now();
  const key = request.ip;
  const previous = requestCounts.get(key);

  if (!previous || now - previous.start > 60000) {
    requestCounts.set(key, {
      start: now,
      count: 1,
    });
    return next();
  }

  previous.count += 1;

  if (previous.count > 5) {
    return response.status(429).json({
      success: false,
      message: "Too many requests. Please try again later.",
    });
  }

  next();
}

setInterval(() => {
  const now = Date.now();

  for (const [key, value] of requestCounts) {
    if (now - value.start > 60000) {
      requestCounts.delete(key);
    }
  }
}, 60000).unref();

function validateContact(body) {
  const name = cleanText(body.name, 60);
  const email = cleanText(body.email, 254).toLowerCase();
  const phone = cleanText(body.phone, 30).replace(/\D/g, "");
  const message = cleanText(body.message, 1000);
  const membership = cleanText(body.membership, 100);

  if (!NAME_PATTERN.test(name)) {
    return { error: "Please enter a valid name." };
  }

  if (!PHONE_PATTERN.test(phone)) {
    return { error: "Please enter a valid 10-digit mobile number." };
  }

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { error: "Please enter a valid email address." };
  }

  if (message.length < 10 || message.length > 1000) {
    return {
      error: "Message must contain between 10 and 1000 characters.",
    };
  }

  if (membership.length > 100) {
    return { error: "Invalid membership selection." };
  }

  return {
    data: { name, email, phone, message, membership },
  };
}

async function saveToSheets(record) {
  const url = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET;

  if (!url || !secret) {
    return { configured: false, saved: false };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      ...record,
      secret,
    }),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    throw new Error(`Google Sheets webhook failed: HTTP ${response.status}`);
  }

  const result = await response.json();

  if (result.success !== true) {
    throw new Error("Google Sheets did not confirm saving");
  }

  return { configured: true, saved: true };
}

app.get("/", (request, response) => {
  response.json({
    service: "FitCore Fitness Backend",
    status: "running",
  });
});

// Contact enquiries
app.post("/api/contact", rateLimit, async (request, response) => {
  try {
    const body = request.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return response.status(400).json({
        success: false,
        message: "Invalid request.",
      });
    }

    // Honeypot field
    if (cleanText(body.website)) {
      return response.json({
        success: true,
        message: "Request received.",
      });
    }

    const validation = validateContact(body);

    if (validation.error) {
      return response.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const { name, email, phone, message, membership } = validation.data;

    const enquiryId = crypto.randomUUID();
    const submittedAt = new Date().toISOString();

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br>");
    const safeMembership = escapeHtml(membership || "Not specified");

    const ownerSubject = `FitCore Fitness Enquiry - ${name}`;

    const ownerText = [
      "New FitCore Fitness Enquiry",
      `Reference: ${enquiryId}`,
      `Name: ${name}`,
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Membership Interest: ${membership || "Not specified"}`,
      "",
      "Message:",
      message,
    ].join("\n");

    const ownerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:24px;background:#f7f7f7;">
        <div style="background:#111111;color:#ffbf00;padding:20px;border-radius:10px 10px 0 0;">
          <h2 style="margin:0;">New FitCore Fitness Enquiry</h2>
        </div>
        <div style="background:#ffffff;padding:24px;">
          <p><strong>Reference:</strong> ${enquiryId}</p>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Phone:</strong> ${safePhone}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Membership Interest:</strong> ${safeMembership}</p>
          <h3>Customer Message</h3>
          <p style="line-height:1.7;overflow-wrap:anywhere;">${safeMessage}</p>
        </div>
      </div>
    `;

    const customerSubject = "Thank You for Contacting FitCore Fitness";

    const customerText = [
      `Dear ${name},`,
      "",
      "Thank you for contacting FitCore Fitness!",
      "We have received your enquiry.",
      "",
      `Reference: ${enquiryId}`,
      "",
      "Your Message:",
      message,
      "",
      "Our team will get back to you as soon as possible.",
      "",
      "Best regards,",
      "FitCore Fitness Team",
    ].join("\n");

    const customerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;padding:24px;background:#f7f7f7;">
        <div style="background:#111111;color:#ffbf00;padding:20px;border-radius:10px 10px 0 0;">
          <h2 style="margin:0;">Thank You for Contacting FitCore Fitness!</h2>
        </div>
        <div style="background:#ffffff;padding:24px;">
          <p>Dear ${safeName},</p>
          <p>Thank you for your interest in FitCore Fitness.</p>
          <p>We have received your enquiry and will respond as soon as possible.</p>
          <p><strong>Reference:</strong> ${enquiryId}</p>
          <h3>Your Message</h3>
          <p style="line-height:1.7;overflow-wrap:anywhere;">${safeMessage}</p>
          <p>Best regards,<br><strong>FitCore Fitness Team</strong></p>
        </div>
      </div>
    `;

    const results = await Promise.allSettled([
      sendEmail({
        to: [{ email: process.env.OWNER_EMAIL }],
        replyTo: email,
        subject: ownerSubject,
        text: ownerText,
        html: ownerHtml,
      }),
      sendEmail({
        to: [{ email, name }],
        subject: customerSubject,
        text: customerText,
        html: customerHtml,
      }),
    ]);

    const ownerAccepted = results[0].status === "fulfilled";
    const customerAccepted = results[1].status === "fulfilled";

    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          index === 0 ? "Owner email failed:" : "Customer email failed:",
          result.reason,
        );
      }
    });

    if (!ownerAccepted) {
      return response.status(502).json({
        success: false,
        ownerEmailAccepted: false,
        customerEmailAccepted: customerAccepted,
        message:
          "We could not deliver your enquiry to the gym. Please contact us directly.",
      });
    }

    let sheetsSaved = false;

    try {
      const sheetResult = await saveToSheets({
        type: "contact",
        enquiryId,
        submittedAt,
        name,
        phone,
        email,
        membership,
        message,
        status: "New",
      });

      sheetsSaved = sheetResult.saved;
    } catch (error) {
      console.error("Google Sheets error:", error.message);
    }

    return response.status(200).json({
      success: true,
      ownerEmailAccepted: true,
      customerEmailAccepted: customerAccepted,
      sheetsSaved,
      message: customerAccepted
        ? "Your enquiry was submitted successfully. A confirmation email has been requested."
        : "Your enquiry was submitted, but we could not send your confirmation email.",
    });
  } catch (error) {
    console.error("Contact processing error:", error);

    return response.status(500).json({
      success: false,
      message: "Something went wrong. Please try again later.",
    });
  }
});

// Gym visit / trial requests
app.post("/api/visit", rateLimit, async (request, response) => {
  try {
    const body = request.body;

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return response.status(400).json({
        success: false,
        message: "Invalid request.",
      });
    }

    if (cleanText(body.website)) {
      return response.json({
        success: true,
        message: "Request received.",
      });
    }

    const validation = validateContact(body);

    if (validation.error) {
      return response.status(400).json({
        success: false,
        message: validation.error,
      });
    }

    const { name, email, phone, message, membership } = validation.data;

    const visitDate = cleanText(body.visitDate, 10);
    const visitTime = cleanText(body.visitTime, 5);
    const visitType = cleanText(body.visitType, 30);

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(visitDate) ||
      !/^\d{2}:\d{2}$/.test(visitTime) ||
      !["Gym Tour", "Free Trial"].includes(visitType)
    ) {
      return response.status(400).json({
        success: false,
        message: "Please select a valid visit date, time and type.",
      });
    }

    const requestedAt = new Date(`${visitDate}T${visitTime}:00+05:30`);

    if (
      Number.isNaN(requestedAt.getTime()) ||
      requestedAt.getTime() <= Date.now() ||
      requestedAt.getTime() > Date.now() + 90 * 86400000
    ) {
      return response.status(400).json({
        success: false,
        message: "Please choose a future date within 90 days.",
      });
    }

    const safeName = escapeHtml(name);
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br>");

    const ownerResult = await Promise.allSettled([
      sendEmail({
        to: [{ email: process.env.OWNER_EMAIL }],
        replyTo: email,
        subject: `FitCore ${visitType} Request - ${name}`,
        text: [
          `New ${visitType} Request`,
          `Name: ${name}`,
          `Phone: ${phone}`,
          `Email: ${email}`,
          `Date: ${visitDate}`,
          `Time: ${visitTime} IST`,
          `Membership: ${membership || "Not specified"}`,
          `Message: ${message}`,
        ].join("\n"),
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px;">
            <h2>New ${visitType} Request</h2>
            <p><strong>Name:</strong> ${safeName}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Date:</strong> ${visitDate}</p>
            <p><strong>Time:</strong> ${visitTime} IST</p>
            <p><strong>Membership:</strong> ${escapeHtml(membership || "Not specified")}</p>
            <p><strong>Message:</strong> ${safeMessage}</p>
          </div>
        `,
      }),
      sendEmail({
        to: [{ email, name }],
        subject: `FitCore Fitness ${visitType} Request Received`,
        text: [
          `Dear ${name},`,
          "",
          `We have received your ${visitType.toLowerCase()} request.`,
          `Requested date: ${visitDate}`,
          `Requested time: ${visitTime} IST`,
          "",
          "This is not a confirmed booking.",
          "Our team will contact you to confirm availability.",
          "",
          "FitCore Fitness Team",
        ].join("\n"),
        html: `
          <div style="font-family:Arial,sans-serif;padding:24px;">
            <h2>FitCore Fitness</h2>
            <p>Dear ${safeName},</p>
            <p>We have received your ${visitType.toLowerCase()} request.</p>
            <p><strong>Date:</strong> ${visitDate}</p>
            <p><strong>Time:</strong> ${visitTime} IST</p>
            <p><strong>This is not a confirmed booking.</strong></p>
            <p>Our team will contact you to confirm availability.</p>
          </div>
        `,
      }),
    ]);

    const ownerAccepted = ownerResult[0].status === "fulfilled";
    const customerAccepted = ownerResult[1].status === "fulfilled";

    ownerResult.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(
          index === 0
            ? "Visit owner email failed:"
            : "Visit customer email failed:",
          result.reason,
        );
      }
    });

    if (!ownerAccepted) {
      return response.status(502).json({
        success: false,
        ownerEmailAccepted: false,
        customerEmailAccepted: customerAccepted,
        message:
          "We could not send your visit request to the gym. Please contact us directly.",
      });
    }

    let sheetsSaved = false;

    try {
      const result = await saveToSheets({
        type: "visit",
        enquiryId: crypto.randomUUID(),
        submittedAt: new Date().toISOString(),
        name,
        phone,
        email,
        membership,
        message,
        visitType,
        visitDate,
        visitTime,
        status: "Pending Confirmation",
      });

      sheetsSaved = result.saved;
    } catch (error) {
      console.error("Visit Google Sheets error:", error.message);
    }

    return response.json({
      success: true,
      ownerEmailAccepted: true,
      customerEmailAccepted: customerAccepted,
      sheetsSaved,
      message: customerAccepted
        ? "Your visit request was received. Our team will confirm availability."
        : "Your visit request was received, but the confirmation email could not be sent.",
    });
  } catch (error) {
    console.error("Visit request error:", error);

    return response.status(500).json({
      success: false,
      message: "We could not process your request.",
    });
  }
});

app.use((error, request, response, next) => {
  console.error("Request error:", error.message);

  if (error.type === "entity.too.large") {
    return response.status(413).json({
      success: false,
      message: "Request is too large.",
    });
  }

  return response.status(400).json({
    success: false,
    message: "Invalid request.",
  });
});

app.listen(PORT, () => {
  console.log(`FitCore Fitness backend running on port ${PORT}`);
});
