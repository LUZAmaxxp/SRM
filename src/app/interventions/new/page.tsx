'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { interventionSchema, type InterventionFormData } from '@/validators/intervention.schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import toast, { Toaster } from 'react-hot-toast';
import { messages } from '@/config/messages';
import SidebarMenu from '@/components/sidebar-menu';

const steps = [
  { title: messages["intervention.step-basic"], description: messages["intervention.step-basic-desc"] },
  { title: messages["intervention.step-team"], description: messages["intervention.step-team-desc"] },
  { title: messages["intervention.step-photo"], description: messages["intervention.step-photo-desc"] },
  { title: messages["intervention.step-review"], description: messages["intervention.step-review-desc"] },
];

export default function NewInterventionPage() {
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
  } = useForm<InterventionFormData>({
    resolver: zodResolver(interventionSchema),
    defaultValues: {
      startDate: '',
      endDate: '',
      entrepriseName: '',
      responsable: '',
      teamMembers: [],
      siteName: '',
      recipientEmails: [],
    },
  });

  const teamMembers = watch('teamMembers') || [];
  const recipientEmails = watch('recipientEmails') || [];
  const photoUrl = watch('photoUrl') || undefined;

  const addTeamMember = () => {
    const current = teamMembers;
    setValue('teamMembers', [...current, '']);
  };

  const removeTeamMember = (index: number) => {
    const current = teamMembers;
    setValue('teamMembers', current.filter((_, i) => i !== index));
  };

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

  const getFieldsForStep = (step: number): (keyof InterventionFormData)[] => {
    switch (step) {
      case 1:
        return ['startDate', 'endDate', 'entrepriseName', 'responsable'];
      case 2:
        return ['teamMembers', 'siteName'];
      case 3:
        return ['recipientEmails'];
      default:
        return [];
    }
  };

  const onSubmit = async (data: InterventionFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/interventions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success('Intervention created successfully!');
        router.push('/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create intervention');
      }
    } catch (error) {
      console.error('Intervention creation error:', error);
      toast.error('An error occurred while creating the intervention');
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
            <h1 className="text-3xl font-bold text-gray-900">{messages["intervention.new-title"]}</h1>
            <p className="mt-2 text-gray-600">{messages["intervention.new-subtitle"]}</p>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="startDate">{messages["form.start-date"]}</Label>
                        <Input
                          id="startDate"
                          type="date"
                          {...register('startDate')}
                          className={errors.startDate ? 'border-red-500' : ''}
                        />
                        {errors.startDate && (
                          <p className="text-red-500 text-sm mt-1">{errors.startDate.message}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="endDate">{messages["form.end-date"]}</Label>
                        <Input
                          id="endDate"
                          type="date"
                          {...register('endDate')}
                          className={errors.endDate ? 'border-red-500' : ''}
                        />
                        {errors.endDate && (
                          <p className="text-red-500 text-sm mt-1">{errors.endDate.message}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="entrepriseName">{messages["form.company-name"]}</Label>
                      <Input
                        id="entrepriseName"
                        {...register('entrepriseName')}
                        placeholder="Entrez le nom de l'entreprise"
                        className={errors.entrepriseName ? 'border-red-500' : ''}
                      />
                      {errors.entrepriseName && (
                        <p className="text-red-500 text-sm mt-1">{errors.entrepriseName.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="responsable">{messages["form.responsible-person"]}</Label>
                      <Input
                        id="responsable"
                        {...register('responsable')}
                        placeholder="Entrez la personne responsable"
                        className={errors.responsable ? 'border-red-500' : ''}
                      />
                      {errors.responsable && (
                        <p className="text-red-500 text-sm mt-1">{errors.responsable.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Team & Site */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <Label>{messages["form.team-members"]}</Label>
                      <div className="space-y-2 mt-2">
                        {teamMembers.map((member, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              {...register(`teamMembers.${index}` as const)}
                              placeholder={`Membre d'équipe ${index + 1}`}
                              className={errors.teamMembers?.[index] ? 'border-red-500' : ''}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeTeamMember(index)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addTeamMember}
                          className="w-full"
                        >
                          {messages["form.add-team-member"]}
                        </Button>
                      </div>
                      {errors.teamMembers && (
                        <p className="text-red-500 text-sm mt-1">{errors.teamMembers.message}</p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="siteName">{messages["form.site-name"]}</Label>
                      <Input
                        id="siteName"
                        {...register('siteName')}
                        placeholder="Entrez le nom du site"
                        className={errors.siteName ? 'border-red-500' : ''}
                      />
                      {errors.siteName && (
                        <p className="text-red-500 text-sm mt-1">{errors.siteName.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 3: Photo & Recipients */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <FileUpload
                      onFileSelect={() => {}}
                      onUrlChange={(url: string | null) => setValue('photoUrl', url || undefined)}
                      currentUrl={photoUrl}
                      label={messages["form.photo-optional"]}
                      error={errors.photoUrl?.message}
                    />
                    <div>
                      <Label>{messages["form.recipient-emails"]}</Label>
                      <div className="space-y-2 mt-2">
                        {recipientEmails.map((email, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              type="email"
                              {...register(`recipientEmails.${index}` as const)}
                              placeholder={`destinataire${index + 1}@exemple.com`}
                              className={errors.recipientEmails?.[index] ? 'border-red-500' : ''}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeRecipientEmail(index)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          onClick={addRecipientEmail}
                          className="w-full"
                        >
                          {messages["form.add-recipient"]}
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
                              <dt className="text-sm text-gray-500">Start Date:</dt>
                              <dd className="text-sm text-gray-900">{watch('startDate')}</dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500">End Date:</dt>
                              <dd className="text-sm text-gray-900">{watch('endDate')}</dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500">Company:</dt>
                              <dd className="text-sm text-gray-900">{watch('entrepriseName')}</dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500">Responsible:</dt>
                              <dd className="text-sm text-gray-900">{watch('responsable')}</dd>
                            </div>
                          </dl>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Team & Site</h4>
                          <dl className="mt-2 space-y-1">
                            <div>
                              <dt className="text-sm text-gray-500">Site:</dt>
                              <dd className="text-sm text-gray-900">{watch('siteName')}</dd>
                            </div>
                            <div>
                              <dt className="text-sm text-gray-500">Team Members:</dt>
                              <dd className="text-sm text-gray-900">{teamMembers.join(', ')}</dd>
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
                      {isSubmitting ? 'Submitting...' : 'Submit Intervention'}
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        <Toaster />
      </div>
    </div>
  );
}