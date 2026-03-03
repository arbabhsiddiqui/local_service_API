import mongoose, { Schema } from 'mongoose'

const userTypeSchema = new Schema({
    name: { type: String, required: true, trim: true },
    role_id: { type: Number, required: true },
    created_at: {
        type: Date,
        default: Date.now,

    },
    updated_at: {
        type: Date,
    },

    // created_by: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    // },

    // updated_by: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "User",
    // },
    status: {
        type: Boolean,
        default: true,
    },

})



export const UserType = mongoose.model("UserType", userTypeSchema)