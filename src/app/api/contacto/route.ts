import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const MAX_PAYLOAD_BYTES = 12 * 1024;
const SUCCESS_MESSAGE = "Tu consulta fue enviada correctamente. Pronto te contactaremos.";
const VALIDATION_MESSAGE = "Revisa los campos marcados antes de enviar tu consulta.";
const GENERIC_ERROR_MESSAGE = "No se pudo enviar la consulta en este momento.";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  website?: unknown;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeNicaraguaPhone(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("505") && digits.length === 11) {
    digits = digits.slice(3);
  }

  return digits;
}

function isValidNicaraguaPhone(value: string) {
  const digits = normalizeNicaraguaPhone(value);

  return digits.length === 8 && /^[2578]/.test(digits);
}

function getPayloadSize(value: string) {
  return new TextEncoder().encode(value).length;
}

function validationResponse() {
  return NextResponse.json(
    {
      success: false,
      message: VALIDATION_MESSAGE,
    },
    { status: 400 },
  );
}

function genericErrorResponse(status = 500) {
  return NextResponse.json(
    {
      success: false,
      message: GENERIC_ERROR_MESSAGE,
    },
    { status },
  );
}

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      message: "Método no permitido.",
    },
    {
      status: 405,
      headers: {
        Allow: "POST",
      },
    },
  );
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      Allow: "POST, OPTIONS",
    },
  });
}

export async function POST(request: Request) {
  try {
    const contentLength = Number(request.headers.get("content-length") || 0);

    if (contentLength > MAX_PAYLOAD_BYTES) {
      return genericErrorResponse(413);
    }

    const rawBody = await request.text();

    if (!rawBody || getPayloadSize(rawBody) > MAX_PAYLOAD_BYTES) {
      return genericErrorResponse(413);
    }

    let body: ContactPayload;

    try {
      body = JSON.parse(rawBody) as ContactPayload;
    } catch {
      return validationResponse();
    }

    const name = normalizeText(body.name);
    const email = normalizeText(body.email).toLowerCase();
    const phone = normalizeText(body.phone);
    const message = normalizeText(body.message);
    const website = normalizeText(body.website);

    // Honeypot anti-spam: usuarios reales no llenan este campo oculto.
    if (website) {
      return NextResponse.json({
        success: true,
        message: SUCCESS_MESSAGE,
      });
    }

    const hasInvalidFields =
      name.length < 3 ||
      name.length > 80 ||
      email.length > 120 ||
      !isValidEmail(email) ||
      phone.length > 20 ||
      !isValidNicaraguaPhone(phone) ||
      message.length < 10 ||
      message.length > 1500;

    if (hasInvalidFields) {
      return validationResponse();
    }

    const resendApiKey = process.env.RESEND_API_KEY;
    const contactToEmail = process.env.CONTACT_TO_EMAIL;

    if (!resendApiKey || !contactToEmail) {
      console.error("Contacto API: faltan variables RESEND_API_KEY o CONTACT_TO_EMAIL.");
      return genericErrorResponse(503);
    }

    const resend = new Resend(resendApiKey);

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeMessage = escapeHtml(message).replaceAll("\n", "<br />");
    const submittedAt = new Intl.DateTimeFormat("es-NI", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "America/Managua",
    }).format(new Date());

    const { error } = await resend.emails.send({
      from:
        process.env.CONTACT_FROM_EMAIL ||
        "BTL Marketing <onboarding@resend.dev>",
      to: [contactToEmail],
      replyTo: email,
      subject: "Nuevo lead desde formulario de contacto - BTL Marketing",
      html: `
        <div style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
          <h2 style="margin: 0 0 16px;">Nuevo lead desde formulario de contacto</h2>

          <p><strong>Nombre:</strong> ${safeName}</p>
          <p><strong>Correo:</strong> ${safeEmail}</p>
          <p><strong>Teléfono:</strong> ${safePhone}</p>
          <p><strong>Fecha:</strong> ${submittedAt}</p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;" />

          <p><strong>Mensaje:</strong></p>
          <p>${safeMessage}</p>
        </div>
      `,
    });

    if (error) {
      console.error("Contacto API: Resend no pudo enviar el correo.", error);
      return genericErrorResponse(502);
    }

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGE,
    });
  } catch (error) {
    console.error("Contacto API: error inesperado.", error);
    return genericErrorResponse();
  }
}
