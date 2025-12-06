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

// ✅ 3. التحقق من مفتاح OpenAI من متغيرات البيئة
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('⚠️ WARNING: OPENAI_API_KEY is not set in environment variables!');
} else {
  console.log('✅ OpenAI API Key loaded from environment');
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
    const adsHandler = require('./ads');
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
    const doctorHandler = require('./doctor');
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
    const analyzeHandler = require('./analyze');
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
