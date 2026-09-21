import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const isApproved = data.status === 'approved';
    
    // UPDATE: Unique Subject Lines based on the item requested!
    const subjectTitle = isApproved 
        ? `✅ APPROVED: ${data.quantity}x ${data.item_name} (CITK Sports)` 
        : `❌ REJECTED: ${data.quantity}x ${data.item_name} (CITK Sports)`;
        
    const headerColor = isApproved ? "#ccff00" : "#ff3333";
    const headerText = isApproved ? "#000" : "#fff";

    const messageHtml = isApproved 
      ? `Good news! Your request for <strong>${data.quantity}x ${data.item_name}</strong> has been approved. <br/><br/><strong>Next Step:</strong> Please bring your physical CITK Student ID card to the sports department to collect your gear.`
      : `Unfortunately, your request for <strong>${data.quantity}x ${data.item_name}</strong> has been rejected. This may be due to depleted stock or an invalid request format.`;

    const mailOptions = {
      from: `"CITK Sports Admin" <${process.env.GMAIL_USER}>`,
      to: data.student_email, 
      subject: subjectTitle,
      html: `
        <div style="font-family: sans-serif; border: 4px solid #000; max-w-xl; background-color: #fff;">
          <div style="background-color: ${headerColor}; color: ${headerText}; padding: 15px; border-bottom: 4px solid #000;">
            <h2 style="margin: 0; text-transform: uppercase; font-style: italic;">${isApproved ? "Request Approved" : "Request Rejected"}</h2>
          </div>
          <div style="padding: 20px;">
            <p style="color: #000; font-size: 16px;">Hi ${data.student_name},</p>
            <p style="color: #333; font-size: 15px; line-height: 1.5;">${messageHtml}</p>
            <hr style="border: none; border-top: 2px dashed #000; margin: 20px 0;" />
            <p style="font-size: 12px; color: #666; font-weight: bold; text-transform: uppercase;">
              Central Institute of Technology Kokrajhar - Sports Department
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('SMTP Error:', error);
    return NextResponse.json({ error: 'Failed to send student email.' }, { status: 500 });
  }
}