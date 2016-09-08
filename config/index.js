require('dotenv').config();
const config = {
    logger: {
        level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'debug' : 'info')
    },
    salesforce: {
        user: process.env.SALESFORCE_USER,
        password: process.env.SALESFORCE_PASSWORD,
        token: process.env.SALESFORCE_TOKEN,
        url: process.env.SALESFORCE_URL
    },
    bot:{
        twilio: {
            account_sid: process.env.TWILIO_ACCOUNT_SID,
            auth_token: process.env.TWILIO_AUTH_TOKEN,
            api_key: process.env.TWILIO_API_KEY,
            api_secret: process.env.TWILIO_API_SECRET,
            sms:{
                phone_number: process.env.TWILIO_NUMBER
            },
            ipmessaging:{
                ipm_service_sid: process.env.TWILIO_IPM_SERVICE_SID
            }
        }
    }
};

module.exports = config;