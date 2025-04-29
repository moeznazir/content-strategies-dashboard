'use client';
import React, { useState } from "react";
import CustomButton from "@/app/customComponents/CustomButton";
import CustomInput from "@/app/customComponents/CustomInput";
import CustomSelect from "@/app/customComponents/CustomSelect";
import { isValidEmail, isValidPassword } from "@/lib/utils";
import { signUpUser } from "@/lib/services/userServices";
import Link from "next/link";
import { appColors } from "@/lib/theme";


const Signup = () => {
  const [selectedTitles, setSelectedTitles] = useState([]);
  const [emailSentMessage, setEmailSentMessage] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const [titleError, setTitleError] = useState("");

  const handleSignUp = async (e) => {

    e.preventDefault();
    setEmailError("");
    setPasswordError("");
    setServerError("");
    setTitleError("");

    let isValid = true;
    if (selectedTitles.length === 0) {
      setTitleError("Please select at least one title.");
      isValid = false;
    }

    if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }

    if (!isValidPassword(password)) {
      setPasswordError("Password must be at least 6 characters long.");
      isValid = false;
    }

    if (!isValid) return;
    setLoading(true);

    try {
      const signUpData = {
        email,
        password,
        title_roles: selectedTitles.map((title) => title),
      };

      const response = await signUpUser(signUpData, email);

      if (response.error) {
        setServerError(response.error);
      } else {
        const user = response.user;

        if (user?.user_metadata?.email_verified === undefined) {
          setServerError("This email is already registered and verified. Try signing in.");
        } else {
          console.log("User signed up successfully:", response);
          setEmailSentMessage("We have sent a verification email. Please check your inbox.");
        }
      }
    } catch (error) {
      setServerError("An unexpected error occurred.");
      console.log(error);
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ color: appColors.textHeadingColor }}>
      <div className="bg-[#ffffff] p-8 rounded-2xl shadow-lg w-100">
        <form onSubmit={handleSignUp}>
          <h2 className="text-2xl font-bold text-center mb-4">
            <span className="border-l-4 border-[#1a1b41] pl-2">Content Strategies</span>
          </h2>
          <p className="text-center  mb-4 w-[100%]">
            Sign Up For A WOW24-7 Podcast Database
          </p>
          <label className="block text-sm text-[#1a1b41] font-bold mb-1" >Select Titles</label>
          <CustomSelect
            id="titles"
            value={selectedTitles}
            onChange={setSelectedTitles}
            placeholder="Select Titles"
            options={[
              { value: "Marketing", label: "Marketing" },
              { value: "Sales", label: "Sales" },
              { value: "Product", label: "Product" },
              { value: "Operations", label: "Operations" },
              { value: "Finance", label: "Finance" },
              { value: "Executive", label: "Executive" },
            ]}
            isMulti={true}
            className="w-full mb-2 "
          />
          {titleError && <p className="text-red-500 text-sm mt-0 mb-3">{titleError}</p>}
          <label className="block text-sm text-[#1a1b41] font-bold mb-1" >Email</label>
          <CustomInput
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full ${emailError ? "border-red-500" : ""} mb-2`}
            disabled={loading}
          />
          {emailError && <p className="text-red-500 text-sm mt-0 mb-2">{emailError}</p>}
          <label className="block text-sm text-[#1a1b41] font-bold mb-1" >Password</label>
          <CustomInput
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full ${passwordError ? "border-red-500" : ""} mb-1 `}
            disabled={loading}
          />
          {passwordError && <p className="text-red-500 text-sm mb-6 mt-2">{passwordError}</p>}
          {emailSentMessage && <p className="text-green-500 text-sm text-center mb-0">{emailSentMessage}</p>}

          {serverError && <p className="text-red-500 text-sm mb-4">{serverError}</p>}

          <CustomButton
            title={loading ? "Signing up..." : "SIGN UP"}
            className="w-full bg-[#1a1b41] hover:bg-gray-600  font-bold py-2 rounded-md transition mb-4 mt-4"
            disabled={loading}
          />

          <div className="flex justify-center items-center">
            <p className="text-sm font-medium text-gray-600">Already have an account?</p>
            <Link href="/login" className="ml-2 text-sm font-medium text-[#1a1b41] hover:text-gray-400 transition">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
