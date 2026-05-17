import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TataILogo } from "@/components/Logo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Read tataI's privacy policy to understand how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  const sections = [
    {
      title: "Information We Collect",
      content: "We collect information you provide directly to us, such as your name and email address when you create an account. We also collect information about how you use tataI, including your conversations with the AI assistant.",
    },
    {
      title: "How We Use Your Information",
      content: "We use the information we collect to provide, maintain, and improve our services, process payments, send notifications, and respond to your requests. We do not sell your personal information to third parties.",
    },
    {
      title: "Data Storage & Security",
      content: "Your data is stored securely using industry-standard encryption. We use Supabase for database storage and Clerk for authentication, both of which maintain high security standards. Conversations are not stored permanently on our servers.",
    },
    {
      title: "Payments",
      content: "Payment processing is handled by PayPal. We do not store your payment card information on our servers. All transactions are secured by PayPal's payment infrastructure.",
    },
    {
      title: "Cookies",
      content: "We use cookies and similar tracking technologies to maintain your session and remember your preferences. You can control cookie settings through your browser.",
    },
    {
      title: "Your Rights",
      content: "You have the right to access, correct, or delete your personal information. You may also request that we restrict processing of your data. To exercise these rights, please contact us.",
    },
    {
      title: "Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated date.",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0a0a]">
      <header className="flex items-center gap-4 px-6 py-4 border-b border-neutral-200 dark:border-white/[0.06] bg-white dark:bg-[#111] sticky top-0 z-10">
        <Link href="/" className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-white/[0.08] transition-colors text-neutral-500 dark:text-white/40">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <TataILogo className="w-6 h-6" />
          <span className="font-bold text-neutral-900 dark:text-white tracking-tight">tataI</span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Privacy Policy</h1>
          <p className="text-neutral-500 dark:text-white/40 text-sm">Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
        </div>

        <div className="space-y-6">
          {sections.map(({ title, content }) => (
            <div key={title} className="bg-white dark:bg-[#111] border border-neutral-200 dark:border-white/[0.07] rounded-2xl p-6">
              <h2 className="font-semibold text-neutral-900 dark:text-white mb-2">{title}</h2>
              <p className="text-sm text-neutral-600 dark:text-white/50 leading-relaxed">{content}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-neutral-400 dark:text-white/25">Questions? Contact us at privacy@tatai.cloud</p>
        </div>
      </div>
    </div>
  );
}
