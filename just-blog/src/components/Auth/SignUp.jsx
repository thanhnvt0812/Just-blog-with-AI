/* eslint-disable no-unused-vars */
import React from "react";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";

import AUTH_IMG from "../../assets/auth-img.png";
import Input from "../Inputs/Input";
import { validateEmail } from "../../utils/helper";
import ProfilePhotoSelector from "../Inputs/ProfilePhotoSelector";
import { uploadImage } from "../../utils/uploadImage";

const SignUp = ({ setCurrentPage }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminAccessToken, setAdminAccessToken] = useState("");
  const [error, setError] = useState(null);
  const { updateUser, setOpenAuthForm } = useContext(UserContext);
  const navigate = useNavigate();

  //handle sign up form submit
  const handleSignUp = async (e) => {
    e.preventDefault();
    let profileImageUrl = "";
    if (!fullName) {
      setError("Please enter full name");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password) {
      setError("Please enter a password");
      return;
    }
    setError("");
    //call sign up API
    try {
      //upload image
      if (profilePic) {
        const imgUpRes = await uploadImage(profilePic);
        profileImageUrl = imgUpRes.imageUrl || "";
      }
      //sign up
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl,
        adminAccessToken,
      });
      const { token, role } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
      }
      //redirect base on role
      if (role === "admin") navigate("/admin/dashboard");
      else navigate("/");
      setOpenAuthForm(false);
    } catch (error) {
      if (error.response && error.response.data.message)
        setError(error.response.data.message);
      else setError("Something went wrong. Please try again.");
    }
  };
  return (
    <>
      <div className="flex items-center h-auto md:h-[520px]">
        <div className="w-[90vw] md:w-[43vw] p-7 flex flex-col justify-center">
          <h3 className="text-lg font-semibold text-black">
            Create an account
          </h3>
          <p className="text-xs text-slate-700 mt-[5px] mb-6">
            Join us by entering your details below
          </p>

          <form onSubmit={handleSignUp}>
            <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                label="Full Name"
                placeholder="Just Blog"
                type="text"
              />
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                label="Email Address"
                placeholder="justblog@example.com"
                type="text"
              />
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label="Password"
                placeholder="Min 8 characters"
                type="password"
              />
              <Input
                value={adminAccessToken}
                onChange={(e) => setAdminAccessToken(e.target.value)}
                label="Admin Invite Token"
                placeholder="6 digit code"
                type="number"
              />
            </div>
            {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
            <button className="btn-primary" type="submit">
              SIGN UP
            </button>
            <p className="text-[13px] text-slate-800 mt-3">
              Already have an account?{" "}
              <button
                className="font-medium text-primary underline cursor-pointer"
                onClick={() => setCurrentPage("login")}
              >
                Login
              </button>
            </p>
          </form>
        </div>
        <div className="hidden md:block">
          <img src={AUTH_IMG} alt="" className="h-[420px] w-[30 vw]" />
        </div>
      </div>
    </>
  );
};

export default SignUp;
