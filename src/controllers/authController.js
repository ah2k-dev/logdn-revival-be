const User = require("../models/User/user");
const sendMail = require("../utils/sendMail");
const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const request = require("../models/Booking/request");
const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

//register
const register = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { firstname, lastname, phone, company, email, password } = req.body;
    // if (
    //   !password.match(
    //     /(?=[A-Za-z0-9]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/
    //   )
    // ) {
    //   return ErrorHandler(
    //     "Password must contain atleast one uppercase letter, one special character and one number",
    //     400,
    //     req,
    //     res
    //   );
    // }
    const user = await User.findOne({ email });
    if (user) {
      return ErrorHandler("User already exists", 400, req, res);
    }
    const newUser = await User.create({
      firstname,
      lastname,
      phone,
      company,
      email,
      password,
      // role: 'admin'
    });
    newUser.save();
    return SuccessHandler("User created successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//request email verification token
const requestEmailToken = async (req, res) => {
  // #swagger.tags = ['auth']

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return ErrorHandler("User does not exist", 400, req, res);
    }
    const emailVerificationToken = Math.floor(100000 + Math.random() * 900000);
    const emailVerificationTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationTokenExpires = emailVerificationTokenExpires;
    await user.save();
    const message = `Your email verification token is ${emailVerificationToken} and it expires in 10 minutes`;
    const subject = `Email verification token`;
    const ForgetPasswordPath = path.join(
      __dirname,
      "../utils/ForgetPassword.ejs"
    );
    const ForgetPasswordTemplate = fs.readFileSync(ForgetPasswordPath, "utf-8");
    const html = ejs.render(ForgetPasswordTemplate, {
      name: user.name,
      token: emailVerificationToken,
    });
    await sendMail(email, subject, html);
    return SuccessHandler(
      `Email verification token sent to ${email}`,
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//verify email token
const verifyEmail = async (req, res) => {
  // #swagger.tags = ['auth']

  try {
    const { email, emailVerificationToken } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User does not exist",
      });
    }
    if (
      user.emailVerificationToken != emailVerificationToken ||
      user.emailVerificationTokenExpires < Date.now()
    ) {
      return ErrorHandler("Invalid token", 400, req, res);
    }
    user.emailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpires = null;
    jwtToken = user.getJWTToken();
    await user.save();
    return SuccessHandler(
      {
        message: "Email verified successfully",
        jwtToken: user.getJWTToken(),
        userData: user,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//login
const login = async (req, res) => {
  // #swagger.tags = ['auth']
  // #swagger.description = 'Send withRequest true if logging in with request payload. location includes llat, lang, string. dateRange is an array 0 index for start and 1 for end. roomRequirements includes single, double, animalSupport.'
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return ErrorHandler("User does not exist", 400, req, res);
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ErrorHandler("Invalid credentials", 400, req, res);
    }
    if (!user.emailVerified) {
      return ErrorHandler("Email not verified", 400, req, res);
    }
    if (user?.isBlocked == true) {
      return ErrorHandler("User is blocked", 400, req, res);
    }
    let jwtToken = user.getJWTToken();
    delete user.password;
    delete user.emailVerificationToken;
    delete user.emailVerificationTokenExpires;
    delete user.passwordResetToken;
    delete user.passwordResetTokenExpires;
    if (req.body.withRequest == true) {
      const { location, dateRange, roomRequirements } = req.body;
      const newrequest = await request.create({
        location,
        dateRange,
        roomRequirements,
        user: user._id,
      });
      newrequest.save();
      return SuccessHandler(
        {
          message: "Logged in successfully",
          jwtToken,
          newrequest,
          userData: user,
        },
        200,
        res
      );
    } else {
      return SuccessHandler(
        { message: "Logged in successfully", jwtToken, userData: user },
        200,
        res
      );
    }
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//logout
const logout = async (req, res) => {
  // #swagger.tags = ['auth']

  try {
    req.user = null;
    return SuccessHandler("Logged out successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//forgot password
const forgotPassword = async (req, res) => {
  // #swagger.tags = ['auth']

  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return ErrorHandler("User does not exist", 400, req, res);
    }
    const passwordResetToken = Math.floor(100000 + Math.random() * 900000);
    const passwordResetTokenExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.passwordResetToken = passwordResetToken;
    user.passwordResetTokenExpires = passwordResetTokenExpires;
    await user.save();
    const message = `Your password reset token is ${passwordResetToken} and it expires in 10 minutes`;
    const subject = `Password reset token`;
    const ForgetPasswordPath = path.join(
      __dirname,
      "../utils/ForgetPassword.ejs"
    );
    const ForgetPassword = fs.readFileSync(ForgetPasswordPath, "utf-8");
    // ejs.renderFile(ForgetPassword ,{
    //   // name: user.name,
    //   token: passwordResetToken
    // }, async (err, file)=>{
    //   if(err){
    //     // return ErrorHandler(err.message, 500, req, res);
    //     console.log(err)
    //   } else {
    //     await sendMail(email, subject, file);
    //   }
    // })
    // // await sendMail(email, subject, message);
    const html = ejs.render(ForgetPassword, {
      name: user.name,
      token: passwordResetToken,
    });
    await sendMail(email, subject, html);
    return SuccessHandler(`Password reset token sent to ${email}`, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//reset password
const resetPassword = async (req, res) => {
  // #swagger.tags = ['auth']

  try {
    const { email, passwordResetToken, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return ErrorHandler("User does not exist", 400, req, res);
    }
    if (
      user.passwordResetToken != passwordResetToken ||
      user.passwordResetTokenExpires < Date.now()
    ) {
      return ErrorHandler("Invalid token", 400, req, res);
    }
    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetTokenExpires = null;
    await user.save();
    return SuccessHandler("Password reset successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//update password
const updatePassword = async (req, res) => {
  // #swagger.tags = ['auth']

  try {
    const { currentPassword, newPassword } = req.body;
    // if (
    //   !newPassword.match(
    //     /(?=[A-Za-z0-9]+$)^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/
    //   )
    // ) {
    //   return ErrorHandler(
    //     "Password must contain at least 8 characters, 1 uppercase, 1 lowercase, 1 number and 1 special character",
    //     400,
    //     req,
    //     res
    //   );
    // }
    const user = await User.findById(req.user.id).select("+password");
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return ErrorHandler("Invalid credentials", 400, req, res);
    }
    const samePasswords = await user.comparePassword(newPassword);
    if (samePasswords) {
      return ErrorHandler(
        "New password cannot be same as old password",
        400,
        req,
        res
      );
    }
    user.password = newPassword;
    await user.save();
    return SuccessHandler("Password updated successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

//googleAuth
const googleAuth = async (req, res) => {
  // #swagger.tags = ['auth']
  try {
    const { email, name, profilePic, emailVerified } = req.body;
    const exUser = await User.findOne({ email: email });
    let user;
    let jwtToken;
    if (!exUser) {
      user = await User.create({
        email: email,
        firstname: name,
        lastname: "",
        profilePic: profilePic,
        emailVerified: emailVerified,
      });
      jwtToken = user.getJWTToken();
    } else {
      jwtToken = exUser.getJWTToken();
      user = exUser;
    }
    delete user.password;
    delete user.emailVerificationToken;
    delete user.emailVerificationTokenExpires;
    delete user.passwordResetToken;
    delete user.passwordResetTokenExpires;
    return SuccessHandler(
      { message: "Logged in successfully", jwtToken, userData: user },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  register,
  requestEmailToken,
  verifyEmail,
  login,
  logout,
  forgotPassword,
  resetPassword,
  updatePassword,
  googleAuth,
};
