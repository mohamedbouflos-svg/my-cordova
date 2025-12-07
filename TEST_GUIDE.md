# 🧪 دليل اختبار السيرفر

## ✅ **الآن يمكنك اختبار السيرفر عبر المتصفح!**

### **1️⃣ اختبار الصفحة الرئيسية**
افتح في المتصفح:
```
https://my-cordova.onrender.com/
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "timestamp": "2025-12-06T...",
  "status": "running",
  "message": "Cordova API Server is ready (Env Mode)",
  "port": 10000
}
```

---

### **2️⃣ اختبار endpoint الدردشة**
افتح في المتصفح:
```
https://my-cordova.onrender.com/doctor
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "timestamp": "2025-12-06T...",
  "message": "Doctor AI Endpoint is working!",
  "info": {
    "method": "POST",
    "description": "Send questions to plant doctor AI",
    "requiredFields": {...},
    "example": {...}
  }
}
```

---

### **3️⃣ اختبار endpoint تحليل الصور**
افتح في المتصفح:
```
https://my-cordova.onrender.com/analyze
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "timestamp": "2025-12-06T...",
  "message": "Plant Analysis Endpoint is working!",
  "info": {
    "method": "POST",
    "description": "Analyze plant images using AI",
    "requiredFields": {...}
  }
}
```

---

### **4️⃣ اختبار endpoint التشخيص البديل**
افتح في المتصفح:
```
https://my-cordova.onrender.com/api/diagnose
```

**النتيجة المتوقعة:**
نفس النتيجة السابقة (لأنه نفس الوظيفة)

---

### **5️⃣ اختبار الإعلانات**
افتح في المتصفح:
```
https://my-cordova.onrender.com/ads
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "timestamp": "2025-12-06T...",
  "admob_banner": "...",
  "admob_interstitial": "...",
  "meta_banner": "...",
  "meta_interstitial": "..."
}
```

---

### **6️⃣ اختبار الإعدادات**
افتح في المتصفح:
```
https://my-cordova.onrender.com/config
```

**النتيجة المتوقعة:**
```json
{
  "success": true,
  "timestamp": "2025-12-06T...",
  "baseURL": "https://my-cordova.onrender.com",
  "version": "1.0.0",
  "maintenance_mode": false
}
```

---

## 📝 **ملاحظات مهمة**

### ✅ **GET vs POST**

- **GET**: للاختبار عبر المتصفح فقط
  - يعرض معلومات عن الـ endpoint
  - لا يقوم بأي عمليات فعلية

- **POST**: للاستخدام الفعلي من التطبيق
  - يجب إرسال البيانات في body
  - يقوم بالعمليات الفعلية (دردشة، تحليل)

---

## 🔧 **كيفية اختبار POST endpoints**

### **استخدم أدوات مثل:**

1. **Postman** (برنامج)
2. **Thunder Client** (امتداد VS Code)
3. **curl** (سطر الأوامر)

### **مثال: اختبار الدردشة باستخدام curl**
```bash
curl -X POST https://my-cordova.onrender.com/doctor \
  -H "Content-Type: application/json" \
  -d '{
    "question": "ما هو أفضل وقت لري النباتات؟",
    "language": "ar"
  }'
```

### **مثال: اختبار التحليل**
```bash
curl -X POST https://my-cordova.onrender.com/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "base64Image": "data:image/jpeg;base64,/9j/4AAQ...",
    "language": "ar"
  }'
```

---

## 🎯 **خلاصة**

| Endpoint | GET (اختبار) | POST (فعلي) |
|----------|-------------|-------------|
| `/` | ✅ يعمل | ❌ غير متاح |
| `/config` | ✅ يعمل | ❌ غير متاح |
| `/ads` | ✅ يعمل | ❌ غير متاح |
| `/doctor` | ✅ يعمل (معلومات) | ✅ يعمل (دردشة) |
| `/analyze` | ✅ يعمل (معلومات) | ✅ يعمل (تحليل) |
| `/api/diagnose` | ✅ يعمل (معلومات) | ✅ يعمل (تحليل) |

---

## ✨ **الآن جرب!**

1. ✅ افتح المتصفح
2. ✅ اذهب إلى: `https://my-cordova.onrender.com/doctor`
3. ✅ يجب أن ترى رسالة نجاح: `"Doctor AI Endpoint is working!"`

**إذا رأيت هذه الرسالة، فالسيرفر يعمل بشكل صحيح!** 🎉
