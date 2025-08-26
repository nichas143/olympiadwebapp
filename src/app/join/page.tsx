'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Select, SelectItem, Checkbox, Card, CardBody, CardHeader, Divider } from "@heroui/react";

// Form validation schema
const formSchema = z.object({
  name: z.string().min(1, 'Full name is required').min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  currentClass: z.enum(['Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'], {
    required_error: 'Please select your current class'
  }),
  schoolName: z.string().min(1, 'School name is required').min(2, 'School name must be at least 2 characters').max(200, 'School name cannot exceed 200 characters'),
  phoneNumber: z.string().min(1, 'Phone number is required').regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'),
  email: z.string().min(1, 'Email address is required').email('Please enter a valid email address'),
  prerequisites: z.object({
    // Algebra
    basicFractions: z.boolean(),
    bodmasRule: z.boolean(),
    linearEquationsOneVariable: z.boolean(),
    simultaneousLinearEquations: z.boolean(),
    squareRoots: z.boolean(),
    squaresOfNumbers: z.boolean(),
    polynomials: z.boolean(),
    polynomialDivision: z.boolean(),
    
    // Geometry
    parallelLinesAngles: z.boolean(),
    typesOfTriangles: z.boolean(),
    circleTangentSecant: z.boolean(),
    arcOfCircle: z.boolean(),
    pythagorasTheorem: z.boolean(),
    linearPairFormation: z.boolean(),
    sumOfAngles: z.boolean(),
    
    // Number Theory
    gcdLcm: z.boolean(),
    primeCompositeNumbers: z.boolean(),
    divisionAlgorithm: z.boolean(),
    
    // Combinatorics
    additionMultiplicationPrinciple: z.boolean(),
    permutations: z.boolean(),
    combinations: z.boolean(),
    
    // Functional
    conceptOfFunctions: z.boolean(),
    
    // Basic Inequalities
    basicInequalityRules: z.boolean(),
    inequalityOperations: z.boolean(),
    inequalitiesOneTwoVariables: z.boolean(),
    sosMethod: z.boolean()
  })
});

type FormData = z.infer<typeof formSchema>;

export default function Join() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prerequisites: {
        // Algebra
        basicFractions: false,
        bodmasRule: false,
        linearEquationsOneVariable: false,
        simultaneousLinearEquations: false,
        squareRoots: false,
        squaresOfNumbers: false,
        polynomials: false,
        polynomialDivision: false,
        
        // Geometry
        parallelLinesAngles: false,
        typesOfTriangles: false,
        circleTangentSecant: false,
        arcOfCircle: false,
        pythagorasTheorem: false,
        linearPairFormation: false,
        sumOfAngles: false,
        
        // Number Theory
        gcdLcm: false,
        primeCompositeNumbers: false,
        divisionAlgorithm: false,
        
        // Combinatorics
        additionMultiplicationPrinciple: false,
        permutations: false,
        combinations: false,
        
        // Functional
        conceptOfFunctions: false,
        
        // Basic Inequalities
        basicInequalityRules: false,
        inequalityOperations: false,
        inequalitiesOneTwoVariables: false,
        sosMethod: false
      }
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Honeypot validation
    const formData = new FormData(document.querySelector('form') as HTMLFormElement);
    const honeypotValue = formData.get('website');
    if (honeypotValue) {
      setSubmitStatus('error');
      setSubmitMessage('Invalid submission detected.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setSubmitMessage(result.message);
        reset();
      } else {
        setSubmitStatus('error');
        setSubmitMessage(result.error || 'Registration failed. Please try again.');
      }
    } catch {
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const prerequisiteTopics = [
    {
      category: 'Algebra',
      topics: [
        { key: 'basicFractions', label: 'Basic fraction addition, multiplication, division' },
        { key: 'bodmasRule', label: 'BODMAS rule' },
        { key: 'linearEquationsOneVariable', label: 'Solving linear equation in one variable' },
        { key: 'simultaneousLinearEquations', label: 'Solving simultaneous linear equation in two variables' },
        { key: 'squareRoots', label: 'Working and finding roots of 2-3 digits numbers' },
        { key: 'squaresOfNumbers', label: 'Knowing what are square of numbers' },
        { key: 'polynomials', label: 'Know what are polynomials in 1-2 variables, Monomials, working with product, addition, subtraction of polynomials' },
        { key: 'polynomialDivision', label: 'Division of polynomials (long division) with linear divisor' }
      ]
    },
    {
      category: 'Geometry',
      topics: [
        { key: 'parallelLinesAngles', label: 'Corresponding, alternate, interior, vertically opposite angles in parallel lines with transversal' },
        { key: 'typesOfTriangles', label: 'Types of triangles (acute, obtuse, right angled) (isosceles, equilateral, scalene)' },
        { key: 'circleTangentSecant', label: 'Circle, tangent, secant' },
        { key: 'arcOfCircle', label: 'Arc of circle' },
        { key: 'pythagorasTheorem', label: 'Pythagoras theorem' },
        { key: 'linearPairFormation', label: 'Linear pair formation' },
        { key: 'sumOfAngles', label: 'Sum of angles in a triangle, polygon' }
      ]
    },
    {
      category: 'Number Theory',
      topics: [
        { key: 'gcdLcm', label: 'Finding GCD and LCM of numbers' },
        { key: 'primeCompositeNumbers', label: 'Know what are prime numbers, composites' },
        { key: 'divisionAlgorithm', label: 'Division algorithm' }
      ]
    },
    {
      category: 'Combinatorics (not needed)',
      topics: [
        { key: 'additionMultiplicationPrinciple', label: 'Addition, multiplication principle' },
        { key: 'permutations', label: 'Permutations' },
        { key: 'combinations', label: 'Combination' }
      ]
    },
    {
      category: 'Functional',
      topics: [
        { key: 'conceptOfFunctions', label: 'Concept of functions' }
      ]
    },
    {
      category: 'Basic Inequalities',
      topics: [
        { key: 'basicInequalityRules', label: 'Basic rules of inequalities' },
        { key: 'inequalityOperations', label: 'Addition, multiplication in inequalities' },
        { key: 'inequalitiesOneTwoVariables', label: 'Inequalities in one, two variable' },
        { key: 'sosMethod', label: 'SOS' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Join Our Program
            </h1>
            <p className="text-xl md:text-2xl text-green-100 max-w-3xl mx-auto">
              Take the first step towards mathematical excellence. Register for our comprehensive olympiad preparation program.
            </p>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <div className="py-16 bg-background-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="shadow-xl">
            <CardHeader className="text-center pb-6 flex flex-col items-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Student Registration Form
              </h2>

              <h3 className="text-black mt-2">
                Please fill in your details below. We&apos;ll review your application and get back to you soon.
              </h3>
            </CardHeader>

            <CardBody className="px-8 pb-8">
            

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Honeypot field for bot protection */}
                <div className="hidden">
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ position: 'absolute', left: '-9999px' }}
                  />
                </div>

                {/* Required Fields Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Note:</span> Fields marked with <span className="text-red-500 font-bold">*</span> are required. Please fill in all required fields to submit your application.
                  </p>
                </div>

                {/* Personal Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Personal Information <span className="text-red-500">*</span>
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                                              <Input
                          type="text"
                          // label="Full Name *"
                          placeholder="Enter your full name"
                          {...register('name')}
                          isInvalid={!!errors.name}
                          errorMessage={errors.name?.message}
                          variant="bordered"
                          size="lg"
                          classNames={{
                            input: "text-gray-900 placeholder:text-gray-500",
                            inputWrapper: "bg-white",
                            label: "text-gray-700 font-medium"
                          }}
                        />
                    </div>

                                        <div>
                      <Controller
                        name="currentClass"
                        control={control}
                        render={({ field }) => (
                          <Select
                            // label="Current Class *"
                            placeholder="Select your class"
                            selectedKeys={field.value ? [field.value] : []}
                            onSelectionChange={(keys) => {
                              const selectedKey = Array.from(keys)[0] as string;
                              field.onChange(selectedKey);
                            }}
                            isInvalid={!!errors.currentClass}
                            errorMessage={errors.currentClass?.message}
                            variant="bordered"
                            size="lg"
                            classNames={{
                              trigger: "bg-white",
                              value: "text-black",
                              base: "w-full",
                              listbox: "bg-white border border-gray-200 shadow-lg z-50",
                              selectorIcon: "text-gray-500",
                              label: "text-gray-700 font-medium"
                            }}
                          >
                            <SelectItem key="Class 7" className="text-black">Class 7</SelectItem>
                            <SelectItem key="Class 8" className="text-black">Class 8</SelectItem>
                            <SelectItem key="Class 9" className="text-black">Class 9</SelectItem>
                            <SelectItem key="Class 10" className="text-black">Class 10</SelectItem>
                            <SelectItem key="Class 11" className="text-black">Class 11</SelectItem>
                            <SelectItem key="Class 12" className="text-black">Class 12</SelectItem>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                                      <Input
                      type="text"
                      // label="School Name *"
                      placeholder="Enter your school name"
                      {...register('schoolName')}
                      isInvalid={!!errors.schoolName}
                      errorMessage={errors.schoolName?.message}
                      variant="bordered"
                      size="lg"
                      classNames={{
                        input: "text-gray-900 placeholder:text-gray-500",
                        inputWrapper: "bg-white",
                        label: "text-gray-700 font-medium"
                      }}
                    />

                  <div className="grid md:grid-cols-2 gap-6">
                    <Input
                      type="tel"
                      // label="Phone Number *"
                      placeholder="Enter 10-digit phone number"
                      {...register('phoneNumber')}
                      isInvalid={!!errors.phoneNumber}
                      errorMessage={errors.phoneNumber?.message}
                      variant="bordered"
                      size="lg"
                      classNames={{
                        input: "text-gray-900 placeholder:text-gray-500",
                        inputWrapper: "bg-white",
                        label: "text-gray-700 font-medium"
                      }}
                    />

                    <Input
                      type="email"
                      // label="Email Address *"
                      placeholder="Enter your email address"
                      {...register('email')}
                      isInvalid={!!errors.email}
                      errorMessage={errors.email?.message}
                      variant="bordered"
                      size="lg"
                      classNames={{
                        input: "text-gray-900 placeholder:text-gray-500",
                        inputWrapper: "bg-white",
                        label: "text-gray-700 font-medium"
                      }}
                    />
                  </div>
                </div>

                <Divider className="my-8" />

                {/* Prerequisites Section */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    Prerequisites Knowledge Assessment
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Please indicate which topics you are familiar with. This helps us understand your current level and provide appropriate guidance. Check all topics that you have studied and are comfortable with. <span className="text-blue-600 font-medium">This section is optional but recommended.</span>
                  </p>
                  
                  <div className="space-y-6">
                    {prerequisiteTopics.map((category) => (
                      <Card key={category.category} className="border border-gray-200">
                        <CardHeader className="pb-3">
                          <h4 className="text-lg font-semibold text-blue-900 flex items-center">
                            <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                            {category.category}
                          </h4>
                        </CardHeader>
                        <CardBody className="pt-0">
                          <div className="space-y-3 px-4">
                            
                            {category.topics.map((topic) => (
                               <div className="flex items-start gap-3" key={topic.key}>
                                <Checkbox
                                  {...register(`prerequisites.${topic.key as keyof FormData['prerequisites']}`)}
                                  size="sm"
                                  color="primary"
                                  classNames={{
                                    base: "mt-0.5"
                                  }}
                                />
                                <div className="text-black text-sm leading-relaxed">
                                  {topic.label}
                                </div>
                               </div>
                            ))}
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center pt-8">
                  {/* <div className="bg-yellow-300 p-4 mb-4">
                    <p className="text-black">Debug: Button container is visible</p>
                  </div> */}
                  <button
                    type="submit"
                    className="px-10 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white border-2 border-red-500 rounded-lg"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>

                  {/* Status Messages */}
              {submitStatus === 'success' && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-800">{submitMessage}</p>
                    </div>
                  </div>
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-800">{submitMessage}</p>
                    </div>
                  </div>
                </div>
              )}
              </form>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Information Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Happens Next?
            </h2>
            <p className="text-xl text-gray-600">
              After submitting your application, here&apos;s what you can expect
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Review</h3>
                              <p className="text-gray-600">We&apos;ll review your application and prerequisites within 2-3 business days.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact & Assessment</h3>
                              <p className="text-gray-600">We&apos;ll contact you to discuss your goals and conduct a brief assessment.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Program Start</h3>
              <p className="text-gray-600">Once approved, you&apos;ll receive access to our comprehensive curriculum.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



