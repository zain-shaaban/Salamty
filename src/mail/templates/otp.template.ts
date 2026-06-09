export function otpEmailTemplate(username: string, otp: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Verification Code</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f7; font-family: Arial, sans-serif; }
    .wrapper { max-width: 560px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
    .header { background: #4F46E5; padding: 32px; text-align: center; }
    .header h1 { margin: 0; color: #ffffff; font-size: 24px; letter-spacing: 1px; }
    .body { padding: 32px; }
    .body p { color: #4a4a4a; font-size: 15px; line-height: 1.6; }
    .otp-box { margin: 24px 0; text-align: center; }
    .otp-code { display: inline-block; background: #f0f0f5; border-radius: 8px; padding: 16px 40px; font-size: 36px; font-weight: bold; letter-spacing: 10px; color: #4F46E5; }
    .footer { padding: 16px 32px; background: #f4f4f7; text-align: center; }
    .footer p { margin: 0; font-size: 12px; color: #9a9a9a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header"><h1>Salamty</h1></div>
    <div class="body">
      <p>Hello <strong>${username}</strong>,</p>
      <p>Use the verification code below to complete your request. This code expires in <strong>10 minutes</strong>.</p>
      <div class="otp-box">
        <span class="otp-code">${otp}</span>
      </div>
      <p>If you did not request this code, please ignore this email or contact support if you have concerns.</p>
    </div>
    <div class="footer"><p>&copy; ${new Date().getFullYear()} Salamty. All rights reserved.</p></div>
  </div>
</body>
</html>`;
}
