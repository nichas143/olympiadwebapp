'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name cannot exceed 100 characters'),
  currentClass: z.enum(['Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'], {
    required_error: 'Please select your current class'
  }),
  schoolName: z.string().min(2, 'School name must be at least 2 characters').max(200, 'School name cannot exceed 200 characters'),
  phoneNumber: z.string().regex(/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number'),
  email: z.string().email('Please enter a valid email address'),
  prerequisites: z.object({
    basicMathematics: z.boolean(),
    algebra: z.boolean(),
    geometry: z.boolean(),
    numberTheory: z.boolean(),
    combinatorics: z.boolean()
  })
});

type FormData = z.infer<typeof formSchema>;

export default function Join() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prerequisites: {
        basicMathematics: false,
        algebra: false,
        geometry: false,
        numberTheory: false,
        combinatorics: false
      }
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setSubmitStatus('idle');

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
    } catch (error) {
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const prerequisiteTopics = [
    { key: 'basicMathematics', label: 'Basic Mathematics', description: 'Arithmetic, fractions, decimals, basic algebra' },
    { key: 'algebra', label: 'Algebra', description: 'Quadratic equations, polynomials, inequalities' },
    { key: 'geometry', label: 'Geometry', description: 'Triangles, circles, coordinate geometry' },
    { key: 'numberTheory', label: 'Number Theory', description: 'Divisibility, prime numbers, modular arithmetic' },
    { key: 'combinatorics', label: 'Combinatorics', description: 'Counting principles, permutations, combinations' }
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
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Student Registration Form
              </h2>
              <p className="text-gray-600">
                Please fill in your details below. We'll review your application and get back to you soon.
              </p>
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

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="currentClass" className="block text-sm font-medium text-gray-700 mb-2">
                    Current Class *
                  </label>
                  <select
                    id="currentClass"
                    {...register('currentClass')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.currentClass ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your class</option>
                    <option value="Class 8">Class 8</option>
                    <option value="Class 9">Class 9</option>
                    <option value="Class 10">Class 10</option>
                    <option value="Class 11">Class 11</option>
                    <option value="Class 12">Class 12</option>
                  </select>
                  {errors.currentClass && (
                    <p className="mt-1 text-sm text-red-600">{errors.currentClass.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="schoolName" className="block text-sm font-medium text-gray-700 mb-2">
                  School Name *
                </label>
                <input
                  type="text"
                  id="schoolName"
                  {...register('schoolName')}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.schoolName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter your school name"
                />
                {errors.schoolName && (
                  <p className="mt-1 text-sm text-red-600">{errors.schoolName.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phoneNumber"
                    {...register('phoneNumber')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter 10-digit phone number"
                  />
                  {errors.phoneNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email address"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Prerequisites Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Prerequisites Knowledge
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please indicate which topics you are familiar with. This helps us understand your current level and provide appropriate guidance.
                </p>
                
                <div className="space-y-4">
                  {prerequisiteTopics.map((topic) => (
                    <div key={topic.key} className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          id={topic.key}
                          {...register(`prerequisites.${topic.key as keyof FormData['prerequisites']}`)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor={topic.key} className="text-sm font-medium text-gray-700">
                          {topic.label}
                        </label>
                        <p className="text-sm text-gray-500">{topic.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-center pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-8 py-3 rounded-lg font-semibold text-lg transition-colors duration-200 ${
                    isSubmitting
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Information Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              What Happens Next?
            </h2>
            <p className="text-xl text-gray-600">
              After submitting your application, here's what you can expect
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📧</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Application Review</h3>
              <p className="text-gray-600">We'll review your application and prerequisites within 2-3 business days.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📞</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact & Assessment</h3>
              <p className="text-gray-600">We'll contact you to discuss your goals and conduct a brief assessment.</p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Program Start</h3>
              <p className="text-gray-600">Once approved, you'll receive access to our comprehensive curriculum.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



