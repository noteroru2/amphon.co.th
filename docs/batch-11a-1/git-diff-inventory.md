# Git Diff Inventory (Batch 11A.1)
**Project:** amphon.co.th  
**Report Date:** July 18, 2026  
**Compliance:** No commits/pushes/deploys made.

---

## 1. Git Status Summary
```bash
M astro.config.mjs
 M scripts/check-duplicate-headings.mjs
 M scripts/validate-seo.mjs
 M src/pages/บริการ/รับซื้อ-gopro.astro
 M vercel.json
?? docs/batch-11a/
?? scratch/
?? sitewide-deep-audit.md
?? src/pages/บริการ/รับซื้อ-storage-nas.astro
?? src/pages/บริการ/รับซื้อเลนส์.astro
?? verify_production_results.json
```

## 2. Git Diff Stat
```bash
astro.config.mjs                     |  2 ++
 scripts/check-duplicate-headings.mjs |  7 ++++-
 scripts/validate-seo.mjs             |  7 ++++-
 src/pages/บริการ/รับซื้อ-gopro.astro     |  1 +
 vercel.json                          | 60 ++++++++++++++++++++++++++++++++++++
 5 files changed, 75 insertions(+), 2 deletions(-)
```

---

## 3. Detailed Diff per File

### 3.1 astro.config.mjs
```diff
diff --git a/astro.config.mjs b/astro.config.mjs
index 14367bf..f3fb255 100644
--- a/astro.config.mjs
+++ b/astro.config.mjs
@@ -30,6 +30,8 @@ export default defineConfig({
           !pathname.includes('/บริการ/รับซื้อสินค้าไอที') &&
           pathname !== '/บริการ/รับซื้อ-gopro' &&
           pathname !== '/บริการ/รับซื้อ-hdd' &&
+          pathname !== '/บริการ/รับซื้อเลนส์' &&
+          pathname !== '/บริการ/รับซื้อ-storage-nas' &&
           !sitemapBlockedPrefixes.some((prefix) => pathname.includes(prefix))
         );
       },
```

### 3.2 vercel.json
```diff
diff --git a/vercel.json b/vercel.json
index bff04dc..30c62ed 100644
--- a/vercel.json
+++ b/vercel.json
@@ -43,6 +43,66 @@
       "destination": "/พื้นที่ให้บริการ/รับซื้อคอมพิวเตอร์-อุบลราชธานี",
       "permanent": true
     },
+    {
+      "source": "/บริการ/รับซื้อ-storage-nas",
+      "destination": "/บริการ/รับซื้อ-nas",
+      "permanent": true
+    },
+    {
+      "source": "/%E0%B8%9B%E0%B8%A3%E0%B8%B4%E0%B8%81%E0%B8%B2%E0%B8%A3/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD-storage-nas",
+      "destination": "/บริการ/รับซื้อ-nas",
+      "permanent": true
+    },
+    {
+      "source": "/รับซื้อ/รับซื้อ-hdd",
+      "destination": "/บริการ/รับซื้อ-ssd",
+      "permanent": true
+    },
+    {
+      "source": "/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD-hdd",
+      "destination": "/บริการ/รับซื้อ-ssd",
+      "permanent": true
+    },
+    {
+      "source": "/รับซื้อ/รับซื้อ-gopro",
+      "destination": "/บริการ/รับซื้อ-gopro-action-camera",
+      "permanent": true
+    },
+    {
+      "source": "/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD-gopro",
+      "destination": "/บริการ/รับซื้อ-gopro-action-camera",
+      "permanent": true
+    },
+    {
+      "source": "/รับซื้อ/รับซื้อเลนส์",
+      "destination": "/บริการ/รับซื้อเลนส์กล้อง",
+      "permanent": true
+    },
+    {
+      "source": "/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD%E0%B9%80%E0%B8%A5%E0%B8%99%E0%B8%AA%E0%B9%8C",
+      "destination": "/บริการ/รับซื้อเลนส์กล้อง",
+      "permanent": true
+    },
+    {
+      "source": "/รับซื้อ/รับซื้อ-storage-nas",
+      "destination": "/บริการ/รับซื้อ-nas",
+      "permanent": true
+    },
+    {
+      "source": "/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD-storage-nas",
+      "destination": "/บริการ/รับซื้อ-nas",
+      "permanent": true
+    },
+    {
+      "source": "/รับซื้อ",
+      "destination": "/รับซื้อสินค้าไอที",
+      "permanent": true
+    },
+    {
+      "source": "/%E0%B8%A3%E0%B8%B1%E0%B8%9A%E0%B8%8B%E0%B8%B7%E0%B9%89%E0%B8%AD",
+      "destination": "/รับซื้อสินค้าไอที",
+      "permanent": true
+    },
     {
       "source": "/รับซื้อ/รับซื้อ-hdd-:province",
       "destination": "/รับซื้อ/รับซื้อ-ssd-:province",
```

### 3.3 scripts/check-duplicate-headings.mjs
```diff
diff --git a/scripts/check-duplicate-headings.mjs b/scripts/check-duplicate-headings.mjs
index ceb9d00..df2c7d4 100644
--- a/scripts/check-duplicate-headings.mjs
+++ b/scripts/check-duplicate-headings.mjs
@@ -10,7 +10,12 @@ const titleMap = new Map();
 const h1Map = new Map();
 
 for (const [pathname, filePath] of builtPages.entries()) {
-  if (pathname.includes('/บริการ/รับซื้อ-gopro') || pathname.includes('/บริการ/รับซื้อ-hdd')) {
+  if (
+    pathname.includes('/บริการ/รับซื้อ-gopro') ||
+    pathname.includes('/บริการ/รับซื้อ-hdd') ||
+    pathname.includes('/บริการ/รับซื้อเลนส์') ||
+    pathname.includes('/บริการ/รับซื้อ-storage-nas')
+  ) {
     continue;
   }
   const html = readText(filePath);
```

### 3.4 scripts/validate-seo.mjs
```diff
diff --git a/scripts/validate-seo.mjs b/scripts/validate-seo.mjs
index c472eb1..f60fbac 100644
--- a/scripts/validate-seo.mjs
+++ b/scripts/validate-seo.mjs
@@ -119,7 +119,12 @@ const seenDescriptions = new Map();
 
 for (const file of htmlFiles) {
   const rel = path.relative(distDir, file).replace(/\\/g, '/');
-  if (rel === 'บริการ/รับซื้อ-gopro/index.html' || rel === 'บริการ/รับซื้อ-hdd/index.html') {
+  if (
+    rel === 'บริการ/รับซื้อ-gopro/index.html' ||
+    rel === 'บริการ/รับซื้อ-hdd/index.html' ||
+    rel === 'บริการ/รับซื้อเลนส์/index.html' ||
+    rel === 'บริการ/รับซื้อ-storage-nas/index.html'
+  ) {
     continue;
   }
   const html = fs.readFileSync(file, 'utf8');
```

### 3.5 src/pages/บริการ/รับซื้อ-gopro.astro
```diff
diff --git a/src/pages/บริการ/รับซื้อ-gopro.astro b/src/pages/บริการ/รับซื้อ-gopro.astro
index dcdb0c6..4e084d1 100644
--- a/src/pages/บริการ/รับซื้อ-gopro.astro
+++ b/src/pages/บริการ/รับซื้อ-gopro.astro
@@ -9,6 +9,7 @@
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
     <title>รับซื้อ GoPro Action Camera DJI Osmo มือสอง | Amphon Trading</title>
     <meta name="description" content="กำลังนำท่านไปยังหน้า บริการรับซื้อ GoPro Action Camera DJI Osmo มือสอง ประเมินราคาเร็ว ตีราคาตามสภาพจริง" />
+    <meta name="robots" content="noindex,follow" />
     <link rel="canonical" href="https://amphon.co.th/บริการ/รับซื้อ-gopro-action-camera" />
     <meta http-equiv="refresh" content="0;url=/บริการ/รับซื้อ-gopro-action-camera" />
     <script is:inline>
```

### 3.6 src/pages/บริการ/รับซื้อ-storage-nas.astro
```diff
diff --git a/src/pages/บริการ/รับซื้อ-storage-nas.astro b/src/pages/บริการ/รับซื้อ-storage-nas.astro
new file mode 100644
index 0000000..2e79de2
--- /dev/null
+++ b/src/pages/บริการ/รับซื้อ-storage-nas.astro
@@ -0,0 +1,105 @@
+---
+const target = '/บริการ/รับซื้อ-nas';
+const canonical = 'https://amphon.co.th/บริการ/รับซื้อ-nas';
+---
+<!doctype html>
+<html lang="th">
+  <head>
+    <meta charset="utf-8" />
+    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
+    <title>รับซื้อ NAS Storage มือสอง | Amphon Trading</title>
+    <meta
+      name="description"
+      content="กำลังนำท่านไปยังหน้ารับซื้อ NAS และอุปกรณ์จัดเก็บข้อมูลเครือข่ายมือสอง เพื่อประเมินตามสภาพจริง"
+    />
+    <meta name="robots" content="noindex,follow" />
+    <link rel="canonical" href={canonical} />
+    <meta http-equiv="refresh" content={`0;url=${target}`} />
+    <script is:inline>
+      window.location.replace("/บริการ/รับซื้อ-nas");
+    </script>
+    <style>
+      body {
+        font-family: system-ui, -apple-system, sans-serif;
+        background-color: #0f172a;
+        color: #f8fafc;
+        display: flex;
+        align-items: center;
+        justify-content: center;
+        min-height: 100vh;
+        margin: 0;
+        padding: 1.5rem;
+        text-align: center;
+      }
+
+      .card {
+        background-color: #1e293b;
+        border: 1px solid rgba(255, 255, 255, 0.08);
+        border-radius: 1rem;
+        padding: 2.5rem 2rem;
+        max-width: 480px;
+        width: 100%;
+        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
+      }
+
+      h1 {
+        font-size: 1.5rem;
+        margin-top: 0;
+        margin-bottom: 1rem;
+        font-weight: 600;
+        color: #ffffff;
+        overflow-wrap: anywhere;
+      }
+
+      p {
+        color: #94a3b8;
+        font-size: 0.95rem;
+        line-height: 1.5;
+        margin-bottom: 2rem;
+      }
+
+      .btn {
+        display: inline-block;
+        background-color: #0284c7;
+        color: #ffffff;
+        text-decoration: none;
+        padding: 0.75rem 1.5rem;
+        border-radius: 0.5rem;
+        font-weight: 500;
+        transition: background-color 0.2s;
+      }
+
+      .btn:hover {
+        background-color: #0369a1;
+      }
+
+      .spinner {
+        display: inline-block;
+        width: 2.5rem;
+        height: 2.5rem;
+        border: 3px solid rgba(255, 255, 255, 0.1);
+        border-radius: 50%;
+        border-top-color: #0284c7;
+        animation: spin 1s ease-in-out infinite;
+        margin-bottom: 1.5rem;
+      }
+
+      @keyframes spin {
+        to {
+          transform: rotate(360deg);
+        }
+      }
+    </style>
+  </head>
+  <body>
+    <div class="card">
+      <div class="spinner"></div>
+      <h1>กำลังเปลี่ยนเส้นทาง...</h1>
+      <p>
+        ระบบกำลังนำคุณไปยังหน้ารับซื้อ NAS และอุปกรณ์จัดเก็บข้อมูลเครือข่ายมือสอง<br />
+        หากหน้าเว็บไม่เปลี่ยนเส้นทางโดยอัตโนมัติภายใน 2-3 วินาที กรุณาคลิกปุ่มด้านล่าง
+      </p>
+      <a href={target} class="btn">คลิกที่นี่เพื่อไปยังหน้าบริการ</a>
+    </div>
+  </body>
+</html>
```

### 3.7 src/pages/บริการ/รับซื้อเลนส์.astro
```diff
diff --git a/src/pages/บริการ/รับซื้อเลนส์.astro b/src/pages/บริการ/รับซื้อเลนส์.astro
new file mode 100644
index 0000000..3eb51e8
--- /dev/null
+++ b/src/pages/บริการ/รับซื้อเลนส์.astro
@@ -0,0 +1,105 @@
+---
+const target = '/บริการ/รับซื้อเลนส์กล้อง';
+const canonical = 'https://amphon.co.th/บริการ/รับซื้อเลนส์กล้อง';
+---
+<!doctype html>
+<html lang="th">
+  <head>
+    <meta charset="utf-8" />
+    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
+    <title>รับซื้อเลนส์กล้องมือสอง | Amphon Trading</title>
+    <meta
+      name="description"
+      content="กำลังนำท่านไปยังหน้ารับซื้อเลนส์กล้องและอุปกรณ์ถ่ายภาพมือสอง เพื่อประเมินตามสภาพจริง"
+    />
+    <meta name="robots" content="noindex,follow" />
+    <link rel="canonical" href={canonical} />
+    <meta http-equiv="refresh" content={`0;url=${target}`} />
+    <script is:inline>
+      window.location.replace("/บริการ/รับซื้อเลนส์กล้อง");
+    </script>
+    <style>
+      body {
+        font-family: system-ui, -apple-system, sans-serif;
+        background-color: #0f172a;
+        color: #f8fafc;
+        display: flex;
+        align-items: center;
+        justify-content: center;
+        min-height: 100vh;
+        margin: 0;
+        padding: 1.5rem;
+        text-align: center;
+      }
+
+      .card {
+        background-color: #1e293b;
+        border: 1px solid rgba(255, 255, 255, 0.08);
+        border-radius: 1rem;
+        padding: 2.5rem 2rem;
+        max-width: 480px;
+        width: 100%;
+        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
+      }
+
+      h1 {
+        font-size: 1.5rem;
+        margin-top: 0;
+        margin-bottom: 1rem;
+        font-weight: 600;
+        color: #ffffff;
+        overflow-wrap: anywhere;
+      }
+
+      p {
+        color: #94a3b8;
+        font-size: 0.95rem;
+        line-height: 1.5;
+        margin-bottom: 2rem;
+      }
+
+      .btn {
+        display: inline-block;
+        background-color: #0284c7;
+        color: #ffffff;
+        text-decoration: none;
+        padding: 0.75rem 1.5rem;
+        border-radius: 0.5rem;
+        font-weight: 500;
+        transition: background-color 0.2s;
+      }
+
+      .btn:hover {
+        background-color: #0369a1;
+      }
+
+      .spinner {
+        display: inline-block;
+        width: 2.5rem;
+        height: 2.5rem;
+        border: 3px solid rgba(255, 255, 255, 0.1);
+        border-radius: 50%;
+        border-top-color: #0284c7;
+        animation: spin 1s ease-in-out infinite;
+        margin-bottom: 1.5rem;
+      }
+
+      @keyframes spin {
+        to {
+          transform: rotate(360deg);
+        }
+      }
+    </style>
+  </head>
+  <body>
+    <div class="card">
+      <div class="spinner"></div>
+      <h1>กำลังเปลี่ยนเส้นทาง...</h1>
+      <p>
+        ระบบกำลังนำคุณไปยังหน้ารับซื้อเลนส์กล้องและอุปกรณ์ถ่ายภาพมือสอง<br />
+        หากหน้าเว็บไม่เปลี่ยนเส้นทางโดยอัตโนมัติภายใน 2-3 วินาที กรุณาคลิกปุ่มด้านล่าง
+      </p>
+      <a href={target} class="btn">คลิกที่นี่เพื่อไปยังหน้าบริการ</a>
+    </div>
+  </body>
+</html>
```
