import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import SendGrid from "@sendgrid/mail";

initializeApp();
const auth = getAuth();

export default async (request) => {
  return new Promise((resolve, reject) => {
    try {
      const { data } = request;
      const email = data.email;
      const actionCodeSettings = {
        url: process.env.URL_AFTER_PASSWORD_RESET,
        handleCodeInApp: false,
      };
      // TODO: check to make sure user exists before trying to create the link..
      //        OR just resolve with the error right away to display client side.

      auth
        .generatePasswordResetLink(email, actionCodeSettings)
        .then(async (link) => {
          // Construct password reset email template, embed the link and send
          // using custom SMTP server.
          const messageData = {
            to: email,
            from: process.env.SENDGRID_EMAIL,
            templateId: "d-514c3831bb18435b9918a2fd2f1babf3",
            dynamicTemplateData: {
              test_text: "{{{That worked... YAY...}}}",
              reset_link: link,
            },
          };
          const sendGridApiKey = process.env.SENDGRID_API;
          SendGrid.setApiKey(sendGridApiKey);
          await SendGrid.send(messageData)
            .then((result) => {
              resolve(result);
            })
            .catch((error) => {
              reject(error);
            });
        })
        .catch((error) => {
          // couldn't create reset link... user probably doesn't exist.
          reject(error);
        });
    } catch (error) {
      reject(error);
    }
  });
};
