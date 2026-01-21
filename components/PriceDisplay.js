import React, { useContext, useEffect } from "react";
import { userContext } from "@/pages/_app";
import { useRouter } from "next/router";
import constant from "@/services/constant";

const PriceDisplay = ({ 
  ourPrice, 
  otherPrice, 
  className = "", 
  delClassName = "",
  showLoginMessage = true 
}) => {
  const [user, setUser, refreshUserProfile] = useContext(userContext);
  const router = useRouter();

  const isLoggedIn = user && user._id;
  const isDocumentVerified = user && user.documentVerified;

  // Auto-refresh user profile if logged in (once per session)
  useEffect(() => {
    if (isLoggedIn && refreshUserProfile && !window.userProfileRefreshed) {
      refreshUserProfile();
      window.userProfileRefreshed = true; // Prevent multiple calls
    }
  }, [isLoggedIn, refreshUserProfile]);

  // Not logged in
  if (!isLoggedIn && showLoginMessage) {
    return (
      <div className="flex flex-col">
        <p className="text-custom-green md:text-xs text-[10px] font-medium">
          Sign in to view wholesale prices
        </p>
      </div>
    );
  }

  // Logged in but document not verified
  if (isLoggedIn && !isDocumentVerified && showLoginMessage) {
    return (
      <div className="flex flex-col">
        <p className="text-orange-500 md:text-xs text-[10px] font-medium">
          Verification pending - Complete to view prices
        </p>
      </div>
    );
  }

  // Logged in and document verified - show prices
  return (
    <div className="flex flex-col">
      <p className={`text-custom-green md:text-xl text-[17px] font-bold ${className}`}>
        {constant.currency} {Number(ourPrice || 0).toFixed(2)}
      </p>
      {otherPrice && (
        <del className={`text-custom-green text-sm font-medium ${delClassName}`}>
          {constant.currency} {Number(otherPrice || 0).toFixed(2)}
        </del>
      )}
    </div>
  );
};

export default PriceDisplay;