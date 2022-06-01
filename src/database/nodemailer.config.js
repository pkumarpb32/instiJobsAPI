const nodemailer = require("nodemailer");

const email =  process.env.email;
const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: email,
    pass: process.env.pass,
  },
});

module.exports.sendConfirmationEmail = (name, user_email, confirmationCode) => {
    console.log("Check");
    transport.sendMail({
      from: email,
      to: user_email,
      subject: "Please confirm your account",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${name}</h2>
          <p>Thank you for subscribing. Your confirmation code is ${confirmationCode}</p>
          </div>`,
    }).catch(err => console.log(err));
  };