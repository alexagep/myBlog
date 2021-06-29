const nodeMailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');

// const transporterDetails = smtpTransport({
//     host: "alagha911@gmail.com",
//     port: 465,
//     secure: true,
//     auth:{
//         user: "alagha911@gmail.com",
//         pass: "illianov84"
//     },
//     tls: {
//         rejectUnauthorized: false
//     }
// })


// exports.sendEmail = (email, firstName, subject, message) => {
//     const transporter = nodeMailer.createTransport(transporterDetails);
//     transporter.sendMail({
//         from: "alagha911@gmail.com",
//         to: email,
//         subject: subject,
//         html: `<h4> HI ${firstName}</h4>
//                 <p>${message}</p>`,
//     })
// }


// const nodemailer = require('nconst transporter = nodeMailer.createTransport({
//     service: 'gmail',
//     auth:{
//         user: "example@gmail.com",
//         pass: "123456789"
//     }
// });odemailer');

// 

// const options = {
//     from: "example@gmail.com",
//     to: "saeid@gmail.com",
//     subject: "nodemailer TEST",
//     text: "test of Nodemailer"
// }

// transporter.sendMail(options, function(err, info) {
//     if(err) return console.log(err);
//     console.log(info);
// })

exports.sendEmail = (email, firstName, subject, message) => {
    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        auth:{
            user: "alagha911@gmail.com",
            pass: "ILLIAnov84"
        }
    });
    transporter.sendMail({
        from: "example@gmail.com",
        to: email,
        subject: subject,
        html: `<h4> HI ${firstName}</h4>
                <p>${message}</p>`,
    })
}
