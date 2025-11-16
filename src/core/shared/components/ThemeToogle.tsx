"use client";
import * as React from "react";
import { useTheme } from "next-themes";

import { ThemeSwitcher } from "@/core/shared/ui/theme-switcher";

type ThemeValue = "light" | "dark" | "system";

export function ThemeToogle() {
  const { setTheme, theme } = useTheme();

  const isValidTheme = (value: string | undefined): value is ThemeValue => {
    return value === "light" || value === "dark" || value === "system";
  };

  const safeTheme: ThemeValue | undefined = isValidTheme(theme)
    ? theme
    : undefined;

  const handleThemeChange = (newTheme: ThemeValue) => {
    setTheme(newTheme);
  };

  return (
    <ThemeSwitcher
      defaultValue="system"
      onChange={handleThemeChange}
      value={safeTheme}
    />
  );
}
