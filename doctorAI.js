/**
 * Doctor AI Chat endpoint handler
 * يستقبل أسئلة المستخدمين ويرد عليها باستخدام OpenAI
 */

export default async function handler(req, res) {
    try {
        const { question, language = 'ar', history = [] } = req.body;

        // التحقق من وجود السؤال
        if (!question) {
            return res.status(400).json({
                error: language === 'ar' ? 'السؤال مطلوب' : 'Question is required'
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

        console.log("Processing chat question:", question);

        // بناء رسائل المحادثة
        const messages = [
            {
                role: "system",
                content: language === 'ar'
                    ? `أنت طبيب نباتات خبير ومتخصص. مهمتك مساعدة المستخدمين في:
- تشخيص أمراض النباتات
- تقديم نصائح العناية بالنباتات
- الإجابة على أسئلة حول الزراعة والري والتسميد
- اقتراح حلول للمشاكل الزراعية

أجب دائماً باللغة العربية بشكل واضح ومفصل ومفيد.`
                    : `You are an expert plant doctor and specialist. Your role is to help users with:
- Diagnosing plant diseases
- Providing plant care advice
- Answering questions about cultivation, watering, and fertilization
- Suggesting solutions to agricultural problems

Always answer in English clearly, in detail, and helpfully.`
            }
        ];

        // إضافة تاريخ المحادثة إذا وجد
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

        // إضافة السؤال الحالي
        messages.push({
            role: "user",
            content: question
        });

        // استدعاء OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                messages: messages,
                max_tokens: 800,
                temperature: 0.8
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("OpenAI API Error:", response.status, errorData);
            throw new Error(`OpenAI API returned ${response.status}`);
        }

        const data = await response.json();
        const answer = data.choices[0].message.content;

        console.log("Chat response generated successfully");

        res.json({
            answer: answer,
            success: true
        });

    } catch (error) {
        console.error("Chat error:", error);
        res.status(500).json({
            error: req.body?.language === 'ar'
                ? 'فشلت الدردشة. يرجى المحاولة مرة أخرى.'
                : 'Chat failed. Please try again.',
            details: error.message,
            success: false
        });
    }
}
