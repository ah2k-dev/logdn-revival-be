const getUsers = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const users = await User.find({
      role: "user",
      isActive: true,
    }).select(
      "-password -emailVerificationToken -emailVerificationTokenExpires -passwordResetToken -passwordResetTokenExpires"
    );
    const moderators = await User.find({
      role: "moderator",
      isActive: true,
    }).select(
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
    const { name, email, password, permissions } = req.body;
    const user = await User.create({
      name,
      email,
      password,
      role: "moderator",
      permissions,
    });
    if (!user) return ErrorHandler("Failed to create moderator", 400, req, res);
    return SuccessHandler({ user }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const updateMe = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const { name } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      { new: true }
    );
    if (!user) return ErrorHandler("Failed to update user", 400, req, res);
    return SuccessHandler({ user }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const blockUnblock = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const { id, status } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { isBlocked: status },
      { new: true }
    );
    if (!user) return ErrorHandler("Failed to update user", 400, req, res);
    return SuccessHandler({ user }, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};
const updateModerator = async (req, res) => {
  // #swagger.tags = ['user']
  try {
    const { id, name, email, permissions } = req.body;
    const user = await User.findByIdAndUpdate(
      id,
      { name, email, permissions },
      { new: true }
    );
    if (!user) return ErrorHandler("Failed to update user", 400, req, res);
    return SuccessHandler({ user }, 200, res);
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
