export type CustomModalLoaderMessageType = "referral" | "signup";

export const CustomModalLoaderMessageBody: { [key in CustomModalLoaderMessageType]: string[] } = {
    referral:[
    "Checking eligibility for referral",
    "Matching your educational qualification",
    "Checking your responsibilities and experiences",
    "Final checks happening",
    "We are almost done"
  ],
  signup:[
   "Hang tight! We’re diving deep into your profile to find jobs matching your skills ,experience, strengths and career goals.",
   ":sparkles: Better matches = Better interview chances",
  ]
}