import { Login_Boy } from '@Assets';
import LoginForm from './LoginForm';

const Login = () => {
	return (
		<div className=" flex justify-center relative w-full min-h-[500px] max-w-[1120px] overflow-hidden rounded-3xl bg-white shadow z-20 ">
			<div className=" px-8 pt-8 pb-16  sm:px:14 flex justify-between w-full items-center ">
				{/* Form and Image */}
				<div className=" img hidden sm:block h-full max-w-[50%] ">
					<img src={Login_Boy} alt="login_img" className="w-full h-full object-contain  " />
				</div>
				<div className=" img h-full w-full sm:w-[50%] ">
        <p className="font-bold text-xl mb-5 md:text-2xl text-gray-700 mx-auto text-left   max-w-[350px] mt-2 "> Nice to see you again </p>
          <LoginForm />
        </div>
			</div>
		</div>
	);
};
export default Login;
