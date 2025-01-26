import { mini_frame1, mini_frame2, student } from '@Assets';
import React, { useState } from 'react';
import { dorpDown } from './data';

const ProductHighlight = () => {
    const [openDropdown, setOpenDropdown] = useState({ one: null, two: null }); // Separate state for each container

   
    const toggleDropdown = (container: 'one' | 'two', index: number) => {
        setOpenDropdown((prev) => ({
            ...prev,
            [container]: prev[container] === index ? null : index, // Toggle dropdown for the specific container
        }));
    };

    return (
        <div className="bg-white p-1 md:p-5 my-10 ">
            <div className="section-wrapper min-h-96 !p-1 md:p-5 mx-auto font-bold text-[10px]">

                {/* Header */}
                <div className="flex gap-2 mb-5 w-fit mx-auto justify-between items-center border-[0.8px] border-blue-600 shadow-sm shadow-blue-500 rounded-full text-blue-600 bg-transparent px-2 py-1">
                    <i className="text-blue-500 rounded-[50%] bg-blue-900 p-1.5 fa-md fa-solid fa-box-open"></i>
                    PRODUCT HIGHLIGHT
                </div>

                {/* Dropdown Container 1 */}
                <div className="max-w-[300px] mb-5 sm:max-w-[90%] mx-auto">
                    <p className="text-lg sm:text-xl mb-3 md:text-4xl mt-10">
                        For <b className="text-white px-2 py-1 tracking-wide bg-blue-500 font-semibold rounded-md">
                            Candidate
                        </b>
                    </p>
                    <div className="gap-0 sm:gap-10 mt-10 flex w-[100%] items-center justify-center">
                        <div className="dropdown_and_frame flex flex-col gap-3 relative">
                            {dorpDown.one.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => toggleDropdown('one', index)}
                                    className="h-auto relative cursor-pointer"
                                >
                                    <div className="w-[290px] sm:w-[250px] md:w-[300px] px-3 py-2 relative text-black rounded-md bg-[#CFEFFF] flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <img src={item.image} alt={"index"} className="w-[24px] h-full object-cover rounded-md" />
                                            <p className="text-sm text-gray-700 text-left">{item.title}</p>
                                        </div>
                                        <i className={`fa-solid fa-caret-${openDropdown.one === index ? "up" : "down"} text-black-600`} />
                                    </div>

                                    {/* Expanded content */}
                                    {openDropdown.one === index && (
                                        <div className="relative top-[0px] left-0 w-[290px] sm:w-[250px] md:w-[300px] text-wrap bg-white p-2 rounded-md shadow-lg">
                                            <p className="text-xs font-semibold ">{item.description}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="hidden sm:inline-block product_highlight_img w-[400px] h-[100%]">
                            <img src={mini_frame1} alt="mini_frame1" className="hidden sm:inline-block" />
                        </div>
                    </div>
                </div>

                {/* Dropdown Container 2 */}
                <div className="max-w-[300px] sm:max-w-[90%] mx-auto">
                    <p className="text-lg sm:text-xl mb-3 md:text-4xl mt-10">
                        For <b className="text-white px-2 py-1 tracking-wide bg-blue-500 font-semibold rounded-md">
                            Employees
                        </b>
                    </p>
                    <div className="gap-0 sm:gap-10 mt-10 flex w-[100%] items-center justify-center">
                        <div className="hidden sm:inline-block product_highlight_img w-[400px] h-[100%]">
                            <img src={mini_frame2} alt="mini_frame1" />
                        </div>
                        <div className="dropdown_and_frame flex flex-col gap-3 relative">
                            {dorpDown.two.map((item, index) => (
                                <div
                                    key={index}
                                    onClick={() => toggleDropdown('two', index)}
                                    className="h-auto relative cursor-pointer"
                                >
                                    <div className="w-[290px] sm:w-[250px] md:w-[300px] px-3 py-2 relative text-black rounded-md bg-[#CFEFFF] flex justify-between items-center">
                                        <div className="flex items-center gap-2">
                                            <img src={item.image} alt={"index"} className="w-[24px] h-full object-cover rounded-md" />
                                            <p className="text-sm text-gray-700 text-left">{item.title}</p>
                                        </div>
                                        <i className={`fa-solid fa-caret-${openDropdown.two === index ? "up" : "down"} text-black-600`} />
                                    </div>

                                    {/* Expanded content */}
                                    {openDropdown.two === index && (
                                        <div className="relative top-[0px] left-0 w-[290px] sm:w-[250px] md:w-[300px] bg-white p-2 rounded-md shadow-lg">
                                            <p className="text-xs font-semibold ">{item.description}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductHighlight;
