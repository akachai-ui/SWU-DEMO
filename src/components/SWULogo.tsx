"use client";

import React from "react";

interface SWULogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  showText?: boolean;
}

export default function SWULogo({
  className = "",
  size = "md",
  showText = false
}: SWULogoProps) {
  const sizeClasses = {
    sm: "h-9 max-w-[220px]",
    md: "h-12 max-w-[300px]",
    lg: "h-16 max-w-[380px]",
    xl: "h-20 sm:h-24 max-w-[440px]",
    "2xl": "h-24 sm:h-28 max-w-[480px]"
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/swu-physdo-logo.png"
          alt="ส่วนพัฒนากายภาพ มหาวิทยาลัยศรีนครินทรวิโรฒ"
          className={`${sizeClasses[size]} w-auto object-contain drop-shadow-md brightness-105`}
          onError={(e) => {
            // Fallback to online URL if local fails
            (e.target as HTMLImageElement).src =
              "https://physdo.op.swu.ac.th/Portals/30/SWU_Physical_Development_Office_TH_Color.png";
          }}
        />
      </div>

      {showText && (
        <div className="flex flex-col text-left border-l border-gray-300 pl-3">
          <span className="font-extrabold text-sm sm:text-base text-gray-900 tracking-tight leading-tight">
            ส่วนพัฒนากายภาพ มศว
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500 font-medium leading-tight">
            Physical Development Office, SWU
          </span>
        </div>
      )}
    </div>
  );
}
