import mongoose, { Schema } from 'mongoose'

const categorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    created_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    updated_at: {
        type: Date,
    },
    updated_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: Boolean,
        default: true,
    },
})



export const Category = mongoose.model("Category", categorySchema)