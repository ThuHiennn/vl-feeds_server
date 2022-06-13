const nodemailer = require("nodemailer");

module.exports.sendEmail = async (email, url) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "vanlangfeeds@gmail.com",
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = await transporter.sendMail({
    from: "vanlangfeeds@gmail.com",
    to: email,
    subject: "Xác thực email Vanlang Feeds ✔",
    html: `
        <h4>Chọn vào nút dưới đây để xác thực email nhé:</h4>
        <a href="${url}">${url}</a>
    `,
  });

  transporter.sendMail(mailOptions, function (error) {
    if (error) {
      console.log(error);
    }
  });
};
