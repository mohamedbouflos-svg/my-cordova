/**
 * Analyze endpoint handler
 * يستقبل صورة النبات ويرسلها إلى OpenAI للتحليل
 */

export default async function handler(req, res) {
    try {
        const { base64Image, language = 'ar' } = req.body;

        // التحقق من وجود الصورة
        if (!base64Image) {
            return res.status(400).json({
                error: language === 'ar' ? 'الصورة مطلوبة' : 'Image is required'
            });
        }

        // التحقق من وجود API Key
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("OPENAI_API_KEY is not configured in environment variables");
            return res.status(500).json({
                error: language === 'ar'
                    ? 'مفتاح API غير مُعرّف. يرجى التواصل مع المطور.'
                    : 'API Key not configured. Please contact developer.'
            });
        }

        console.log("Starting plant analysis...");

        // استدعاء OpenAI API
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
                        content: [
                            {
                                type: "text",
                                text: language === 'ar'
                                    ? `قم بتحليل صورة النبات هذه وحدد:
1. نوع النبات (plantName)
2. الحالة الصحية (healthStatus): "Healthy" أو "Diseased"
3. اسم المرض إن وجد (diseaseName)
4. وصف تفصيلي (description)
5. خطوات العلاج (treatment) - قائمة
6. نصائح الوقاية (prevention) - قائمة
7. نسبة الثقة (confidence) من 0 إلى 1

أرجع النتيجة بصيغة JSON فقط بدون أي نص إضافي:
{
  "plantName": "اسم النبات",
  "healthStatus": "Healthy أو Diseased",
  "diseaseName": "اسم المرض أو null",
  "description": "وصف تفصيلي",
  "treatment": ["خطوة 1", "خطوة 2"],
  "prevention": ["نصيحة 1", "نصيحة 2"],
  "confidence": 0.95
}`
                                    : `Analyze this plant image and identify:
1. Plant name (plantName)
2. Health status (healthStatus): "Healthy" or "Diseased"
3. Disease name if any (diseaseName)
4. Detailed description (description)
5. Treatment steps (treatment) - array
6. Prevention tips (prevention) - array
7. Confidence level (confidence) from 0 to 1

Return ONLY JSON format without any additional text:
{
  "plantName": "plant name",
  "healthStatus": "Healthy or Diseased",
  "diseaseName": "disease name or null",
  "description": "detailed description",
  "treatment": ["step 1", "step 2"],
  "prevention": ["tip 1", "tip 2"],
  "confidence": 0.95
}`
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: base64Image
                                }
                            }
                        ]
                    }
                ],
                max_tokens: 1000,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("OpenAI API Error:", response.status, errorData);
            throw new Error(`OpenAI API returned ${response.status}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;

        console.log("OpenAI Response:", content);

        // محاولة تحليل JSON من الرد
        let diagnosis;
        try {
            // إزالة أي markdown code blocks إذا وجدت
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                diagnosis = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("No JSON found in response");
            }
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            // إنشاء رد افتراضي
            diagnosis = {
                plantName: language === 'ar' ? 'نبات غير معروف' : 'Unknown Plant',
                healthStatus: 'Unknown',
                diseaseName: null,
                description: content,
                treatment: [],
                prevention: [],
                confidence: 0.5
            };
        }

        // التأكد من وجود جميع الحقول المطلوبة
        const result = {
            plantName: diagnosis.plantName || (language === 'ar' ? 'نبات غير معروف' : 'Unknown Plant'),
            healthStatus: diagnosis.healthStatus || 'Unknown',
            diseaseName: diagnosis.diseaseName || null,
            description: diagnosis.description || '',
            treatment: Array.isArray(diagnosis.treatment) ? diagnosis.treatment : [],
            prevention: Array.isArray(diagnosis.prevention) ? diagnosis.prevention : [],
            confidence: typeof diagnosis.confidence === 'number' ? diagnosis.confidence : 0.5
        };

        console.log("Analysis completed successfully");
        res.json(result);

    } catch (error) {
        console.error("Analysis error:", error);
        res.status(500).json({
            error: req.body?.language === 'ar'
                ? 'فشل التحليل. يرجى المحاولة مرة أخرى.'
                : 'Analysis failed. Please try again.',
            details: error.message
        });
    }
}
