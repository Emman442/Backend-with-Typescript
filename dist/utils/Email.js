"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const html_to_text_1 = require("html-to-text");
class Email {
    constructor(user, url, otp) {
        this.to = user.email;
        this.firstName = user.firstName;
        this.otp = otp;
        this.url = url;
        this.from = `Ndema Emmanuel Chidera(Senior Software Engineer, Google) <${process.env.EMAIL_FROM}>`;
    }
    newTransport() {
        if (process.env.NODE_ENV === "production") {
            // Sendgrid
            return nodemailer_1.default.createTransport({
                service: "SendGrid",
                auth: {
                    user: process.env.SENDGRID_USERNAME,
                    pass: process.env.SENDGRID_PASSWORD,
                },
            });
        }
        return nodemailer_1.default.createTransport({
            service: "gmail",
            port: 587,
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
    // Send the actual email
    send(template, subject) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1) Render HTML based on a pug template
            const html = yield ejs_1.default.renderFile(`${__dirname}/../views/${template}.ejs`, {
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
                text: (0, html_to_text_1.convert)(html),
            };
            // 3) Create a transport and send email
            yield this.newTransport().sendMail(mailOptions);
        });
    }
    sendVerificationEmail() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send("verificationEmail", "Please Verify your Email!");
        });
    }
    sendWelcome() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send("WelcomeEmail", "Welcome Onboard to the Progfams Family!");
        });
    }
    sendPasswordReset() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.send("PasswordReset", "Your password reset token (valid for only 10 minutes)");
        });
    }
}
exports.default = Email;
;
