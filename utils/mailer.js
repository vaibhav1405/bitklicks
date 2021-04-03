const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: 'marketingwala02@gmail.com',
        pass: 'Vaibhav2000'
    }
})
// let info = await transporter.sendMail({
//     from: 'Marketingwala02@gmail.com', // sender address
//     to: "vaibhavdadhich74@gmail.com", // list of receivers
//     subject: "Hello ✔", // Subject line
//     text: "Hello world?", // plain text body
//     html: "<b>Hello world?</b>", // html body
//   });
let sendMail =  async function sendMails(to = "vaibhavdadhich74@gmail.com" , subject = "BitKlicks" , html = "<h1>BitKlicks</h1>"){
    // , text="BitKlicks" 
  await transporter.sendMail({
    from: 'Marketingwala02@gmail.com', // sender address
    to: to, // list of receivers
    subject: subject, // Subject line
    // text: text, 
    html: html, // html body
  });
//   return ("done");
// maybe gmail not support two connectins
}
exports.sendMail = sendMail;