# 🚀 دليل النشر السريع على Render

## الخطوات بالتفصيل:

### 1️⃣ إعداد Environment Variable على Render

**مهم جداً:** قبل نشر السيرفر، يجب إضافة مفتاح OpenAI API:

1. اذهب إلى لوحة تحكم Render
2. اختر Web Service الخاص بك: `my-cordova-api-new`
3. اذهب إلى تبويب **Environment**
4. اضغط **Add Environment Variable**
5. أضف:
   - **Key:** `OPENAI_API_KEY`
   - **Value:** `sk-proj-...` (مفتاحك الفعلي من OpenAI)
6. اضغط **Save Changes**

### 2️⃣ التحقق من إعدادات Build

في تبويب **Settings**، تأكد من:

- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Node Version:** 18 أو أحدث

### 3️⃣ إعادة النشر

بعد إضافة Environment Variable:
1. اذهب إلى تبويب **Manual Deploy**
2. اضغط **Deploy latest commit**
3. انتظر حتى ينتهي النشر (2-3 دقائق)

### 4️⃣ التحقق من نجاح النشر

افتح المتصفح واذهب إلى:
```
https://my-cordova-api-new.onrender.com/config
```

يجب أن ترى:
```json
{
  "baseURL": "https://my-cordova-api-new.onrender.com",
  "adsURL": "https://opensheet.elk.sh/..."
}
```

### 5️⃣ اختبار Endpoint التحليل

استخدم Postman أو curl:

```bash
curl -X POST https://my-cordova-api-new.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "base64Image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "language": "ar"
  }'
```

### 6️⃣ مراقبة الأخطاء

في تبويب **Logs** على Render، تحقق من:
- ✅ `API Running on port 10000`
- ✅ لا توجد أخطاء حمراء
- ❌ إذا رأيت `OPENAI_API_KEY is not configured` - ارجع للخطوة 1

---

## ⚠️ أخطاء شائعة وحلولها

### خطأ: "Application failed to respond"
**السبب:** السيرفر لا يعمل  
**الحل:** تحقق من Logs - غالباً مشكلة في Environment Variable

### خطأ: "Build failed"
**السبب:** مشكلة في package.json  
**الحل:** تأكد من وجود `"type": "module"` في package.json

### خطأ: "Cannot find module 'express'"
**السبب:** Dependencies لم تُثبّت  
**الحل:** تأكد من Build Command: `npm install`

---

## 📋 Checklist قبل النشر

- [ ] مفتاح OpenAI API جاهز
- [ ] تم رفع الكود إلى GitHub
- [ ] تم ربط Render بـ GitHub
- [ ] تم إضافة OPENAI_API_KEY في Environment
- [ ] تم اختبار /config endpoint
- [ ] تم اختبار /analyze endpoint
- [ ] لا توجد أخطاء في Logs

---

## 🎯 بعد النشر الناجح

قم بتحديث التطبيق (Frontend) للتأكد من استخدام الرابط الصحيح:

في ملف `www/services/geminiService.ts`:
```typescript
const API_BASE_URL = "https://my-cordova-api-new.onrender.com";
```

---

**ملاحظة:** Render قد يستغرق 30-50 ثانية للرد على أول طلب بعد فترة عدم نشاط (Free Plan).
