# **App Name**: AlertWave

## Core Features:

- Login: Secure email and OTP authentication for admin/partner access.
- Risk Map: Display district-based map with color-coded village markers (green, yellow, red) indicating risk levels, using Mapbox GL JS.
- Alerts Control Center: List villages with current risk levels and alert status. Options to resend or pause alerts for each village.
- Event Logs: Table displaying timestamp, village, hazard, risk score, and alert status (Yes/No) for troubleshooting.
- User Management: Add and manage village groups with village names, WhatsApp group links/phone numbers, and hazard preferences.
- Data Diagnostics: Display last rainfall fetch, last satellite sync, and any errors to prevent debugging panics.
- Risk Score Computation: ML module to compute flood, heat, and landslide risk scores for each village using GPM rainfall, Sentinel-1 SAR, temperature forecasts, DEM slope, and soil moisture, and save the results in the database.
- Scheduled Jobs: Automated cron jobs to trigger rainfall fetch, Sentinel-1 sync, temperature forecasts, ML risk computation, and WhatsApp alert sending.
- Notification System: Background queue for sending messages, retry logic for failures, and logging for every success/failure using Meta Cloud API, Gupshup, or Twilio WhatsApp API.
- Spatial Database: Supabase PostGIS enabled with tables for polygons, coordinates, elevation metadata, and spatial indexing for fast querying.
- Raster Processing Backend: Backend compute using Google Earth Engine + Cloud Run, Sentinel Hub API, or Cloudflare Workers + R2 to handle satellite preprocessing, SAR decoding, DEM clipping, soil moisture raster ops, and temporal smoothing.
- Risk Threshold Engine: Hazard-specific thresholds, escalation rules (yellow → orange → red), cooldown period before downgrading risk, and alert fatigue prevention system.
- Audit Trails + Data Provenance: Versioning of risk model, tracking which dataset influenced which alert, who sent what alert, API call history, and reproducibility pipeline.
- Security & Rate-Limiting: Supabase RLS rules, API rate limiting, fail-safe if API keys get leaked, Mapbox token protection, and Edge API auth middleware.
- CI/CD + Observability: Logs (Vercel logs, Supabase logs, Worker logs, Model run logs), error monitoring (Sentry), deployment workflow (GitHub → Vercel integration), preview deployments, and automatic schema migration on deploy (Supabase CLI).
- ETL & Data Validation Layer: Data validation layer to check for missing timestamps, corrupt rasters, cloud cover issues, pixel anomalies, including automatic fallback if a source fails.
- Cache Layer: Redis or Supabase Redis Add-on to cache last good raster results, village risk scores, and API-level fallback to stale-but-safe mode.
- Manual Override Panel: Admin interface for manual overrides, including risk score, forced alert sending/stopping, and threshold adjustments.
- Ground Truth Input System: Simple form for users to report flood/landslide/heat issues, collect images, and GPS location, storing ground truth to retrain models.
- Model Registry & Rollback System: Explicit model registry (e.g., GCS bucket, Supabase storage) with model version tagging and rollback system, including a change log per version.
- Feature Store: Tables storing historical rainfall, SAR backscatter, normalized soil moisture, temperature 7-day window, DEM + slope + land cover, Vegetation indices (NDVI), and Water index (NDWI).
- Frontend Error & Offline Handling: Define behavior for no network, no satellite sync, missing risk scores, fetch timeout, API error, and partial data, ensuring the app fails gracefully.
- Public Interface: Recipient interface for villagers, including a WhatsApp bot for risk status, a simple dashboard for flood risk today, and auto-language translation.
- Policy & Compliance Layer: Include data disclaimer, non-liability clause, consent to send alerts, compliance with WhatsApp Business API policies, and geo-sensitive data privacy rules.
- Alert Template Management: The system for managing the actual message text including threat-level based templates, language variations, and placeholder variables.

## Style Guidelines:

- Primary color: Black (#000000) to convey seriousness and importance.
- Background color: White (#FFFFFF) for a clean and neutral dashboard interface.
- Accent color: Gray (#808080) to highlight key actions and data points.
- Body and headline font: 'Inter', a sans-serif font for a modern, machined and objective look. Note: currently only Google Fonts are supported.
- Use clear, minimalist icons to represent different hazard types and alert states.
- Mobile-responsive layout using a grid system for adaptability across devices. Sidebar navigation for primary sections.
- Subtle transitions and animations to enhance user experience during data loading and state changes.