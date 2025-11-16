import Image from "next/image";

export default function SignInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-10">
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm mx-auto px-2 sm:px-0">{children}</div>
        </div>
      </div>
      <div className="relative hidden lg:block md:border md:border-l">
        <Image
          src="/signIn/logo.webp"
          alt="Login Background"
          className="object-contain"
          fill
          priority
        />
      </div>
    </div>
  );
}
