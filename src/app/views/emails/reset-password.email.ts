export default (verificationCode: string) => {
  return `
<!doctype html>
<html lang="en-US">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Code</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            background-color: #f4f4f4; 
            margin: 0;
            padding: 20px;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            background: #ffffff; 
            padding: 20px; 
            border-radius: 5px; 
            text-align: center;
         }
        .logo img { width: 50px; margin-bottom: 20px; }
        .title { font-size: 24px; color: #333; margin: 0; }
        .code { font-size: 20px; color: #20e277; margin: 20px 0; }
        .message { font-size: 16px; color: #666; }
        .footer { font-size: 12px; color: #aaa; margin-top: 20px; }
    </style>
</head>

<body>
    <div class="container">
        <div class="logo">
            <img src="https://via.placeholder.com/50" alt="Logo" />
        </div>
        <h1 class="title">Reset Your Password</h1>
        <p class="message">
            Use the following code to reset your password. 
            This code is valid for 10 minutes.
        </p>
        <div class="code">${verificationCode}</div>
        <p class="message">If you did not request a password reset, please ignore this email.</p>
        <div class="footer">&copy; Your Company</div>
    </div>
</body>

</html>
`;
};