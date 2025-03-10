const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,  // Ton email
        pass: process.env.EMAIL_PASS   // Ton mot de passe d'application Gmail
    }
});

const sendResetEmail = async (email, token) => {
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Réinitialisation de votre mot de passe",
        text: `Cliquez sur ce lien pour réinitialiser votre mot de passe : ${resetLink}`
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendResetEmail;
