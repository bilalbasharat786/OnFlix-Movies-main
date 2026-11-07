import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

router.post('/movie', async (req, res) => {
    console.log("-----------------------------------------");
    console.log("➡️ API HIT: /api/requests/movie");
    
    const { movieName } = req.body;
    console.log("📦 Received Movie Name:", movieName);
    
    if (!movieName) {
        return res.status(400).json({ error: "Movie name is required" });
    }

    try {
        console.log("⏳ Gmail SMTP Transporter create ho raha hai...");
        
        // 🔥 GMAIL SMTP SETUP (Brevo se jaan chhoot gayi)
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Sirf 'gmail' likhna kaafi hai
            auth: {
                user: process.env.EMAIL_USER,
                // YAHAN GMAIL KA 16-DIGIT APP PASSWORD DALEIN (Bina space ke)
                pass: process.env.EMAIL_PASS 
            }
        });

        console.log("✅ Transporter ready. Email bhejne ki koshish kar raha hoon...");

        // Email Bhejne ka format
        const info = await transporter.sendMail({
            from: '"On Flix Requests" <officialbilal707@gmail.com>', 
            to: 'officialbilal707@gmail.com', // Aap ko is email par notification aayega
            subject: `🎬 New Movie Request: ${movieName}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: #1f2937; color: white; border-radius: 8px;">
                    <h2 style="color: #ef4444;">🎬 Nayi Movie Request!</h2>
                    <p style="font-size: 16px;">Bhai, kisi user ko is movie ka intezar hai:</p>
                    <h3 style="background: #374151; padding: 10px; border-left: 4px solid #ef4444;">${movieName}</h3>
                </div>
            `
        });

        console.log("📨 Email Successfully Bhej Di Gayi!");
        res.status(200).json({ message: "Request sent successfully!" });
    } catch (error) {
        console.error("❌ Email Error Details:", error);
        res.status(500).json({ error: "Email bhejne mein masla aya." });
    }
});

export default router;