/**
 * 🔍 ملف تحليل صور النباتات (Client-Side)
 * يرسل الصور إلى السيرفر على Render للتحليل
 * ❌ لا يحتوي على أي API Key
 */

const { sendRequest } = require('./helper');

/**
 * تحليل صورة نبات
 * @param {string} base64Image - الصورة بصيغة Base64
 * @param {string} language - اللغة (ar أو en)
 * @returns {Promise<object>} - نتيجة التحليل
 */
async function sendAnalyzeRequest(base64Image, language = 'ar') {
  if (!base64Image || base64Image.trim() === '') {
    throw new Error(language === 'ar' ? 'الصورة مطلوبة' : 'Image is required');
  }

  console.log('📤 إرسال صورة للتحليل...');

  try {
    // تنظيف الصورة من البادئة إذا وجدت
    let cleanBase64 = base64Image;
    if (base64Image.startsWith('data:image')) {
      cleanBase64 = base64Image.split(',')[1];
    }

    // إرسال طلب POST إلى السيرفر
    const result = await sendRequest('/analyze', {
      base64Image: cleanBase64,
      language: language
    }, 'POST');

    // التحقق من النجاح
    if (!result.success) {
      throw new Error(result.error || 'فشل تحليل الصورة');
    }

    console.log('✅ تم تحليل الصورة بنجاح');
    return result;

  } catch (error) {
    console.error('❌ خطأ في تحليل الصورة:', error);

    // رسالة خطأ واضحة للمستخدم
    return {
      success: false,
      timestamp: new Date().toISOString(),
      error: language === 'ar'
        ? 'فشل تحليل الصورة. يرجى المحاولة مرة أخرى.'
        : 'Failed to analyze image. Please try again.',
      details: error.message
    };
  }
}

// ✅ تصدير الوظيفة
module.exports = {
  sendAnalyzeRequest
};

// ✅ للاستخدام في المتصفح
if (typeof window !== 'undefined') {
  window.sendAnalyzeRequest = sendAnalyzeRequest;
}
