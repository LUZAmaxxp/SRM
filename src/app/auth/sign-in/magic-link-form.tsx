"use client";

import { useState } from "react";
import { SubmitHandler } from "react-hook-form";
import { Button, Input } from "rizzui";
import { useMedia } from "@core/hooks/use-media";
import { Form } from "@core/ui/form";
import { authClient } from "@/lib/auth-client";
import toast from "react-hot-toast";
import { useTranslations } from "@/hooks/use-translations";
import { z } from "zod";

const magicLinkSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type MagicLinkSchema = z.infer<typeof magicLinkSchema>;

const initialValues: MagicLinkSchema = {
  email: "",
};

export default function MagicLinkForm() {
  const { t: t } = useTranslations();
  const { t: tAuth } = useTranslations();
  const isMedium = useMedia("(max-width: 1200px)", false);
  const [isLoading, setIsLoading] = useState(false);
  const [reset, setReset] = useState({});
  const [emailSent, setEmailSent] = useState(false);

  const onSubmit: SubmitHandler<MagicLinkSchema> = async (data) => {
    setIsLoading(true);

    try {
      const { error } = await authClient.signIn.magicLink({
        email: data.email,
        callbackURL: "/",
      });

      if (error) {
        console.error("Magic link error:", error);
        toast.error(
          error.message || "Failed to send magic link. Please try again."
        );
      } else {
        setEmailSent(true);
        toast.success("Magic link sent! Please check your email to sign in.");
        setReset(initialValues);
      }
    } catch (error) {
      console.error("Magic link error:", error);
      toast.error("Failed to send magic link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Check your email
          </h3>
          <p className="text-gray-600">
            We&apos;ve sent you a magic link. Click the link in your email to
            sign in instantly.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            The link will expire in 10 minutes for security reasons.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            setEmailSent(false);
            setReset({});
          }}
          className="w-full"
        >
          Send another link
        </Button>
      </div>
    );
  }

  return (
    <Form<MagicLinkSchema>
      validationSchema={magicLinkSchema}
      resetValues={reset}
      onSubmit={onSubmit}
      useFormProps={{
        mode: "onChange",
        defaultValues: initialValues,
      }}
    >
      {({ register, formState: { errors } }) => (
        <div className="space-y-5 lg:space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Sign in with Magic Link
            </h3>
            <p className="text-sm text-gray-600">
              Enter your email address and we&apos;ll send you a magic link to
              sign in instantly - no password needed!
            </p>
          </div>

          <Input
            type="email"
            size={isMedium ? "lg" : "xl"}
            label={t("form.form-email")}
            placeholder={t("form.form-email-placeholder")}
            className="[&>label>span]:font-medium [&>label>span]:text-black"
            {...register("email")}
            error={errors.email?.message}
          />

          <Button
            className="w-full bg-primary hover:bg-primary-dark focus:bg-primary-dark"
            type="submit"
            size={isMedium ? "lg" : "xl"}
            isLoading={isLoading}
          >
            Send Magic Link
          </Button>
        </div>
      )}
    </Form>
  );
}
