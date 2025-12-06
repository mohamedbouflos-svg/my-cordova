import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    const { question, language = "ar", history = [] } = req.body;

    if (!question) {
      return res.status(400).json({
        error: language === "ar" ? "السؤال مطلوب" : "Question is required"
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: language === "ar"
          ? "مفتاح API غير مُعرّف. يرجى التواصل مع المطور."
          : "API Key not configured. Please contact developer."
      });
    }

    const messages = [
      {
        role: "system",
        content: language === "ar"
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

    history.forEach(msg => {
      if (msg.role && msg.text) {
        messages.push({
          role: msg.role === "user" ? "user" : "assistant",
          content: msg.text
        });
      }
    });

    messages.push({ role: "user", content: question });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
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

    res.json({ answer, success: true });

  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({
      error: req.body?.language === "ar"
        ? "فشلت الدردشة. يرجى المحاولة مرة أخرى."
        : "Chat failed. Please try again.",
      details: error.message,
      success: false
    });
  }
}
