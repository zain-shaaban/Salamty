export function otpEmailTemplate(username: string, otp: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>رمز التحقق</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f7; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #00D478; padding: 32px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 1px; }
    .body { padding: 32px; text-align: right; }
    .body p { color: #4a4a4a; font-size: 15px; line-height: 1.8; }
    .otp-box { margin: 24px 0; text-align: center; }
    .otp-code { display: inline-block; background: #e8faf3; border-radius: 8px; padding: 16px 40px; font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #00D478; direction: ltr; }
    .footer { padding: 16px 32px; background: #f4f4f7; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #9a9a9a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>سلامتي</h1></div>
    <div class="body">
      <p>مرحباً <strong>${username}</strong>،</p>
      <p>استخدم رمز التحقق أدناه لإكمال طلبك. ينتهي صلاحية هذا الرمز خلال <strong>10 دقائق</strong>.</p>
      <div class="otp-box">
        <span class="otp-code">${otp}</span>
      </div>
      <p>إذا لم تطلب هذا الرمز، يمكنك تجاهل هذا البريد.</p>
    </div>
    <div class="footer"><p>&copy; ${new Date().getFullYear()} سلامتي. جميع الحقوق محفوظة.</p></div>
  </div>
</body>
</html>`;
}
