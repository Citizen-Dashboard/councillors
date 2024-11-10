import { cn } from "@/lib/utils";
import { FC } from "react";

export const Gutters: FC<{
  children: React.ReactNode;
  className?: string;
  size?: "small";
}> = ({ size = "small", className, children }) => {
  return (
    <div
      className={cn(
        "px-2 mx-auto",
        {
          "max-w-lg": size === "small",
        },
        className,
      )}
    >
      {children}
    </div>
  );
};
