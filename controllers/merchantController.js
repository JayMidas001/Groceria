const merchModel = require(`../models/merchantModel.js`)
const bcrypt = require(`bcrypt`)
const cloudinary = require(`../utils/cloudinary.js`)
const mongoose = require(`mongoose`)
const jwt = require(`jsonwebtoken`)
const fs = require(`fs`)
const path = require('path')
const sendMail = require(`../helpers/email.js`);

const {
    signUpTemplate,
    verifyTemplate,
    forgotPasswordTemplate,
    passwordChangeTemplate,
} = require(`../helpers/html.js`);



const signUp = async (req, res) => {
    try {

        const { businessName, email, password, phoneNumber, address, description } = req.body;
        
        if(!businessName || !email || !password || !phoneNumber || !address || !description){
            return res.status(400).json(`Please enter all fields.`)
        }
        const emailExist = await merchModel.findOne({ email:email.toLowerCase() });
        if (emailExist) {
            return res.status(400).json(`User with email already exist.`);
        } else {
            //perform an encryption using salt
            const saltedPassword = await bcrypt.genSalt(10);
            //perform an encrytion of the salted password
            const hashedPassword = await bcrypt.hash(password, saltedPassword);
            // create object of the body
            const user = new merchModel({
                businessName,
                email: email.toLowerCase(),
                password: hashedPassword,
                phoneNumber, 
                address,
                description
            });

            const userToken = jwt.sign(
                { id: user._id, email: user.email },
                process.env.jwt_secret,
                { expiresIn: "10 Minutes" }
            );
            const verifyLink = `${req.protocol}://${req.get(
                "host"
            )}/api/v1/merchant-verify/${userToken}`;
            
            await user.save();
            await sendMail({
                subject: `Email Verification`,
                email: user.email,
                html: signUpTemplate(verifyLink, user.businessName),
            });
            res.status(201).json({
                message: `Welcome, ${user.businessName}, kindly check your mail to access the link to verify your email`,
                data: user,
            });
        }
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error (E11000)
            const duplicateField = Object.keys(error.keyPattern)[0]; // Get the duplicate field (e.g., email)
            return res.status(400).json({ message: `A user with this ${duplicateField} already exists.` });
        }
        res.status(500).json({message: error.message});
    }
};

const verifyEmail = async (req, res) => {
    try {
        // Extract the token from the request params
        const { token } = req.params;
        // Extract the email from the verified token
        const { email } = jwt.verify(token, process.env.jwt_secret);
        // Find the user with the email
        const user = await merchModel.findOne({ email:email.toLowerCase()});
        // Check if the user is still in the database
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }
        // Check if the user has already been verified
        if (user.isVerified) {
            return res.status(400).json({
                message: "User already verified",
            });
        }
        // Verify the user
        user.isVerified = true;
        // Save the user data
        await user.save();
        // Send a success response
        res.status(200).json({
            message: "User verified successfully",
        });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.json({ message: "Link expired." });
        }
        res.status(500).json({
            message: error.message,
        });
    }
};

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if( !email || !password ){
            return res.status(400).json(`Please enter all fields (email & pasword).`)
        }
        const existingUser = await merchModel.findOne({
            email: email.toLowerCase()
        });
        if (!existingUser) {
            return res.status(404).json({
                message: "User not found."}); }

        const confirmPassword = await bcrypt.compare(password,existingUser.password);
        if (!confirmPassword) {
            return res.status(404).json({
                message: "Incorrect Password." });}
        if (!existingUser.isVerified) {
            return res.status(400).json({
                message:
                    "User not verified, Please check you email to verify your account.",
            });
        }

        const token = await jwt.sign(
            {
                userId: existingUser._id,
                email: existingUser.email,
            },
            process.env.jwt_secret,
            { expiresIn: "3h" }
        );

        res.status(200).json({
            message: "User logged in successfully",
            data: existingUser,
            token,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }
        // Find the user with the email
        const user = await merchModel.findOne({ email:email.toLowerCase() });
        // Check if the user is still in the database
        if (!user) {
            return res.status(404).json({
                message: "User not found."
            });
        }

        // Check if the user has already been verified
        if (user.isVerified) {
            return res.status(400).json({
                message: "User already verified."
            });
        }

        const token = jwt.sign({ email: user.email }, process.env.jwt_secret, {
            expiresIn: "20mins"
        });
        const verifyLink = `${req.protocol}://${req.get(
            "host"
        )}/api/v1/verify/${token}`;
        let mailOptions = {
            email: user.email,
            subject: "Email Verification",
            html: verifyTemplate(verifyLink, user.businessName),
        };
        // Send the the email
        await sendMail(mailOptions);
        // Send a success message
        res.status(200).json({
            message: "Verification email resent successfully.",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const forgotPassword = async (req, res) => {
    try {
        // Extract the email from the request body
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: "Email is required." });
        }
        // Check if the email exists in the database
        const user = await merchModel.findOne({ email:email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // Generate a reset token
        const resetToken = jwt.sign({ email: user.email }, process.env.jwt_secret, {
            expiresIn: "30m",
        });
        const resetLink = `${req.protocol}://${req.get(
            "host"
        )}/api/v1/reset-password/${resetToken}`;

        // Send reset password email
        const mailOptions = {
            email: user.email,
            subject: "Password Reset",
            html: forgotPasswordTemplate(resetLink, user.businessName),
        };
        //   Send the email
        await sendMail(mailOptions);
        //   Send a success response
        res.status(200).json({
            message: "Password reset email sent successfully.",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        // Verify the user's token and extract the user's email from the token
        const { email } = jwt.verify(token, process.env.jwt_secret);

        // Find the user by ID
        const user = await merchModel.findOne({ email:email.toLowerCase()});
        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        // Salt and hash the new password
        const saltedRound = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, saltedRound);

        // Update the user's password
        user.password = hashedPassword;
        // Save changes to the database
        await user.save();
        // Send a success response
        res.status(200).json({
            message: "Password reset successful",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const changePassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword, existingPassword } = req.body;
        if( !newPassword || !existingPassword ){
            return res.status(400).json(`Please enter all fields (New Password & Existing pasword).`)
        }
        // Verify the user's token and extract the user's email from the token
        const { email } = jwt.verify(token, process.env.jwt_secret);

        // Find the user by ID
        const user = await merchModel.findOne({ email:email.toLowerCase()});
        if (!user) {
            return res.status(404).json({
                message: "User not found.",
            });
        }

        // Confirm the previous password
        const isPasswordMatch = await bcrypt.compare(
            existingPassword,
            user.password
        );
        if (!isPasswordMatch) {
            return res.status(401).json({
                message: "Existing password does not match.",
            });
        }

        // Salt and hash the new password
        const saltedRound = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, saltedRound);

        // Update the user's password
        user.password = hashedPassword;
        // Save the changes to the database
        await user.save();
        let mailOptions = {
            email: user.email,
            subject: "Password Changed",
            html: passwordChangeTemplate(user.businessName),
        };
        // Send the the email
        await sendMail(mailOptions);
        //   Send a success response
        res.status(200).json({
            message: "Password changed successfully.",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
const updateMerchant = async (req, res) => {
    try {
        const { merchantId } = req.params;
        const { businessName, phoneNumber, address, description } = req.body;
        
        // Ensure the merchant exists
        const merchant = await merchModel.findById(merchantId);
        if (!merchant) {
            return res.status(404).json({ message: 'Merchant not found' });
        }

        // If a file is uploaded, handle the file upload to Cloudinary
        if (req.files && req.files.profileImage) {
            const file = req.files.profileImage;
            
            // Upload to Cloudinary
            const result = await cloudinary.uploader.upload(file.tempFilePath);

            // Assign the new profile image URL
            merchant.profileImage = result.secure_url;

            // Delete the temp file
            fs.unlinkSync(file.tempFilePath);
        }

        // Update other merchant details
        merchant.businessName = businessName || merchant.businessName;
        merchant.phoneNumber = phoneNumber || merchant.phoneNumber;
        merchant.address = address || merchant.address;
        merchant.description = description || merchant.description;

        // Save the updated merchant
        await merchant.save();

        res.status(200).json({ message: 'Merchant profile updated successfully', data: merchant });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


const getOneMerchant = async (req, res) => {
    try {
        const {merchantId} = req.params
        if (!mongoose.Types.ObjectId.isValid(merchantId)) {
            return res.status(400).json({ message: 'Invalid ID format.' });}
        const merchant = await merchModel.findById(merchantId)
        if(!merchant){
            return res.status(404).json(`Business not found.`)
        }
        res.status(200).json({
            message: `Business found.`,
            data: merchant
        })
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const getAllMerchants = async(req,res)=>{
    try {
        /// find all merchants from the DB
     const merchants = await merchModel.find()

     if(merchants.length <= 0){
        return res.status(404).json(`No available merchants.`)
     }else{
        res.status(200).json({message:`Kindly find the ${merchants.length} registered merchants below`, data: merchants})
     }
        
    } catch (error) {
        res.status(500).json({message: error.message})
    }
}

const merchantLogOut = async (req, res) => {
    try {
        // Check if authorization header exists
        const auth = req.headers.authorization;
        if (!auth || !auth.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authorization header missing or malformed.' });
        }

        // Extract token from the authorization header
        const token = auth.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token missing in authorization header.' });
        }

        // Verify the user's token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.jwt_secret);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token.' });
        }

        // Find the user by email
        const { email } = decoded;
        const user = await merchModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        // Add token to the blacklist (ensure `blackList` exists in user schema)
        user.blackList = user.blackList || []; // Initialize if not present
        if (!user.blackList.includes(token)) {
            user.blackList.push(token); // Add token to blacklist if not already present
        }

        // Save the changes to the database
        await user.save();

        // Send a success response
        res.status(200).json({ message: 'User logged out successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports ={
    signUp, verifyEmail, resendVerificationEmail, userLogin, resetPassword, forgotPassword, changePassword, updateMerchant, getOneMerchant, getAllMerchants, merchantLogOut
}