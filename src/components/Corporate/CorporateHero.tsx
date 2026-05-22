import { appsforbharat, corp_office_bg, firstClub, meesho, rapido } from "@Assets";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { validationRules } from "@Utils/FormValidator.utils";
import { toast } from "react-toastify";
import { getToastOptions } from "@Utils/Toast.utils";
import { PartyPopper, ArrowUpRight } from "lucide-react";

type CorporateDemoForm = {
  fullName: string;
  workEmail: string;
  phoneNumber: string;
  companyName: string;
};

export default function HeroSection({ hires, salary }: { hires: number; salary: number }) {
  const traditionalCost = Math.round(hires * salary * 100000 * 0.12);
  const workoCost = Math.round(hires * salary * 100000 * 0.05);
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

    <section id="relative corporate-hero-form" className=" relative overflow-hidden bg-white">
          <div
          className="absolute mx-auto mt-14 hidden min-h-[960px] max-w-6xl overflow-visible md:block"
          style={{
            maskImage: "radial-gradient(ellipse 90% 99% at 50% 0%, #fff 70%, transparent 110%)",
            WebkitMaskImage: "radial-gradient(ellipse 60% 50% at 50% 0%, #fff 70%, transparent 110%)",
          }}
        >
          </div>     


      {/* Content Container */}
      <div className="mx-auto relative z-10 max-w-7xl px-4 sm:px-6 py-12 sm:py-20">
        <div className="flex justify-center items-center flex-col lg:flex-row lg:items-center gap-8 lg:gap-16">
          {/* Left Side - Content */}
          <div className="flex-1 max-w-xl text-left">
            {/* AI Recruitment Engine Badge */}
            <span className="inline-flex items-center px-3 py-1 mb-6 text-xs font-medium tracking-wide uppercase rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              <svg
                className="w-4 h-4 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              AI RECRUITMENT ENGINE
            </span>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 !leading-snug mb-12">
              Stop drowning in{" "}
              <span className="relative inline-block">
                1,000+ resumes.
                {/* Curved underline effect from center */}
                <svg
                  className="absolute -bottom-4 left-0 w-full"
                  viewBox="0 0 300 13"
                  fill="none"
                  preserveAspectRatio="none">
                  <path
                    d="M2 9 C 80 1, 160 1, 298 7"
                    stroke="#0044FF"
                    strokeWidth="3"
                    strokeLinecap="round"></path>
                </svg>
              </span>
            </h1>

            {/* Description */}
            <p className="mt-4 text-lg sm:text-xl text-gray-600 leading-relaxed">
              Worko.ai filters thousands of applicants down to{" "}
              <span className="font-semibold text-gray-900">10–15 interview-ready candidates</span>{" "}
              using deep 5-parameter analysis — beyond keywords, beyond resumes.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap gap-4">
              <button className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-lg shadow-blue-200 disabled:opacity-50 disabled:hover:bg-blue-600">
                Book a demo <ArrowUpRight className="ml-2 w-4 h-4" />
              </button>
              <a 
              href="#worko_corporate_flow"
              className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 rounded-full transition-colors">
                See how it works
              </a>
            </div>

            {/* Security Badges */}
            <div className="mt-6 flex items-center gap-4 text-sm text-gray-500">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                <svg
                  className="w-3 h-3 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                SOC 2 ready
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <svg
                  className="w-3 h-3 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                GDPR-compliant
              </span>
              <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                <svg
                  className="w-3 h-3 mr-1"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Data encrypted at rest
              </span>
            </div>

            {/* Trusted Companies */}
            <div className="mt-12 pt-8 border-t border-gray-200">
              <p className="text-center text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
                TRUSTED BY HIRING TEAMS AT
              </p>
              <div className="overflow-hidden">
                <div className="flex animate-marquee !duration-[20s] whitespace-nowrap gap-6 sm:gap-8">
                  {/* Logo placeholders - replace with actual logo assets */}
                  {["Moi soi", "Sirona", "Onmeta", "Syneos health", "Antino", "Hexaware"].map((company) => (
                    <span key={company} className="text-base sm:text-lg text-gray-400 font-medium">
                      {company}
                    </span>
                  ))}
                  {["Olsen spaces", "Cred", "Firstclub", "Swiggy", "Rapido", "Alstom"].map((company) => (
                    <span
                      key={`${company}-duplicate`}
                      className="text-base sm:text-lg text-gray-400 font-medium">
                      {company}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Floating Form Card */}
          <div className="flex-1 w-full max-w-md lg:max-w-lg animate-fade-in">
            <div className="relative">
              {/* Glow effect behind card */}
              <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full transform scale-90" />

              <div
                className={`relative w-full bg-white backdrop-blur-xl rounded-2xl p-8 sm:p-10 border border-gray-100 shadow-sm transition-all duration-300 ${
                  isSuccess ? "shadow-green-200/50" : "shadow-blue-200/50"
                } hover:shadow-2xl`}>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-sm text-left font-semibold tracking-wide uppercase text-blue-600">
                      Book a 20-min demo
                    </h2>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      See Worko on your roles.
                    </p>
                  </div>
                  <button className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center text-white transition-colors shadow-md">
                    <ArrowUpRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Form / Success State */}
                {isSuccess ? (
                  /* Success State */
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-green-100 animate-bounce">
                      <PartyPopper className="w-10 h-10 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h3>
                    <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                      Your request has been received. Our team will contact you shortly.
                    </p>
                    <button
                      onClick={() => setIsSuccess(false)}
                      className="inline-flex items-center justify-center px-6 py-3 text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors shadow-lg">
                      Submit another request
                    </button>
                  </div>
                ) : (
                  /* Form State */
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {/* Full Name */}
                    <div>
                      <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 mb-1.5">
                        Full name *
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        placeholder="Jane Doe"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
                        {...register("fullName", validationRules.name)}
                      />
                      {errors.fullName && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.fullName.message}</p>
                      )}
                    </div>

                    {/* Work Email */}
                    <div>
                      <label
                        htmlFor="workEmail"
                        className="block text-sm font-medium text-gray-700 mb-1.5">
                        Work email *
                      </label>
                      <input
                        id="workEmail"
                        type="email"
                        placeholder="jane@company.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
                        {...register("workEmail", validationRules.corporateEmail)}
                      />
                      {errors.workEmail && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.workEmail.message}</p>
                      )}
                    </div>

                    {/* Phone */}
                    <div>
                      <label
                        htmlFor="phoneNumber"
                        className="block text-sm font-medium text-gray-700 mb-1.5">
                        Phone *
                      </label>
                      <input
                        id="phoneNumber"
                        type="text"
                        placeholder="+1 555 0100"
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
                        {...register("phoneNumber", validationRules.phone)}
                      />
                      {errors.phoneNumber && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.phoneNumber.message}</p>
                      )}
                    </div>

                    {/* Company */}
                    <div>
                      <label
                        htmlFor="companyName"
                        className="block text-sm font-medium text-gray-700 mb-1.5">
                        Company *
                      </label>
                      <input
                        id="companyName"
                        type="text"
                        placeholder="Acme Inc."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 bg-transparent focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60"
                        {...register("companyName", validationRules.companyName)}
                      />
                      {errors.companyName && (
                        <p className="mt-1.5 text-sm text-red-600">{errors.companyName.message}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="w-full px-6 py-4 mt-2 text-base font-semibold text-white bg-black hover:bg-gray-800 rounded-lg transition-all shadow-lg disabled:opacity-90 disabled:hover:bg-gray-900"
                      disabled={isSubmitting || !isValid}>
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.062 1.938 5.92 4.707 7.208"
                              stroke="currentColor"
                              strokeWidth="2"></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center">
                          Book my demo <ArrowUpRight className="ml-2 w-4 h-4" />
                        </span>
                      )}
                    </button>

                    {/* Footer Text */}
                    <p className="text-xs text-gray-500 text-center mt-3">
                      Free 20-minute consultation. No credit card required.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>


      </div>
    </section>

  );
}
