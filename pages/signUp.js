import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { Api } from "@/services/service";
import { IoEyeOffOutline } from "react-icons/io5";
import { IoEyeOutline } from "react-icons/io5";
import { useTranslation } from "react-i18next";
import { userContext } from "./_app";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";

const SignUp = (props) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [userDetail, setUserDetail] = useState({
    name: "",
    lastname: "",
    email: "",
    number: "",
    password: "",
    businessType: "",
    legalBusinessName: "",
    resellerPermit: null,
    termsAgreement: false,
  });
  const [user] = useContext(userContext);
  const [eyeIcon, setEyeIcon] = useState(false);
  const [isBusinessAccount, setIsBusinessAccount] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user?._id) {
      router.push("/");
    }
  }, [user, router]);

  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "First name is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Only letters and spaces allowed";
        if (value.trim().length < 2) return "Minimum 2 characters required";
        return "";
      case "lastname":
        if (!value.trim()) return "Last name is required";
        if (!/^[A-Za-z\s]+$/.test(value)) return "Only letters and spaces allowed";
        if (value.trim().length < 2) return "Minimum 2 characters required";
        return "";
      case "email":
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          return "Invalid email format";
        return "";
      case "number":
        if (!value) return "Mobile number is required";
        if (!/^\d{10}$/.test(value)) return "Must be 10 digits";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Minimum 8 characters required";
        if (!/[A-Z]/.test(value)) return "At least one uppercase letter";
        if (!/[a-z]/.test(value)) return "At least one lowercase letter";
        if (!/[0-9]/.test(value)) return "At least one number";
        if (!/[^A-Za-z0-9]/.test(value))
          return "At least one special character";
        return "";
      case "isBusinessAccount":
        if (!value) return "Please select if this is a business account";
        return "";
      case "businessType":
        if (isBusinessAccount && !value) return "Business type is required";
        return "";
      case "legalBusinessName":
        // Optional field, no validation needed
        return "";
      case "resellerPermit":
        // Optional field, no validation needed
        return "";
      case "termsAgreement":
        if (!value) return "You must agree to terms and conditions";
        return "";
      default:
        return "";
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    // Handle file upload for resellerPermit only
    if (name === "resellerPermit") {
      const file = files[0];
      if (file) {
        // Check file type (only PDF, JPG, PNG allowed)
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          props?.toaster?.({
            type: "error",
            message: "Only PDF, JPG, and PNG files are allowed",
          });
          return;
        }
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          props?.toaster?.({
            type: "error",
            message: "File size should be less than 5MB",
          });
          return;
        }
      }
      setUserDetail({
        ...userDetail,
        [name]: file,
      });
      // Clear error when user uploads file
      setErrors({
        ...errors,
        [name]: "",
      });
      return;
    }

    // Prevent numbers in name fields but allow spaces
    if ((name === "name" || name === "lastname") && /[0-9]/.test(value)) {
      return;
    }

    // Prevent non-numeric characters in phone number
    if (name === "number" && value && !/^\d*$/.test(value)) {
      return;
    }

    // Handle checkbox for business account and terms agreement
    if (name === "termsAgreement" || name === "isBusinessAccount") {
      const checked = e.target.checked;
      
      if (name === "isBusinessAccount") {
        setIsBusinessAccount(checked);
        // Clear business fields when unchecked
        if (!checked) {
          setUserDetail({
            ...userDetail,
            businessType: "",
            legalBusinessName: "",
            resellerPermit: null,
          });
          // Clear business field errors
          setErrors({
            ...errors,
            businessType: "",
            legalBusinessName: "",
            resellerPermit: "",
            isBusinessAccount: "",
          });
        } else {
          // Clear error when checked
          setErrors({
            ...errors,
            isBusinessAccount: "",
          });
        }
      } else {
        // Handle terms agreement
        setUserDetail({
          ...userDetail,
          [name]: checked,
        });
        // Clear error when user checks the box
        setErrors({
          ...errors,
          [name]: "",
        });
      }
      return;
    }

    setUserDetail({
      ...userDetail,
      [name]: value,
    });

    // Clear error when user starts typing
    setErrors({
      ...errors,
      [name]: "",
    });
  };

  const handleBlur = (e) => {
    const { name, value, files } = e.target;
    let fieldValue = value;
    
    // For file input, check if file is selected (only for resellerPermit now)
    if (name === "resellerPermit") {
      fieldValue = files && files[0] ? files[0] : null;
      const error = validateField(name, fieldValue);
      setErrors({
        ...errors,
        [name]: error,
      });
      return;
    }
    
    const error = validateField(name, fieldValue);
    setErrors({
      ...errors,
      [name]: error,
    });
  };

  const submitSignUp = (e) => {
    e.preventDefault();

    // Validate all fields
    let formValid = true;
    const newErrors = {};

    // Validate all required fields
    let requiredFields = ['name', 'lastname', 'email', 'number', 'password', 'isBusinessAccount', 'termsAgreement'];
    
    // Add business fields only if business account is selected
    if (isBusinessAccount) {
      requiredFields.push('businessType');
    }
    
    requiredFields.forEach((key) => {
      let fieldValue;
      if (key === 'isBusinessAccount') {
        fieldValue = isBusinessAccount;
      } else {
        fieldValue = userDetail[key];
      }
      const error = validateField(key, fieldValue);
      if (error) {
        formValid = false;
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);

    if (!formValid) {
      props?.toaster?.({
        type: "error",
        message: "Please fix the errors in the form",
      });
      return;
    }

    props?.loader?.(true);
    
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('email', userDetail.email.toLowerCase());
    formData.append('username', userDetail.name);
    formData.append('password', userDetail.password);
    formData.append('number', userDetail.number);
    formData.append('lastname', userDetail.lastname);
    formData.append('type', 'USER');
    
    // Add new fields
    formData.append('termsAgreement', userDetail.termsAgreement);
    formData.append('isBusinessAccount', isBusinessAccount);
    
    // Add business fields only if business account is selected
    if (isBusinessAccount) {
      formData.append('businessType', userDetail.businessType);
      if (userDetail.legalBusinessName) {
        formData.append('legalBusinessName', userDetail.legalBusinessName);
      }
      if (userDetail.resellerPermit) {
        formData.append('resellerPermit', userDetail.resellerPermit);
      }
    }

    Api("post", "signUp", formData, router).then(
      (res) => {
        props?.loader?.(false);
        if (res?.success) {
          router.push("/signIn");
          props?.toaster?.({
            type: "success",
            message: "Registered successfully",
          });
        } else {
          props?.toaster?.({
            type: "error",
            message: res?.data?.message || res?.message || "Registration failed",
          });
        }
      },
      (err) => {
        props?.loader?.(false);
        props?.toaster?.({
          type: "error",
          message: err?.response?.data?.message || err?.message || "Something went wrong",
        });
      }
    );
  };

  return (
    <>
      <Head>
        <title>Vietnamese Groceries Delivered Fresh to Your Door</title>
        <meta name="description"
          content="Get authentic Vietnamese groceries delivered fresh to your doorstep. Enjoy vegetables, snacks, seafood, and more with fast, reliable service" />
        <link
          rel="canonical"
          href="https://www.bachhoahouston.com/signUp"
        />
      </Head>
      <div className="font-sans flex flex-col items-center justify-center md:min-h-[750px]">
        <div className="max-w-7xl mx-auto w-full">

          <div className="flex md:hidden flex-col justify-center items-center">  
            <h1 className="mt-8 text-[34px] md:text-[48px] text-black">
              {t("Welcome")}
            </h1>
            <p className="md:text-[20px] text-[16px] text-[#858080]">
              {" "}
              {t("Please enter your sign up details")}.
            </p>
            <div className=" w-full h-[120px] justify-center items-center relative mb-4">
              <Image
                src="/ladies.png"
                alt="Sign In"
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="bg-custom-lightGreen rounded-[22px]  grid lg:grid-cols-3 md:grid-cols-3 shadow-[2px_4px_4px_4px_#00000040] md:mx-0 mx-3 mb-12 md:mb-0">

            <form
              className="bg-white rounded-[22px] md:px-12 px-5 md:py-4 py-6 flex flex-col justify-center items-start col-span-2 border-[1px] border-[#2E7D3240]"
              onSubmit={submitSignUp}
            >
              <h3 className="text-black text-[28px] md:text-[40px] font-bold text-center mb-6">
                {t("Application")}
              </h3>

              <div className="relative flex flex-col w-full md:w-[80%] mb-6 md:mb-5">
                <div className="relative flex items-center">
                  <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[14px] md:text-[18px]">
                    {t("First Name")}
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder={t("Enter First Name")}
                    value={userDetail.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="px-4 py-3 bg-white w-full text-[14px] md:text-[16px] border-2 border-black rounded-xl text-black outline-none"
                    required
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-red-500 text-xs">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="relative flex flex-col w-full md:w-[80%] mb-6 md:mb-5">
                <div className="relative flex items-center">
                  <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[14px] md:text-[18px]">
                    {t("Last Name")}
                  </label>
                  <input
                    type="text"
                    name="lastname"
                    placeholder={t("Enter Last Name")}
                    value={userDetail.lastname}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="px-4 py-3 bg-white w-full text-[14px] md:text-[16px] border-2 border-black rounded-xl text-black outline-none"
                    required
                  />
                </div>
                {errors.lastname && (
                  <p className="mt-1 text-red-500 text-xs">
                    {errors.lastname}
                  </p>
                )}
              </div>

              <div className="relative flex flex-col w-full md:w-[80%] mb-6 md:mb-5">
                <div className="relative flex items-center">
                  <label className="text-gray-800 text-[14px] md:text-[18px] bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px]">
                    {t("Email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder={t("demo@gmail.com")}
                    value={userDetail.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="px-4 py-3 bg-white w-full text-[14px] md:text-[16px] border-2 border-black rounded-xl text-black outline-none"
                    required
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-red-500 text-xs">
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="relative flex flex-col w-full md:w-[80%] mb-6 md:mb-5">
                <div className="relative flex items-center">
                  <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[14px] md:text-[18px]">
                    {t("Mobile Number")}
                  </label>
                  <input
                    type="tel"
                    name="number"
                    placeholder="9685933689"
                    value={userDetail.number}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    maxLength={10}
                    className="px-4 py-3 bg-white w-full border-2 border-[#000000] rounded-xl outline-none text-[16px] text-black md:text-[18px]"
                    required
                  />
                </div>
                {errors.number && (
                  <p className="mt-1 text-red-500 text-xs">
                    {errors.number}
                  </p>
                )}
              </div>

              <div className="relative flex flex-col w-full md:w-[80%] mb-6 md:mb-5">
                <div className="relative flex items-center">
                  <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[14px] md:text-[18px]">
                    {t("Password")}
                  </label>
                  <input
                    type={eyeIcon ? "text" : "password"}
                    name="password"
                    placeholder="***********"
                    value={userDetail.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="px-4 py-3 bg-white w-full border-2 border-[#000000] rounded-xl outline-none text-[16px] text-black md:text-[18px]"
                    required
                  />
                  <div
                    className="absolute right-4 cursor-pointer"
                    onClick={() => setEyeIcon(!eyeIcon)}
                  >
                    {eyeIcon ? (
                      <IoEyeOutline className="w-[20px] h-[20px] text-custom-gray" />
                    ) : (
                      <IoEyeOffOutline className="w-[20px] h-[20px] text-custom-gray" />
                    )}
                  </div>
                </div>
                {errors.password && (
                  <p className="mt-1 text-red-500 text-xs">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Business Account Checkbox */}
              <div className="relative flex flex-col w-full md:w-[80%] mb-6 md:mb-5">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isBusinessAccount"
                    checked={isBusinessAccount}
                    onChange={handleChange}
                    className="w-5 h-5 text-custom-green bg-white border-2 border-gray-300 rounded focus:ring-custom-green focus:ring-2"
                    required
                  />
                  <label className="text-gray-800 text-[14px] md:text-[16px] font-medium">
                    {t("This is a business account")} *
                  </label>
                </div>
                {errors.isBusinessAccount && (
                  <p className="mt-1 text-red-500 text-xs">
                    {errors.isBusinessAccount}
                  </p>
                )}
              </div>

              {/* Business Fields - Only show when business account is checked */}
              {isBusinessAccount && (
                <>
                  {/* Business Type Dropdown */}
                  <div className="relative flex flex-col w-full md:w-[80%] mb-6 md:mb-5">
                    <div className="relative flex items-center">
                      <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[14px] md:text-[18px] z-10">
                        {t("Business Type")} *
                      </label>
                      <select
                        name="businessType"
                        value={userDetail.businessType}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="px-4 py-3 bg-white w-full text-[14px] md:text-[16px] border-2 border-black rounded-xl text-black outline-none"
                        required
                      >
                        <option value="">{t("Select Business Type")}</option>
                        <option value="wholesale">{t("Wholesale")}</option>
                        <option value="retail">{t("Retail")}</option>
                        <option value="foodservice">{t("Food Service")}</option>
                        <option value="restaurant">{t("Restaurant / Café")}</option>
                        <option value="onlinefoodseller">{t("Online Food Seller")}</option>
                        <option value="mealprep">{t("Meal Prep / Ghost Kitchen")}</option>
                        <option value="homebased">{t("Home-Based Food Business")}</option>
                      </select>
                    </div>
                    {errors.businessType && (
                      <p className="mt-1 text-red-500 text-xs">
                        {errors.businessType}
                      </p>
                    )}
                  </div>

                  {/* Legal Business Name - Optional */}
                  <div className="relative flex flex-col w-full md:w-[80%] mb-6 md:mb-5">
                    <div className="relative flex items-center">
                      <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[14px] md:text-[18px]">
                        {t("Legal Business Name")}
                      </label>
                      <input
                        type="text"
                        name="legalBusinessName"
                        placeholder={t("Enter Legal Business Name")}
                        value={userDetail.legalBusinessName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className="px-4 py-3 bg-white w-full text-[14px] md:text-[16px] border-2 border-black rounded-xl text-black outline-none"
                      />
                    </div>
                    {errors.legalBusinessName && (
                      <p className="mt-1 text-red-500 text-xs">
                        {errors.legalBusinessName}
                      </p>
                    )}
                  </div>

                  {/* Reseller Permit Upload - Optional */}
                  <div className="relative flex flex-col w-full md:w-[80%] mb-10 md:mb-8">
                    <div className="relative flex items-center">
                      <label className="text-gray-800 bg-white absolute px-2 md:top-[-18px] top-[-12px] left-[18px] text-[14px] md:text-[18px] z-10">
                        {t("Reseller Permit Upload")}
                      </label>
                      <div className="relative w-full">
                        <input
                          type="file"
                          name="resellerPermit"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                        />
                        <div className="px-4 py-3 bg-white w-full border-2 border-[#000000] rounded-xl flex items-center justify-between">
                          <span className="text-[14px] md:text-[16px] text-gray-500">
                            {userDetail.resellerPermit ? userDetail.resellerPermit.name : "No file chosen"}
                          </span>
                          <button
                            type="button"
                            className="ml-4 py-2 px-4 rounded-full border-0 text-sm font-semibold bg-custom-green text-white cursor-pointer hover:bg-green-700"
                          >
                            Choose File
                          </button>
                        </div>
                      </div>
                    </div>
                    {errors.resellerPermit && (
                      <p className="mt-1 text-red-500 text-xs">
                        {errors.resellerPermit}
                      </p>
                    )}
                    <p className="mt-1 text-gray-500 text-xs">
                      Upload reseller permit or tax exemption certificate (PDF, JPG, PNG - Max 5MB)
                    </p>
                  </div>
                </>
              )}

              <div className="w-full md:w-[80%]">
                {/* Terms Agreement Checkbox */}
                <div className="relative w-full mb-6 md:mb-5 bg-white p-4 border-2 border-gray-200 rounded-xl">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      name="termsAgreement"
                      checked={userDetail.termsAgreement}
                      onChange={handleChange}
                      className="mt-1 w-5 h-5 text-custom-green bg-white border-2 border-gray-300 rounded focus:ring-custom-green focus:ring-2 flex-shrink-0"
                      required
                    />
                    <div className="flex flex-col flex-1">
                      <span className="text-gray-800 text-[12px] md:text-[14px] leading-relaxed">
                        {t("By clicking Submit you agree with our Terms and Conditions and Privacy Policy. Prepayment required. No net terms offered.")}
                      </span>
                    </div>
                  </div>
                  {errors.termsAgreement && (
                    <p className="mt-2 text-red-500 text-xs">
                      {errors.termsAgreement}
                    </p>
                  )}
                </div>
                
                <button
                  type="submit"
                  className="w-full shadow-xl py-3.5 px-4 text-sm tracking-wider font-semibold rounded-xl text-white text-[16px] md:text-[20px] bg-custom-green focus:outline-none"
                >
                  {t("Submit")}
                </button>
              </div>

              <p className="text-[14px] text-[#A7A9AA]  text-center mb-6 mt-2">
                {t("Already have an account?")}
                <span
                  className="text-custom-green text-[14px] font-semibold hover:underline ml-1 whitespace-nowrap cursor-pointer"
                  onClick={() => router.push("/signIn")}
                >
                  {t("Sign in")}
                </span>
              </p>
            </form>

            <div className="md:flex hidden rounded-tr-[22px] rounded-br-[22px] bg-custom-lightGreen  flex-col justify-center items-center ">
              <h1 className="mt-4 text-[34px] md:text-[48px] text-black">
                {t("Welcome")}
              </h1>
              <p className="md:text-[20px] text-[16px] text-[#858080] mt-4 mb-4">
                {" "}
                {t("Please enter your sign in details")}.
              </p>
              <div className="hidden md:flex w-full h-[320px] justify-center items-center relative">
                <Image
                  src="/ladies.png"
                  alt="Sign In"
                  fill
                  className="object-contain"
                />
              </div>

              <div className="mt-6 relative  w-[170px]  h-14 mb-10 ">
                <Link href="/" aria-label="Go to homepage">
                  <Image
                    alt="Bach Hoa Houston grocery pickup logo"
                    className="mb-4 cursor-pointer "
                    fill
                    src="/newlogo.jpeg"
                    priority
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;