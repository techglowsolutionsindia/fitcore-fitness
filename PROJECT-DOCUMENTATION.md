# FitCore Fitness — Project Documentation

## 1. Project Overview

- **Project Name:** FitCore Fitness
- **Website Type:** Gym and Fitness Centre
- **Developer:** TechGlow Solutions
- **Frontend Technologies:** HTML5, CSS3, Vanilla JavaScript
- **Backend Technologies:** Node.js, Express
- **Frontend Hosting:** GitHub Pages
- **Backend Hosting:** Render
- **Transactional Email Service:** Brevo
- **Project Status:** Final audit and deployment verification in progress
- **Final Completion Date:** Not yet verified

## 2. GitHub and Hosting

**GitHub Repository:**
https://github.com/techglowsolutionsindia/fitcore-fitness

**Live Website:**
https://techglowsolutionsindia.github.io/fitcore-fitness/

**Backend Hosting Provider:** Render

**Render Service Name:** `fitcore-fitness-api`

**Backend URL:**
https://fitcore-fitness-api.onrender.com

**Backend Root Endpoint:** `/`

**Contact API:** `POST /api/contact`

**Gym Visit API:** `POST /api/visit`

**Latest Deployment Status:** Not yet verified after recent local changes.

## 3. Project Structure

Main project folder: `D:\web-projects\fitcore-fitness\`

Important files and folders:

- `index.html` — Main website
- `trainers.html` — Trainers page
- `sitemap.html` — Visitor-facing HTML sitemap
- `sitemap.xml` — Search engine XML sitemap
- `robots.txt` — Search engine crawling instructions
- `.gitignore` — Git exclusions
- `.gitattributes` — Git attributes
- `PROJECT-DOCUMENTATION.md` — Project documentation
- `assets/css/` — Website stylesheets
- `assets/css/pages/` — Page-specific stylesheets
- `assets/js/main.js` — Shared JavaScript
- `assets/js/pages/home.js` — Homepage JavaScript
- `assets/images/` — Website images
- `assets/images/logo/fitcore-logo.svg` — Navbar and footer logo
- `assets/images/logo/fitcore-favicon.svg` — Favicon
- `backend/server.js` — Express API server
- `backend/package.json` — Backend dependencies and scripts
- `backend/package-lock.json` — Dependency lockfile
- `backend/.env` — Local environment configuration; never commit
- `backend/node_modules/` — Local installed dependencies; never commit

## 4. Website Pages and SEO

Main indexable pages:

1. Homepage — `/fitcore-fitness/`
2. Trainers — `/fitcore-fitness/trainers.html`

The HTML sitemap is configured with `noindex, follow`.

The XML sitemap includes the homepage and trainers page.

`robots.txt` references the XML sitemap.

Canonical URLs have been added to the homepage and trainers page.

**Final live SEO and sitemap verification:** Pending.

## 5. Backend Architecture

The backend uses Express with CORS and JSON request parsing.

The configured allowed origins include:

- `http://127.0.0.1:5500`
- `http://localhost:5500`
- `https://techglowsolutionsindia.github.io`
- Additional origin from `FRONTEND_ORIGIN`, when configured

The backend disables the `X-Powered-By` response header.

The request body limit is 20 KB.

The backend uses the Brevo HTTPS API to request transactional email delivery.

**Brevo API endpoint:**
`https://api.brevo.com/v3/smtp/email`

No SMTP password is embedded in the backend source.

## 6. Contact Form Integration

**Endpoint:** `POST /api/contact`

The backend accepts:

- Customer name
- Email address
- Phone number
- Message
- Membership interest, when provided

The backend generates a unique enquiry reference and submission timestamp.

**Owner Notification Email**

Sends the submitted customer information and enquiry reference to the configured gym owner email address.

**Customer Confirmation Email**

Sends a professional thank-you message, enquiry reference, and a copy of the customer's message.

Both email requests are processed independently using `Promise.allSettled()`.

If the owner email request fails, the API reports failure.

If the owner email request succeeds but the customer email request fails, the API reports partial success.

Brevo API acceptance is not equivalent to confirmed final inbox delivery.

**Previous Testing:** Owner notification and customer confirmation emails were successfully tested.

**Final delivery verification from the latest deployed GitHub Pages version:** Pending.

## 7. Gym Visit and Free-Trial API

**Endpoint:** `POST /api/visit`

The backend contains functionality for gym tours and free-trial requests.

It validates customer information, visit type, date, and time.

Supported visit types:

- Gym Tour
- Free Trial

The requested date must be in the future and within 90 days.

The endpoint sends an owner notification and customer acknowledgement through Brevo.

The acknowledgement explicitly states that the request is not a confirmed booking.

**Frontend usage:** Not yet verified.

**Live endpoint testing:** Not yet verified.

This endpoint must not be described as a completed live booking feature until its frontend integration and actual delivery are verified.

## 8. Spam Protection and Validation

The backend includes:

- Server-side name, email, phone, and message validation
- HTML escaping for customer-supplied content
- Honeypot field handling
- Basic IP-based request limiting
- JSON request size restriction
- CORS origin restrictions
- Error handling

The request limiter permits up to five requests per IP per 60-second window.

**Limitation:** The rate limiter uses in-memory storage and resets when the backend restarts. It is not shared between multiple server instances.

**Additional production security testing:** Not yet verified.

## 9. Google Sheets Integration

The backend contains an optional Google Sheets webhook integration.

Configuration variables:

- `GOOGLE_SHEETS_WEBHOOK_URL`
- `GOOGLE_SHEETS_WEBHOOK_SECRET`

If these variables are absent, Google Sheets saving is skipped.

Google Sheets integration was not selected as a required final portfolio feature.

**Current Render configuration:** Not yet verified for these two variables.

**Successful Google Sheets record creation:** Not yet verified.

Do not describe Google Sheets integration as active without confirmation.

## 10. Newsletter Integration

Newsletter subscription, double opt-in, and newsletter campaigns were removed from the project's planned active features.

The uploaded backend contains no newsletter subscription endpoint.

Previously configured newsletter-related Render variables and Brevo newsletter resources were removed during cleanup.

**Newsletter status:** Not required.

## 11. Environment Variables

Environment variable names used by the backend:

| Variable                       | Purpose                               |
| ------------------------------ | ------------------------------------- |
| `BREVO_API_KEY`                | Brevo API authentication              |
| `BREVO_SENDER_EMAIL`           | Verified sender email                 |
| `BREVO_SENDER_NAME`            | Sender display name                   |
| `OWNER_EMAIL`                  | Recipient of owner notifications      |
| `FRONTEND_ORIGIN`              | Additional allowed frontend origin    |
| `PORT`                         | Backend listening port; optional      |
| `GOOGLE_SHEETS_WEBHOOK_URL`    | Optional Google Sheets webhook        |
| `GOOGLE_SHEETS_WEBHOOK_SECRET` | Optional Google Sheets authentication |

The previously confirmed Render configuration contained these five variables:

- `BREVO_API_KEY`
- `BREVO_SENDER_EMAIL`
- `BREVO_SENDER_NAME`
- `FRONTEND_ORIGIN`
- `OWNER_EMAIL`

**Current Render environment:** Reverification pending.

Never store environment variable values, API keys, passwords, or authentication tokens in this document or GitHub.

## 12. Local Backend Setup

1. Open `D:\web-projects\fitcore-fitness\backend\`.
2. Ensure a compatible Node.js version is installed.
3. Install dependencies using `npm ci`.
4. Configure the required environment variables in a local `.env` file.
5. Start the backend using the script defined in `backend/package.json`, or `node server.js`.
6. Check the backend root endpoint.
7. Run contact form tests with valid test data.

The exact Node.js version and package scripts should be confirmed against `backend/package.json`.

Never commit `.env` or `node_modules`.

## 13. Frontend Deployment — GitHub Pages

1. Complete the mandatory website audit.
2. Verify local functionality and navigation.
3. Check Git status and review changed files.
4. Confirm `.gitignore` excludes secrets and dependencies.
5. Review unused files and dependencies before proposing deletions.
6. Commit approved changes in the existing Git repository.
7. Push changes to the `main` branch.
8. Verify the GitHub Pages deployment.
9. Test both website pages and important navigation links.
10. Test the live contact form and verify both email deliveries.

Use the existing repository. Do not create a duplicate project folder.

**Latest deployment verification:** Pending.

## 14. Backend Deployment — Render

1. Open the existing Render service `fitcore-fitness-api`.
2. Verify its linked repository and deployment configuration.
3. Confirm required environment variable names are present.
4. Deploy the approved backend changes through the existing deployment workflow.
5. Verify the backend root endpoint.
6. Test the contact API.
7. Check Render logs for errors.
8. Verify owner and customer email deliveries.

Do not create a new Render service when the existing service is working.

**Latest backend deployment verification:** Pending.

## 15. Testing History

Previously completed:

- Owner notification email tested successfully.
- Customer confirmation email tested successfully.
- Navbar and footer SVG logos visually reviewed.
- Homepage and trainers footer layouts visually reviewed.
- Newsletter functionality removed by decision.

Completed during final local audit:

- Homepage canonical URL added.
- Trainers canonical URL added.
- Trainers footer navigation links corrected.
- HTML sitemap created and updated.
- XML sitemap created.
- `robots.txt` created.

Remaining verification:

- Latest GitHub Pages deployment
- Latest Render deployment, if backend changes require it
- Live owner and customer email delivery
- Mobile and tablet functionality
- Sitemap and robots URLs on the live website
- `.gitignore` exclusions
- Final Google Drive backup

## 16. Maintenance and Known Limitations

- The backend may experience cold-start delays depending on Render service configuration.
- In-memory rate limiting resets when the server restarts.
- Google Sheets saving is optional and unverified.
- Gym visit API frontend usage is unverified.
- Newsletter functionality is intentionally excluded.
- Contact email delivery depends on Render availability, Brevo availability, and correct environment configuration.
- Website contact details may be demonstration information and should be replaced with verified business information before use for a real gym.
- Changes to the frontend domain may require updating the backend CORS configuration.
- Backend secrets must remain outside Git.

## 17. GitHub and Google Drive Backup

**GitHub Repository:**
https://github.com/techglowsolutionsindia/fitcore-fitness

**Latest GitHub Push:** Pending verification.

**Google Drive Backup:** Pending final update.

**Final Documentation Included in GitHub:** Pending.

**Final Documentation Included in Google Drive:** Pending.

The project must not be marked fully closed until deployment, documentation, and backup are verified.

## 18. Common Backend & Email Service Details — TechGlow Solutions

### Render

**Dashboard:**
https://dashboard.render.com/

**Login Email:**
websphereindia7@gmail.com

**Used by FitCore Fitness:** Yes.

**Project Service:** `fitcore-fitness-api`

**Backend URL:**
https://fitcore-fitness-api.onrender.com

### Brevo

**Dashboard:**
https://app.brevo.com/

**Login Email:**
websphereindia7@gmail.com

**Used by FitCore Fitness:** Yes.

**Purpose:** Transactional owner notification and customer confirmation emails.

**Integration:** Brevo HTTPS API.

The dashboard login email addresses are account references only. They are not necessarily the sender or owner notification addresses.

Never document passwords, API keys, authentication tokens, or customer records.

## 19. Final Project Closure Checklist

- [x] Frontend website developed
- [x] Backend contact email integration implemented
- [x] Previous owner email test successful
- [x] Previous customer email test successful
- [x] Newsletter functionality removed
- [x] Canonical URLs added
- [x] HTML sitemap created
- [x] XML sitemap created
- [x] Robots configuration created
- [ ] Final Git configuration verification
- [ ] Final mobile responsiveness verification
- [ ] Latest frontend deployment verified
- [ ] Latest backend deployment verified, if required
- [ ] Both emails verified from the latest live website
- [ ] Project documentation committed to GitHub
- [ ] Google Drive backup updated
- [ ] Final project closure confirmed

---

**Documentation Status:** Draft prepared from reviewed backend source and previously confirmed project work.

**Last Updated:** 4 November 2026

**Final Project Status:** Audit and deployment verification pending.
