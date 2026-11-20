/* Single switch for "Pay by UPI". The number comes from assets/site-config.js — change it there.
   enabled: false hides every Pay by UPI button and QR.
   upiId: the owner's UPI ID. Leave it empty to hide the buttons
   even if enabled is true. */
window.SJ_PAY = {
  enabled: true,
  upiId: (window.SJ_SITE ? window.SJ_SITE.phoneDigits : "9566977211") + "@upi",
  payeeName: "SJ Tours and Travels"
};
