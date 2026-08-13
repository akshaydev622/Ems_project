import { useState, useCallback } from "react";
import { fetchMyProfile } from "../services/myProfileApi";
import toast from "react-hot-toast";

export const useMyProfile = () => {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const refresh = useCallback(async (silent = false) => {
        if (!silent) setLoading(true);
        setError(null);
        try {
            const { data } = await fetchMyProfile();
            setProfileData(data);
        } catch (err) {
            const msg = err.response?.data?.message || "Failed to load profile";
            setError(msg);
            if (!silent) toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    return { profileData, loading, error, refresh };
};
