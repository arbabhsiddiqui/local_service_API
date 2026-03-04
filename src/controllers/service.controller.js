import { Service } from '../models/service.model.js'
import { ApiError } from '../utils/apiError.js'
import { ApiResponse, } from '../utils/apiResponse.js'
import { asyncHandler } from '../utils/asyncHandler.js'



const allowInFields = "_id title description";

const addItem = asyncHandler(async (req, res) => {


    const { title, description, categoryId, } = req.body


    if ([title, description, categoryId].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "required fields should not be empty")
    }


    const existed = await Service.findOne({
        $or: [{ title, user_id: req.user?._id }]
    })

    if (existed) {
        throw new ApiError(409, "Already exists")
    }

    const createItem = await Service.create({
        title,
        description,
        category_id: categoryId,
        user_id: req.user?._id,
        created_by: req.user?._id
    })



    const populated = await createItem.populate([
        { path: "user_id", select: "full_name" },
        { path: "category_id", select: "name" }
    ])

    const serviceObj = populated.toObject();


    const resJson = {
        isApprove: serviceObj.is_approve,
        serviceStatus: serviceObj.service_status,
        id: serviceObj._id,
        title: serviceObj.title,
        description: serviceObj.description,
        categoryId: serviceObj.category_id._id,
        category: serviceObj.category_id.name,
        userId: serviceObj.user_id._id,
        user: serviceObj.user_id.full_name,
    }

    return res.status(201).json(
        new ApiResponse(200, resJson, "created")
    )
})

const getAll = asyncHandler(async (req, res) => {


    const data = await Service.find({ status: 1 }).sort({
        created_at: -1
    }).populate("user_id", "full_name")
        .populate("category_id", "name")
        .lean();


    const formatted = data.map(service => ({
        id: service._id,
        title: service.title,
        isApprove: service.is_approve,
        serviceStatus: service.service_status,
        categoryId: service.category_id._id,
        category: service.category_id.name,
        userId: service.user_id._id,
        user: service.user_id.full_name,
    }));

    if (formatted.length == 0) {
        return res.status(204).json(new ApiResponse(200, null, "No content found"))
    }


    return res.status(200).json(new ApiResponse(200, formatted, "All Data"))


})

const getById = asyncHandler(async (req, res) => {


    const id = req.params.id



    if (id.trim() === '') {
        throw new ApiError(400, "enter a valid id")
    }



    const data = await Service.findById({ _id: id, status: 1 }).populate([
        { path: "user_id", select: "full_name" },
        { path: "category_id", select: "name" }
    ])

    const serviceObj = data.toObject();


    const resJson = {
        isApprove: serviceObj.is_approve,
        serviceStatus: serviceObj.service_status,
        id: serviceObj._id,
        title: serviceObj.title,
        description: serviceObj.description,
        categoryId: serviceObj.category_id._id,
        category: serviceObj.category_id.name,
        userId: serviceObj.user_id._id,
        user: serviceObj.user_id.full_name,
    }


    if (!data) {
        return res.status(204).json(new ApiResponse(200, null, "No content found"))
    }

    return res.status(200).json(new ApiResponse(200, resJson, "single data"))
})

const updateItem = asyncHandler(async (req, res) => {
    const id = req.params.id
    const { title, description, categoryId, } = req.body


    if (id.trim() === '') {
        throw new ApiError(400, "enter a valid id")
    }

    if ([title, description, categoryId].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "required fields should not be empty")
    }

    const existing = await Service.findOne({ _id: id, status: 1 });

    if (!existing) {
        return res.status(404).json({ message: "Record not found" });
    }

    const updatedData = await Service.findByIdAndUpdate(
        id,
        {
            title,
            description,
            category_id: categoryId,
            updated_by: req.user?._id,
        },
        {
            new: true,
            runValidators: true,
        }
    ).select("-created_at -updated_at -__v");

    return res.status(200).json(
        new ApiResponse(200, { name: title, description: updatedData.description }, "updated")
    )

})

const deleteItem = asyncHandler(async (req, res) => {
    const id = req.params.id

    if (id.trim() === '') {
        throw new ApiError(400, "enter a valid id")
    }
    const existing = await Service.findOne({ _id: id, status: 1 });

    if (!existing) {
        return res.status(204).json({ message: "Record not found" });
    }

    const updatedData = await Service.findByIdAndUpdate(
        id,
        {
            status: false,
            updated_by: req.user?._id,
        },
        {
            new: true,
        }
    )

    return res.status(200).json(
        new ApiResponse(200, {}, "deleted")
    )

})


export default { addItem, getAll, getById, updateItem, deleteItem }