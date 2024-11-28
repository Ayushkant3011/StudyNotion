const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/templates/emailVerificationTemplate");

const OTPSchema = new mongoose.Schema({
    email:{
        type: String,
        required: true,
    },
    otp:{
        type: String,
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now(),
        expires: 5*60,
    },
});

// a Function that will send email 
async function sendVerificationEmail(email, otp){
    try{
        const mailResponse = await mailSender(
            email,
            "Verification Email From StudyNotion",
            emailTemplate(otp));
        console.log("Email Sent Successfully:" , mailResponse.response);
    }
    catch(error){
        console.log("Error Occured while Sending mail",error);
        throw error;
    }
}


OTPSchema.pre("save", async function(next){
    console.log("New Document saved to Database");
    
    // Only send an email when a new document is created
    if(this.isNew){
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
});



module.exports = mongoose.model("OTP", OTPSchema);