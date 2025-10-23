import Image from "next/image";

export default function SignInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">{children}</div>
        </div>
      </div>
      <div className="relative hidden lg:block md:border md:border-l">
        <Image
          src="/signIn/login-bg.png"
          alt="Login Background"
          fill
          className="object-contain dark:brightness-[0.2] dark:grayscale"
          sizes="(max-width: 768px) 0vw, 50vw"
          quality={90}
          priority
        />
      </div>
    </div>
  );
}
