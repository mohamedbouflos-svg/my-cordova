/**
 * 📱 المدخل الرئيسي للـ API
 * هذا الملف هو نقطة الدخول الرئيسية التي يستخدمها التطبيق
 */

const CordovaAPI = require('./api');

// ✅ تصدير جميع الوظائف
module.exports = CordovaAPI;

// ✅ للاستخدام في المتصفح
if (typeof window !== 'undefined') {
    window.CordovaAPI = CordovaAPI;
}
