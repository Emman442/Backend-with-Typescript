
import nodemailer, {Transport} from "nodemailer";
import ejs from "ejs";
import htmlToText, { convert } from "html-to-text"

interface User {
  email: string;
  firstName: string, 
  lastName: string
  otp: string
  // verificationToken: String 
}


export default class Email {
  private to: string;
  private firstName: string;
  private otp: string;
  private from: string;
  private url: string;

  constructor(user: any, url: string, otp: string) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.otp = otp;
    this.url = url;
    this.from = `Ndema Emmanuel Chidera(Senior Software Engineer, Google) <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    if (process.env.NODE_ENV === "production") {
      // Sendgrid
      return nodemailer.createTransport({
        service: "SendGrid",
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        },
      });
    }

    return nodemailer.createTransport({
      service: "gmail",
      port: 587,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template: any, subject: any) {
    // 1) Render HTML based on a pug template
    const html = await ejs.renderFile(`${__dirname}/../views/${template}.ejs`, {
      firstName: this.firstName,
      otp: this.otp,
      subject,
      url: this.url,
    });

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: convert(html),
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendVerificationEmail() {
    await this.send("verificationEmail", "Please Verify your Email!");
  }
  async sendWelcome() {
    await this.send("WelcomeEmail", "Welcome Onboard to the Progfams Family!");
  }

  async sendPasswordReset() {
    await this.send(
      "PasswordReset",
      "Your password reset token (valid for only 10 minutes)"
    );
  }
};
