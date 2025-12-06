const https = require('https');

/**
 * ✅ Doctor AI - الدردشة مع طبيب النباتات الذكي
 * يستخدم OpenAI GPT-4o للإجابة على أسئلة المستخدمين
 */
module.exports = async function doctorHandler(req, res, apiKey) {
    try {
        const { question, language = 'ar', history = [] } = req.body;

        // ✅ التحقق من وجود السؤال
        if (!question || question.trim() === '') {
            return res.status(400).json({
                error: language === 'ar' ? 'السؤال مطلوب' : 'Question is required',
                success: false
            });
        }

        // ✅ التحقق من مفتاح API
        if (!apiKey) {
            return res.status(500).json({
                error: language === 'ar'
                    ? 'مفتاح API غير مُعرّف. يرجى التواصل مع المطور.'
                    : 'API Key not configured. Please contact developer.',
                success: false
            });
        }

        console.log(`📝 Doctor AI - New question (${language}):`, question.substring(0, 50) + '...');

        // ✅ بناء رسائل المحادثة
        const messages = [
            {
                role: 'system',
                content: language === 'ar'
                    ? `أنت طبيب نباتات خبير ومتخصص. مهمتك مساعدة المستخدمين في:
- تشخيص أمراض النباتات بدقة
- تقديم نصائح العناية بالنباتات (الري، التسميد، الإضاءة، التربة)
- الإجابة على أسئلة حول الزراعة والآفات والحشرات
- اقتراح حلول عملية وفعالة للمشاكل الزراعية
- تقديم معلومات علمية موثوقة عن النباتات

أجب دائماً باللغة العربية بشكل واضح ومفصل ومفيد. استخدم أسلوب ودود ومهني.`
                    : `You are an expert plant doctor and specialist. Your role is to help users with:
- Accurately diagnosing plant diseases
- Providing plant care advice (watering, fertilization, lighting, soil)
- Answering questions about cultivation, pests, and insects
- Suggesting practical and effective solutions to agricultural problems
- Providing reliable scientific information about plants

Always answer in English clearly, in detail, and helpfully. Use a friendly and professional tone.`
            }
        ];

        // ✅ إضافة تاريخ المحادثة
        if (Array.isArray(history) && history.length > 0) {
            history.forEach(msg => {
                if (msg.role && msg.text) {
                    messages.push({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: msg.text
                    });
                }
            });
        }

        // ✅ إضافة السؤال الحالي
        messages.push({
            role: 'user',
            content: question
        });

        // ✅ إعداد البيانات للإرسال إلى OpenAI
        const requestData = JSON.stringify({
            model: 'gpt-4o',
            messages: messages,
            max_tokens: 1000,
            temperature: 0.8,
            top_p: 1,
            frequency_penalty: 0.3,
            presence_penalty: 0.3
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
                        reject(new Error(`OpenAI API returned ${response.statusCode}: ${data}`));
                    }
                });
            });

            request.on('error', (error) => {
                reject(error);
            });

            request.write(requestData);
            request.end();
        });

        // ✅ استخراج الإجابة
        const answer = openaiResponse?.choices?.[0]?.message?.content;

        if (!answer) {
            throw new Error('No response from OpenAI');
        }

        console.log('✅ Doctor AI - Response generated successfully');

        // ✅ إرجاع الإجابة
        res.json({
            answer: answer.trim(),
            success: true,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ Doctor AI error:', error.message);

        // ✅ إرجاع رسالة خطأ واضحة
        res.status(500).json({
            error: req.body?.language === 'ar'
                ? 'عذراً، خدمة الدردشة غير متاحة حالياً. يرجى المحاولة مرة أخرى.'
                : 'Sorry, chat service is currently unavailable. Please try again.',
            details: error.message,
            success: false
        });
    }
};
