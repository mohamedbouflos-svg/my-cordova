# 🌱 Cordova API Server - Plant Doctor

سيرفر API خلفي لتطبيق Plant Doctor يعمل على **Render** ويستخدم **OpenAI GPT-4o** لتحليل النباتات والدردشة الذكية.

---

## 📋 المميزات

✅ **تحليل الصور** - تحليل صور النباتات باستخدام OpenAI Vision API  
✅ **الدردشة الذكية** - طبيب نباتات ذكي يجيب على جميع الأسئلة  
✅ **الإعلانات** - جلب إعدادات الإعلانات من Google Sheets  
✅ **متعدد اللغات** - دعم العربية والإنجليزية  
✅ **آمن** - لا يحتوي على API Keys في الكود  

---

## 🚀 التثبيت والتشغيل

### 1️⃣ تثبيت Dependencies

```bash
npm install
```

### 2️⃣ إعداد OpenAI API Key

**الطريقة الأولى: استخدام ملف `openai.json`**

افتح ملف `openai.json` وضع مفتاح API الخاص بك:

```json
{
  "apiKey": "sk-proj-YOUR_ACTUAL_API_KEY_HERE"
}
```

**الطريقة الثانية: استخدام Environment Variables (مُفضّل لـ Render)**

```bash
export OPENAI_API_KEY=sk-proj-your-api-key-here
```

### 3️⃣ تشغيل السيرفر محلياً

```bash
npm start
```

السيرفر سيعمل على: `http://localhost:10000`

---

## 🌐 النشر على Render

### الخطوات:

1. **رفع الكود إلى GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **إنشاء Web Service على Render**
   - اذهب إلى [Render Dashboard](https://dashboard.render.com/)
   - اضغط على **New** → **Web Service**
   - اربط حساب GitHub واختر المستودع
   - اختر المجلد: `www/my-cordova-api-new`

3. **إعدادات Render**
   - **Name**: `my-cordova`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

4. **إضافة Environment Variables**
   في قسم **Environment**، أضف:
   ```
   OPENAI_API_KEY = sk-proj-your-actual-api-key-here
   ```

5. **Deploy**
   اضغط على **Create Web Service** وانتظر حتى ينتهي النشر.

6. **الرابط النهائي**
   ```
   https://my-cordova.onrender.com
   ```

---

## 📡 API Endpoints

### 1. **GET /** - حالة السيرفر
```bash
curl https://my-cordova.onrender.com/
```

**Response:**
```json
{
  "status": "running",
  "message": "Cordova API Server is running successfully",
  "version": "2.0.0",
  "endpoints": {
    "config": "GET /config",
    "ads": "GET /ads",
    "doctor": "POST /doctor",
    "analyze": "POST /analyze"
  }
}
```

---

### 2. **GET /config** - إعدادات التطبيق
```bash
curl https://my-cordova.onrender.com/config
```

**Response:**
```json
{
  "baseURL": "https://my-cordova.onrender.com",
  "adsURL": "https://opensheet.elk.sh/...",
  "apiVersion": "2.0.0",
  "supportedLanguages": ["ar", "en"]
}
```

---

### 3. **GET /ads** - الإعلانات
```bash
curl https://my-cordova.onrender.com/ads
```

**Response:**
```json
{
  "admob_banner": "ca-app-pub-xxx",
  "admob_interstitial": "ca-app-pub-xxx",
  "meta_banner": "xxx",
  "meta_interstitial": "xxx"
}
```

---

### 4. **POST /doctor** - الدردشة مع Doctor AI
```bash
curl -X POST https://my-cordova.onrender.com/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "question": "كيف أعتني بنبات الورد؟",
    "language": "ar"
  }'
```

**Response:**
```json
{
  "answer": "للعناية بنبات الورد، اتبع الخطوات التالية...",
  "success": true,
  "timestamp": "2025-12-06T10:00:00.000Z"
}
```

---

### 5. **POST /analyze** - تحليل الصور
```bash
curl -X POST https://my-cordova.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "base64Image": "data:image/jpeg;base64,/9j/4AAQ...",
    "language": "ar"
  }'
```

**Response:**
```json
{
  "plantName": "نبات الطماطم",
  "healthStatus": "Diseased",
  "diseaseName": "اللفحة المتأخرة",
  "description": "النبات مصاب باللفحة المتأخرة...",
  "symptoms": ["بقع بنية على الأوراق", "ذبول الأوراق"],
  "causes": ["رطوبة عالية", "سوء التهوية"],
  "treatment": ["إزالة الأوراق المصابة", "رش مبيد فطري"],
  "prevention": ["تحسين التهوية", "تقليل الري"],
  "severity": "High",
  "confidence": 0.92,
  "success": true
}
```

---

## 🔧 استكشاف الأخطاء

### ❌ خطأ: "API Key not configured"
**الحل:**
- تأكد من إضافة `OPENAI_API_KEY` في Environment Variables على Render
- أو ضع المفتاح في ملف `openai.json`

### ❌ خطأ: "Failed to load config"
**الحل:**
- تأكد من وجود ملف `config.json` في نفس المجلد

### ❌ خطأ: "Cannot GET /doctor"
**الحل:**
- `/doctor` هو POST endpoint وليس GET
- استخدم POST request مع body

### ❌ خطأ: "Chat service is currently unavailable"
**الحل:**
- تحقق من صحة OpenAI API Key
- تأكد من وجود رصيد في حساب OpenAI

---

## 📁 هيكل الملفات

```
my-cordova-api-new/
├── server.js          # السيرفر الرئيسي
├── doctor.js          # معالج الدردشة
├── analyze.js         # معالج تحليل الصور
├── ads.js             # معالج الإعلانات
├── config.json        # إعدادات التطبيق
├── openai.json        # إعدادات OpenAI
├── ads.json           # إعلانات محلية (احتياطي)
├── package.json       # Dependencies
├── .env.example       # مثال للمتغيرات البيئية
└── README.md          # هذا الملف
```

---

## 🔐 الأمان

⚠️ **مهم جداً:**
- **لا تضع** API Keys في الكود أبداً
- استخدم Environment Variables على Render
- لا ترفع ملف `.env` إلى GitHub
- أضف `.env` إلى `.gitignore`

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. تحقق من Logs على Render Dashboard
2. تأكد من صحة OpenAI API Key
3. تأكد من وجود رصيد في حساب OpenAI
4. راجع قسم استكشاف الأخطاء أعلاه

---

## 📝 الترخيص

MIT License - مفتوح المصدر

---

**صُنع بـ ❤️ لتطبيق Plant Doctor**
