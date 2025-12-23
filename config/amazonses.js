import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import dotenv from 'dotenv'

dotenv.config()

const sesClient = new SESClient({
    region: process.env.AWS_SES_REGION,
    credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SES_SECRET_KEY
    }
})

const sendEmail = async (to, subject, text)=>{
    try {
        const params = {
            Source : process.env.AWS_SES_SOURCE_EMAIL,
            Destination : {ToAddresses: [to]},
            Message: {
                Subject: {Data: subject},
                Body: {Text: {Data: text}}
            }
        }
        const command =  new SendEmailCommand(params)
        const response = await sesClient.send(command)
        console.log("Email sent successfully", response)
    } catch (error) {
        console.log("Error sending email via Amazon SES", error)
    }
} 

export default sendEmail