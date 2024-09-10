const nodeMailer = require(`nodemailer`)

require ("dotenv").config()

const sendMail =async (options)=>{

const transporter = await nodeMailer.createTransport(
    {    
     secure: true,
      service :  process.env.SERVICE,
     
 auth: {
         user:process.env.mail_id,
          pass:process.env.mail_password  ,
        },
      }
    
)


let mailOptions = {
    from: process.env.mail_id,
    to: options.email,
    subject: options.subject,
    // text: options.message
  html:options.html
//   
}
  await transporter.sendMail(mailOptions)

}



module.exports = sendMail