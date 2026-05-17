import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-white tracking-tight">tataI</span>
        </div>
        <SignUp
          appearance={{
            variables: {
              colorBackground: "#171717",
              colorText: "#ffffff",
              colorPrimary: "#7c3aed",
              colorInputBackground: "#262626",
              colorInputText: "#ffffff",
              borderRadius: "0.75rem",
            },
          }}
        />
      </div>
    </div>
  );
}
