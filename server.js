const express = require('express');
const cors = require('cors');
const path = require('path');

// تحميل متغيرات البيئة محلياً (للتطوير فقط)
// على Render يتم تحميلها تلقائياً
try {
  require('dotenv').config();
} catch (e) {
  // ignore if dotenv is not installed
}

const app = express();

// ✅ 1. تفعيل CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ 2. إعداد Body Parser
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ 3. تحميل OpenAI API Key
let OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// إذا لم يوجد في البيئة، نحاول قراءته من ملف api/openai.json
if (!OPENAI_API_KEY) {
  try {
    const fs = require('fs');
    // محاولة الوصول للملف في مسار api/openai.json بالنسبة للمجلد الحالي
    const keyPath = path.resolve(__dirname, 'api', 'openai.json');

    if (fs.existsSync(keyPath)) {
      console.log(`🔍 Found key file at: ${keyPath}`);
      const fileContent = fs.readFileSync(keyPath, 'utf8');
      const keyData = JSON.parse(fileContent);

      // دعم عدة صيغ للمفتاح داخل الملف
      OPENAI_API_KEY = keyData.OPENAI_API_KEY || keyData.apiKey || keyData.key;

      if (OPENAI_API_KEY) {
        console.log('✅ OpenAI API Key loaded from api/openai.json');
      }
    } else {
      // محاولة مسار بديل (في نفس المجلد)
      const altPath = path.resolve(__dirname, 'openai.json');
      if (fs.existsSync(altPath)) {
        const fileContent = fs.readFileSync(altPath, 'utf8');
        const keyData = JSON.parse(fileContent);
        OPENAI_API_KEY = keyData.OPENAI_API_KEY || keyData.apiKey;
        if (OPENAI_API_KEY) console.log('✅ OpenAI API Key loaded from openai.json (root)');
      }
    }
  } catch (error) {
    console.warn('⚠️ Error reading openai.json:', error.message);
  }
}

if (!OPENAI_API_KEY) {
  console.warn('❌ WARNING: OPENAI_API_KEY is missing! Chat and Analyze features will fail.');
} else {
  // تنظيف المفتاح من أي مسافات زائدة
  OPENAI_API_KEY = OPENAI_API_KEY.trim();
}

// ==================== ROUTES ====================

// ✅ GET / - حالة السيرفر
app.get('/', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    status: 'running',
    message: 'Cordova API Server is ready (Env Mode)',
    port: process.env.PORT || 10000
  });
});

// ✅ GET /config - الإعدادات العامة
app.get('/config', (req, res) => {
  try {
    // يمكن قراءة config.json للإعدادات العامة غير الحساسة
    // أو إرجاع قيم ثابتة
    const configPath = path.join(__dirname, 'config.json');
    let config = {};

    try {
      const fs = require('fs');
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (e) {
      console.warn('Config file not found or invalid');
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...config,
      // نضمن أن baseURL يأتي من البيئة إذا وجد
      baseURL: process.env.BASE_URL || config.baseURL || 'https://my-cordova.onrender.com'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Failed to load config'
    });
  }
});

// ✅ GET /ads - الإعلانات
app.get('/ads', async (req, res) => {
  try {
    const adsHandler = require('./server-handlers/ads.handler');
    await adsHandler(req, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Failed to load ads',
      details: error.message
    });
  }
});

// ✅ GET /doctor - للاختبار فقط (يعرض معلومات عن الـ endpoint)
app.get('/doctor', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    message: 'Doctor AI Endpoint is working!',
    info: {
      method: 'POST',
      description: 'Send questions to plant doctor AI',
      requiredFields: {
        question: 'string (required)',
        language: 'string (ar or en, optional, default: ar)',
        history: 'array (optional, chat history)'
      },
      example: {
        question: 'ما هو أفضل وقت لري النباتات؟',
        language: 'ar'
      }
    }
  });
});

// ✅ POST /doctor - الدردشة
app.post('/doctor', async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Server Configuration Error',
      message: 'OPENAI_API_KEY is missing on server.'
    });
  }

  try {
    const doctorHandler = require('./server-handlers/doctor.handler');
    await doctorHandler(req, res, OPENAI_API_KEY);
  } catch (error) {
    console.error('Doctor Route Error:', error);
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Sorry, chat service is currently unavailable.',
      details: error.message
    });
  }
});

// ✅ GET /analyze - للاختبار فقط
app.get('/analyze', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    message: 'Plant Analysis Endpoint is working!',
    info: {
      method: 'POST',
      description: 'Analyze plant images using AI',
      requiredFields: {
        base64Image: 'string (required, base64 encoded image)',
        language: 'string (ar or en, optional, default: ar)'
      },
      example: {
        base64Image: 'data:image/jpeg;base64,/9j/4AAQSkZJ...',
        language: 'ar'
      }
    }
  });
});

// ✅ POST /analyze - تحليل الصور
app.post('/analyze', async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Server Configuration Error',
      message: 'OPENAI_API_KEY is missing on server.'
    });
  }

  try {
    const analyzeHandler = require('./server-handlers/analyze.handler');
    await analyzeHandler(req, res, OPENAI_API_KEY);
  } catch (error) {
    console.error('Analyze Route Error:', error);
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Failed to analyze image. Please try again.',
      details: error.message
    });
  }
});

// ✅ GET /api/diagnose - للاختبار فقط
app.get('/api/diagnose', (req, res) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    message: 'Plant Diagnosis Endpoint is working!',
    info: {
      method: 'POST',
      description: 'Diagnose plant diseases using AI (same as /analyze)',
      requiredFields: {
        base64Image: 'string (required, base64 encoded image)',
        language: 'string (ar or en, optional, default: ar)'
      }
    }
  });
});

// ✅ POST /api/diagnose - تحليل الصور (نفس /analyze لكن مع مسار مختلف للتوافق مع التطبيق)
app.post('/api/diagnose', async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Server Configuration Error',
      message: 'OPENAI_API_KEY is missing on server.'
    });
  }

  try {
    const analyzeHandler = require('./server-handlers/analyze.handler');
    await analyzeHandler(req, res, OPENAI_API_KEY);
  } catch (error) {
    console.error('Analyze Route Error:', error);
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: 'Failed to analyze image. Please try again.',
      details: error.message
    });
  }
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    timestamp: new Date().toISOString(),
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

// ✅ Start Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
