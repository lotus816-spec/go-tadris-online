# نشر منصة تدريس الحقيقية على Vercel (مجاني)

GitHub Pages يعرض صفحة ثابتة فقط. التطبيق الكامل يحتاج خادماً → Vercel.

## 1. قاعدة بيانات مجانية (Neon)
1. سجّل في `neon.tech` بحساب GitHub.
2. أنشئ مشروعاً → انسخ **Connection string** (يبدأ بـ `postgresql://`).
3. أضف `?sslmode=require` لنهايته إن لم يكن موجوداً → هذا هو `DATABASE_URL`.

## 2. النشر على Vercel
1. سجّل في `vercel.com` بحساب GitHub (`lotus816-spec`).
2. **Add New → Project** → اختر `go-tadris-online` → **Import**.
3. في **Environment Variables** أضف:
   - `DATABASE_URL` = رابط Neon
   - `NEXTAUTH_SECRET` = أي نص عشوائي طويل (32+ حرفاً)
   - `NEXTAUTH_URL` = اتركه مؤقتاً `http://localhost:3000`
   - `APP_URL` = اتركه مؤقتاً `http://localhost:3000`
4. **Deploy** → ستحصل على رابط مثل `go-tadris-online.vercel.app`.
5. ارجع لـ **Settings → Environment Variables** وحدّث `NEXTAUTH_URL` و `APP_URL` إلى رابط Vercel ثم **Redeploy**.

## 3. إنشاء الجداول (مرة واحدة)
من جهازك بعد تثبيت Node.js:
```bash
git clone https://github.com/lotus816-spec/go-tadris-online.git
cd go-tadris-online
npm install
$env:DATABASE_URL="postgresql://..."   # رابط Neon
npx prisma db push
npm run db:seed
```

## 4. الدخول
- المدير: `admin@tadris.dz` / `Admin123!`
- المعلم: `teacher@tadris.dz` / `Teacher123!`
- غيّر كلمتي السر فوراً بعد أول دخول.
