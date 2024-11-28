const User = require("../models/User");
const OTP = require("../models/Otp");
const otpGenerator = require("otp-generator");
const Profile = require("../models/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const mailSender = require("../utils/mailSender");
const { passwordUpdated } = require("../mail/templates/passwordUpdate");


// Send OTP
exports.sendOTP = async (req,res) =>{
    try{
        // Fetch email from request body
        const {email} = req.body;

        // check if user exists
        const checkUserPresent = await User.findOne({email});

        // if User already exists
        if(checkUserPresent) {
            return res.status(401).json({
                success:false,
                message:`User already registered`,
            });
        }

        // Generate OTP
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false,
        });

        // check unique otp or not 
        const result = await OTP.findOne({otp: otp});
        console.log("Result is generate OTP Func");
        console.log("OTP", otp);
        console.log("Result", result);
        while(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
            });
        }

        const otpPayload = {email, otp};

        // create and entry for otp 
        const otpBody = await OTP.create(otpPayload);
        console.log("OTP Body",otpBody);

        // Return response 
        res.status(200).json({
            success: true,
            message: `OTP Sent Successfully`,
            otp,
        });
    }
    catch(error){
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }

}

// SignUp
exports.signUp = async (req,res) =>{
    try{
        // data fetch or destructure fields from request body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // Check if All details are there or not 
        if(!firstName || !lastName || !email || !password || !confirmPassword
            || !otp){
                return res.status(403).json({
                    success: false,
                    message: "All fields are required",
                });
            }


        // Check if the password and cnfPassword are same or not
        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password and Confirm password does not match. Please Try Again.",
            });
        }
        
        // Check if user exists or not
        const existingUser = await User.findOne({email});
        if(existingUser){
            return res.status(400).json({
                success: false,
                message: "User is already Registered. Please Sign in to Continue.",
            });
        }


        // find most recent otp stored for the use 
        const response = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        console.log(response);
        
        // validate otp
        if(response.length === 0){
            // OTP not found
            return res.status(400).json({
                success: false,
                message: "OTP is Invalid",
            });
        }else if(otp !== response[0].otp){
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }


        // hash password 
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the User
        let approved = "";
        approved === "Instructor" ? (approved = false) : (approved = true);

        // Create the additional Profile for The user
        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about:null,
            contactNumber: null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password: hashedPassword,
            accountType: accountType,
            approved: approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName} ${lastName}`,
        });


        // return res
        return res.status(200).json({
            success: true,
            user,
            message: "User is Registered",
        });
    }
    catch(error){
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "User Cannot be registered. Please Try Again",
        });
    }

};

// LogIn
exports.login = async (req,res) =>{
    try{
        // Get email and password from req body
        const {email, password} = req.body;

        // validation of data
        if(!email || !password){
            // Return 400 bad request status code with error message
            return res.status(403).json({
                success: false,
                message: "All fields are required, please try again",
            });
        }

        // Find user with provided email
        const user = await User.findOne({email}).populate("additionalDetails");
        if(!user){
            return res.stauts(401).json({
                success: false,
                message: "User is Not registered, Please SignUp first",
            });
        }
        
        // generate JWT token, after password macthing
        if(await bcrypt.compare(password, user.password)){
            const payload ={
                email : user.email,
                id: user._id,
                accountType: user.accountType,
            };
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn:"24h",
            });
            user.token = token;
            user.password = undefined;
            
            // create cookie and send response
            const options ={
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly: true,
            };

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: `Logged in successfully`,
            });
        }
        else{
            return res.status(401).json({
                success: false,
                message:`Password is incorrect`,
            });
        }
        
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success:false,
            message: 'Login Failure, please try Again',
        });
    }
};

// Change Password
exports.changePassword = async (req, res) => {
	try {
		// Get user data from req.user
		const userDetails = await User.findById(req.user.id);

		// Get old password, new password, and confirm new password from req.body
		const { oldPassword, newPassword, confirmNewPassword } = req.body;

		// Validate old password
		const isPasswordMatch = await bcrypt.compare(
			oldPassword,
			userDetails.password
		);
		if (!isPasswordMatch) {
			// If old password does not match, return a 401 (Unauthorized) error
			return res
				.status(401)
				.json({ success: false, message: "The password is incorrect" });
		}

		// Match new password and confirm new password
		if (newPassword !== confirmNewPassword) {
			// If new password and confirm new password do not match, return a 400 (Bad Request) error
			return res.status(400).json({
				success: false,
				message: "The password and confirm password does not match",
			});
		}

		// Update password
		const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

		// Send notification email
		try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
                "Password for your account has been updated",
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

		// Return success response
		return res
			.status(200)
			.json({ success: true, message: "Password updated successfully" });
	} catch (error) {
		// If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
		console.error("Error occurred while updating password:", error);
		return res.status(500).json({
			success: false,
			message: "Error occurred while updating password",
			error: error.message,
		});
	}
};