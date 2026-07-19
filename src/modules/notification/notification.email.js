const sender = require("../../config/email.config")

const sendStatusMail = async (mailFrom, mailTo, mailSubject, mailBody) => {
      try {
            const response = await sender.sendMail({
                  from: mailFrom,
                  to: mailTo,
                  subject: mailSubject,
                  text: mailBody
            })

            return response
      } catch (error) {
            console.log("failed to send the status notification")
      }
}