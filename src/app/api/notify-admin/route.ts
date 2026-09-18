import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 1. Properly map through the new array of requested items
    const itemsListHtml = data.requested_items.map((item: any) => 
      `<li style="margin-bottom: 5px;"><span style="color: #6A00F4; font-weight: bold;">${item.quantity}x</span> ${item.item_name}</li>`
    ).join('');

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"CITK Sports Portal" <${process.env.GMAIL_USER}>`,
      // ⚠️ IMPORTANT: Change the email below to your REAL admin email address!
      to: 'citsports2006@gmail.com', 
      subject: `New Equipment Request from ${data.student_name}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 2px solid #000; border-radius: 0px; max-w-xl; background-color: #fff;">
          <h2 style="color: #000; margin-top: 0; text-transform: uppercase; font-style: italic;">New Gear Request</h2>
          <p style="color: #333;">A student has submitted a multi-item request from the sports inventory.</p>
          
          <div style="background-color: #f8fafc; padding: 15px; border: 2px solid #000; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Student Name:</strong> ${data.student_name}</p>
            <p style="margin: 5px 0;"><strong>Roll No:</strong> <span style="font-family: monospace;">${data.roll_no}</span></p>
            <p style="margin: 5px 0;"><strong>Branch/Sem:</strong> ${data.branch} - Sem ${data.semester}</p>
            <br/>
            <p style="margin: 5px 0; font-weight: 900; text-transform: uppercase;">Items Requested:</p>
            <ul style="margin-top: 5px; color: #000;">
              ${itemsListHtml}
            </ul>
          </div>
          
          <p style="font-size: 14px; color: #64748b; font-weight: bold;">
            Please log in to the Admin Portal to review and approve these requests.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Notification sent to admin.' });
  } catch (error: any) {
    console.error('SMTP Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send notification email.' },
      { status: 500 }
    );
  }
}