import * as nodemailer from 'nodemailer';
import { google } from 'googleapis';
import * as dotenv from 'dotenv';
dotenv.config();
const { OAuth2 } = google.auth;
const OAUTH_PLAYGROUND = 'https://developers.google.com/oauthplayground/';

const {
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  SENDER_EMAIL_ADDRESS,
} = process.env;

const oauth2Client = new OAuth2(
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
);

//Send email
const sendEmail = (to: any, url: string, txt: string) => {
  oauth2Client.setCredentials({
    refresh_token: MAILING_SERVICE_REFRESH_TOKEN,
  });

  const accessToken = oauth2Client.getAccessToken();

  const smtpTransport = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: SENDER_EMAIL_ADDRESS,
      clientId: MAILING_SERVICE_CLIENT_ID,
      clientSecret: MAILING_SERVICE_CLIENT_SECRET,
      refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
      accessToken,
    },
  });

  const mailOptions = {
    from: SENDER_EMAIL_ADDRESS,
    to,
    subject: 'Auth Register',
    html: `
        <div style="max-width: 700px; margin:auto; border: 1px solid #0D011A; padding: 50px 20px; font-size: 110%;">
        <h2 style="text-align: center; text-transform: uppercase;color: #8216D6;">Welcome to Strong register</h2>
        <p>Congratulations! You are almost ready to start...<br/>
        Just click the button below to validate your email address.
        </p>

        <a href=${url} style="background: #0D011A; text-decoration: none; color: white; padding: 10px 20px; margin: 10px 0; display: inline-block;">${txt}</a>

        <p>If the button doesn't work for any reason, you can also click the link below:</p>

        <div>${url}</div>
        </div>
        `,
  };

  smtpTransport.sendMail(mailOptions, (err: any, info: any) => {
    if (err) return err;
    return info;
  });
};

export default sendEmail;
