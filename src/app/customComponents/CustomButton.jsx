import React from "react";
import { Button } from "@/components/ui/button";
import { appColors } from "@/theme";
import { Spinner } from "./Spinner";
import clsx from "clsx";

export default function CustomButton({
    onClick,
    loading,
    disabled,
    title,
    buttonColor = appColors.primaryColor, 
    className,
    style, 
    type,
    children
}) {
    return (
        <Button
            onClick={!loading && !disabled ? onClick : null}
            disabled={loading || disabled}
            style={{ backgroundColor: buttonColor, ...style }}
            type ={type}
            className={clsx(
                "w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2",
                className 
            )}
        >
           {loading ? (
                <Spinner className="h-5" />
            ) : (
                <>
                    {title} {/* Render title */}
                    {children} {/* Render children */}
                </>
            )}
        </Button>
    );
}
