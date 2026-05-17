import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { TataILogo } from "@/components/Logo";

export default function TermsPage() {
  const sections = [
    {
      title: "Acceptance of Terms",
      content: "By accessing and using tataI, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.",
    },
    {
      title: "Description of Service",
      content: "tataI is an AI-powered chat assistant service. We provide access to AI language models to help you with tasks including writing, coding, research, and more. Service features vary based on your subscription plan.",
    },
    {
      title: "User Accounts",
      content: "You must create an account to use tataI. You are responsible for maintaining the security of your account and password. You must notify us immediately of any unauthorized use of your account.",
    },
    {
      title: "Acceptable Use",
      content: "You agree not to use tataI for any illegal purposes, to generate harmful or misleading content, to violate any third-party rights, or to attempt to circumvent our security measures. We reserve the right to terminate accounts that violate these terms.",
    },
    {
      title: "Subscription & Payments",
      content: "Free accounts receive 10 messages per day. Pro accounts ($9.99/month) include unlimited messages. Payments are processed via PayPal. You may cancel your subscription at any time. No refunds are provided for partial billing periods.",
    },
    {
      title: "Intellectual Property",
      content: "The tataI service, including its design, code, and branding, is owned by tataI. Content you create using tataI belongs to you, subject to any limitations imposed by the underlying AI model providers.",
    },
    {
      title: "Disclaimer of Warranties",
      content: "tataI is provided 'as is' without warranties of any kind. We do not guarantee the accuracy, completeness, or usefulness of AI-generated content. You should always verify important information from authoritative sources.",
    },
    {
      title: "Limitation of Liability",
      content: "To the maximum extent permitted by law, tataI shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service.",
    },
    {
      title: "Changes to Terms",
      content: "We reserve the right to modify these terms at any time. Continued use of tataI after changes constitutes acceptance of the new terms. We will notify users of significant changes via email.",
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
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">Terms of Service</h1>
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
          <p className="text-xs text-neutral-400 dark:text-white/25">Questions? Contact us at legal@tatai.cloud</p>
        </div>
      </div>
    </div>
  );
}
