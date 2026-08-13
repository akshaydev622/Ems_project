import api from "../../../api/axios";

// ─── Overview ──────────────────────────────────────────────────────────────────
export const fetchMyProfile = () => api.get("/profile/my-profile");

// ─── Personal Details ─────────────────────────────────────────────────────────
export const fetchPersonalDetails = () => api.get("/profile/my-profile/personal");
export const savePersonalDetails = (data) => api.put("/profile/my-profile/personal", data);

// ─── Bank Details ─────────────────────────────────────────────────────────────
export const fetchBankDetails = () => api.get("/profile/my-profile/bank");
export const saveBankDetails = (data) => api.post("/profile/my-profile/bank", data);

// ─── Parent Information ───────────────────────────────────────────────────────
export const fetchParentInfo = () => api.get("/profile/my-profile/parents");
export const saveParentInfo = (data) => api.put("/profile/my-profile/parents", data);

// ─── Qualifications ───────────────────────────────────────────────────────────
export const fetchQualifications = () => api.get("/profile/my-profile/qualifications");

// Education
export const addEducation = (data) => api.post("/profile/my-profile/qualifications/education", data);
export const updateEducation = (eduId, data) => api.put(`/profile/my-profile/qualifications/education/${eduId}`, data);
export const deleteEducation = (eduId) => api.delete(`/profile/my-profile/qualifications/education/${eduId}`);

// Experience
export const addExperience = (data) => api.post("/profile/my-profile/qualifications/experience", data);
export const updateExperience = (expId, data) => api.put(`/profile/my-profile/qualifications/experience/${expId}`, data);
export const deleteExperience = (expId) => api.delete(`/profile/my-profile/qualifications/experience/${expId}`);

// Fresher
export const setFresherStatus = (isFresher) => api.put("/profile/my-profile/qualifications/fresher", { isFresher });

// ─── Documents ────────────────────────────────────────────────────────────────
export const fetchDocuments = () => api.get("/profile/my-profile/documents");
export const uploadDocument = (formData) =>
    api.post("/profile/my-profile/documents", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
export const deleteDocument = (docId) => api.delete(`/profile/my-profile/documents/${docId}`);
