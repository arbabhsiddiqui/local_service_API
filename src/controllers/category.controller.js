import { Category } from '../models/category.model.js'
import { ApiError } from '../utils/apiError.js'
import { ApiResponse, } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'



const allowInFields = "_id name role_id";

const addItem = asyncHandler(async (req, res) => {


    const { name } = req.body


    if ([name].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "required fields should not be empty")
    }


    const existed = await Category.findOne({
        $or: [{ name }]
    })

    if (existed) {
        throw new ApiError(409, "User type already exists")
    }

    const newUserType = await Category.create({
        name,
        created_by: req.user?._id
    })


    return res.status(201).json(
        new ApiResponse(200, { name }, "created")
    )
})

const getAll = asyncHandler(async (req, res) => {


    const data = await Category.find({ status: 1 }).sort({
        created_at: -1
    }).select("_id name")

    if (data.length == 0) {
        return res.status(204).json(new ApiResponse(200, null, "No content found"))
    }


    return res.status(200).json(new ApiResponse(200, data, "All User Data"))


})

const getById = asyncHandler(async (req, res) => {


    const id = req.params.id



    if (id.trim() === '') {
        throw new ApiError(400, "enter a valid id")
    }



    const data = await Category.findById({ _id: id, status: 1 }).select(allowInFields)

    if (!data) {
        return res.status(204).json(new ApiResponse(200, null, "No content found"))
    }

    return res.status(200).json(new ApiResponse(200, data, "All User Data"))
})

const updateItem = asyncHandler(async (req, res) => {
    const id = req.params.id
    const { name } = req.body


    if (id.trim() === '') {
        throw new ApiError(400, "enter a valid id")
    }

    if ([name].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "required fields should not be empty")
    }

    const existing = await Category.findOne({ _id: id, status: 1 });

    if (!existing) {
        return res.status(404).json({ message: "Record not found" });
    }

    const updatedData = await Category.findByIdAndUpdate(
        id,
        {
            name,
            updated_by: req.user?._id,
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-created_at -updated_at -__v");

    return res.status(200).json(
        new ApiResponse(200, { name: updatedData.name, role_id: updatedData.role_id, id: updatedData._id }, "created")
    )

})

const deleteItem = asyncHandler(async (req, res) => {
    const id = req.params.id

    if (id.trim() === '') {
        throw new ApiError(400, "enter a valid id")
    }
    const existing = await Category.findOne({ _id: id, status: 1 });

    if (!existing) {
        return res.status(204).json({ message: "Record not found" });
    }

    const updatedData = await Category.findByIdAndUpdate(
        id,
        {
            status: false,
            updated_by: req.user?._id,
        },
        {
            new: true,
        }
    ).select("-created_at -updated_at -__v");

    return res.status(200).json(
        new ApiResponse(200, {}, "deleted")
    )

})


export default { addItem, getAll, getById, updateItem, deleteItem }