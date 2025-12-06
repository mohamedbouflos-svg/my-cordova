const https = require('https');

/**
 * ✅ Analyze - تحليل صور النباتات باستخدام OpenAI Vision (GPT-4o)
 * يستقبل صورة base64 ويرجع تشخيص مفصل للنبات
 */
module.exports = async function analyzeHandler(req, res, apiKey) {
  try {
    const { base64Image, language = 'ar' } = req.body;

    // ✅ التحقق من وجود الصورة
    if (!base64Image) {
      return res.status(400).json({
        error: language === 'ar' ? 'الصورة مطلوبة' : 'Image is required',
        success: false
      });
    }

    // ✅ التحقق من مفتاح API
    if (!apiKey) {
      return res.status(500).json({
        error: language === 'ar' ? 'مفتاح API غير مُعرّف' : 'API Key not configured',
        success: false
      });
    }

    console.log('🔍 Starting plant image analysis...');

    // ✅ تنظيف base64 (إزالة البادئة إن وجدت)
    let cleanBase64 = base64Image;
    if (base64Image.includes(',')) {
      cleanBase64 = base64Image.split(',')[1];
    }

    // ✅ إعداد الرسالة للتحليل
    const analysisPrompt = language === 'ar'
      ? `قم بتحليل هذه الصورة للنبات بدقة وأعطِ النتيجة بصيغة JSON فقط بدون أي نص إضافي:

{
  "plantName": "اسم النبات بالعربية",
  "healthStatus": "Healthy أو Diseased",
  "diseaseName": "اسم المرض بالعربية أو null إذا كان النبات سليماً",
  "description": "وصف تفصيلي لحالة النبات والمرض إن وجد",
  "symptoms": ["العرض الأول", "العرض الثاني", "العرض الثالث"],
  "causes": ["السبب الأول", "السبب الثاني"],
  "treatment": ["خطوة العلاج الأولى", "خطوة العلاج الثانية", "خطوة العلاج الثالثة"],
  "prevention": ["نصيحة الوقاية الأولى", "نصيحة الوقاية الثانية"],
  "severity": "Low أو Medium أو High",
  "confidence": 0.95
}

ملاحظات مهمة:
- إذا كان النبات سليماً، اجعل diseaseName = null و healthStatus = "Healthy"
- إذا كان مريضاً، حدد المرض بدقة واجعل healthStatus = "Diseased"
- كن دقيقاً في التشخيص واذكر الأعراض والأسباب بوضوح
- قدم خطوات علاج عملية وقابلة للتطبيق`
      : `Analyze this plant image accurately and return ONLY JSON without any additional text:

{
  "plantName": "plant name in English",
  "healthStatus": "Healthy or Diseased",
  "diseaseName": "disease name in English or null if plant is healthy",
  "description": "detailed description of plant condition and disease if present",
  "symptoms": ["symptom 1", "symptom 2", "symptom 3"],
  "causes": ["cause 1", "cause 2"],
  "treatment": ["treatment step 1", "treatment step 2", "treatment step 3"],
  "prevention": ["prevention tip 1", "prevention tip 2"],
  "severity": "Low or Medium or High",
  "confidence": 0.95
}

Important notes:
- If plant is healthy, set diseaseName = null and healthStatus = "Healthy"
- If diseased, identify the disease accurately and set healthStatus = "Diseased"
- Be precise in diagnosis and clearly state symptoms and causes
- Provide practical and actionable treatment steps`;

    // ✅ إعداد البيانات للإرسال إلى OpenAI Vision API
    const requestData = JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: analysisPrompt
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${cleanBase64}`,
                detail: 'high'
              }
            }
          ]
        }
      ],
      max_tokens: 1500,
      temperature: 0.3
    });

    // ✅ إرسال الطلب إلى OpenAI API
    const openaiResponse = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.openai.com',
        port: 443,
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'Content-Length': Buffer.byteLength(requestData)
        }
      };

      const request = https.request(options, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          if (response.statusCode === 200) {
            try {
              resolve(JSON.parse(data));
            } catch (error) {
              reject(new Error('Failed to parse OpenAI response'));
            }
          } else {
            console.error('❌ OpenAI API Error:', response.statusCode, data);
            reject(new Error(`OpenAI API returned ${response.statusCode}`));
          }
        });
      });

      request.on('error', (error) => {
        reject(error);
      });

      request.write(requestData);
      request.end();
    });

    // ✅ استخراج المحتوى من الرد
    const content = openaiResponse?.choices?.[0]?.message?.content || '';

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // ✅ استخراج JSON من المحتوى
    let diagnosis;
    try {
      // محاولة استخراج JSON من النص
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        diagnosis = JSON.parse(jsonMatch[0]);
      } else {
        // إذا لم يكن JSON، نستخدم المحتوى كوصف
        diagnosis = {
          description: content
        };
      }
    } catch (parseError) {
      console.warn('⚠️ Failed to parse JSON, using raw content');
      diagnosis = {
        description: content
      };
    }

    // ✅ بناء النتيجة النهائية مع قيم افتراضية
    const result = {
      plantName: diagnosis.plantName || (language === 'ar' ? 'نبات غير معروف' : 'Unknown Plant'),
      healthStatus: diagnosis.healthStatus || 'Unknown',
      diseaseName: diagnosis.diseaseName || null,
      description: diagnosis.description || content,
      symptoms: Array.isArray(diagnosis.symptoms) ? diagnosis.symptoms : [],
      causes: Array.isArray(diagnosis.causes) ? diagnosis.causes : [],
      treatment: Array.isArray(diagnosis.treatment) ? diagnosis.treatment : [],
      prevention: Array.isArray(diagnosis.prevention) ? diagnosis.prevention : [],
      severity: diagnosis.severity || 'Medium',
      confidence: typeof diagnosis.confidence === 'number' ? diagnosis.confidence : 0.7,
      timestamp: new Date().toISOString(),
      success: true
    };

    console.log('✅ Plant analysis completed successfully');
    console.log(`   Plant: ${result.plantName}`);
    console.log(`   Status: ${result.healthStatus}`);
    console.log(`   Disease: ${result.diseaseName || 'None'}`);

    // ✅ إرجاع النتيجة
    res.json(result);

  } catch (error) {
    console.error('❌ Analysis error:', error.message);

    // ✅ إرجاع رسالة خطأ واضحة
    res.status(500).json({
      error: req.body?.language === 'ar'
        ? 'فشل تحليل الصورة. يرجى المحاولة مرة أخرى.'
        : 'Failed to analyze image. Please try again.',
      details: error.message,
      success: false
    });
  }
};
