import Mailgen from "mailgen";
import nodemailer from "nodemailer"

const sendEmail=async(options)=>{
    const mailGenerator=new Mailgen({
        theme:"default",
        product:{
            name:"Task Manager",
            link:"https://taskmanagerlink.com"
        }
    })

    const emailTextual=mailGenerator.generatePlaintext(options.mailgenContent)
    const emailHTML=mailGenerator.generate(options.mailgenContent)

    const transporter=nodemailer.createTransport({
        host:process.env.MAILTRAP_SMTP_HOST,
        port:process.env.MAILTRAP_SMTP_PORT,
        auth:{
            user: process.env.MAILTRAP_SMTP_USER
        ,pass: process.env.MAILTRAP_SMTP_PASSWORD}
        
    })


    const mail={
        from:"mail.taskmanager@example.com",
        to:options.email,
        subject:options.subject,
        text:emailTextual,
        html:emailHTML
    }
    try {
        await transporter.sendMail(mail)
    } catch (error) {
        console.error("email service failed,make sure you have provided credentials in env file")
        console.error("error:",error)
    }
}


const emailverimailgencontent=(username,verificationUrl)=>{
    return{
        body:{
            name:username,

            intro:"WELCOME TO OUR APP!",
            action:{
                instructions:"TO VERIFY YOUR EMAIL CLICK ON THE BUTTON",
                button:{
                    color:"#9d5cc1",
                    text:"VERIFY YOUR EMAIL",
                    link:verificationUrl
                }
            },
            outro: "NEED HELP, REPLY TO THIS EMAIL, WE'D LOVE TO HELP"
        }
    };
};

const forgotpasswordmailgencontent=(username,passwordreseturl)=>{
    return{
        body:{
            name:username,

            intro:"WE GOT A REQUEST TO RESET YOUR ACC PASSWORD!",
            action:{
                instructions:"TO RESET YOUR PASSWORD CLICK ON THE BUTTON",
                button:{
                    color:"#b31966",
                    text:"RESET YOUR PASSWORD",
                    link:passwordreseturl
                }
            },
            outro: "NEED HELP, REPLY TO THIS EMAIL, WE'D LOVE TO HELP"
        }
    };
};

export {emailverimailgencontent,forgotpasswordmailgencontent,sendEmail};