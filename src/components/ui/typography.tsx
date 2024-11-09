import { FC } from "react";

export const PageHeading: FC<{ children: string }> = ({ children }) => (
  <h2 className="scroll-m-20 pb-2 text-3xl font-semibold tracking-tight first:mt-0">
    {children}
  </h2>
);
