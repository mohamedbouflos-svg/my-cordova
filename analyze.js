export default async function handler(req, res) {
  try {
    const { base64Image, language = 'ar' } = req.body;

    if (!base64Image) {
      return res.status(400).json({
        error: language === 'ar' ? 'الصورة مطلوبة' : 'Image is required'
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: language === 'ar' ? 'مفتاح API غير مُعرّف' : 'API Key not configured'
      });
    }

    console.log("Starting plant analysis...");

    // إرسال الصورة وطلب التحليل من OpenAI GPT-4o
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: language === 'ar'
              ? `قم بتحليل هذه الصورة وأعطِ النتيجة بصيغة JSON فقط:
{
  "plantName": "اسم النبات",
  "healthStatus": "Healthy أو Diseased",
  "diseaseName": "اسم المرض أو null",
  "description": "وصف تفصيلي",
  "treatment": ["خطوة 1", "خطوة 2"],
  "prevention": ["نصيحة 1", "نصيحة 2"],
  "confidence": 0.95
}`
              : `Analyze this plant image and return ONLY JSON:
{
  "plantName": "plant name",
  "healthStatus": "Healthy or Diseased",
  "diseaseName": "disease name or null",
  "description": "detailed description",
  "treatment": ["step 1", "step 2"],
  "prevention": ["tip 1", "tip 2"],
  "confidence": 0.95
}`
          }
        ],
        // إذا النموذج يدعم الصورة، يمكن إضافة base64 هنا
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API Error:", response.status, errorText);
      throw new Error(`OpenAI API returned ${response.status}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || "";

    let diagnosis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      diagnosis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      diagnosis = {};
    }

    const result = {
      plantName: diagnosis.plantName || (language === 'ar' ? 'نبات غير معروف' : 'Unknown Plant'),
      healthStatus: diagnosis.healthStatus || 'Unknown',
      diseaseName: diagnosis.diseaseName || null,
      description: diagnosis.description || content,
      treatment: Array.isArray(diagnosis.treatment) ? diagnosis.treatment : [],
      prevention: Array.isArray(diagnosis.prevention) ? diagnosis.prevention : [],
      confidence: typeof diagnosis.confidence === 'number' ? diagnosis.confidence : 0.5
    };

    console.log("Analysis completed successfully");
    res.json(result);

  } catch (error) {
    console.error("Analysis error:", error);
    res.status(500).json({
      error: req.body?.language === 'ar' ? 'فشل التحليل. يرجى المحاولة مرة أخرى.' : 'Analysis failed. Please try again.',
      details: error.message
    });
  }
}
