import SendGrid from "@sendgrid/mail";

/**
 *
 * @param {*} emailData
 * @return Promise
 */
export const sendEmailWelcome = async (emailData) => {
  return new Promise(async (resolve, reject) => {
    const { email, name, account, role, resetLink } = emailData;
    const messageData = {
      to: email,

      from: process.env.SENDGRID_EMAIL,
      templateId: process.env.SENDGRID_TEMPLATE_PASSOWRD_RESET,
      dynamicTemplateData: {
        email: email,
        name: name,
        account: account,
        role: role,
        resetLink: resetLink,
      },
    };
    const sendGridApiKey = process.env.SENDGRID_API;
    SendGrid.setApiKey(sendGridApiKey);
    await SendGrid.send(messageData)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        // Error sending email
        reject({ status: error, error });
      });
  });
};

/**
 *
 * @param {*} emailData
 * @return Promise
 */
export const sendEmailVerified = async (emailData) => {
  return new Promise(async (resolve, reject) => {
    const { email, name, account, role, resetLink } = emailData;
    const messageData = {
      to: email,
      from: process.env.SENDGRID_EMAIL,
      templateId: process.env.SENDGRID_TEMPLATE_VERIFIED_USER,
      dynamicTemplateData: {
        email: email,
        name: name,
        account: account,
        role: role,
        resetLink: resetLink,
        continueLink: process.env.CONTINUE_LINK,
      },
    };
    const sendGridApiKey = process.env.SENDGRID_API;
    SendGrid.setApiKey(sendGridApiKey);
    await SendGrid.send(messageData)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        // Error sending email
        reject({ status: error, error });
      });
  });
};

/**
 *
 * @param {*} emailData
 * @return Promise
 */
export const sendEmailNewOrder = async (emailData) => {
  return new Promise(async (resolve, reject) => {
    const messageData = {
      to: emailData.buyer.email,
      cc: [process.env.ORDERS_EMAIL, process.env.ROGER_EMAIL, process.env.GUY_EMAIL, process.env.HUNTER_EMAIL],
      from: process.env.SENDGRID_EMAIL,
      subject: "New Locket Studio Order",
      templateId: process.env.SENDGRID_TEMPLATE_ORDER,
      dynamicTemplateData: { ...emailData },
    };
    console.log("email:" + process.env.SENDGRID_EMAIL);
    console.log("message:" + emailData);

    const sendGridApiKey = process.env.SENDGRID_API;
    SendGrid.setApiKey(sendGridApiKey);
    console.log("Email used: " + messageData.cc);
    await SendGrid.send(messageData)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        // Error sending email
        resolve({ status: error, error });
      });
  });
};

/**
 *
 * @param {*} emailData
 * @return Promise
 */
export const sendEmailShippedOrder = async (emailData) => {
  return new Promise(async (resolve, reject) => {
    const messageData = {
      to: emailData.buyer.email,
      from: process.env.SENDGRID_EMAIL,
      subject: "Locket Studio Order Has Been Shipped",
      templateId: process.env.SENDGRID_TEMPLATE_SHIPPED,
      dynamicTemplateData: { ...emailData },
    };
    const sendGridApiKey = process.env.SENDGRID_API;
    SendGrid.setApiKey(sendGridApiKey);
    await SendGrid.send(messageData)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        // Error sending email
        reject({ status: error, error });
      });
  });
};

/**
 *
 * @param {*} emailData
 * @return Promise
 */
export const sendContactEmail = async (emailData) => {
  return new Promise(async (resolve, reject) => {
    const { email, name, phone, city, zipcode, account, order, message } =
      emailData;
    const messageData = {
      to: process.env.CONTACT_EMAIL,
      from: process.env.SENDGRID_EMAIL,
      subject: "Contact",
      templateId: process.env.SENDGRID_TEMPLATE_CONTACT,
      dynamicTemplateData: {
        ...emailData,
      },
    };
    const sendGridApiKey = process.env.SENDGRID_API;
    SendGrid.setApiKey(sendGridApiKey);
    await SendGrid.send(messageData)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        // Error sending email
        reject({ status: error, error });
      });
  });
};
