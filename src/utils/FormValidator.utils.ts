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
	name: {
		required: 'Name is required',
		minLength: { value: 3, message: 'Minimum 3 characters required' },
	},
	phone: {
		required: "Phone number is required",
        pattern: {
          value: /^[6-9]\d{9}$/, // Invalid if it doesn't start with 6, 7, 8, or 9
          message: "Invalid phone number"
		},
	},
	email: {
		required: 'Email is required',
		pattern: {
			value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
			message: 'Invalid email address',
		},
	},
	linkedInPage: {
		required: 'LinkedIn page is required',
		pattern: {
			value: /https:\/\/www.linkedin.com\/[A-Za-z0-9\.-]+/,
			message: 'Invalid LinkedIn page',
		},
	},
	url: {
		required: 'URL is required',
		pattern: {
			value: /^(http|https):\/\/[^ "]+$/,
			message: 'Invalid URL',
		},
	},
	company: {
        required: 'Company name is required',
        validate: (value: string | undefined) => {
            // If no value is provided or it's an empty string
            if (!value || value.trim() === '') {
                return 'Company name is required';
            }
            
            // Check if it's a valid company selection (SK format)
            if (!value.startsWith('COMPANY#')) {
                return 'Please select a valid company';
            }
            
            return true;
        }
    },
	password: {
		required: 'Password is required',
		minLength: { value: 6, message: 'Minimum 6 characters required' },
	},
	confirmPassword: (watch: any) => ({
		required: 'Confirm Password is required',
		validate: (value: any) => value === watch('password') || 'Passwords do not match',
	}),
	otp: {
		required: 'OTP is required',
		pattern: {
			value: /^[0-9]{6}$/,
			message: 'OTP should be a 6-digit number',
		},
	},
	termsAndConditions: {
		validate: (value: boolean) => value || 'You must accept the terms and conditions',
	},
	cv: {
		required: 'CV is required',  
		validate: (fileList: FileList) => {
			if (!fileList?.length) return 'File is required';
			const file = fileList[0];
			const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
			const maxSize = 5 * 1024 * 1024; // 5MB

			if (!allowedTypes.includes(file.type)) return 'Only PDF, DOC, or DOCX allowed';
			if (file.size > maxSize) return 'File size must be under 5MB';

			return true;
		},
	},
};
