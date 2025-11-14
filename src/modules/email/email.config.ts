import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'Gmail', // o SMTP
  auth: {
    
    user: 'ecoride923@gmail.com',
    pass: 'kstm jayr gemb ekrd',

  },
});