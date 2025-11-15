import * as React from "react";
import { cn } from "@shared/utils";

// H1 – Sidrubrik
export function H1({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className
      )}
      {...props}
    />
  );
}

// H2 – Sektionstitel
export function H2({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "scroll-m-20 text-3xl font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  );
}

// H3 – Underrubrik
export function H3({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "scroll-m-20 text-2xl font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  );
}

// H4 – Mindre rubrik
export function H4({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h4
      className={cn(
        "scroll-m-20 text-xl font-semibold tracking-tight",
        className
      )}
      {...props}
    />
  );
}

// P – Brödtext
export function P({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-4", className)}
      {...props}
    />
  );
}

// Lead – Introtext / under rubrik
export function Lead({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xl text-muted-foreground", className)}
      {...props}
    />
  );
}

// Muted – Dämpad text, t.ex. hjälptrafik
export function Muted({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

// Small – Liten text
export function Small({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <small
      className={cn("text-sm font-medium leading-none", className)}
      {...props}
    />
  );
}

// Blockquote – Citat
export function Blockquote({
  className,
  ...props
}: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className={cn(
        "mt-6 border-l-2 pl-6 italic text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function Span({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <span
      className={cn("inline-block", className)}
      {...props}
    />
  );
}

// Code – Inline kod
export function InlineCode({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm",
        className
      )}
      {...props}
    />
  );
}

// List – UL/OL wrapper
type ListProps = React.HTMLAttributes<HTMLUListElement | HTMLOListElement> & {
  as?: "ul" | "ol";
};

export function List({
  as = "ul",
  className,
  ...props
}: ListProps) {
  const Comp = as;
  return (
    <Comp
      className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
      {...props}
    />
  );
}
