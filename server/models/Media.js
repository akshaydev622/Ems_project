import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema({
    mediaType: { type: String, default: null },
    parentMediaId: { type: mongoose.Schema.Types.ObjectId, ref: "Media", default: null },
    mediaDirectoryId: { type: mongoose.Schema.Types.ObjectId, ref: "MediaDirectory", default: null },
    title: { type: String, default: null },
    description: { type: String, default: null },
    fileName: { type: String },
    filePath: { type: String, default: null },
    fileSize: { type: String, default: null },
    fileType: { type: String, default: null },
    deviceType: { type: String, default: null },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    caption: { type: String, default: null },
    cdnPath: { type: String, },
    isDeleted: { type: Boolean, default: false },

}, { timestamps: true });

const Media = mongoose.models.Media || mongoose.model("Media", mediaSchema);

export default Media