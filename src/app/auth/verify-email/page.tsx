"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from '@/hooks/use-translations';
import { Button } from "rizzui";
import AuthWrapperFour from '@/app/shared/auth-layout/auth-wrapper-four';
import { routes } from "@/config/routes";
import { authClient } from "@/lib/auth-client";

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState<string>("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t: t } = useTranslations();

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get("token");
      const email = searchParams.get("email");

      if (!token || !email) {
        setStatus("error");
        setMessage("Invalid verification link.");
        return;
      }

      try {
        // Use Better Auth's built-in email verification endpoint
        const response = await fetch(`/api/auth/email/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        if (response.ok) {
          setStatus("success");
          setMessage("Email verified successfully!");

          // Auto-redirect after 3 seconds to dashboard since user is now verified
          setTimeout(() => {
            router.push("/");
          }, 3000);
        } else {
          const errorData = await response.json().catch(() => ({}));
          setStatus("error");
          setMessage(errorData.message || "Verification failed.");
        }
      } catch (error) {
        console.error("Email verification error:", error);
        setStatus("error");
        setMessage("Verification failed. Please try again later.");
      }
    };

    verifyEmail();
  }, [searchParams, router]);

  const getTitle = () => {
    switch (status) {
      case "verifying":
        return "Verifying Your Email...";
      case "success":
        return "Email Successfully Verified!";
      case "error":
        return "Verification Failed";
      default:
        return "Email Verification";
    }
  };

  return (
    <AuthWrapperFour title={getTitle()}>
      <div className="text-center space-y-6">
        {/* Status Icon */}
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
          status === "success"
            ? "bg-green-100"
            : status === "error"
            ? "bg-red-100"
            : "bg-primary/10"
        }`}>
          {status === "verifying" && (
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
          )}
          {status === "success" && (
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          {status === "error" && (
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {status === "verifying" && (
            <p className="text-gray-600">
              Please wait while we verify your email address...
            </p>
          )}

          {status === "success" && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-medium">{message}</p>
              </div>
              <p className="text-gray-600">
                Welcome! You will be automatically redirected in 3 seconds.
              </p>
            </div>
          )}

          {status === "error" && (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium">{message}</p>
              </div>
              <p className="text-gray-600 text-sm">
                Please try requesting a new verification email or contact support if the problem persists.
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        {status === "success" && (
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => router.push("/")}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-3 pt-4">
            <Button
              onClick={() => router.push(routes.auth.signUp)}
              className="w-full"
            >
              Back to Sign Up
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Support */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a
              href="mailto:support@tokenizedeconomies.org"
              className="text-primary hover:text-primary/80 font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </AuthWrapperFour>
  );
}
