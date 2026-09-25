# Search Engine Optimization (SEO) & Structured Data Documentation

**Website**: [https://www.orvencasido.site](https://www.orvencasido.site)  
**Primary Specialization**: Senior DevOps & Cloud Engineer  
**Focus Areas**: Kubernetes, CI/CD Automation, Cloud Architecture (AWS/Azure), Docker, Infrastructure as Code (Terraform), DevSecOps, Platform Engineering  

---

## 1. Directory Structure

All SEO configurations, scripts, and static files are centralized in:

```
├── seo/
│   ├── robots.txt              # Production crawl directives & sitemap reference
│   ├── sitemap.xml             # Canonical XML sitemap with all public routes & case studies
│   ├── generate-sitemap.mjs    # Automated sitemap generator (runs on build)
│   └── README.md               # This documentation
├── public/
│   ├── robots.txt              # Served directly at https://www.orvencasido.site/robots.txt
│   └── sitemap.xml             # Served directly at https://www.orvencasido.site/sitemap.xml
└── src/
    └── seo/
        ├── seoConfig.ts        # Canonical domain, default metadata, and per-page SEO maps
        ├── SEOHead.tsx         # Zero-dependency React dynamic <head> manager
        └── structuredData.ts   # Schema.org JSON-LD generators (Person, WebSite, ProfilePage, etc.)
```

---

## 2. Core SEO Components

### A. Sitemap (`/sitemap.xml`)
- Generated dynamically during build via `node seo/generate-sitemap.mjs`.
- Inspects Supabase PostgreSQL to pull all published blog posts (`/blogs/:slug`) and active projects (`/projects/:slug`) alongside standard public pages:
  - `https://www.orvencasido.site/` (priority 1.0, weekly)
  - `https://www.orvencasido.site/projects` (priority 0.9, weekly)
  - `https://www.orvencasido.site/blogs` (priority 0.8, weekly)
  - `https://www.orvencasido.site/experience` (priority 0.8, monthly)
  - `https://www.orvencasido.site/certifications` (priority 0.8, monthly)
  - `https://www.orvencasido.site/education` (priority 0.7, monthly)
  - `https://www.orvencasido.site/contact` (priority 0.7, yearly)

### B. Robots Directives (`/robots.txt`)
- Allows search crawlers (Googlebot, Bingbot, etc.) on all public content.
- Explicitly disallows private CMS administration portals (`/orven` and `/orven/*`).
- References the canonical sitemap:  
  `Sitemap: https://www.orvencasido.site/sitemap.xml`

### C. CMS Global Settings Integration (Supabase Sync)
- **Editor Location**: Admin CMS -> **Site Settings** (`/orven/dashboard/settings`).
- **Database Table**: `site_settings` in Supabase.
- **Synced Properties**:
  - `website_title` -> Directly controls `<title>` and `og:title` on the homepage.
  - `website_description` -> Sets `<meta name="description">` and `og:description`.
  - `seo_keywords` -> Sets `<meta name="keywords">`.
- When updated in the Admin CMS, the changes are written to Supabase and cache-invalidated, ensuring immediate reflection on the live homepage without redeploying code.

### D. Structured Data (JSON-LD)
Schema.org structured data is embedded both statically in `index.html` (for non-JS crawlers) and dynamically injected into `<head>`:
- **`Person`**: Identifies Orven Casido as a Senior DevOps Engineer, including LinkedIn, GitHub, email, and skill proficiencies.
- **`WebSite`**: Declares site name, URL, and publisher identity.
- **`ProfilePage`**: Wraps the personal profile for Google Search Knowledge Panels.
- **`BlogPosting`**: Automatically generated for each individual blog post (`/blogs/:slug`), attributing author, publication date, cover image, and tags.
- **`SoftwareSourceCode`**: Generated for each project detail case study (`/projects/:slug`).

### E. Indexability & Canonical URLs
- **Canonical Domain**: `https://www.orvencasido.site` is strictly enforced.
- **Noindex Protection**: Protected routes (`/orven`, `/orven/*`) and 404 pages automatically receive `<meta name="robots" content="noindex, nofollow">` to prevent ranking dilution.

---

## 3. How to Verify in Google Search Console

1. **Verify Sitemap Submission**:
   - Open **Google Search Console** -> Select property `https://www.orvencasido.site`.
   - In the left sidebar, click **Sitemaps**.
   - Under *Add a new sitemap*, enter: `sitemap.xml` and click **Submit**.
   - Confirm status reports **Success** with detected URLs.

2. **Inspect & Request Indexing**:
   - In the top Search Console bar, paste your URL: `https://www.orvencasido.site/`.
   - Click **Test Live URL**.
   - Verify:
     - URL is available to Google (HTTP 200).
     - User-agent can read `robots.txt`.
     - Canonical declared by user matches Google-selected canonical.
   - Click **Request Indexing**.

3. **Verify Schema.org Rich Results**:
   - Open Google's [Rich Results Test](https://search.google.com/test/rich-results).
   - Enter `https://www.orvencasido.site/` and test.
   - Confirm detected structured data items:
     - Person
     - WebSite
     - ProfilePage
