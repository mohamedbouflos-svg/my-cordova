/**
 * 📢 ملف جلب إعدادات الإعلانات (Client-Side)
 * يرسل طلبات GET إلى السيرفر على Render
 * ❌ لا يحتوي على أي معلومات حساسة
 */

const { sendRequest } = require('./helper');

/**
 * جلب إعدادات الإعلانات من السيرفر
 * @returns {Promise<object>} - إعدادات الإعلانات
 */
async function getAds() {
    console.log('📤 جلب إعدادات الإعلانات...');

    try {
        // إرسال طلب GET إلى السيرفر
        const result = await sendRequest('/ads', null, 'GET');

        // التحقق من النجاح
        if (!result.success) {
            throw new Error(result.error || 'فشل جلب إعدادات الإعلانات');
        }

        console.log('✅ تم جلب إعدادات الإعلانات بنجاح');
        return result;

    } catch (error) {
        console.error('❌ خطأ في جلب إعدادات الإعلانات:', error);

        // إرجاع قيم افتراضية في حالة الفشل
        return {
            success: false,
            timestamp: new Date().toISOString(),
            error: 'Failed to load ads',
            details: error.message,
            // قيم افتراضية فارغة
            admob_banner: '',
            admob_interstitial: '',
            meta_banner: '',
            meta_interstitial: ''
        };
    }
}

// ✅ تصدير الوظيفة
module.exports = {
    getAds
};

// ✅ للاستخدام في المتصفح
if (typeof window !== 'undefined') {
    window.getAds = getAds;
}
