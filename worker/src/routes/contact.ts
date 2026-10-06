import { Hono } from 'hono';
import { Env } from '../types';

const contact = new Hono<{ Bindings: Env }>();

// Send contact form email
contact.post('/', async (c) => {
  const body = await c.req.json();
  const { name, email, message, language } = body;

  // Validation
  if (!name || !email || !message) {
    return c.json({ error: 'Name, email, and message are required' }, 400);
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json({ error: 'Invalid email address' }, 400);
  }

  if (!c.env.BREVO_API_KEY) {
    console.error('Brevo API key not configured');
    return c.json({ error: 'Email service not configured' }, 500);
  }

  try {
    // Email 1: Send to info@sterrenverhalen.nl with customer details
    const toInfoEmail = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': c.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Sterren Verhalen Contactformulier',
          email: 'info@sterrenverhalen.nl'
        },
        to: [{
          email: 'info@sterrenverhalen.nl',
          name: 'Sterren Verhalen'
        }],
        replyTo: {
          email: email,
          name: name
        },
        subject: language === 'nl' 
          ? `Nieuw contactformulier bericht van ${name}` 
          : `New contact form message from ${name}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
              ${language === 'nl' ? 'Nieuw Contactformulier Bericht' : 'New Contact Form Message'}
            </h2>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <p><strong>${language === 'nl' ? 'Van' : 'From'}:</strong> ${name}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #6366f1;">${email}</a></p>
            </div>
            
            <div style="background: #ffffff; padding: 20px; border-left: 4px solid #6366f1; margin: 20px 0;">
              <h3 style="margin-top: 0;">${language === 'nl' ? 'Bericht' : 'Message'}:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #666;">
              ${language === 'nl' 
                ? 'Dit bericht is verzonden via het contactformulier op sterrenverhalen.nl' 
                : 'This message was sent via the contact form on sterrenverhalen.nl'}
            </p>
          </div>
        `
      })
    });

    if (!toInfoEmail.ok) {
      const errorText = await toInfoEmail.text();
      console.error('Brevo email API error (to info):', toInfoEmail.status, errorText);
      return c.json({ error: 'Failed to send email' }, 500);
    }

    // Email 2: Send confirmation copy to customer
    const toCustomerEmail = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': c.env.BREVO_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sender: {
          name: 'Sterren Verhalen',
          email: 'info@sterrenverhalen.nl'
        },
        to: [{
          email: email,
          name: name
        }],
        subject: language === 'nl' 
          ? 'Bedankt voor je bericht!' 
          : 'Thank you for your message!',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
            <h2 style="color: #6366f1;">
              ${language === 'nl' ? `Beste ${name},` : `Dear ${name},`}
            </h2>
            
            <p>${language === 'nl' 
              ? 'Bedankt voor je bericht! We hebben je vraag goed ontvangen en zullen zo snel mogelijk reageren.' 
              : 'Thank you for your message! We have received your inquiry and will respond as soon as possible.'}</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin-top: 0;">${language === 'nl' ? 'Jouw bericht' : 'Your message'}:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            
            <p>${language === 'nl' 
              ? 'We streven ernaar om binnen 24 uur te reageren.' 
              : 'We aim to respond within 24 hours.'}</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
            
            <p style="margin-top: 30px;">
              <strong>${language === 'nl' ? 'Met vriendelijke groet,' : 'Best regards,'}</strong><br>
              Het Sterren Verhalen-team
            </p>
            
            <p style="font-size: 12px; color: #666; margin-top: 30px;">
              ${language === 'nl' 
                ? 'Vragen? Neem contact met ons op via' 
                : 'Questions? Contact us at'} 
              <a href="mailto:info@sterrenverhalen.nl" style="color: #6366f1;">info@sterrenverhalen.nl</a>
            </p>
          </div>
        `
      })
    });

    if (!toCustomerEmail.ok) {
      const errorText = await toCustomerEmail.text();
      console.error('Brevo email API error (to customer):', toCustomerEmail.status, errorText);
      // Don't fail if customer confirmation fails, main email was sent
    }

    const infoEmailData = await toInfoEmail.json();
    console.log('Contact form email sent to info@sterrenverhalen.nl:', infoEmailData);
    
    if (toCustomerEmail.ok) {
      const customerEmailData = await toCustomerEmail.json();
      console.log('Confirmation email sent to customer:', customerEmailData);
    }

    return c.json({ 
      success: true, 
      message: language === 'nl' 
        ? 'Bericht succesvol verzonden' 
        : 'Message sent successfully' 
    });
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return c.json({ error: 'Failed to send email' }, 500);
  }
});

export default contact;

