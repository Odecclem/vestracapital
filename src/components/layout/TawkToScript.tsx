"use client";

import Script from "next/script";

export default function TawkToScript() {
  // TODO: Replace with your actual Tawk.to Property ID and Widget ID
  // You can find this in your Tawk.to Dashboard -> Administration -> Chat Widget -> Direct Chat Link
  // E.g., https://tawk.to/chat/PROPERTY_ID/WIDGET_ID
  const propertyId = "YOUR_PROPERTY_ID_HERE";
  const widgetId = "YOUR_WIDGET_ID_HERE";

  // Do not render if the IDs are placeholders
  if (propertyId === "YOUR_PROPERTY_ID_HERE") {
    return null;
  }

  return (
    <Script
      id="tawk-to"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
          (function(){
          var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
          s1.async=true;
          s1.src='https://embed.tawk.to/${propertyId}/${widgetId}';
          s1.charset='UTF-8';
          s1.setAttribute('crossorigin','*');
          s0.parentNode.insertBefore(s1,s0);
          })();
        `,
      }}
    />
  );
}
