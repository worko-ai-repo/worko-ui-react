import React from 'react';

const UnderConstruction = () => {
	return (
			<div className="bg-blue-500 w-full flex flex-col items-center justify-center min-h-screen ">
				<h1 className="text-5xl text-white font-bold mb-8 animate-pulse">Coming Soon</h1>
				<p className="text-white text-lg mb-8">We're working hard to bring you something amazing. Stay tuned!</p>
				<button className="btn_t1 text-white" onClick={() => window.location.href = '/'}>
					Back to Home
				</button>
			</div>
		
	);
};

export default UnderConstruction;
