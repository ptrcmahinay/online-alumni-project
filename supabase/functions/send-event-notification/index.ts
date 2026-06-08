import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "jsr:@supabase/supabase-js@2"
import { Resend } from "npm:resend@4.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!)
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
)

interface Payload {
  userIds: string[]
  eventTitle: string
  eventType: string
  eventDate: string
  eventTime: string
  eventLocation: string | null
  eventDescription: string | null
}

Deno.serve(async (req) => {
  try {
    const payload: Payload = await req.json()

    const { data: users } = await supabase.auth.admin.listUsers()
    const emailMap = new Map(
      users?.users.map((u) => [u.id, u.email]) ?? [],
    )

    const recipients = payload.userIds
      .map((id) => ({ id, email: emailMap.get(id) }))
      .filter((r): r is { id: string; email: string } => !!r.email)

    if (recipients.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: "No recipients with email" }))
    }

    const dateObj = new Date(payload.eventDate)
    const formattedDate = dateObj.toLocaleDateString("en-PH", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    })

    const html = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f4f4f5; }
          .container { max-width: 600px; margin: 0 auto; padding: 32px 24px; }
          .card { background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          h1 { font-size: 22px; color: #00342B; margin: 0 0 8px; }
          .badge { display: inline-block; background: #dcfce7; color: #166534; font-size: 12px; padding: 4px 10px; border-radius: 999px; margin-bottom: 20px; }
          .details { margin: 20px 0; padding: 16px; background: #f8f9fa; border-radius: 8px; }
          .detail-row { display: flex; gap: 8px; margin-bottom: 8px; font-size: 14px; }
          .detail-label { font-weight: 600; min-width: 80px; color: #6b7280; }
          .footer { margin-top: 24px; font-size: 12px; color: #9ca3af; text-align: center; }
          .btn { display: inline-block; background: #00342B; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; margin-top: 20px; }
        </style></head>
        <body>
          <div class="container">
            <div class="card">
              <h1>${payload.eventTitle}</h1>
              <span class="badge">${payload.eventType}</span>
              <div class="details">
                <div class="detail-row"><span class="detail-label">Date:</span> <span>${formattedDate}</span></div>
                <div class="detail-row"><span class="detail-label">Time:</span> <span>${payload.eventTime}</span></div>
                ${payload.eventLocation ? `<div class="detail-row"><span class="detail-label">Location:</span> <span>${payload.eventLocation}</span></div>` : ""}
              </div>
              ${payload.eventDescription ? `<div style="font-size:14px;color:#374151;margin-top:16px;">${payload.eventDescription}</div>` : ""}
              <a href="${Deno.env.get("SITE_URL") || "http://localhost:5173"}/events" class="btn">View Event</a>
            </div>
            <div class="footer">You received this email as a registered alumni of CvSU Naic.</div>
          </div>
        </body>
      </html>
    `

    const { error } = await resend.emails.send({
      from: "CvSU Naic Alumni <onboarding@resend.dev>",
      to: recipients.map((r) => r.email),
      subject: `New Event: ${payload.eventTitle}`,
      html,
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ sent: recipients.length }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
