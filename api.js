/**
 * 🌐 ملف API الرئيسي - يجمع جميع الوظائف
 * يربط doctor.js و analyze.js و ads.js
 */

const { BASE_URL } = require('./config');
const { sendDoctorRequest } = require('./doctor');
const { sendAnalyzeRequest } = require('./analyze');
const { getAds } = require('./ads');

/**
 * واجهة API الموحدة للتطبيق
 */
const CordovaAPI = {
    /**
     * إرسال سؤال إلى الطبيب النباتي
     * @param {string} question - السؤال
     * @param {string} language - اللغة (ar أو en)
     * @param {Array} history - سجل المحادثة
     * @returns {Promise<object>} - الرد من الطبيب
     */
    askDoctor: async function (question, language = 'ar', history = []) {
        return await sendDoctorRequest(question, language, history);
    },

    /**
     * تحليل صورة نبات
     * @param {string} base64Image - الصورة بصيغة Base64
     * @param {string} language - اللغة (ar أو en)
     * @returns {Promise<object>} - نتيجة التحليل
     */
    analyzePlant: async function (base64Image, language = 'ar') {
        return await sendAnalyzeRequest(base64Image, language);
    },

    /**
     * جلب إعدادات الإعلانات
     * @returns {Promise<object>} - إعدادات الإعلانات
     */
    getAdsConfig: async function () {
        return await getAds();
    },

    /**
     * الحصول على رابط السيرفر
     * @returns {string} - رابط السيرفر
     */
    getServerURL: function () {
        return BASE_URL;
    }
};

// ✅ تصدير للاستخدام
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CordovaAPI;
}

// ✅ للاستخدام في المتصفح
if (typeof window !== 'undefined') {
    window.CordovaAPI = CordovaAPI;
}
