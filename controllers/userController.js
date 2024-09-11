const userModel = require(`../models/userModel`)
const bcrypt = require(`bcrypt`)
const jwt = require(`jsonwebtoken`)
const sendMail = require(`../helpers/email.js`);
const {
    signUpTemplate,
    verifyTemplate,
    forgotPasswordTemplate,
    passwordChangeTemplate,
} = require(`../helpers/html.js`);


const userSignUp = async (req, res) => {
    try {

        const { fullName, email, password, phoneNumber} = req.body;
        if(!fullName || !email || !password || !phoneNumber ){
            return res.status(400).json(`Please enter all fields.`)
        }
        const emailExist = await userModel.findOne({ email: email.toLowerCase() });
        if (emailExist) {
            return res.status(400).json(`User with email already exist.`);
        } else {
            //perform an encryption using salt
            const saltedPassword = await bcrypt.genSalt(10);
            //perform an encrytion of the salted password
            const hashedPassword = await bcrypt.hash(password, saltedPassword);
            // create object of the body
            const user = new userModel({
                fullName,
                email: email.toLowerCase(),
                password: hashedPassword,
                phoneNumber
            });

            const userToken = jwt.sign(
                { id: user._id, email: user.email },
                process.env.jwt_secret,
                { expiresIn: "10 Minutes" }
            );
            const verifyLink = `${req.protocol}://${req.get(
                "host"
            )}/api/v1/verify/${userToken}`;
    
            await user.save();
            await sendMail({
                subject: `Email Verification`,
                email: user.email,
                html: signUpTemplate(verifyLink, user.fullName),
            });
            res.status(201).json({
                message: `Welcome ${user.fullName}, kindly check your mail to access the link to verify your email`,
                data: user,
            });
        }
    } catch (error) {
        if (error.code === 11000) {
            // Handle duplicate key error (E11000)
            const duplicateField = Object.keys(error.keyPattern)[0]; // Get the duplicate field (e.g., email)
            return res.status(400).json({ message: `A user with this ${duplicateField} already exists.` });
        }
        res.status(500).json({
            message: error.message,
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        // Extract the token from the request params
        const { token } = req.params;
        // Extract the email from the verified token
        const { email } = jwt.verify(token, process.env.jwt_secret);
        // Find the user with the email
        const user = await userModel.findOne({ email });
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
        const existingUser = await userModel.findOne({email: email.toLowerCase()});
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
        // Find the user with the email
        const user = await userModel.findOne({ email });
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
            subject: "Verification email",
            html: verifyTemplate(verifyLink, user.firstName),
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

        // Check if the email exists in the database
        const user = await userModel.findOne({ email });
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
            html: forgotPasswordTemplate(resetLink, user.firstName),
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
        const user = await userModel.findOne({ email });
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
        const { password, existingPassword } = req.body;

        // Verify the user's token and extract the user's email from the token
        const { email } = jwt.verify(token, process.env.jwt_secret);

        // Find the user by ID
        const user = await userModel.findOne({ email });
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
        const hashedPassword = await bcrypt.hash(password, saltedRound);

        // Update the user's password
        user.password = hashedPassword;
        // Save the changes to the database
        await user.save();
        let mailOptions = {
            email: user.email,
            subject: "Password Changed",
            html: passwordChangeTemplate(user.firstName),
        };
        // Send the the email
        await sendMail(mailOptions);
        //   Send a success response
        res.status(200).json({
            message: "Password changed successful",
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};

const makeAdmin = async(req, res)=> {
    try {
        const {userId} = req.params
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid ID format.' });}
        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).json(`User with ID: ${userId} was not found`)
        }
        user.isAdmin = true
        await user.save()
        res.status(200).json({message: `Dear ${user.fullName}, you're now an admin`, data: user})
    } catch (error) {
        res.status(500).json(error.message)
    }
}

const makeSuperAdmin = async(req, res)=> {
    try {
        const {userId} = req.params
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid ID format.' });}
        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).json(`User with ID ${userId} was not found`)
        }
        user.isSuperAdmin = true
        await user.save()
        res.status(200).json({message: `Dear ${user.fullName}, you're now a Super Admin`, data: user})
    } catch (error) {
        res.status(500).json(error.message)
    }
}

const getOneUser = async (req, res) => {
    try {
        const {userId} = req.params
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid ID format.' });}
        const user = await userModel.findById(userId)
        if(!user){
            return res.status(404).json(`User not found.`)
        }
        res.status(200).json({
            message: `Dear ${user.firstName}, kindly find your information below:`,
            data: user
        })
    } catch (error) {
        res.status(500).json(error.message)
    }
}

const getAllUsers = async(req,res)=>{
    try {
     const users = await userModel.find()
     if(users.length <= 0){
        return res.status(404).json(`No available users`)
     }else{
        res.status(200).json({message:`Kindly find the ${users.length} registered users below`, data: users})
     }
        
    } catch (error) {
        res.status(500).json(error.message)
    }
}

const userLogOut = async (req, res) => {
    try {
        const auth = req.headers.authorization;
        const token = auth.split(' ')[1];

        if(!token){
            return res.status(401).json({
                message: 'invalid token'
            })
        }
        // Verify the user's token and extract the user's email from the token
        const { email } = jwt.verify(token, process.env.jwt_secret);
        // Find the user by ID
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        user.blackList.push(token);
        // Save the changes to the database
        await user.save();
        //   Send a success response
        res.status(200).json({
            message: "User logged out successfully."
        });
    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
}

module.exports ={
    userSignUp, verifyEmail, resendVerificationEmail, userLogin, resetPassword, forgotPassword, changePassword, makeAdmin, makeSuperAdmin, getOneUser, getAllUsers, userLogOut
}