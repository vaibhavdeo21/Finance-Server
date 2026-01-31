const nodemailer = require('nodemailer');

// 1. Setup the transporter (Gmail)
const emailClient = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GOOGLE_EMAIL,      // Your Gmail Address
        pass: process.env.GOOGLE_APP_PASSWORD // Your Gmail App Password
    }
});

const emailService = {
    // 2. Function to send emails
    send: async (to, subject, body) => {
        const emailOptions = {
            from: process.env.GOOGLE_EMAIL, // Sender address
            to: to,                         // Receiver address
            subject: subject,               // Subject line
            text: body                      // Plain text body
        };

        // 3. Send the email
        await emailClient.sendMail(emailOptions);
    }
};

module.exports = emailService;