/**
 * 🔧 ملف الإعدادات الرئيسي
 * هذا هو المكان الوحيد الذي يجب تغيير رابط السيرفر فيه
 */

// ✅ رابط السيرفر الوحيد على Render
export const BASE_URL = "https://my-cordova.onrender.com";

// ✅ تصدير CommonJS (للتوافق)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BASE_URL };
}
