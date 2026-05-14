import React from "react";
import logoImage from "../../assets/logo_brand.png";

interface LogoProps {
  variant?: "full" | "icon-only";
  className?: string;
  clickable?: boolean;
  onClick?: () => void;
  size?: "sm" | "md" | "lg";
}

export default function Logo({
  variant = "full",
  className = "",
  clickable = false,
  onClick,
  size = "md",
}: LogoProps) {
  const iconSizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const fullSizeClasses = {
    sm: "h-10 max-w-[112px]",
    md: "h-12 sm:h-14 max-w-[144px]",
    lg: "h-16 sm:h-20 max-w-[192px]",
  };

  const content = () => {
    if (variant === "icon-only") {
      return (
        <img
          src={logoImage}
          alt="Garasi21 Motowash"
          className={`${iconSizeClasses[size]} object-contain`}
        />
      );
    }

    return (
      <img
        src={logoImage}
        alt="Garasi21 Motowash"
        className={`${fullSizeClasses[size]} w-auto object-contain`}
      />
    );
  };

  const element = content();

  if (clickable) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex shrink-0 items-center hover:opacity-80 transition-opacity focus:outline-none ${className}`}
        aria-label="Logo"
      >
        {element}
      </button>
    );
  }

  return <div className={`inline-flex shrink-0 items-center ${className}`}>{element}</div>;
}
