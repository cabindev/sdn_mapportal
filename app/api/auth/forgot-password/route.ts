import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json(
        { error: "ไม่พบผู้ใช้งานในระบบ" },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { email },
      data: {
        resetToken: token,
        resetTokenCreatedAt: new Date(),
        resetTokenExpiresAt: expiresAt,
      },
    });

    const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;

          const htmlContent = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>รีเซ็ตรหัสผ่าน - SDN Map-portal</title>
      </head>
      <body style="font-family: 'Sarabun', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <tr>
          <td align="center" style="padding-bottom: 20px;">
            <img src="${process.env.NEXTAUTH_URL}/images/logo.png" alt="SDN Thailand Logo" width="150" style="display: block;">
          </td>
          </tr>
          <tr>
            <td>
              <h2 style="color: #f58220;">รีเซ็ตรหัสผ่านของคุณ</h2>
              <p>เรียน คุณ${user.firstName},</p>
              <p>เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชีของคุณที่ SDN Map-portal หากคุณไม่ได้ทำการร้องขอนี้ กรุณาเพิกเฉยต่ออีเมลนี้</p>
              <p>คลิกที่ปุ่มด้านล่างเพื่อรีเซ็ตรหัสผ่านของคุณ:</p>
              <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${resetUrl}" style="background-color: #f58220; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 5px; display: inline-block;">รีเซ็ตรหัสผ่าน</a>
                  </td>
                </tr>
              </table>
              <p>หากคุณมีปัญหาในการคลิกปุ่ม ให้คัดลอกและวางลิงก์ต่อไปนี้ลงในเบราว์เซอร์ของคุณ:</p>
              <p>${resetUrl}</p>
              <p>ลิงก์นี้จะหมดอายุภายใน 1 ชั่วโมง เพื่อความปลอดภัยของบัญชีของคุณ</p>
              <p>หากคุณไม่ได้ร้องขอการรีเซ็ตรหัสผ่าน กรุณาติดต่อเราทันทีที่ <a href="mailto:evo_reaction@hotmail.com" style="color: #f58220;">support@sdnmapportal.sdnthailand.com</a></p>
              <p>ขอแสดงความนับถือ,<br>ทีมงาน SDN Map-portal</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `;

    const mailOptions = {
      from: '"SDN Map-portal" <noreply@sdnmapportal.sdnthailand.com>',
      to: email,
      subject: "รีเซ็ตรหัสผ่าน - SDN Map-portal",
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      message: "ลิงก์สำหรับรีเซ็ตรหัสผ่านได้ถูกส่งไปยังอีเมลของคุณแล้ว",
    });
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการส่งอีเมล โปรดลองอีกครั้งในภายหลัง" },
      { status: 500 }
    );
  }
}
