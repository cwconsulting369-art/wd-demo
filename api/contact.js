// Kontaktformular-Handler für den Wohnen+Design-Entwurf.
// Sendet über Resend an AEVUM (info@aevum-system.de), NICHT direkt an die echte Firma —
// dieser Entwurf ist unbeauftragt, Wohnen + Design weiß nichts von dieser Seite.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const { name, email, phone, message, website } = body;

  // Honeypot: Bots füllen verstecktes Feld aus, Menschen nicht.
  if (website) {
    res.status(200).json({ ok: true });
    return;
  }

  if (!name || !email || !message) {
    res.status(400).json({ error: "Name, E-Mail und Nachricht sind erforderlich." });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    res.status(400).json({ error: "Ungültige E-Mail-Adresse." });
    return;
  }
  if (String(message).length > 5000 || String(name).length > 200) {
    res.status(400).json({ error: "Eingabe zu lang." });
    return;
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY fehlt");
    res.status(500).json({ error: "Serverfehler." });
    return;
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "AEVUM Demo-Formular <formular@aevum-system.de>",
        to: ["info@aevum-system.de"],
        reply_to: email,
        subject: `Neue Anfrage über Wohnen+Design-Demo — ${name}`,
        text:
          `Name: ${name}\n` +
          `E-Mail: ${email}\n` +
          `Telefon: ${phone || "–"}\n\n` +
          `Nachricht:\n${message}\n\n` +
          `---\n` +
          `Diese Anfrage kam über den unbeauftragten AEVUM-Design-Entwurf für ` +
          `wd-amann-kaltenecker-direkt.de (wd-demo.aevum-system.de). ` +
          `NICHT automatisch an Wohnen + Design weiterleiten — erst Rücksprache halten, ` +
          `da die Firma von diesem Entwurf nichts weiß.`
      })
    });

    if (!r.ok) {
      const errText = await r.text();
      console.error("Resend error:", r.status, errText);
      res.status(502).json({ error: "Nachricht konnte nicht gesendet werden." });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Serverfehler." });
  }
}
