const https = require('https');

module.exports = async function analyzeHandler(req, res, apiKey) {
  try {
    const { base64Image, language = 'ar' } = req.body;

    if (!base64Image) {
      return res.status(400).json({
        success: false,
        timestamp: new Date().toISOString(),
        error: language === 'ar' ? 'الصورة مطلوبة' : 'Image is required'
      });
    }

    // تنظيف الصورة
    const cleanBase64 = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const prompt = language === 'ar'
      ? 'حلل صورة النبات هذه وأعطني JSON يحتوي على: plantName, healthStatus (Healthy/Diseased), diseaseName, description, treatment (array), prevention (array).'
      : 'Analyze this plant image and return JSON with: plantName, healthStatus (Healthy/Diseased), diseaseName, description, treatment (array), prevention (array).';

    const requestData = JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${cleanBase64}` } }
          ]
        }
      ],
      max_tokens: 1000
    });

    const openaiResponse = await new Promise((resolve, reject) => {
      const req = https.request({
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          if (res.statusCode === 200) resolve(JSON.parse(data));
          else reject(new Error(`OpenAI Error: ${res.statusCode} ${data}`));
        });
      });
      req.on('error', reject);
      req.write(requestData);
      req.end();
    });

    const content = openaiResponse.choices[0].message.content;

    // محاولة استخراج JSON
    let resultData = { description: content };
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) resultData = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.warn('Failed to parse JSON from OpenAI response');
    }

    res.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...resultData
    });

  } catch (error) {
    console.error('Analyze Error:', error.message);
    res.status(500).json({
      success: false,
      timestamp: new Date().toISOString(),
      error: req.body?.language === 'ar'
        ? 'فشل تحليل الصورة. يرجى المحاولة مرة أخرى.'
        : 'Failed to analyze image. Please try again.',
      details: error.message
    });
  }
};
