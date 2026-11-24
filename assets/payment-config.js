/* Single switch for "Pay by UPI". The number comes from assets/site-config.js — change it there.
   enabled: false hides every Pay by UPI button and QR.
   upiId: the owner's UPI ID. Leave it empty to hide the buttons
   even if enabled is true.
   The UPI ID is the 10-digit mobile number WITHOUT the country code
   (9566977211@upi — founder-confirmed 24 Nov 2026). wa.me/tel links
   keep the 91 prefix; only the UPI ID drops it. */
window.SJ_PAY = {
  enabled: true,
  upiId: (window.SJ_SITE ? window.SJ_SITE.phoneDigits.replace(/^91/, "") : "9566977211") + "@upi",
  payeeName: "SJ Tours and Travels"
};
