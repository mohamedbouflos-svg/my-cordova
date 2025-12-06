const https = require('https');
const fs = require('fs');
const path = require('path');

module.exports = async function adsHandler(req, res) {
    try {
        // 1. الأولوية: رابط Sheets من متغيرات البيئة
        let adsURL = process.env.ADS_SHEETS_URL;

        // 2. الخيار الثاني: من config.json (إذا لم يوجد في البيئة)
        if (!adsURL) {
            try {
                const configPath = path.join(__dirname, 'config.json');
                if (fs.existsSync(configPath)) {
                    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                    adsURL = config.adsURL;
                }
            } catch (e) { /* ignore */ }
        }

        // دالة لجلب البيانات
        const fetchAds = (url) => {
            return new Promise((resolve, reject) => {
                https.get(url, (resp) => {
                    let data = '';
                    resp.on('data', (chunk) => data += chunk);
                    resp.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        } catch (e) { reject(e); }
                    });
                }).on('error', reject);
            });
        };

        let adsData = {};

        // 3. محاولة الجلب من Google Sheets
        if (adsURL) {
            try {
                console.log('Fetching ads from:', adsURL);
                const sheetsData = await fetchAds(adsURL);
                if (Array.isArray(sheetsData) && sheetsData.length > 0) {
                    adsData = {
                        admob_banner: sheetsData[0].admob_banner || '',
                        admob_interstitial: sheetsData[0].admob_interstitial || '',
                        meta_banner: sheetsData[0].meta_banner || '',
                        meta_interstitial: sheetsData[0].meta_interstitial || ''
                    };
                }
            } catch (e) {
                console.warn('Failed to fetch from Sheets:', e.message);
            }
        }

        // 4. Fallback: ملف ads.json المحلي (فقط إذا فشل كل شيء)
        if (!adsData.admob_banner) {
            const localAdsPath = path.join(__dirname, 'ads.json');
            if (fs.existsSync(localAdsPath)) {
                try {
                    adsData = JSON.parse(fs.readFileSync(localAdsPath, 'utf8'));
                } catch (e) { /* ignore */ }
            }
        }

        res.json({
            success: true,
            timestamp: new Date().toISOString(),
            ...adsData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            timestamp: new Date().toISOString(),
            error: 'Failed to load ads',
            details: error.message
        });
    }
};
