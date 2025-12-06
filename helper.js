/**
 * 🛠️ ملف الوظائف المساعدة
 * يحتوي على دوال مشتركة للاتصال بالسيرفر
 */

const { BASE_URL } = require('./config');

/**
 * إرسال طلب HTTP إلى السيرفر
 * @param {string} endpoint - نقطة النهاية (مثل: /doctor أو /analyze)
 * @param {object} data - البيانات المراد إرسالها
 * @param {string} method - نوع الطلب (GET أو POST)
 * @returns {Promise<object>} - النتيجة من السيرفر
 */
async function sendRequest(endpoint, data = null, method = 'POST') {
    const url = `${BASE_URL}${endpoint}`;

    console.log(`📡 إرسال طلب ${method} إلى: ${url}`);

    try {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        // إضافة البيانات إذا كان الطلب POST
        if (method === 'POST' && data) {
            options.body = JSON.stringify(data);
        }

        // إرسال الطلب
        const response = await fetch(url, options);

        // التحقق من نجاح الطلب
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ خطأ في الـ API (${response.status}):`, errorText);
            throw new Error(`API Error: ${response.status} - ${response.statusText}`);
        }

        // الحصول على النتيجة
        const result = await response.json();
        console.log('✅ تم استلام الرد بنجاح');

        return result;

    } catch (error) {
        console.error('❌ خطأ في الاتصال بالسيرفر:', error);
        throw error;
    }
}

/**
 * تحويل JSON إلى كائن بشكل آمن
 * @param {string} jsonString - النص JSON
 * @param {object} defaultValue - القيمة الافتراضية في حالة الفشل
 * @returns {object} - الكائن الناتج
 */
function safeJSONParse(jsonString, defaultValue = {}) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.warn('⚠️ فشل تحليل JSON:', error.message);
        return defaultValue;
    }
}

/**
 * التحقق من وجود اتصال بالإنترنت
 * @returns {boolean} - true إذا كان متصلاً
 */
function isOnline() {
    return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * اختبار الاتصال بالسيرفر
 * @returns {Promise<boolean>} - true إذا كان السيرفر متاحاً
 */
async function testServerConnection() {
    try {
        const result = await sendRequest('/config', null, 'GET');
        return result && result.success;
    } catch (error) {
        console.error('❌ فشل الاتصال بالسيرفر:', error);
        return false;
    }
}

// ✅ تصدير الوظائف
module.exports = {
    sendRequest,
    safeJSONParse,
    isOnline,
    testServerConnection
};
