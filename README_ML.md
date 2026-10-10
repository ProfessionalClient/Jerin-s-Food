# ജെറിന്റെ കട — Live Online POS

ഈ പ്രോജക്റ്റ് പഴയ single-HTML പതിപ്പിൽ നിന്ന് വ്യത്യസ്തമാണ്. **ഓർഡറുകൾ ഒരേ ഓൺലൈൻ PostgreSQL ഡാറ്റാബേസിൽ സേവ് ചെയ്യുന്നു**, അതിനാൽ മറ്റൊരു ഫോണിൽ നിന്ന് ഉപഭോക്താവ് ഓർഡർ നൽകിയാലും കട ഉടമയുടെ `/admin` പേജിൽ അത് കാണാം.

## പ്രധാന ഫീച്ചറുകൾ
- മലയാളം/English ഭക്ഷണ മെനു, category/search/sort, ഫോട്ടോകൾ
- കാർട്ടിൽ quantity കൂട്ടുക/കുറയ്ക്കുക; server-side വില വീണ്ടും പരിശോധിക്കുന്നു
- ഓരോ ഓർഡറിനും unique `JK-YYYYMMDD-XXXXXXXX` കോഡ്
- കസ്റ്റമർ പേര്/ഫോൺ/പ്രത്യേക നിർദ്ദേശം, table/takeaway/delivery
- ഓർഡർ കോഡ് ഉപയോഗിച്ച് ബിൽ തുറക്കൽ
- admin password login, എല്ലാ ഉപഭോക്തൃ ഓർഡറുകളും, status മാറ്റൽ
- PDF download, print/save as PDF, CSV export
- PostgreSQL-ൽ order data നിലനിൽക്കും; browser Local Storage-നെ ആശ്രയിക്കുന്നില്ല

## ഓൺലൈനിൽ publish ചെയ്യാൻ ആവശ്യമായത്
1. GitHub account (project code സൂക്ഷിക്കാൻ)
2. Supabase project (PostgreSQL database)
3. Render account (website/server host ചെയ്യാൻ)

ഇവിടെ നിന്ന് നിങ്ങളുടെ അക്കൗണ്ടുകളിൽ നേരിട്ട് deploy ചെയ്യാൻ കഴിയില്ല; അക്കൗണ്ടുകൾ നിങ്ങളുടേതായതിനാൽ നിങ്ങൾ തന്നെ connect ചെയ്യണം.

## ഘട്ടം 1 — Supabase database
1. Supabase-ൽ പുതിയ project സൃഷ്ടിക്കുക.
2. Database password സുരക്ഷിതമായി സൂക്ഷിക്കുക.
3. Project-ൽ **Connect** തുറന്ന് PostgreSQL connection string copy ചെയ്യുക. Direct connection ലഭ്യമല്ലെങ്കിൽ **Session pooler** string ഉപയോഗിക്കുക.
4. `server.js` ആദ്യമായി start ആകുമ്പോൾ `orders` table സ്വയം സൃഷ്ടിക്കും. SQL editor-ൽ വേറെ SQL paste ചെയ്യേണ്ടതില്ല.

## ഘട്ടം 2 — GitHub-ൽ code ഇടുക
1. ZIP unzip ചെയ്യുക.
2. GitHub-ൽ പുതിയ **private repository** ഉണ്ടാക്കുക (code public ആക്കേണ്ടതില്ല).
3. ZIP-ൽ ഉള്ള ഫയലുകൾ repository root-ലേക്ക് upload/commit ചെയ്യുക. `node_modules` upload ചെയ്യേണ്ടതില്ല.
4. `.env` അല്ലെങ്കിൽ യഥാർത്ഥ database password GitHub-ലേക്ക് upload ചെയ്യരുത്.

## ഘട്ടം 3 — Render-ൽ website deploy ചെയ്യുക
1. Render Dashboard തുറന്ന് **New → Web Service** തിരഞ്ഞെടുക്കുക.
2. GitHub repository connect ചെയ്യുക.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Environment Variables ചേർക്കുക:
   - `DATABASE_URL` = Supabase-ൽ നിന്ന് copy ചെയ്ത connection string
   - `ADMIN_PASSWORD` = കടയുടെ admin page-നുള്ള ശക്തമായ password
   - `SESSION_SECRET` = കുറഞ്ഞത് 32 characters ഉള്ള random secret
   - `NODE_ENV` = `production`
6. Deploy ചെയ്യുക. Render നൽകിയ `https://...onrender.com` URL നിങ്ങളുടെ order website ആണ്.
7. കട ഉടമയുടെ dashboard: അതേ URL-ന്റെ അവസാനം `/admin` ചേർക്കുക.

Render free web service inactivity കഴിഞ്ഞ് sleep ആകാം; ആദ്യ request വരുമ്പോൾ വീണ്ടും start ആകാൻ കുറച്ച് സമയം എടുക്കാം. Production-ൽ സ്ഥിരമായി ലഭ്യമാക്കാൻ hosting plan-ന്റെ നിലവിലെ പരിധികൾ പരിശോധിക്കുക.

## ഘട്ടം 4 — പരിശോധിക്കേണ്ടത്
1. Customer URL മറ്റൊരു ഫോണിൽ തുറക്കുക, ഭക്ഷണം ചേർത്ത് test order നൽകുക.
2. ലഭിച്ച order code copy කරുക.
3. Owner phone-ൽ `...onrender.com/admin` തുറന്ന് admin password ഉപയോഗിച്ച് login ചെയ്യുക.
4. Refresh ചെയ്താൽ test order list-ൽ കാണണം; order details, status, PDF, CSV എന്നിവ പരിശോധിക്കുക.
5. Test order കഴിഞ്ഞ് menu prices-ஐ உண்மையான கடை விலைக்கு மாற்றவும். `server.js`-ലെ `menu` array-ൽ `price` values edit செய்து GitHub-க்கு commit செய்தால் Render redeploy ஆகும்.

## உணவு படங்கள் குறித்த குறிப்பு
இந்த version-ல் ஒவ்வொரு menu item-க்கும் தனித்த image URL மற்றும் `alt` label கொடுக்கப்பட்டுள்ளது; image URL load ஆகாவிட்டால் fallback placeholder வரும். இவை remote images; internet தேவை. Public use-க்கு முன் ஒவ்வொரு photo-வும் சரியான dish-ஐ காட்டுகிறதா என்பதைச் சரிபார்க்கவும். Restaurant-specific rates-ஐ நான் live-ஆக உறுதிப்படுத்தவில்லை; இவை Kerala restaurant-க்கான தொடக்க மதிப்பீடுகள் மட்டுமே.

## பாதுகாப்பு
- Admin password, `DATABASE_URL`, `SESSION_SECRET` ஆகியவற்றை யாரிடமும் பகிர வேண்டாம்.
- `.env`-ஐ GitHub-க்கு upload செய்ய வேண்டாம்.
- இந்த starter app customer order creation-ஐ public-ஆக அனுமதிக்கிறது; admin listing/status update password-protected.
