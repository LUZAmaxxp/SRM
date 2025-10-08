"use client";

import { useForm, UseFormProps, FieldValues, Path, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ReactNode } from "react";

interface FormProps<T extends FieldValues> {
  children: (methods: {
    register: any;
    formState: { errors: FieldErrors<T> };
  }) => ReactNode;
  validationSchema?: z.ZodSchema<T>;
  resetValues?: any;
  onSubmit: (data: T) => void;
  useFormProps?: UseFormProps<T>;
}

export function Form<T extends FieldValues>({
  children,
  validationSchema,
  resetValues,
  onSubmit,
  useFormProps,
}: FormProps<T>) {
  const methods = useForm<T>({
    ...useFormProps,
    resolver: validationSchema ? zodResolver(validationSchema) : undefined,
  });

  const handleSubmit = methods.handleSubmit(onSubmit);

  return (
    <form onSubmit={handleSubmit}>
      {children({
        register: methods.register,
        formState: { errors: methods.formState.errors },
      })}
    </form>
  );
}
