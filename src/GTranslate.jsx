import React, { useEffect } from "react";

const GTranslate = () => {
  useEffect(() => {
    // Configure GTranslate settings
    window.gtranslateSettings = {
      default_language: "en",
      detect_browser_language: true,
      wrapper_selector: ".gtranslate_wrapper",
      languages: ["ar", "bn", "en", "gu", "hi", "kn", "ml", "mr", "pa", "sd", "ta", "te", "ur"],
      native_language_names: true,
    };

    // Load the GTranslate script dynamically
    const script = document.createElement("script");
    script.src = "https://cdn.gtranslate.net/widgets/latest/float.js";
    script.defer = true;
    document.head.appendChild(script);

    // Cleanup function to remove the script when the component unmounts
    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return <div className="gtranslate_wrapper"></div>;
};

export default GTranslate;