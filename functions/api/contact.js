
export async function onRequestPost({ request, env }) {
  const origin = request.headers.get("Origin");
  const siteOrigin = new URL(request.url).origin;

  if (origin && origin !== siteOrigin) {
    return Response.json(
      { success: false, message: "Request not allowed." },
      { status: 403 }
    );
  }

  let data;

  try {
    data = await request.formData();
  } catch {
    return Response.json(
      { success: false, message: "Invalid form submission." },
      { status: 400 }
    );
  }

  const name = String(data.get("name") || "").trim();
  const email = String(data.get("email") || "").trim();
  const service = String(data.get("service") || "").trim();
  const message = String(data.get("message") || "").trim();

  if (!name || !email || !service || !message) {
    return Response.json(
      { success: false, message: "Please complete all fields." },
      { status: 400 }
    );
  }

  if (
    name.length > 100 ||
    email.length > 254 ||
    service.length > 100 ||
    message.length > 5000 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return Response.json(
      { success: false, message: "Please check your details." },
      { status: 400 }
    );
  }

  if (!env.RESEND_API_KEY || !env.SENDER_EMAIL) {
    return Response.json(
      { success: false, message: "Email service is not configured." },
      { status: 500 }
    );
  }

  const emailBody = [
    "New client enquiry from Zyvera Digital",
    "",
    `Name: ${name}`,
    `Client email: ${email}`,
    `Service requested: ${service}`,
    "",
    "Project message:",
    message
  ].join("\n");

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: env.SENDER_EMAIL,
        to: ["zyveradigital037@gmail.com"],
        reply_to: email,
        subject: `New Client Enquiry - ${service}`,
        text: emailBody
      })
    });

    if (!response.ok) {
      console.error("Email provider returned status:", response.status);

      return Response.json(
        {
          success: false,
          message: "Email could not be sent. Please try again later."
        },
        { status: 502 }
      );
    }

    return Response.json({
      success: true,
      message: "Thank you! Your enquiry has been submitted."
    });
  } catch {
    return Response.json(
      {
        success: false,
        message: "Email service is temporarily unavailable."
      },
      { status: 502 }
    );
  }
}
