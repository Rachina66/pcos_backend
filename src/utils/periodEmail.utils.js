export const sendPeriodReminder = async (
  userEmail,
  userName,
  nextPeriodDate,
) => {
  try {
    await transporter.sendMail({
      from: `"PCOS Health App" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: "Your Period is Coming in 3 Days",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #B565A7;">Period Reminder</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Based on your cycle history, your next period is predicted 
          to start on <strong>${new Date(nextPeriodDate).toDateString()}</strong>.</p>
          <div style="background: #f9f0f7; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Tips to prepare:</strong></p>
            <ul>
              <li>Stay hydrated</li>
              <li>Get enough rest</li>
              <li>Keep pain relief handy</li>
              <li>Light exercise can help with cramps</li>
            </ul>
          </div>
          <p style="color: #B565A7;">PCOS Health App</p>
        </div>
      `,
    });
    console.log("Period reminder sent to", userEmail);
  } catch (error) {
    console.error("Failed to send period reminder:", error.message);
  }
};
