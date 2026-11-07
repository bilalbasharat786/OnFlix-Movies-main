// errorRoute.js ya jahan aapki email config hai
router.post('/error', async (req, res) => {
    const { message, userAgent } = req.body;
    
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail', 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS 
            }
        });

        await transporter.sendMail({
            from: `"On Flix Alerts" <${process.env.EMAIL_USER}>`, 
            to: process.env.EMAIL_USER, // Khud ko alert bhejna
            subject: `🚨 ALERT: User getting NO RESULTS FOUND!`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; background: #1f2937; color: white;">
                    <h2 style="color: #ef4444;">🚨 Warning: Empty Results on Homepage</h2>
                    <p>Kisi user ko website par movies load nahi huin.</p>
                    <p><strong>Error Message:</strong> ${message}</p>
                    <p><strong>Device Info:</strong> ${userAgent}</p>
                </div>
            `
        });

        res.status(200).json({ success: true });
    } catch (error) {
        console.error("Alert Email Error:", error);
        res.status(500).json({ error: "Alert fail" });
    }
});