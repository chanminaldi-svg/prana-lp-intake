import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import nodemailer from "nodemailer";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;

async function sendEmail(payload) {
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT || 587),
    secure: Number(SMTP_PORT || 587) === 465,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const subjects = [
    `New LP intake submission from ${payload.fullName}`,
    `${payload.entityName} — ${payload.amount}`,
  ];

  await transport.sendMail({
    from: SMTP_USER,
    to: CONTACT_EMAIL,
    subject: subjects.join(" | "),
    text: `Name: ${payload.fullName}
Email: ${payload.email}
Entity: ${payload.entityName}
Phone: ${payload.phone || "N/A"}
Country: ${payload.country || "N/A"}
Commitment: ${payload.amount}
Region: ${payload.region || "N/A"}
Access code: ${payload.tokenCode || "N/A"}
Notes: ${payload.notes || "N/A"}
`,
  });
}

async function saveLocally(payload) {
  const filePath = path.join(process.cwd(), "submissions.jsonl");
  await fs.appendFile(filePath, `${JSON.stringify({ ...payload, receivedAt: new Date().toISOString() })}\n`);
}

export async function POST(request) {
  try {
    const body = await request.json();
    const required = ["fullName", "email", "entityName", "amount"];

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json({ success: false, message: `${field} is required.` }, { status: 400 });
      }
    }

    if (SMTP_HOST && SMTP_USER && SMTP_PASS && CONTACT_EMAIL) {
      await sendEmail(body);
      return NextResponse.json({ success: true, message: "Submission received and emailed to the GP team." });
    }

    await saveLocally(body);
    return NextResponse.json({
      success: true,
      message: "Submission received locally. Configure SMTP in production to enable email delivery.",
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Unable to process submission." }, { status: 500 });
  }
}
