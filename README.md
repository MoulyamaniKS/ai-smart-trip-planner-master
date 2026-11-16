# ✈️ AI Smart Trip Planner Master (Complete A to Z Application)

A brand-new, modern, full-stack **AI Smart Trip Planner Application** built from scratch with **Node.js**, **SQLite**, **React 18**, **Tailwind CSS**, **Leaflet Maps**, **Open-Meteo Live Weather API**, **OpenStreetMap Geocoding**, **Wikipedia Intelligence**, **YouTube Creator Vlogs**, **Tour Guides Directory**, and **Interactive Animated Character Authentication**.

---

## 🌟 Complete Breakdown of All 21 Parts Implemented

### 1. Modern Tech Stack & Clean Folder Structure (PART 1)
- Zero-dependency native Node.js backend (`server.js`) with native HTTP, SQLite (`node:sqlite.DatabaseSync`), and crypto security.
- Clean modular frontend architecture organized into `public/css/`, `public/js/components/`, `public/js/services/`, and `public/js/data/`.
- Fast, resilient launch without complex dependency installation issues.

### 2. Database Schema & Persistent Models (PART 2)
- Relational SQLite database (`trips.db`) storing:
  * `users` (credentials, salted password hashes, avatars)
  * `trips` (day-by-day itineraries, custom stops, budgets, traveler counts, preferences)
  * `favorites` (bookmarked destinations)
  * `rental_bookings` (bicycle and vehicle rental orders)
  * `guide_inquiries` (custom tour inquiries to local guides)
  * `reviews` (verified diner and accommodation reviews)
- Automatic fallback to JSON file storage (`database.json`) when operating in environments without native SQLite binaries.

### 3. Secure User Authentication & Authorization (PART 3)
- Cryptographic password hashing using Node's `crypto.scryptSync` with unique cryptographic salts.
- Session authorization tokens returned upon login/registration.
- Pre-seeded traveler demo credentials:
  * **Email**: `traveler@smarttrip.com`
  * **Password**: `password123`
- Seamless Google OAuth demo sign-in option.

### 4. Interactive Eye-Tracking Character Login (PART 4)
- Split-screen travel-themed authentication view (`public/login.html`) featuring 3 animated expedition squad characters:
  1. **Sky** (Blue Passport Companion)
  2. **Blaze** (Orange Mountain Wanderer with Headband)
  3. **Atlas** (Midnight Suitcase Explorer)
- **8 Dynamic Behaviors**:
  * Real-time cursor following: pupils smoothly calculate angles and distances.
  * Focused on email: characters eagerly look right towards the email input.
  * Focused on password: characters playfully cover their eyes with hands/paws!
  * Toggling "Show Password": characters part their fingers and peek curiously with wide eyes!
  * Mouse leaves window: characters droop into cute sad puppy-dog expressions (`🥺`).
  * Excited submission: characters lean forward in happy anticipation.
  * Confetti celebration: confetti explosion (`🎉`) and jumping animations on success.
  * Head shake: sympathetic head shake and error alert if credentials mismatch.

### 5. Dynamic Destination Search & Global Geocoding (PART 5)
- Search **any** city, mountain, town, or landmark worldwide.
- Live integration with **OpenStreetMap Nominatim Geocoding API** for real coordinate resolution and boundary detection.
- Real-time fallback to **Wikipedia REST API** to pull verified encyclopedic descriptions and authentic high-resolution photography.

### 6. Destination Intelligence & Overview (PART 6)
- High-resolution hero imagery and gallery view.
- Historical context and comprehensive cultural background.
- 4-card quick information grid:
  * Local currency ($, €, £, ₹, ¥, CHF, etc.)
  * Local timezone
  * Recommended optimal seasons to visit
  * Emergency helpline contacts (Police, Medical, Forest Departments)
- Direct link to open location in Google Maps.

### 7. Real-time Weather & 7-Day Forecast Engine (PART 7)
- Live meteorological data via **Open-Meteo API** (zero API key required).
- Current temperature, apparent feels-like temperature, humidity percentage, wind speed, and precipitation levels.
- 7-day daily forecast with maximum/minimum temperatures and rain probability.
- Dynamic travel & packing advisory tailored to real-time weather conditions.

### 8. Sightseeing & Tourist Attractions Catalog (PART 8)
- Categorized by optimal visiting periods:
  * 🌅 **Morning Places to Visit** (06:00 AM - 12:00 PM)
  * ☀️ **Afternoon Places to Visit** (12:00 PM - 05:00 PM)
  * 🌙 **Evening Places to Visit** (05:00 PM - 10:00 PM)
- Entry ticket fees, recommended duration, opening hours, verified customer ratings, and reviews counts.
- Interactive "Add to Itinerary" and "View on Map" buttons.

### 9. AI Multi-Day Itinerary Generator (PART 9)
- Generates structured day-by-day travel schedules from 1 to 14 days.
- Chronological breakdown from 07:30 AM to 08:00 PM:
  * Morning artisan breakfast & landmark exploration
  * Regional lunch stop
  * Afternoon cultural deep-dive & museums
  * Evening sunset promenade
  * Atmospheric regional dinner
- Configurable by traveler counts (Solo, Couple, Family, Group), budget tier (Budget $, Moderate $$, Luxury $$$), and travel vibe (Culture & Nature, Treks, Food, Leisure).

### 10. Interactive Itinerary Customization (PART 10)
- Add custom stops with custom times, titles, locations, descriptions, and costs.
- Remove unwanted stops with instant deletion.
- Real-time recalculation of each day's estimated cost and overall trip budget.

### 11. Multi-Tier Accommodations & Hotels (PART 11)
- Stays categorized into:
  * **Budget ($)**: Hostels, mountain lodges, trekker basecamps, and traveler inns.
  * **Mid-Range ($$)**: Boutique hotels, scenic valley suites, and heritage guesthouses.
  * **Luxury ($$$)**: 5-star palace hotels, spa resorts, and private villas.
- Verified guest ratings, amenities tags (Wi-Fi, AC, breakfast, pools), nightly prices, and direct booking links.

### 12. "Rent a Ride" Vehicle & Bike Rentals (PART 12)
- Vehicles available for rental:
  * Mountain Bicycles & City Cruisers
  * Electric Bicycles & E-Scooters
  * Adventure Motorcycles (e.g., Royal Enfield Himalayan)
  * 4x4 SUVs & Hybrid Sedans
- Hourly and daily rental rates, mechanical specifications, shop addresses, and "Book This Ride" modal.

### 13. Local Food & Culinary Explorer (PART 13)
- Authentic regional dishes and street delicacies.
- Clear dietary badges: **Vegetarian 🟢** and **Non-Vegetarian 🔴**.
- Price ranges, dish descriptions, and recommended restaurants or bazaars.

### 14. Authentic Restaurant Reviews & Dining Guide (PART 14)
- Verified reviews from actual diners.
- Cuisine classifications, average meal costs for two, positive highlights, and insider dining tips.

### 15. YouTube Travel Vlogs & Video Discovery (PART 15)
- Creator videos categorized into:
  * Sightseeing & Treks
  * Local Food & Street Food
  * Hotels & Stays
  * Travel Tips & Budget
  * Solo & Adventure Vlogs
- Real creators, verified badges, video lengths, viewer counts, and clickable watch links opening original YouTube watch pages.
- Direct global YouTube search shortcut for any destination.

### 16. Verified Local Tour Guides Directory (PART 16)
- Accredited tour guides and certified wilderness leaders.
- Spoken languages, credential badges, experience summaries, and customer ratings.
- Tour packages with durations and pricing.
- Direct WhatsApp contact links and interactive "Book / Inquire" modal.

### 17. Interactive Travel Budget Calculator (PART 17)
- Dynamic simulation of total costs across Stays, Food, Transit, Activities, Rentals, and Shopping.
- Real-time cost per person and daily averages.
- Visual percentage distribution bar.
- Multi-currency support: USD ($), EUR (€), GBP (£), INR (₹), JPY (¥), AUD (A$).

### 18. Interactive Map & Geographic Navigation (PART 18)
- Interactive Leaflet map with OpenStreetMap tiles.
- Categorized pin markers:
  * ⭐ Destination Center
  * 🏛️ Sights & Attractions (Sky Blue)
  * 🏨 Hotels & Stays (Emerald Green)
  * 🚲 Vehicle & Bike Rentals (Indigo)
- Interactive popups with photos, ticket costs, ratings, and instant pan-to-location capability.

### 19. Favorites & Saved Trip Management (PART 19)
- Instant one-click bookmarking of favorite destinations.
- Complete database persistence for multi-day itineraries.
- Dual-sync between backend REST API and browser `localStorage` ensuring 100% offline access.

### 20. PDF Export & Social Sharing Engine (PART 20)
- Built-in print-ready styled PDF itinerary generator:
  * Destination title, duration, budget, and traveler summary
  * Chronological day-by-day timetable
  * Clean, paper-friendly styling with single-click print or save to PDF
- One-click WhatsApp sharing, Email mailto export, and clipboard formatted text copy.

### 21. Smart Packing Assistant & One-Click Launch Script (PART 21)
- Context-aware packing checklist generated dynamically from destination climate, rainfall, and planned activities.
- Interactive checkboxes with real-time percentage progress bar.
- Add custom personal packing items.
- Windows one-click automated startup launcher (`start.bat`).

---

## 🚀 How to Run the Application

### Option A: Using the Windows Launcher Script (Recommended)
Double-click `start.bat` in the project root:
```cmd
start.bat
```
- Starts the web server on `http://localhost:5000`
- Automatically opens the web app in your default browser.

### Option B: Running with Node.js
```bash
node server.js
```
Open your browser and visit: `http://localhost:5000`

### Option C: Standalone Browser Mode (No Server Required)
Simply double-click `open_app.html` or open `public/index.html` directly in any web browser! The application automatically operates using client-side APIs and `localStorage` persistence.

---

## 🔐 Demo Authentication Credentials
- **Email**: `traveler@smarttrip.com`
- **Password**: `password123`
- Or use the "Continue with Google" one-click demo sign-in!

---

## 🌐 External APIs Used (No Paid API Keys Required)
1. **Open-Meteo Weather API**: Live weather, precipitation, wind speed, and 7-day forecasts. (Free, public, no API key needed).
2. **OpenStreetMap Nominatim API**: Worldwide geocoding and coordinate resolution. (Free, public).
3. **Wikipedia REST API**: Real encyclopedic city overviews, historical summaries, and high-resolution photography. (Free, public).
4. **Leaflet.js & OpenStreetMap Tiles**: Interactive maps and spatial navigation. (Free, open-source).
