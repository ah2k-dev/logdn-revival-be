const user = require("../models/User/user");
// const user = require("../models/User/user");
// const user = require("../models/User/user");
// const user = require("../models/User/user");
const ErrorHandler = require("../utils/ErrorHandler");
const SuccessHandler = require("../utils/SuccessHandler");

const getUsers = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const users = await user
      .find({
        role: "user",
        isActive: true,
      })
      .select(
        "-password -emailVerificationToken -emailVerificationTokenExpires -passwordResetToken -passwordResetTokenExpires"
      );
    const moderators = await user
      .find({
        role: "moderator",
        isActive: true,
      })
      .select(
        "-password -emailVerificationToken -emailVerificationTokenExpires -passwordResetToken -passwordResetTokenExpires"
      );
    return SuccessHandler({ users, moderators }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const getMe = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const user = req.user;
    return SuccessHandler({ user }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const createModerator = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const { firstName, lastName, email, password, permissions } = req.body;

    const updatedUser = await user.create({
      firstname: firstName,
      lastname: lastName,
      email,
      password,
      role: "moderator",
      permissions,
    });
    if (!updatedUser)
      return ErrorHandler("Failed to create moderator", 400, req, res);
    return SuccessHandler({ updatedUser }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const updateMe = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const { firstName, lastName, phone, company } = req.body;
    const updated = await user.findByIdAndUpdate(
      req.user._id,
      { firstname: firstName, lastname: lastName, phone, company },
      { new: true }
    );
    if (!updated)
      return ErrorHandler("Failed to update updated", 400, req, res);
    return SuccessHandler({ updated }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const blockUnblock = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const { id, status } = req.body;
    const updated = await user.findByIdAndUpdate(
      id,
      { isBlocked: status },
      { new: true }
    );
    if (!updated) return ErrorHandler("Failed to update user", 400, req, res);
    return SuccessHandler({ updated }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const updateModerator = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const { id, firstName, lastName, email, permissions } = req.body;
    const exuser = await user.findByIdAndUpdate(
      id,
      { firstname: firstName, lastname: lastName, email, permissions },
      { new: true }
    );
    console.log(exuser)
    if (!exuser) return ErrorHandler("Failed to update user", 400, req, res);
    return SuccessHandler({ exuser }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  getUsers,
  getMe,
  createModerator,
  updateMe,
  blockUnblock,
  updateModerator,
};
