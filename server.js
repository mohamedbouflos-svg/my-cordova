const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

// ✅ تفعيل CORS لجميع الطلبات
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ زيادة حجم body لقبول الصور الكبيرة (50MB)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// ✅ تسجيل جميع الطلبات للتتبع
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ✅ قراءة مفتاح OpenAI من openai.json
let OPENAI_API_KEY = null;
try {
  const openaiConfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'openai.json'), 'utf8'));
  OPENAI_API_KEY = openaiConfig.apiKey || process.env.OPENAI_API_KEY;
  console.log('✅ OpenAI API Key loaded successfully');
} catch (error) {
  console.warn('⚠️ Warning: openai.json not found, using environment variable');
  OPENAI_API_KEY = process.env.OPENAI_API_KEY;
}

// ==================== ROUTES ====================

// ✅ GET / - حالة السيرفر
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'Cordova API Server is running successfully',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    endpoints: {
      config: 'GET /config',
      ads: 'GET /ads',
      doctor: 'POST /doctor',
      analyze: 'POST /analyze'
    }
  });
});

// ✅ GET /config - إعدادات التطبيق
app.get('/config', (req, res) => {
  try {
    const configPath = path.join(__dirname, 'config.json');

    if (!fs.existsSync(configPath)) {
      return res.status(404).json({
        error: 'Config file not found',
        message: 'config.json does not exist'
      });
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    console.log('✅ Config loaded successfully');
    res.json(config);
  } catch (error) {
    console.error('❌ Config error:', error.message);
    res.status(500).json({
      error: 'Failed to load config',
      details: error.message
    });
  }
});

// ✅ GET /ads - جلب الإعلانات من Google Sheets
app.get('/ads', async (req, res) => {
  try {
    const adsHandler = require('./ads');
    await adsHandler(req, res);
  } catch (error) {
    console.error('❌ Ads error:', error.message);
    res.status(500).json({
      error: 'Failed to load ads',
      details: error.message
    });
  }
});

// ✅ POST /doctor - الدردشة مع Doctor AI
app.post('/doctor', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'API Key not configured',
        message: 'OpenAI API Key is missing. Please configure it in openai.json or environment variables.'
      });
    }

    const doctorHandler = require('./doctor');
    await doctorHandler(req, res, OPENAI_API_KEY);
  } catch (error) {
    console.error('❌ Doctor AI error:', error.message);
    res.status(500).json({
      error: 'Chat service is currently unavailable',
      details: error.message
    });
  }
});

// ✅ POST /analyze - تحليل الصور
app.post('/analyze', async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({
        error: 'API Key not configured',
        message: 'OpenAI API Key is missing. Please configure it in openai.json or environment variables.'
      });
    }

    const analyzeHandler = require('./analyze');
    await analyzeHandler(req, res, OPENAI_API_KEY);
  } catch (error) {
    console.error('❌ Analyze error:', error.message);
    res.status(500).json({
      error: 'Failed to analyze image. Please try again.',
      details: error.message
    });
  }
});

// ✅ معالجة المسارات غير الموجودة (404)
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`,
    availableEndpoints: {
      root: 'GET /',
      config: 'GET /config',
      ads: 'GET /ads',
      doctor: 'POST /doctor',
      analyze: 'POST /analyze'
    }
  });
});

// ✅ معالجة الأخطاء العامة
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: error.message
  });
});

// ✅ تشغيل السيرفر
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log('🚀 Cordova API Server Started Successfully!');
  console.log('='.repeat(50));
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🌐 Base URL: http://localhost:${PORT}`);
  console.log(`🔑 OpenAI API Key: ${OPENAI_API_KEY ? '✅ Loaded' : '❌ Missing'}`);
  console.log('='.repeat(50));
  console.log('Available Endpoints:');
  console.log('  GET  /        - Server status');
  console.log('  GET  /config  - App configuration');
  console.log('  GET  /ads     - Advertisements');
  console.log('  POST /doctor  - Chat with AI');
  console.log('  POST /analyze - Analyze plant images');
  console.log('='.repeat(50));
});
