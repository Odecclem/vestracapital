"use client";

import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  variant?: "horizontal" | "full" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  dark?: boolean;
  href?: string | null;
  className?: string;
  showSubtitle?: boolean;
}

export default function Logo({
  variant = "horizontal",
  size = "md",
  dark = false,
  href = "/",
  className = "",
  showSubtitle = true,
}: LogoProps) {
  // Dimensions for icon / emblem
  const iconSizeMap = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const imagePixelMap = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  const textTitleSizeMap = {
    sm: "text-base font-bold",
    md: "text-xl font-extrabold",
    lg: "text-2xl font-extrabold",
    xl: "text-3xl font-extrabold",
  };

  const subtitleSizeMap = {
    sm: "text-[8px]",
    md: "text-[10px]",
    lg: "text-[11px]",
    xl: "text-xs",
  };

  const content = (() => {
    if (variant === "full") {
      // Full badge with emblem and golden typography
      const badgeDimensions = {
        sm: { w: 120, h: 80 },
        md: { w: 160, h: 106 },
        lg: { w: 200, h: 133 },
        xl: { w: 240, h: 160 },
      }[size];

      return (
        <div
          className={`relative rounded-xl overflow-hidden shadow-md border border-amber-500/30 bg-[#0B132B] flex items-center justify-center transition-transform hover:scale-[1.02] ${className}`}
        >
          <Image
            src="/logo.jpg"
            alt="Vestra Capital Investment"
            width={badgeDimensions.w}
            height={badgeDimensions.h}
            className="w-auto h-auto object-contain"
            priority
          />
        </div>
      );
    }

    if (variant === "icon") {
      return (
        <div
          className={`relative ${iconSizeMap[size]} rounded-xl overflow-hidden shadow-md border border-amber-400/40 bg-[#0B132B] flex items-center justify-center p-0.5 transition-transform hover:scale-105 ${className}`}
        >
          <Image
            src="/logo-icon.png"
            alt="Vestra Capital Emblem"
            width={imagePixelMap[size]}
            height={imagePixelMap[size]}
            className="w-full h-full object-contain"
            priority
          />
        </div>
      );
    }

    // Default: Horizontal (Icon emblem + Golden styled text)
    return (
      <div className={`flex items-center gap-3 group ${className}`}>
        {/* Emblem */}
        <div
          className={`relative ${iconSizeMap[size]} rounded-xl overflow-hidden shadow-md border border-amber-400/40 bg-[#0B132B] flex items-center justify-center shrink-0 p-0.5 group-hover:border-amber-400 transition-all`}
        >
          <Image
            src="/logo-icon.png"
            alt="Vestra Capital Emblem"
            width={imagePixelMap[size]}
            height={imagePixelMap[size]}
            className="w-full h-full object-contain"
            priority
          />
        </div>

        {/* Text */}
        <div className="flex flex-col justify-center leading-tight">
          <span
            className={`${textTitleSizeMap[size]} tracking-tight transition-colors ${
              dark
                ? "text-white group-hover:text-amber-300"
                : "text-[#0a0a0a] group-hover:text-blue-700"
            }`}
          >
            Vestra Capital
          </span>
          {showSubtitle && (
            <span
              className={`${subtitleSizeMap[size]} uppercase font-bold tracking-[0.25em] text-amber-600 dark:text-amber-400 -mt-0.5`}
            >
              Investment
            </span>
          )}
        </div>
      </div>
    );
  })();

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}
