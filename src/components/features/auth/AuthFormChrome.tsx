export type AuthFormHeaderProps = {
  title: string;
  description: string;
};

export function AuthFormHeader({
  title,
  description,
}: Readonly<AuthFormHeaderProps>) {
  return (
    <div>
      <h1 className="text-[40px] leading-10 font-medium tracking-[-2px] text-darkest">
        {title}
      </h1>
      <p className="pt-2 text-lg font-medium text-[#8892a3]">{description}</p>
    </div>
  );
}

export type AuthDividerProps = {
  label?: string;
};

export function AuthDivider({
  label = "or sign in with email",
}: Readonly<AuthDividerProps>) {
  return (
    <div className="flex items-center gap-3 pt-5">
      <div className="h-px min-w-0 flex-1 bg-darkest/10" />
      <span className="shrink-0 text-xs font-medium whitespace-nowrap text-[#8892a3]">
        {label}
      </span>
      <div className="h-px min-w-0 flex-1 bg-darkest/10" />
    </div>
  );
}
