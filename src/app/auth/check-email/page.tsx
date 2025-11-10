"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "rizzui";
import AuthWrapperFour from "@/app/shared/auth-layout/auth-wrapper-four";
import { routes } from "@/config/routes";

export default function CheckEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [searchParams]);

  const handleResendEmail = async () => {
    if (!email) return;

    try {
      const response = await fetch("/api/auth/email/send-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert("Verification email sent successfully!");
      } else {
        alert("Failed to send verification email. Please try again.");
      }
    } catch (error) {
      console.error("Error resending email:", error);
      alert("Failed to send verification email. Please try again.");
    }
  };

  return (
    <AuthWrapperFour title="Check Your Email" className="max-w-lg">
      <div className="text-center space-y-6">
        {/* Email Icon */}
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Verification Email Sent!
          </h3>
          <div className="space-y-3 text-gray-600">
            <p>We&apos;ve sent a verification link to:</p>
            {email && (
              <p className="font-medium text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">
                {email}
              </p>
            )}
            <p className="text-sm">
              Please check your email and click on the verification link to
              activate your account.
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-left">
          <h4 className="font-medium text-yellow-800 mb-2 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
            Can&apos;t find the email?
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1 ml-7">
            <li>• Check your spam or junk folder</li>
            <li>• Make sure your email address is correct</li>
            <li>• The email might take a few minutes to arrive</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3 pt-4">
          <Button
            onClick={handleResendEmail}
            variant="outline"
            className="w-full"
            disabled={!email}
          >
            Resend Verification Email
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(routes.auth.signIn)}
              className="flex-1"
            >
              Sign In Instead
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(routes.auth.signUp)}
              className="flex-1"
            >
              Back to Sign Up
            </Button>
          </div>
        </div>

        {/* Support */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Still having trouble?{" "}
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
