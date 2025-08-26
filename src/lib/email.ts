import * as nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

// Verify transporter configuration
transporter.verify(function(error, success) {
  if (error) {
    console.error('Email transporter error:', error);
    console.error('Please check your EMAIL_USER and EMAIL_PASS in .env.local');
    console.error('Make sure you are using an App Password, not your regular Gmail password');
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Log email configuration (without password)
console.log('Email configuration check:');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set' : 'NOT SET');

export interface StudentData {
  name: string;
  currentClass: string;
  schoolName: string;
  phoneNumber: string;
  email: string;
  prerequisites: any;
}

// Send notification email to admin
export async function sendAdminNotification(studentData: StudentData) {
  const prerequisitesList = Object.entries(studentData.prerequisites)
    .filter(([_, value]) => value === true)
    .map(([key, _]) => key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()))
    .join(', ');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'sachin.gadkar@gmail.com',
    subject: 'New Student Registration - Math Olympiad Program',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          New Student Registration
        </h2>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Student Details:</h3>
          
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Name:</td>
              <td style="padding: 8px 0; color: #6b7280;">${studentData.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Class:</td>
              <td style="padding: 8px 0; color: #6b7280;">${studentData.currentClass}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">School:</td>
              <td style="padding: 8px 0; color: #6b7280;">${studentData.schoolName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Phone:</td>
              <td style="padding: 8px 0; color: #6b7280;">${studentData.phoneNumber}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email:</td>
              <td style="padding: 8px 0; color: #6b7280;">${studentData.email}</td>
            </tr>
          </table>
        </div>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">Prerequisites Knowledge:</h3>
          <p style="color: #6b7280; margin: 0;">
            ${prerequisitesList || 'No prerequisites selected'}
          </p>
        </div>
        
        <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #92400e; margin: 0; font-size: 14px;">
            <strong>Action Required:</strong> Please review this application and contact the student within 2-3 business days.
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 12px;">
            This is an automated notification from the Math Olympiad Registration System.
          </p>
        </div>
      </div>
    `
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured');
      return false;
    }
    
    await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent successfully');
    return true;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    return false;
  }
}

// Send thank you email to student
export async function sendThankYouEmail(studentData: StudentData) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: studentData.email,
    subject: 'Thank you for your registration - Math Olympiad Program',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">
          Thank you for your registration!
        </h2>
        
        <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Dear <strong>${studentData.name}</strong>,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Thank you for registering for our Math Olympiad preparation program! We're excited to have you join our community of aspiring mathematicians.
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            We have received your application and our team will review it within <strong>2-3 business days</strong>. You can expect to hear from us soon regarding the next steps.
          </p>
        </div>
        
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #374151; margin-top: 0;">What happens next?</h3>
          <ol style="color: #374151; line-height: 1.8;">
            <li><strong>Application Review:</strong> We'll carefully review your application and prerequisites</li>
            <li><strong>Assessment Call:</strong> We'll contact you to discuss your goals and conduct a brief assessment</li>
            <li><strong>Program Access:</strong> Once approved, you'll get to join to Olympiad Program</li>
          </ol>
        </div>
        
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #065f46; margin-top: 0;">Your Registration Details:</h3>
          <p style="color: #065f46; margin: 5px 0;"><strong>Name:</strong> ${studentData.name}</p>
          <p style="color: #065f46; margin: 5px 0;"><strong>Class:</strong> ${studentData.currentClass}</p>
          <p style="color: #065f46; margin: 5px 0;"><strong>School:</strong> ${studentData.schoolName}</p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">
            If you have any questions, please don't hesitate to contact us.
          </p>
          <p style="color: #6b7280; font-size: 12px;">
            Best regards,<br>
            Math Olympiad Preparation Team
          </p>
        </div>
      </div>
    `
  };

  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email credentials not configured');
      return false;
    }
    
    await transporter.sendMail(mailOptions);
    console.log('Thank you email sent successfully to:', studentData.email);
    return true;
  } catch (error) {
    console.error('Error sending thank you email:', error);
    return false;
  }
}

// Verify email format and domain
export function validateEmail(email: string): { isValid: boolean; reason?: string } {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, reason: 'Invalid email format' };
  }

  // Check for common disposable email domains
  const disposableDomains = [
    'tempmail.org', 'guerrillamail.com', 'mailinator.com', '10minutemail.com',
    'throwaway.email', 'temp-mail.org', 'fakeinbox.com', 'sharklasers.com',
    'getairmail.com', 'mailnesia.com', 'maildrop.cc', 'yopmail.com'
  ];

  const domain = email.split('@')[1]?.toLowerCase();
  if (disposableDomains.includes(domain)) {
    return { isValid: false, reason: 'Disposable email addresses are not allowed' };
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /^test/, /^admin/, /^info/, /^contact/, /^hello/, /^hi@/, /^a@/, /^b@/,
    /^user/, /^demo/, /^sample/, /^example/, /^temp/, /^fake/
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(email.toLowerCase())) {
      return { isValid: false, reason: 'Suspicious email pattern detected' };
    }
  }

  return { isValid: true };
}

// Rate limiting check (simple in-memory implementation)
const submissionAttempts = new Map<string, { count: number; lastAttempt: number }>();

export function checkRateLimit(identifier: string, maxAttempts: number = 3, windowMs: number = 60000): boolean {
  const now = Date.now();
  const attempts = submissionAttempts.get(identifier);

  if (!attempts) {
    submissionAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  // Reset if window has passed
  if (now - attempts.lastAttempt > windowMs) {
    submissionAttempts.set(identifier, { count: 1, lastAttempt: now });
    return true;
  }

  // Check if limit exceeded
  if (attempts.count >= maxAttempts) {
    return false;
  }

  // Increment attempt count
  attempts.count++;
  attempts.lastAttempt = now;
  return true;
}
