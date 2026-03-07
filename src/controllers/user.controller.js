import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const register = asyncHandler(async (req, res) => {

    const { fullName, email, password, userTypeId } = req.body


    if (!fullName || fullName.trim() === "") {
        throw new ApiError(400, "Full name is required");
    }

    if (!email || email.trim() === "") {
        throw new ApiError(400, "Email is required");
    }

    if (!password || password.trim() === "") {
        throw new ApiError(400, "Password is required");
    }

    if (userTypeId == null) {   // works for number
        throw new ApiError(400, "User type is required");
    }

    const existed = await User.findOne({
        $or: [{ email }]
    })


    if (existed) {
        throw new ApiError(409, "User Already exists")
    }


    const newUser = await User.create({
        full_name: fullName,
        email,
        password,
        user_type_id: userTypeId
    })


    const createdUser = await User.findById(newUser._id).select(
        "-password -refreshToken"
    )


    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )


})

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if (!email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken").populate([
        { path: "user_type_id", select: "name" }
    ])

    const options = {
        httpOnly: true,
        secure: true
    }

    const resJson = {
        user: {
            email: loggedInUser.email,
            fullName: loggedInUser.full_name,
            roleName: loggedInUser.user_type_id.name,
            roleId: loggedInUser.user_type_id.role_id,
        },
        accessToken,
        refreshToken
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                resJson,
                "User logged In Successfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})


const refreshAccessToken = asyncHandler(async (req, res) => {
    // cookies may not always be parsed, guard with optional chaining
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        // explicit message for missing token
        throw new ApiError(401, "Refresh token is required")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Refresh token is expired or used")

        }

        const options = {
            httpOnly: true,
            secure: true
        }

        // we return an object with properties accessToken and refreshToken
        // earlier this was destructured incorrectly as "newRefreshToken" which
        // resulted in undefined being sent back to the client. the cookie would
        // then contain the string "undefined" and subsequent calls would fail
        // with "jwt malformed" when trying to verify the bogus value.
        const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken },
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})


const me = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!token) {
        throw new ApiError(401, "Refresh token is required")
    }

    try {
        const decodedToken = jwt.verify(
            token,
            process.env.REFRESH_TOKEN_SECRET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }


        const loggedInUser = await User.findById(user._id).select("-password -refreshToken").populate([
            { path: "user_type_id", select: "name" }
        ])

        const resJson = {
            email: loggedInUser.email,
            fullName: loggedInUser.full_name,
            roleName: loggedInUser.user_type_id.name,
            roleId: loggedInUser.user_type_id.role_id,
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    resJson,
                    "Access token refreshed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token")
    }

})

export default { register, login, refreshAccessToken, logoutUser, me }