# Plant Doctor API Server

## 📋 نظرة عامة

هذا هو السيرفر الخلفي لتطبيق Plant Doctor. يوفر endpoints للتحليل بالذكاء الاصطناعي والدردشة مع طبيب النباتات.

## 🚀 التثبيت والتشغيل المحلي

### المتطلبات
- Node.js 18 أو أحدث
- مفتاح OpenAI API

### خطوات التشغيل

1. **تثبيت المكتبات:**
```bash
cd www/my-cordova-api-new
npm install
```

2. **إعداد متغيرات البيئة:**
قم بإنشاء ملف `.env` في نفس المجلد:
```env
OPENAI_API_KEY=sk-your-actual-openai-key-here
PORT=10000
```

3. **تشغيل السيرفر:**
```bash
npm start
```

أو للتطوير مع auto-reload:
```bash
npm run dev
```

## 🌐 النشر على Render

### الخطوات:

1. **رفع الكود إلى GitHub:**
   - قم بإنشاء repository جديد
   - ارفع مجلد `my-cordova-api-new` كاملاً

2. **إنشاء Web Service على Render:**
   - اذهب إلى [render.com](https://render.com)
   - اضغط "New +" → "Web Service"
   - اربط GitHub repository الخاص بك
   - اختر المجلد: `my-cordova-api-new`

3. **إعدادات Render:**
   - **Name:** my-cordova-api-new
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

4. **إضافة Environment Variables:**
   في قسم "Environment" أضف:
   ```
   OPENAI_API_KEY = sk-your-actual-key-here
   ```

5. **Deploy:**
   اضغط "Create Web Service" وانتظر حتى ينتهي النشر

## 📡 API Endpoints

### 1. GET /config
يرجع إعدادات التطبيق الأساسية.

**Response:**
```json
{
  "baseURL": "https://my-cordova-api-new.onrender.com",
  "adsURL": "https://opensheet.elk.sh/..."
}
```

### 2. GET /ads
يرجع إعدادات الإعلانات.

**Response:**
```json
{
  "admob_banner": "",
  "admob_interstitial": "",
  "meta_banner": "",
  "meta_interstitial": ""
}
```

### 3. POST /analyze
تحليل صورة النبات باستخدام OpenAI.

**Request:**
```json
{
  "base64Image": "data:image/jpeg;base64,...",
  "language": "ar"
}
```

**Response:**
```json
{
  "plantName": "طماطم",
  "healthStatus": "Diseased",
  "diseaseName": "اللفحة المبكرة",
  "description": "وصف تفصيلي...",
  "treatment": ["خطوة 1", "خطوة 2"],
  "prevention": ["نصيحة 1", "نصيحة 2"],
  "confidence": 0.92
}
```

### 4. POST /doctor
الدردشة مع طبيب النباتات الذكي.

**Request:**
```json
{
  "question": "كيف أعتني بنبات الصبار؟",
  "language": "ar",
  "history": [
    {"role": "user", "text": "سؤال سابق"},
    {"role": "model", "text": "إجابة سابقة"}
  ]
}
```

**Response:**
```json
{
  "answer": "نبات الصبار يحتاج إلى...",
  "success": true
}
```

## 🔒 الأمان

### ⚠️ مهم جداً:
- **لا تضع** مفتاح OpenAI API في الكود مباشرة
- **استخدم** Environment Variables دائماً
- **لا ترفع** ملف `.env` إلى GitHub
- **أضف** `.env` إلى `.gitignore`

### ملف .gitignore المقترح:
```
node_modules/
.env
*.log
.DS_Store
```

## 🐛 استكشاف الأخطاء

### خطأ: "OPENAI_API_KEY is not configured"
**الحل:** تأكد من إضافة المفتاح في Environment Variables على Render.

### خطأ: "Cannot find module"
**الحل:** قم بتشغيل `npm install` مرة أخرى.

### خطأ: "Port already in use"
**الحل:** غيّر PORT في `.env` إلى رقم آخر (مثل 3000 أو 8080).

### خطأ: "Failed to load config"
**الحل:** تأكد من وجود ملف `api/config.json` في المكان الصحيح.

## 📊 المراقبة والـ Logs

### على Render:
1. اذهب إلى Dashboard
2. اختر Web Service الخاص بك
3. اضغط على "Logs" لرؤية السجلات المباشرة

### محلياً:
جميع الأخطاء والرسائل تظهر في Console.

## 🔄 التحديثات

عند تحديث الكود:
1. ارفع التغييرات إلى GitHub
2. Render سيقوم بإعادة النشر تلقائياً
3. تحقق من Logs للتأكد من نجاح النشر

## 📞 الدعم

إذا واجهت مشاكل:
1. تحقق من Logs على Render
2. تأكد من صحة Environment Variables
3. اختبر Endpoints باستخدام Postman أو curl

## 🧪 اختبار الـ API

### باستخدام curl:

**اختبار /config:**
```bash
curl https://my-cordova-api-new.onrender.com/config
```

**اختبار /analyze:**
```bash
curl -X POST https://my-cordova-api-new.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -d '{"base64Image":"data:image/jpeg;base64,/9j/4AAQ...", "language":"ar"}'
```

**اختبار /doctor:**
```bash
curl -X POST https://my-cordova-api-new.onrender.com/doctor \
  -H "Content-Type: application/json" \
  -d '{"question":"كيف أعتني بالنباتات؟", "language":"ar"}'
```

## 📝 ملاحظات

- السيرفر يستخدم ES Modules (`type: "module"`)
- جميع الملفات بصيغة `.js` وليس `.mjs`
- CORS مفعّل للسماح بالطلبات من أي مصدر
- حد أقصى لحجم JSON: 20MB (للصور الكبيرة)

## 🎯 الخطوات التالية

- [ ] إضافة Rate Limiting لمنع الإساءة
- [ ] إضافة Caching للنتائج المتكررة
- [ ] إضافة Authentication للـ API
- [ ] إضافة Database لحفظ السجلات
- [ ] إضافة Monitoring (مثل Sentry)

---

**تاريخ آخر تحديث:** 2025-12-04  
**الإصدار:** 1.0.0
