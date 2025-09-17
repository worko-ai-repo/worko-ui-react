import { appsforbharat, corp_office_bg, firstClub, meesho, rapido } from "@Assets";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { validationRules } from "@Utils/FormValidator.utils";
import { toast } from "react-toastify";
import { getToastOptions } from "@Utils/Toast.utils";
import { PartyPopper } from "lucide-react";

type CorporateDemoForm = {
  fullName: string;
  workEmail: string;
  phoneNumber: string;
  companyName: string;
};

export default function HeroSection({ hires, salary }: { hires: number; salary: number }) {
  const traditionalCost = Math.round(hires * salary * 100000 * 0.12);
  const workoCost = Math.round(hires * salary * 100000 * 0.02);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<CorporateDemoForm>({
    mode: "onChange",
    defaultValues: {
      fullName: "",
      workEmail: "",
      phoneNumber: "",
      companyName: "",
    },
  });

  const onSubmit = async (data: CorporateDemoForm) => {
    setIsSubmitting(true);

    try {
      debugger;
      const AIRTABLE_API_KEY = import.meta.env.APP_AIRTABLE_API_KEY as string;
      const AIRTABLE_BASE_ID = import.meta.env.APP_AIRTABLE_BASE_ID as string;
      const AIRTABLE_TABLE =
        (import.meta.env.APP_AIRTABLE_TABLE as string) || "CorporateDemoRequests";

      if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
        throw new Error(
          "Airtable env variables missing (APP_AIRTABLE_API_KEY/APP_AIRTABLE_BASE_ID)"
        );
      }

      const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(
        AIRTABLE_TABLE
      )}`;

      const payload = {
        records: [
          {
            fields: {
              FullName: data.fullName,
              WorkEmail: data.workEmail,
              PhoneNumber: data.phoneNumber,
              CompanyName: data.companyName,
            },
          },
        ],
      };

      const response = await fetch(airtableUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Failed to submit form");
      }

      toast.success("Demo request submitted successfully!", getToastOptions());
      reset();
      setIsSuccess(true);
    } catch (error) {
      console.error("[CorporateHero] Form submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "Network error. Please try again.",
        getToastOptions()
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="corporate-hero-form"
      className="relative bg-gradient-to-r from-blue-800 to-blue-600 text-white min-h-[80vh] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={corp_office_bg}
          alt="Modern office background"
          className="object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-blue-600/90" />
      </div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 animate-fade-in">
        {/* Left Side */}
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
            Stop Drowning in <span className="text-yellow-400">1,000+ Resumes</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-lg sm:text-2xl font-bold">
            Start Getting <span className="text-green-400">10–15 Interview-Ready</span> Candidates
          </p>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-blue-100 max-w-lg mx-auto lg:mx-0">
            Our AI evaluates 5 critical parameters and surfaces only candidates worth your time.{" "}
            <span className="font-bold">98% relevance rate.</span>
          </p>

          {/* Trusted Companies */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <div className="flex space-x-3">
              {[
                { src: rapido, alt: "Rapido logo" },
                { src: meesho, alt: "Meesho logo" },
                { src: appsforbharat, alt: "Appsforbharat logo" },
                { src: firstClub, alt: "Firstclub logo" },
              ].map((logo, index) => (
                <div
                  key={index}
                  className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-md border border-gray-200 overflow-hidden">
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    width={40}
                    height={40}
                    className="object-contain"
                  />
                </div>
              ))}
            </div>
            <div className="text-center sm:text-left">
              <p className="font-semibold text-sm sm:text-base">50+ Companies Trust Us</p>
              <p className="text-blue-100 text-xs sm:text-sm">80% reduction in screening time</p>
            </div>
          </div>
        </div>

        {/* Right Side - Form / Thank You Card */}
        <div className="flex-1 w-full max-w-md animate-slide-up">
          {isSuccess ? (
            <div className="w-full bg-white h-[500px] flex flex-col items-center justify-center gap-2 backdrop-blur rounded-lg p-6 border border-white/20 text-center">
              <div className="p-4 bg-green-400 rounded-full flex items-center justify-center h-[100px] m-3 w-[100px]">
                <PartyPopper className="w-12 h-12 text-white-400 mb-4" />
              </div>
              <div className="text-2xl text-blue-500 font-bold mb-2">Thank you!</div>
              <p className="text-blue-500 mb-4">
                Your request has been received. Our team will contact you shortly.
              </p>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold rounded"
                onClick={() => setIsSuccess(false)}>
                Submit another request
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="text-left space-y-4 bg-white backdrop-blur rounded-lg p-6 border border-white/20">
              <h1 className="text-xl sm:text-2xl font-extrabold text-center mb-8 text-gray-800 ">
                Get Your Free Demo
                <h3 className="mt-4 text-sm font-base text-center text-gray-800">
                  {" "}
                  See how we can transform your hiring in just 7 days
                </h3>
              </h1>
              <div>
                <label className="block font-medium">Full Name *</label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="border rounded-md p-2 w-full text-black"
                  {...register("fullName", validationRules.name)}
                />
                {errors.fullName && (
                  <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium">Work Email *</label>
                <input
                  type="email"
                  placeholder="Enter your work email"
                  className="border rounded-md p-2 w-full text-black"
                  {...register("workEmail", validationRules.corporateEmail)}
                />
                {errors.workEmail && (
                  <p className="text-red-500 text-sm mt-1">{errors.workEmail.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium">Phone Number *</label>
                <input
                  type="text"
                  placeholder="Enter your phone number"
                  className="border rounded-md p-2 w-full text-black"
                  {...register("phoneNumber", validationRules.phone)}
                />
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                )}
              </div>

              <div>
                <label className="block font-medium">Company Name *</label>
                <input
                  type="text"
                  placeholder="Enter your company name"
                  className="border rounded-md p-2 w-full text-black"
                  {...register("companyName", validationRules.companyName)}
                />
                {errors.companyName && (
                  <p className="text-red-500 text-sm mt-1">{errors.companyName.message}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 font-semibold rounded disabled:opacity-60"
                disabled={isSubmitting || !isValid}>
                {isSubmitting ? "Submitting..." : "✓ Schedule Free Demo"}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
