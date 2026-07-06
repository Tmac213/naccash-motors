import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const router = Router();
const prisma = new PrismaClient();

// Send inquiry email
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, email, message } = req.body;

    // Get settings to find the recipient email
    const settings = await prisma.settings.findUnique({
      where: { id: 1 }
    });

    const recipientEmail = settings?.email || 'info@naccashmotors.com';

    // Configure email transporter (using Gmail as example - you'll need to set up environment variables)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.SMTP_FROM || email,
      to: recipientEmail,
      subject: `New Inquiry from ${firstName} ${lastName}`,
      text: `
Name: ${firstName} ${lastName}
Email: ${email}

Message:
${message}
      `,
      html: `
        <h2>New Inquiry from ${firstName} ${lastName}</h2>
        <p><strong>Email:</strong> ${email}</p>
        <h3>Message:</h3>
        <p>${message}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({ success: true, message: 'Inquiry sent successfully!' });
  } catch (error) {
    console.error('Error sending inquiry:', error);
    res.status(500).json({ error: 'Failed to send inquiry. Please try again.' });
  }
});

export default router;
