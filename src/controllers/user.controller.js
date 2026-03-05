import userModel from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js";
import uploadOnCloudinary from "../services/cloudinary.service.js";
import { apiResponse } from "../utils/apiResponse.js";

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

export default { registerUser };
