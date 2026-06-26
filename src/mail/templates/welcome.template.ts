export function welcomeEmailTemplate(username: string): string {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>مرحباً بك في سلامتي</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f7; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #00D478; padding: 32px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 1px; }
    .body { padding: 32px; text-align: right; }
    .body p { color: #4a4a4a; font-size: 15px; line-height: 1.8; }
    .footer { padding: 16px 32px; background: #f4f4f7; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #9a9a9a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>مرحباً بك في سلامتي!</h1></div>
    <div class="body">
      <p>مرحباً <strong>${username}</strong>،</p>
      <p>تم التحقق من حسابك بنجاح. يمكنك الآن تسجيل الدخول واستخدام تطبيق سلامتي.</p>
      <p>ابقَ بأمان!</p>
    </div>
    <div class="footer"><p>&copy; ${new Date().getFullYear()} سلامتي. جميع الحقوق محفوظة.</p></div>
  </div>
</body>
</html>`;
}
