'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reclamationSchema, type ReclamationFormData } from '@/validators/reclamation.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import toast, { Toaster } from 'react-hot-toast';
import { messages } from '@/config/messages';
import SidebarMenu from '@/components/sidebar-menu';

const steps = [
  { title: messages["reclamation.step-basic"], description: messages["reclamation.step-basic-desc"] },
  { title: messages["reclamation.step-desc"], description: messages["reclamation.step-desc-desc"] },
  { title: messages["reclamation.step-recipients"], description: messages["reclamation.step-recipients-desc"] },
  { title: messages["intervention.step-review"], description: messages["intervention.step-review-desc"] },
];

export default function NewReclamationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    trigger,
  } = useForm<ReclamationFormData>({
    resolver: zodResolver(reclamationSchema),
    defaultValues: {
      date: '',
      stationName: '',
      reclamationType: 'hydraulic',
      description: '',
      recipientEmails: [],
    },
  });

  const recipientEmails = watch('recipientEmails') || [];
  const photoUrl = watch('photoUrl');

  const addRecipientEmail = () => {
    const current = recipientEmails;
    setValue('recipientEmails', [...current, '']);
  };

  const removeRecipientEmail = (index: number) => {
    const current = recipientEmails;
    setValue('recipientEmails', current.filter((_, i) => i !== index));
  };

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number): (keyof ReclamationFormData)[] => {
    switch (step) {
      case 1:
        return ['date', 'stationName', 'reclamationType'];
      case 2:
        return ['description'];
      case 3:
        return ['recipientEmails'];
      default:
        return [];
    }
  };

  const onSubmit = async (data: ReclamationFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/reclamations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Reclamation created successfully!');
        router.push('/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create reclamation');
      }
    } catch (error) {
      console.error('Reclamation creation error:', error);
      toast.error('An error occurred while creating the reclamation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / steps.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <SidebarMenu />
      <div className="flex-1 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{messages["reclamation.new-title"]}</h1>
          <p className="mt-2 text-gray-600">{messages["reclamation.new-subtitle"]}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Step {currentStep} of {steps.length}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between mb-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex flex-col items-center ${
                index + 1 <= currentStep ? 'text-blue-600' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  index + 1 <= currentStep
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300'
                }`}
              >
                {index + 1}
              </div>
              <span className="text-xs mt-2 text-center max-w-20">{step.title}</span>
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              {/* Step 1: Basic Information */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="date">{messages["form.date"]}</Label>
                    <Input
                      id="date"
                      type="date"
                      {...register('date')}
                      className={errors.date ? 'border-red-500' : ''}
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="stationName">{messages["form.station-name"]}</Label>
                    <Input
                      id="stationName"
                      {...register('stationName')}
                      placeholder={messages["form.station-name-placeholder"]}
                      className={errors.stationName ? 'border-red-500' : ''}
                    />
                    {errors.stationName && (
                      <p className="text-red-500 text-sm mt-1">{errors.stationName.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="reclamationType">{messages["form.reclamation-type"]}</Label>
                    <Select
                      value={watch('reclamationType')}
                      onValueChange={(value: 'hydraulic' | 'electric' | 'mechanic') =>
                        setValue('reclamationType', value)
                      }
                    >
                      <SelectTrigger className={errors.reclamationType ? 'border-red-500' : ''}>
                        <SelectValue placeholder={messages["form.reclamation-type-placeholder"]} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hydraulic">{messages["form.reclamation-type-hydraulic"]}</SelectItem>
                        <SelectItem value="electric">{messages["form.reclamation-type-electric"]}</SelectItem>
                        <SelectItem value="mechanic">{messages["form.reclamation-type-mechanic"]}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.reclamationType && (
                      <p className="text-red-500 text-sm mt-1">{errors.reclamationType.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Description & Photo */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="description">{messages["form.description"]}</Label>
                    <Textarea
                      id="description"
                      {...register('description')}
                      placeholder={messages["form.description-placeholder"]}
                      rows={6}
                      className={errors.description ? 'border-red-500' : ''}
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                    )}
                  </div>
                  <FileUpload
                    onFileSelect={() => {}}
                    onUrlChange={(url) => setValue('photoUrl', url || undefined)}
                    currentUrl={photoUrl}
                    label="Photo (Optional)"
                    error={errors.photoUrl?.message}
                  />
                </div>
              )}

              {/* Step 3: Recipients */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <Label>{messages["form.recipient-emails"]}</Label>
                    <div className="space-y-2 mt-2">
                      {recipientEmails.map((email, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            type="email"
                            {...register(`recipientEmails.${index}` as const)}
                            placeholder={`recipient${index + 1}@example.com`}
                            className={errors.recipientEmails?.[index] ? 'border-red-500' : ''}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeRecipientEmail(index)}
                          >
                            {messages["form.remove"]}
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addRecipientEmail}
                        className="w-full"
                      >
                        {messages["form.add-recipient-email"]}
                      </Button>
                    </div>
                    {errors.recipientEmails && (
                      <p className="text-red-500 text-sm mt-1">{errors.recipientEmails.message}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Review Your Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium text-gray-900">Basic Information</h4>
                        <dl className="mt-2 space-y-1">
                          <div>
                            <dt className="text-sm text-gray-500">Date:</dt>
                            <dd className="text-sm text-gray-900">{watch('date')}</dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Station:</dt>
                            <dd className="text-sm text-gray-900">{watch('stationName')}</dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Type:</dt>
                            <dd className="text-sm text-gray-900">{watch('reclamationType')}</dd>
                          </div>
                        </dl>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">Details</h4>
                        <dl className="mt-2 space-y-1">
                          <div>
                            <dt className="text-sm text-gray-500">Description:</dt>
                            <dd className="text-sm text-gray-900">{watch('description')}</dd>
                          </div>
                          <div>
                            <dt className="text-sm text-gray-500">Recipients:</dt>
                            <dd className="text-sm text-gray-900">{recipientEmails.join(', ')}</dd>
                          </div>
                          {photoUrl && (
                            <div>
                              <dt className="text-sm text-gray-500">Photo:</dt>
                              <dd className="text-sm text-gray-900">Uploaded</dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < steps.length ? (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Reclamation'}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
