# RYZE — Razorpay Payment Setup Guide 💳

*Follow this when your parent's bank account is ready. Do it together — the account must legally be in their name (18+).*

---

## ⚠️ Read this first — the current state of your code

Your checkout **looks** like it takes payment, but it does **not**. Three things are fake right now:

| In your code | Problem |
|---|---|
| `key: 'rzp_test_ryze_2024_id'` (Checkout.jsx line ~117) | Not a real Razorpay key — made up |
| `createRazorpayOrder()` (firebaseService.js) | Returns a **fake** order ID |
| `verifyPayment()` | Always returns `verified: true` — verifies nothing |

**So right now, nobody can actually pay you.** This guide fixes that.

---

# PART 1 — Create the Razorpay Account 🏦

### What you need ready (your parent's details)
- ✅ **PAN card** (your parent's)
- ✅ **Bank account** + IFSC code (their name)
- ✅ **Aadhaar** (for KYC)
- ✅ Phone number + email
- ✅ Business name: **RYZE** (register as *Individual / Proprietorship* — simplest)
- ✅ Business type: **E-commerce / Retail**
- ✅ Website: your Vercel URL

### Steps
1. Go to **razorpay.com** → **Sign Up**
2. Sign up with **your parent's** email and phone
3. Choose **Accept Payments** → business type **Individual/Proprietor**
4. Enter business details (name RYZE, category e-commerce, your website URL)
5. Submit **KYC documents** (PAN, Aadhaar, bank details)
6. **Wait for activation** — usually 1–3 working days

> 💡 Until KYC is approved you can still use **Test Mode** and build/test everything. Do that while you wait.

---

# PART 2 — Get Your API Keys 🔑

1. Log into the **Razorpay Dashboard**
2. Go to **Settings → API Keys**
3. Click **Generate Test Key** (start here) — you'll get:
   - **Key ID** — looks like `rzp_test_xxxxxxxx` (safe to use in frontend)
   - **Key Secret** — 🔴 **SECRET. NEVER put this in frontend code or GitHub.**
4. Later, after KYC approval, generate the **Live Key** (`rzp_live_xxxxxxxx`)

### 🔒 Safety rules — do NOT skip
- ❌ **Never** paste the Key Secret into React/frontend code
- ❌ **Never** commit `.env` to GitHub (your `.gitignore` already blocks it — keep it that way)
- ❌ **Never** send keys over WhatsApp/screenshots
- ✅ If a secret ever leaks → **regenerate it immediately** in the dashboard

---

# PART 3 — Where the keys go 📁

**In `client/.env`** (this file stays on your computer, never uploaded):
```
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
```

**In Vercel** (for the live site): Project → **Settings → Environment Variables** → add the same. The **secret key** goes ONLY here (server side), never in the client:
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_here
```

Then in `Checkout.jsx`, replace the fake key line with:
```js
key: import.meta.env.VITE_RAZORPAY_KEY_ID,
```

---

# PART 4 — Choose your path 🛣️

Making payments truly work needs a **server** (because the secret key can never live in the browser). You have two options:

## 🟢 PATH A — Payment Links (no coding, start here)

**Best if you're doing this alone.** You can take real money **today**, no server needed.

**How it works:**
1. Customer places an order on your store (order saves to your dashboard as "Pending")
2. You open **Razorpay Dashboard → Payment Links → Create**
3. Enter the amount + customer's name/phone/email → send the link via **WhatsApp/SMS/email**
4. Customer pays → you get notified → you mark the order Paid and fulfil it

**Pros:** works immediately, zero code, fully secure, real money
**Cons:** manual (about 2 minutes per order) — totally fine for your first 10–50 sales

👉 **Recommended: start here.** Get your first sales, *then* automate.

## 🔵 PATH B — Full integration (needs a small backend)

Payment happens inside your site, no manual step. You need two serverless functions (your site is on Vercel, so you'd add an `/api` folder):

1. **`/api/create-order`** — uses the SECRET key to create a real Razorpay order, returns the order ID
2. **`/api/verify-payment`** — checks the payment signature Razorpay sends back, so nobody can fake a payment

Then Checkout calls those instead of the fake functions.

> ⚠️ **Do not skip signature verification.** Without it, someone can fake a "successful" payment and get free products. That's exactly what your current code does.

---

# PART 5 — Testing (before real money) 🧪

Always test in **Test Mode** first (keys starting `rzp_test_`).

**Razorpay test cards:**
- Card: `4111 1111 1111 1111`
- Expiry: any future date · CVV: any 3 digits
- Test UPI: `success@razorpay`

**Checklist:**
- [ ] Checkout opens the Razorpay popup
- [ ] Test payment completes
- [ ] Order appears in **Staff Dashboard → Orders**
- [ ] Customer address + "Order from Supplier" button show correctly
- [ ] Failed payment shows a proper error (try `failure@razorpay`)

---

# PART 6 — Going live 🚀

1. KYC approved ✅
2. Swap test keys → **live keys** (in `.env` *and* Vercel)
3. Do **one real ₹1–₹10 test purchase yourself** — confirm money reaches the bank
4. Check settlement (Razorpay pays out to your bank in **T+2/T+3 days**)
5. Start selling 🎉

---

# 💰 Fees reminder

| Method | Fee |
|---|---|
| **UPI (GPay/PhonePe/Paytm)** | **0%** 🎉 |
| Cards | 2% + GST |
| Setup / annual fee | ₹0 |
| Chargeback dispute | ₹100 |

👉 **Push UPI at checkout** — most Indian customers prefer it *and* it costs you nothing.

---

# 🔧 Common problems

| Problem | Fix |
|---|---|
| "Invalid key" | You're using the fake placeholder key — replace with a real one from the dashboard |
| Popup doesn't open | Razorpay script missing — it's already in `client/index.html`, check it loads |
| Payment succeeds but no order | Check the browser console; the `handler` function saves the order |
| Works local, fails live | You forgot to add env variables in **Vercel** |
| KYC rejected | Usually a name mismatch — bank name must match PAN exactly |

---

# ✅ Your checklist

- [ ] Parent creates Razorpay account
- [ ] KYC documents submitted
- [ ] KYC approved
- [ ] Test keys generated
- [ ] Keys added to `.env` + Vercel
- [ ] Fake key replaced in `Checkout.jsx`
- [ ] **Path A** (payment links) working → take first sales
- [ ] Later: **Path B** (full integration)
- [ ] Live keys + ₹1 real test
- [ ] 🎉 First real sale

---

**Remember:** Path A gets you earning **now**. Don't let "perfect automation" stop you from making your first sale. 🚀
