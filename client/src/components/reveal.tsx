import type { ReactNode, HTMLAttributes } from "react";
import { useReveal } from "@/hooks/use-reveal";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  delay?: number;
}

export default function Reveal({ children, delay, style, className, ...rest }: Props) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${className || ""}`}
      style={{ transitionDelay: delay ? `${delay}ms` : undefined, ...style }}
      {...rest}
    >
      {children}
    </div>
  );
}
