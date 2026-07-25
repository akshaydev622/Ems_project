import React from "react";

const Button = ({
    children,
    type = "button",
    variant = "primary",
    size = "md",
    loading = false,
    disabled = false,
    fullWidth = false,
    className = "",
    onClick,
    leftIcon,
    rightIcon,
}) => {

    const variants = {
        primary: "btn-primary",
        success: "btn-success",
        danger: "btn-danger",
        warning: "btn-warning",
        secondary: "btn-secondary",
        successLight: "btn-success-light",
        dangerLight: "btn-danger-light",
        warningLight: "btn-warning-light",
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-4 py-2 text-sm",
        lg: "px-5 py-3 text-base",
    };

    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={`
                btn
                ${variants[variant]}
                ${sizes[size]}
                ${fullWidth ? "w-full" : ""}
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                flex items-center justify-center gap-2 px-5 py-2.5 rounded-md text-sm transition-all duration-200 font-medium
                ${className}
            `}
        >
            {loading ? (
                <>
                    <span className="loader"></span>
                    Loading...
                </>
            ) : (
                <>
                    {leftIcon}
                    {children}
                    {rightIcon}
                </>
            )}
        </button>
    );
};

export default Button;