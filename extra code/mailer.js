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
async function sendMail(subject = "BitKlicks" , text="BitKlicks" , html = "<h1>BitKlicks</h1>"){
     await transporter.sendMail({
    from: 'Marketingwala02@gmail.com', // sender address
    to: "vaibhavdadhich74@gmail.com", // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
    html: html, // html body
  });
}
export {sendMail}