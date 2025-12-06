const https = require('https');

module.exports = async function doctorHandler(req, res, apiKey) {
    try {
        const { question, language = 'ar', history = [] } = req.body;

        if (!question) {
            return res.status(400).json({
                success: false,
                timestamp: new Date().toISOString(),
                error: language === 'ar' ? 'السؤال مطلوب' : 'Question is required'
            });
        }

        const messages = [
            {
                role: 'system',
                content: language === 'ar'
                    ? 'أنت طبيب نباتات خبير. أجب بالعربية بوضوح وتفصيل.'
                    : 'You are an expert plant doctor. Answer in English clearly.'
            },
            ...history.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.text
            })),
            { role: 'user', content: question }
        ];

        const requestData = JSON.stringify({
            model: 'gpt-4o',
            messages: messages,
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

        const answer = openaiResponse.choices[0].message.content;

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            answer: answer
        });

    } catch (error) {
        console.error('Doctor Error:', error.message);
        res.status(500).json({
            success: false,
            timestamp: new Date().toISOString(),
            error: req.body?.language === 'ar'
                ? 'عذراً، خدمة الدردشة غير متاحة حالياً.'
                : 'Sorry, chat service is currently unavailable.',
            details: error.message
        });
    }
};
