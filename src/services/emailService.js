const nodemailer = require('nodemailer');

nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GOOGLE_EMAIL,
        pass: process.env.GOOGLE_APP_PASSWORD,
    }
});

const emailService = {
    send: async (to, subject, body) => {

    },
};

module.exports = emailService;