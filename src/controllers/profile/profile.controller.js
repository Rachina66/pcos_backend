import {
  successResponse,
  errorResponse,
} from "../../utils/apiResponse.utils.js";
import * as profileService from "../../services/profile/profile.service.js";
import {
  sendOtpEmail,
  sendPasswordChangedEmail,
} from "../../utils/otpEmail.utils.js";

//Update Name
export const updateName = async (req, res) => {
  try {
    const user = await profileService.updateName(req.user.id, req.body.name);
    return successResponse(res, user, "Name updated successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

//Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await profileService.changePassword(
      req.user.id,
      currentPassword,
      newPassword,
    );

    //Send confirmation email (non-blocking)
    sendPasswordChangedEmail(req.user.email, req.user.name);

    return successResponse(res, null, "Password changed successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

//CHANGE EMAIL
export const changeEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;
    const user = await profileService.changeEmail(
      req.user.id,
      newEmail,
      password,
    );
    return successResponse(res, user, "Email updated successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

//FORGOT PASSWORD – Request OTP
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const otp = await profileService.generateOtp(email);

    // Send OTP email
    await sendOtpEmail(email, otp);

    return successResponse(res, null, "OTP sent to your email");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

//FORGOT PASSWORD – Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    profileService.verifyOtp(email, otp);
    return successResponse(res, null, "OTP verified successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};

//FORGOT PASSWORD – Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    await profileService.resetPassword(email, newPassword);
    return successResponse(res, null, "Password reset successfully");
  } catch (error) {
    return errorResponse(res, error.message, 400);
  }
};
