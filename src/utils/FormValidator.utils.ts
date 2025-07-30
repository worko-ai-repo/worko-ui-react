import { emailDomainDenyListValidator } from "./CorporateMailValidator.utils";

/**
 * How to use this file:
 *
 * @example
 * import { validationRules } from 'src/utils/FormValidator.utils';
 *
 * const SignupEmpForm = () => {
 *  const {
 *   register,
 *  handleSubmit,
 * watch,
 * setValue,
 * formState: { errors },
 * } = useForm({
 * mode: "onChange",
 * });
 *
 * const [showPassword, setShowPassword] = useState(false);
 * const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 *
 * const onSubmit = (data:any) => {
 * console.log("Form Data:", data);
 * };
 *
 * return (
 * <div className=" mx-auto  bg-white rounded-xl shadow-md flex justify-center items-center w-[90%] bc  ">
 * <form onSubmit={handleSubmit(onSubmit)} className="bc min-w-full ">
 *
 * <div className="mainForm bc min-w-full space-y-4  grid grid-cols-3 items-baseline gap-2 ">
 *
 * {/* Phone Number *\/}
 * <div>
 * <label className="block font-medium">Phone</label>
 * <input
 * type="text"
 * placeholder="+91 XXXXXXXXXX"
 * className="border rounded-md p-2 w-full"
 * {...register("phone", validationRules.phone({ required: true}))}
 * />
 */

export const validationRules = {
  /**
   * @type  {Object} name
   *
   * @description - Validation rules for form fields for name entered.
   *
   * @property {string} name.required - Error message when the name is not provided.
   * @property {Object} name.minLength - Minimum length validation for the name.
   * @property {Object} name.pattern - Regex validation to prevent special characters.
   */
  name: {
    required: "Name is required",
    minLength: { value: 3, message: "Minimum 3 characters required" },
    pattern: { value: /^[A-Za-z\s]+$/, message: "Special characters and Numbers are not allowed" }, // Only allows letters and spaces
  },

  /**
   * @type  {Object} phone
   *
   * @description - Validation rules for form fields for phone number entered.
   *
   * @property {string} phone.required - Error message when the phone number is not provided.
   * @property {Object} phone.pattern - Pattern validation for the phone number that it should start from 6, 7, 8, or 9. and should be 10 digit long.
   */
  phone: {
    required: "Phone number is required",
    pattern: {
      value: /^[6-9]\d{9}$/, // Invalid if it doesn't start with 6, 7, 8, or 9
      message: "Invalid phone number",
    },
  },

  /**
   * @type  {Object} email
   *
   * @description - Validation rules for form fields for email entered.
   *
   * @property {string} email.required - Error message when the email is not provided.
   * @property {Object} email.pattern - Pattern validation for the email.
   */
  email: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
  },

  /**
   * @type  {Object} corporateEmail
   *
   * @description - Validation rules for form fields for corporate email entered.
   *
   * @property {string} corporateEmail.required - Error message when the corporate email is not provided.
   * @property {Object} corporateEmail.pattern - Pattern validation for the corporate email.
   */
  corporateEmail: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
    validate: (email: string) => emailDomainDenyListValidator(email) || "Personal email domains are not allowed",
  },

  /**
   * @type  {Object} personalEmail
   * 
   * @description - Validation rules for form fields for personal email entered.
   * 
   * @property {string} personalEmail.required - Error message when the personal email is not provided.
   * @property {Object} personalEmail.pattern - Pattern validation for the personal email.
   * */
  personalEmail: {
    required: "Email is required",
    pattern: {
      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
      message: "Invalid email address",
    },
    validate: (email: string) =>{
      //skip if email has worko.ai domain
      if(email.endsWith("@worko.ai")) return true;
      else return (
      !emailDomainDenyListValidator(email) || "Corporate email domains are not allowed"
      )},
  },

  /**
   * @type  {Object} linkedInPage
   *
   * @description - Validation rules for form fields for linkedin url entered.
   *
   * @property {string} linkedInPage.required - Error message when the LinkedIn page is not provided.
   * @property {Object} linkedInPage.pattern - Pattern validation for the LinkedIn page.
   */
  linkedInPage: {
    required: "LinkedIn page is required",
    pattern: {
      value: /https:\/\/www.linkedin.com\/[A-Za-z0-9\.-]+/,
      message: "Invalid LinkedIn page",
    },
  },

  /**
   * @type  {Object} url
   *
   * @description - Validation rules for form fields.
   *
   * @property {string} url.required - Error message when the URL is not provided.
   * @property {Object} url.pattern - Pattern validation for the URL.
   */
  url: {
    required: "URL is required",
    pattern: {
      value: /^(http|https):\/\/[^ "]+$/,
      message: "Invalid URL",
    },
  },

  /**
   * @type  {Object} company
   *
   * @description - Validation rules for form fields for company by custom company component that will use the company sk to validate the company.
   *
   * @property {string} company.required - Error message when the company name is not provided.
   * @property {Function} company.validate - Custom validation function for the company name.
   */
  company: {
    required: "Company name is required",
    validate: (value: string | undefined) => {
      // If no value is provided or it's an empty string
      if (!value || value.trim() === "") {
        return "Company name is required";
      }

      // Check if it's a valid company selection (SK format)
      if (!value.startsWith("COMPANY#")) {
        return "Please select a valid company";
      }

      return true;
    },
  },

  /**
   * @type  {Object} companyName
   *
   * @description - Validation rules for form fields for company name entered.
   *
   * @property {string} companyName.required - Error message when the company name is not provided.
   * @property {Object} companyName.minLength - Minimum length validation for the company name.
   */
  companyName: {
    required: "Company name is required",
    minLength: { value: 3, message: "Minimum 3 characters required" },
  },

  /**
   * @type  {Object} designation
   *
   * @description - Validation rules for form fields for designation entered.
   *
   * @property {string} designation.required - Error message when the designation is not provided.
   * @property {Object} designation.minLength - Minimum length validation for the designation.
   */
  designation: {
    required: "Designation is required",
    minLength: { value: 3, message: "Minimum 3 characters required" },
  },

  /**
   * @type  {Object} password
   *
   * @description - Validation rules for form fields.
   *
   * @property {string} password.required - Error message when the password is not provided.
   * @property {Object} password.minLength - Minimum length validation for the password.
   */
  password: {
    required: "Password is required",
    minLength: { value: 8, message: "Password must be at least 8 characters long" },
    pattern: {
      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/, // Changed
      message: "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    },
  },

  /**
   * @type  {Function} confirmPassword
   *
   * @description - Validation rules for form fields.
   *
   * @param {Function} watch - Function to watch the value of the password field.
   *
   * @property {string} confirmPassword.required - Error message when the confirm password is not provided.
   * @property {Function} confirmPassword.validate - Custom validation function for the confirm password.
   */
  confirmPassword: (watch: any) => ({
    required: "Confirm Password is required",
    validate: (value: any) => value === watch("password") || "Passwords do not match",
  }),

  /**
   * @type  {Object} otp
   *
   * @description - Validation rules for form fields.
   *
   * @property {string} otp.required - Error message when the otp is not provided.
   * @property {Object} otp.pattern - Pattern validation for the otp that it should be a 6-digit number.
   */
  otp: {
    required: "OTP is required",
    pattern: {
      value: /^[0-9]{6}$/,
      message: "OTP should be a 6-digit number",
    },
  },

  /**
   * @type  {Object} termsAndConditions
   *
   * @description - Validation rules for form fields.
   *
   * @property {Function} termsAndConditions.validate - Custom validation function for terms and conditions.
   */
  termsAndConditions: {
    validate: (value: boolean) => value || "Please accept our terms and conditions to proceed.",
  },

  /**
   * @type  {Object} cv
   *
   * @description - Validation rules for form fields.
   *
   * @property {string} cv.required - Error message when the cv is not provided.
   * @property {Function} cv.validate - Custom validation function for the cv file.
   */
  cv: {
    required: "CV is required",
    validate: (fileList: FileList) => {
      if (!fileList?.length) return "File is required";
      const file = fileList[0];
      const allowedTypes = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) return "Only PDF, DOC, or DOCX allowed";
      if (file.size > maxSize) return "File size must be under 5MB";

      return true;
    },
  },

  /**
   * @type  {Object} department
   *
   * @description - Validation rules for form fields.
   *
   * @property {Object} department - Validation rules for the department field.
   * @property {string} department.required - Error message when the department is not provided.
   */
  department: {
    required: "Department is required",
  },

  /**
   * JobDescription
   *
   * @description - Validation rules for form fields. That will throw error if it doesnt have experience skills jotTtitle no of Opening and many more fields
   *
   */
  jobDescription: {
    required: "Job Description is required",
    minLength: { value: 50, message: "Minimum 50 characters required" },
    validate: (value: string) => {
      const requiredKeywords = ["experience", "education", "skills", "certifications", "responsibilities", "role", "employment type", "department"];

      const missingKeywords = requiredKeywords.filter((keyword) => !value.toLowerCase().includes(keyword.toLowerCase()));

      if (missingKeywords.length > 0) {
        return `Please include the following sections: ${missingKeywords.join(", ")}`;
      }

      return true; // Validation passed
    },
  },

  /**
   * default
   *
   * @description - Default validation rules for form fields.
   *
   * @property {string} default.required - Error message when the field is not provided.
   */
  default: {
    required: "This field is required",
  },

  /**
   * defaultNumber
   *
   * @description - Default validation rules for form fields. This is used for number fields.
   */
  defaultNumber: {
    required: "This field is required",
    pattern: {
      value: /^[0-9]*$/,
      message: "Only numbers are allowed",
    },
  },

  /**
   * defaultTextarea
   *
   * @description - Default validation rules for form fields. This is used for textarea fields.
   */
  defaultTextarea: {
    required: "This field is required",
    minLength: { value: 50, message: "Minimum 50 characters required" },
  },

  /**
   * guidanceRequestDeadline
   *
   * @description - Default validation rules for form fields. This is used for date fields.
   */
  guidanceRequestDeadline: {
    required: "This field is required",
    validate: (value: Date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Normalize time to midnight
      if (value < today) return "Date must be today or later";
      return true;
    },
  },

  /**
   * ctc
   *
   * @description - Default validation rules for form fields. This is used for CTC fields.
   */
  ctc: {
    valueAsNumber: true,
    required: "CTC is required",
    min: { value: 0, message: "Minimum value is 0" },
    max: { value: 100, message: "Maximum value is 100" },
    validate: (value: number) => {
      if (isNaN(value)) {
        return "Please enter a valid number";
      }
      // Max 2 decimal places
      if (!/^\d+(\.\d{1,2})?$/.test(value.toString())) {
        return "Only up to 2 decimal places allowed";
      }
      return true;
    },
  }  
};
