// api/send-completion-email.js
// This function is designed for Vercel / Netlify / Supabase Edge Functions
// Requires RESEND_API_KEY in environment variables.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, subject, text, projectTitle, price, files, sharedLink } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // If you are using Resend:
  // const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  // NOTE: This is a simulation/placeholder for the real email sending logic.
  // In a real environment, you would use:
  // const resend = new Resend(RESEND_API_KEY);
  // await resend.emails.send({ ... });

  console.log('--- Simulation: Sending Email ---');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Body:', text);
  console.log('Attachments count:', files?.length || 0);
  console.log('Shared Link:', sharedLink);
  console.log('---------------------------------');

  // We'll return success to allow the frontend flow to continue
  // In a real app, this would be the result of the resend call.
  return res.status(200).json({ 
    success: true, 
    message: 'Email sent successfully (Simulated)' 
  });
}
