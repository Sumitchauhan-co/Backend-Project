import userModel from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import uploadOnCloudinary from "../services/cloudinary.service.js";
import { apiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";

const registerUser = asyncHandler(async (req, res) => {
    const { username, email, fullName, password } = req.body;

    if (
        [username, email, fullName, password].some(
            (field) => field?.trim === ""
        )
    ) {
        throw new apiError(400, "All fields are required");
    }

    const existedUser = await userModel.findOne({
        $or: [{ username }, { email }],
    });

    if (existedUser) {
        throw new apiError(409, "User already existed with username or email");
    }

    const avatarLocalPath = req.files?.avatar[0]?.path;

    const coverImageLocalPath =
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.length > 0
            ? req.files.coverImage[0].path
            : "";

    if (!avatarLocalPath) {
        throw new apiError(400, "Avatar field is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    let coverImage;
    if (coverImageLocalPath) {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
    }

    if (!avatar) {
        throw new apiError(400, "Avatar file is required");
    }

    const user = await userModel.create({
        fullName,
        email,
        username,
        password,
        coverImage: coverImage?.url || "",
        avatar: avatar.url,
    });
    return res
        .status(201)
        .json(new apiResponse(201, user, "User registered successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body;

    if (!email && !username) {
        throw new apiError(400, "username or email is required");
    }

    const user = await userModel.findOne({
        $or: [{ email }, { username }],
    });

    if (!user) {
        throw new apiError(404, "User not exist for email or username");
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if (!isPasswordValid) {
        throw new apiError(401, "Invalid user credentials");
    }

    const accessToken = user.generateAcccessToken();

    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new apiResponse(200, user, "User logged in successfully"));
});

const logoutUser = asyncHandler(async (req, res) => {
    await userModel.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined,
        },
    });

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new apiResponse(200, {}, "User logged out successfully "));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
        throw new apiError(401, "Unauthorized request");
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const user = await userModel.findById(decoded?._id);

    if (!user) {
        throw new apiError(401, "Invalid refresh token");
    }

    if (refreshToken !== user?.refreshToken) {
        throw new apiError(401, "Refresh token is expired");
    }

    const accessToken = user.generateAcccessToken();

    const newRefreshToken = user.generateRefreshToken();

    user.refreshToken = newRefreshToken;

    await user.save({ validateBeforeSave: false });

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new apiResponse(
                200,
                { accessToken, refrehToken: newRefreshToken },
                "Access token refreshed successfully"
            )
        );
});

export default { registerUser, loginUser, logoutUser, refreshAccessToken };
