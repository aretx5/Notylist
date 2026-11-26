// Email utility for contact form
// In production, integrate with SendGrid, Resend, or Nodemailer

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  // For now, just log it (replace with actual email service)
  console.log('Contact form submission:', data);
  
  // In production, use a service like Resend:
  // const { Resend } = require('resend');
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: 'noreply@notylist.com',
  //   to: 'support@notylist.com',
  //   subject: `Contact: ${data.subject}`,
  //   html: `<p><strong>From:</strong> ${data.name} (${data.email})</p><p>${data.message}</p>`
  // });
  
  return { success: true };
}
