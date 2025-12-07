/**
 * 💬 ملف الدردشة مع الطبيب النباتي (Client-Side)
 * يرسل الأسئلة إلى السيرفر على Render
 * ❌ لا يحتوي على أي API Key
 */

const { sendRequest } = require('./helper');

/**
 * إرسال سؤال إلى الطبيب النباتي
 * @param {string} question - السؤال
 * @param {string} language - اللغة (ar أو en)
 * @param {Array} history - سجل المحادثة
 * @returns {Promise<object>} - الرد من الطبيب
 */
async function sendDoctorRequest(question, language = 'ar', history = []) {
    if (!question || question.trim() === '') {
        throw new Error(language === 'ar' ? 'السؤال مطلوب' : 'Question is required');
    }

    console.log('📤 إرسال سؤال إلى الطبيب النباتي...');

    try {
        // إرسال طلب POST إلى السيرفر
        const result = await sendRequest('/doctor', {
            question: question.trim(),
            language: language,
            history: history || []
        }, 'POST');

        // التحقق من النجاح
        if (!result.success) {
            throw new Error(result.error || 'فشل الحصول على رد من الطبيب');
        }

        console.log('✅ تم استلام رد الطبيب بنجاح');
        return result;

    } catch (error) {
        console.error('❌ خطأ في الدردشة مع الطبيب:', error);

        // رسالة خطأ واضحة للمستخدم
        return {
            success: false,
            timestamp: new Date().toISOString(),
            error: language === 'ar'
                ? 'عذراً، خدمة الدردشة غير متاحة حالياً.'
                : 'Sorry, chat service is currently unavailable.',
            details: error.message
        };
    }
}

// ✅ تصدير الوظيفة
module.exports = {
    sendDoctorRequest
};

// ✅ للاستخدام في المتصفح
if (typeof window !== 'undefined') {
    window.sendDoctorRequest = sendDoctorRequest;
}
