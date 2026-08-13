import mongoose from "mongoose";

const mediaDirectorySchema = new mongoose.Schema({
    name: { type: String },
    parentDirectoryId: { type: mongoose.Schema.Types.ObjectId, ref: "MediaDirectory", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", requird: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true }
);

const MediaDirectory = mongoose.models.MediaDirectory || mongoose.model("MediaDirectory", mediaDirectorySchema);

export default MediaDirectory