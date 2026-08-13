import Employee from "../models/Employee.js";
import EmployeePersonalDetails from "../models/EmployeePersonalDetails.js";
import EmployeeBankDetails from "../models/EmployeeBankDetails.js";
import EmployeeParentInformation from "../models/EmployeeParentInformation.js";
import EmployeeQualification from "../models/EmployeeQualification.js";
import EmployeeDocuments from "../models/EmployeeDocuments.js";
import Media from "../models/Media.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Helper: mask bank account number ───────────────────────────────────────
const maskAccountNumber = (accNum) => {
    if (!accNum) return null;
    const cleaned = accNum.replace(/\s/g, "");
    if (cleaned.length <= 4) return "XXXX";
    const visible = cleaned.slice(-4);
    const masked = "X".repeat(cleaned.length - 4);
    return `${masked.match(/.{1,4}/g).join(" ")} ${visible}`;
};

// ─── Helper: get employee from userId ────────────────────────────────────────
export const getEmployeeByUserId = async (userId) => {
    const employee = await Employee.findOne({ userId, isDeleted: { $ne: true } });
    return employee;
};

// ─── Profile Completion ───────────────────────────────────────────────────────
export const calculateProfileCompletion = async (employeeId) => {
    const sections = [
        {
            key: "personalDetails",
            label: "Personal Details",
            check: async () => {
                const doc = await EmployeePersonalDetails.findOne({ employeeId });
                return !!(doc && (doc.pancardNumber || doc.aadharcardNumber || doc.currentAddress));
            },
        },
        {
            key: "bankDetails",
            label: "Bank Details",
            check: async () => {
                const doc = await EmployeeBankDetails.findOne({ employeeId });
                return !!(doc && doc.bankName && doc.accountNumber);
            },
        },
        {
            key: "parentInformation",
            label: "Parent Information",
            check: async () => {
                const doc = await EmployeeParentInformation.findOne({ employeeId });
                return !!(doc && (doc.fatherName || doc.motherName));
            },
        },
        {
            key: "qualification",
            label: "Qualification",
            check: async () => {
                const doc = await EmployeeQualification.findOne({ employeeId });
                return !!(doc && (doc.education?.length > 0 || doc.experience?.length > 0));
            },
        },
        {
            key: "documents",
            label: "Documents",
            check: async () => {
                const count = await EmployeeDocuments.countDocuments({ employeeId, isDeleted: false });
                return count > 0;
            },
        },
    ];

    const results = await Promise.all(
        sections.map(async (s) => ({ key: s.key, label: s.label, completed: await s.check() }))
    );

    const completed = results.filter((s) => s.completed).length;
    const total = sections.length;
    const percentage = Math.round((completed / total) * 100);

    return { percentage, completed, total, sections: results };
};

// ─── My Profile Overview ──────────────────────────────────────────────────────
export const getMyProfile = async (userId) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) return null;

    const employeeId = employee._id;

    const [personal, bank, parents, qualification, docsCount, profileCompletion] =
        await Promise.all([
            EmployeePersonalDetails.findOne({ employeeId }).lean(),
            EmployeeBankDetails.findOne({ employeeId }).lean(),
            EmployeeParentInformation.findOne({ employeeId }).lean(),
            EmployeeQualification.findOne({ employeeId }).lean(),
            EmployeeDocuments.countDocuments({ employeeId, isDeleted: false }),
            calculateProfileCompletion(employeeId),
        ]);

    // Mask account number before sending
    const bankData = bank
        ? {
              ...bank,
              accountNumber: maskAccountNumber(bank.accountNumber),
              reimbursment: (bank.reimbursment || []).map((r) => ({
                  ...r,
                  accountNumber: maskAccountNumber(r.accountNumber),
              })),
          }
        : null;

    return {
        employee: {
            id: employee._id,
            employeeCode: employee.employeeCode,
            firstName: employee.firstName,
            middleName: employee.middleName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone,
            department: employee.department,
            position: employee.position,
            gender: employee.gender,
            dateOfBirth: employee.dateOfBirth,
            blodGroup: employee.blodGroup,
            nationality: employee.nationality,
            employeeStatus: employee.employeeStatus,
            employeeType: employee.employeeType,
            dateOfJoining: employee.dateOfJoining,
            dateOfConfirmation: employee.dateOfConfirmation,
            bio: employee.bio,
            skillType: employee.skillType,
            profilePicture: employee.profilePicture,
        },
        personalDetails: {
            completed: !!(personal && (personal.pancardNumber || personal.aadharcardNumber || personal.currentAddress)),
            data: personal || null,
        },
        bankDetails: {
            completed: !!(bank && bank.bankName && bank.accountNumber),
            data: bankData,
        },
        parentInformation: {
            completed: !!(parents && (parents.fatherName || parents.motherName)),
            data: parents || null,
        },
        qualification: {
            completed: !!(qualification && (qualification.education?.length > 0 || qualification.experience?.length > 0)),
            educationCount: qualification?.education?.length || 0,
            experienceCount: qualification?.experience?.length || 0,
            data: qualification || null,
        },
        documents: {
            completed: docsCount > 0,
            uploaded: docsCount,
            data: null,
        },
        profileCompletion,
    };
};

// ─── Personal Details ─────────────────────────────────────────────────────────
export const getPersonalDetails = async (userId) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) return null;
    const details = await EmployeePersonalDetails.findOne({ employeeId: employee._id }).lean();
    return { employee, details };
};

export const upsertPersonalDetails = async (userId, data) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) throw new Error("Employee not found");

    // Only allow employee-editable fields
    const allowed = {
        pancardNumber: data.pancardNumber,
        aadharcardNumber: data.aadharcardNumber,
        passportNumber: data.passportNumber,
        passportExpiryDate: data.passportExpiryDate || undefined,
        drivingLicenceNumber: data.drivingLicenceNumber,
        drivingLicenceExpiryDate: data.drivingLicenceExpiryDate || undefined,
        secondaryEmail: data.secondaryEmail,
        emergencyContactName: data.emergencyContactName,
        emergencyContactNumber: data.emergencyContactNumber,
        relation: data.relation,
        currentAddress: data.currentAddress,
        currentCountry: data.currentCountry,
        currentState: data.currentState,
        currentDistrict: data.currentDistrict,
        currentPincode: data.currentPincode,
        permanentAddress: data.permanentAddress,
        permanentCountry: data.permanentCountry,
        permanentState: data.permanentState,
        permanentDistrict: data.permanentDistrict,
        permanentPincode: data.permanentPincode,
    };

    // Remove undefined fields
    Object.keys(allowed).forEach((k) => allowed[k] === undefined && delete allowed[k]);

    const result = await EmployeePersonalDetails.findOneAndUpdate(
        { employeeId: employee._id },
        { $set: allowed },
        { upsert: true, new: true }
    );
    return result;
};

// ─── Bank Details ─────────────────────────────────────────────────────────────
export const getBankDetails = async (userId) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) return null;
    const bank = await EmployeeBankDetails.findOne({ employeeId: employee._id }).lean();
    if (!bank) return { employee, details: null };
    return {
        employee,
        details: {
            ...bank,
            accountNumber: maskAccountNumber(bank.accountNumber),
            reimbursment: (bank.reimbursment || []).map((r) => ({
                ...r,
                accountNumber: maskAccountNumber(r.accountNumber),
            })),
        },
    };
};

export const upsertBankDetails = async (userId, data) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) throw new Error("Employee not found");

    const allowed = {
        salaryPayMode: data.salaryPayMode,
        bankName: data.bankName?.trim(),
        accountNumber: data.accountNumber?.trim(),
        ifscCode: data.ifscCode?.trim()?.toUpperCase(),
        branchName: data.branchName?.trim(),
        branchAddress: data.branchAddress?.trim(),
    };

    Object.keys(allowed).forEach((k) => (allowed[k] === undefined || allowed[k] === null) && delete allowed[k]);

    const result = await EmployeeBankDetails.findOneAndUpdate(
        { employeeId: employee._id },
        { $set: allowed },
        { upsert: true, new: true }
    );

    // Return masked version
    return {
        ...result.toObject(),
        accountNumber: maskAccountNumber(result.accountNumber),
    };
};

// ─── Parent Information ───────────────────────────────────────────────────────
export const getParentInfo = async (userId) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) return null;
    const info = await EmployeeParentInformation.findOne({ employeeId: employee._id }).lean();
    return { employee, details: info || null };
};

export const upsertParentInfo = async (userId, data) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) throw new Error("Employee not found");

    const allowed = {
        fatherName: data.fatherName?.trim(),
        motherName: data.motherName?.trim(),
        maritalStatus: data.maritalStatus,
        spouseName: data.spouseName?.trim(),
        spouseDateOfBirth: data.spouseDateOfBirth || undefined,
        marriedDate: data.marriedDate || undefined,
        children: Array.isArray(data.children) ? data.children : undefined,
    };

    Object.keys(allowed).forEach((k) => allowed[k] === undefined && delete allowed[k]);

    const result = await EmployeeParentInformation.findOneAndUpdate(
        { employeeId: employee._id },
        { $set: allowed },
        { upsert: true, new: true }
    );
    return result;
};

// ─── Qualifications ───────────────────────────────────────────────────────────
export const getQualifications = async (userId) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) return null;
    const qual = await EmployeeQualification.findOne({ employeeId: employee._id }).lean();
    return { employee, details: qual || null };
};

export const addEducation = async (userId, data) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) throw new Error("Employee not found");

    const entry = {
        educationLevel: data.educationLevel?.trim(),
        institutionName: data.institutionName?.trim(),
        courseName: data.courseName?.trim(),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        percentage: Number(data.percentage) || 0,
        cgpa: Number(data.cgpa) || 0,
        gpa: Number(data.gpa) || 0,
        remarks: data.remarks?.trim() || "",
    };

    const result = await EmployeeQualification.findOneAndUpdate(
        { employeeId: employee._id },
        { $push: { education: entry } },
        { upsert: true, new: true }
    );
    return result;
};

export const updateEducation = async (userId, eduId, data) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) throw new Error("Employee not found");

    const result = await EmployeeQualification.findOneAndUpdate(
        { employeeId: employee._id, "education._id": eduId },
        {
            $set: {
                "education.$.educationLevel": data.educationLevel?.trim(),
                "education.$.institutionName": data.institutionName?.trim(),
                "education.$.courseName": data.courseName?.trim(),
                "education.$.startDate": new Date(data.startDate),
                "education.$.endDate": new Date(data.endDate),
                "education.$.percentage": Number(data.percentage) || 0,
                "education.$.cgpa": Number(data.cgpa) || 0,
                "education.$.gpa": Number(data.gpa) || 0,
                "education.$.remarks": data.remarks?.trim() || "",
            },
        },
        { new: true }
    );
    return result;
};

export const deleteEducation = async (userId, eduId) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) throw new Error("Employee not found");

    await EmployeeQualification.findOneAndUpdate(
        { employeeId: employee._id },
        { $pull: { education: { _id: eduId } } }
    );
};

export const addExperience = async (userId, data) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) throw new Error("Employee not found");

    const entry = {
        organizationName: data.organizationName?.trim(),
        organizationType: data.organizationType?.trim(),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        totalExperience: data.totalExperience?.trim(),
        responsibilities: data.responsibilities?.trim(),
    };

    const result = await EmployeeQualification.findOneAndUpdate(
        { employeeId: employee._id },
        { $push: { experience: entry } },
        { upsert: true, new: true }
    );
    return result;
};

export const updateExperience = async (userId, expId, data) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) throw new Error("Employee not found");

    const result = await EmployeeQualification.findOneAndUpdate(
        { employeeId: employee._id, "experience._id": expId },
        {
            $set: {
                "experience.$.organizationName": data.organizationName?.trim(),
                "experience.$.organizationType": data.organizationType?.trim(),
                "experience.$.startDate": new Date(data.startDate),
                "experience.$.endDate": new Date(data.endDate),
                "experience.$.totalExperience": data.totalExperience?.trim(),
                "experience.$.responsibilities": data.responsibilities?.trim(),
            },
        },
        { new: true }
    );
    return result;
};

export const deleteExperience = async (userId, expId) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) throw new Error("Employee not found");

    await EmployeeQualification.findOneAndUpdate(
        { employeeId: employee._id },
        { $pull: { experience: { _id: expId } } }
    );
};

export const setFresherStatus = async (userId, isFresher) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) throw new Error("Employee not found");

    await EmployeeQualification.findOneAndUpdate(
        { employeeId: employee._id },
        { $set: { isFresher } },
        { upsert: true, new: true }
    );
};

// ─── Documents ────────────────────────────────────────────────────────────────
export const getDocuments = async (userId) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) return null;

    const docs = await EmployeeDocuments.find({ employeeId: employee._id, isDeleted: false })
        .populate("documentId")
        .lean();

    return { employee, documents: docs };
};

export const uploadDocument = async (userId, file, documentName) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) throw new Error("Employee not found");

    // Save file to storage/documents directory
    const uploadDir = path.join(__dirname, "../storage/documents");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const ext = path.extname(file.originalname);
    const fileName = `${employee._id}_${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    // Create Media record
    const media = await Media.create({
        mediaType: "DOCUMENT",
        title: documentName || file.originalname,
        fileName,
        filePath: `/storage/documents/${fileName}`,
        fileSize: String(file.size),
        fileType: file.mimetype,
    });

    // Create EmployeeDocuments record
    const doc = await EmployeeDocuments.create({
        employeeId: employee._id,
        documentName: documentName || file.originalname,
        documentId: media._id,
        documentStatus: "ACTIVE",
    });

    return doc;
};

export const deleteDocument = async (userId, docId) => {
    const employee = await getEmployeeByUserId(userId);
    if (!employee) throw new Error("Employee not found");

    // Verify ownership
    const doc = await EmployeeDocuments.findOne({ _id: docId, employeeId: employee._id });
    if (!doc) throw new Error("Document not found or access denied");

    doc.isDeleted = true;
    await doc.save();
};
