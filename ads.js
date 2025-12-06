const https = require('https');
const fs = require('fs');
const path = require('path');

/**
 * ✅ Ads - جلب الإعلانات من Google Sheets أو من ملف محلي
 */
module.exports = async function adsHandler(req, res) {
    try {
        console.log('📢 Fetching ads configuration...');

        // ✅ قراءة رابط Google Sheets من config.json
        let adsURL = null;
        try {
            const configPath = path.join(__dirname, 'config.json');
            if (fs.existsSync(configPath)) {
                const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                adsURL = config.adsURL;
            }
        } catch (error) {
            console.warn('⚠️ Could not read adsURL from config.json');
        }

        // ✅ إذا كان هناك رابط Google Sheets، نجلب البيانات منه
        if (adsURL && adsURL.includes('opensheet.elk.sh')) {
            try {
                console.log('🌐 Fetching ads from Google Sheets:', adsURL);

                const sheetsData = await new Promise((resolve, reject) => {
                    https.get(adsURL, (response) => {
                        let data = '';

                        response.on('data', (chunk) => {
                            data += chunk;
                        });

                        response.on('end', () => {
                            if (response.statusCode === 200) {
                                try {
                                    resolve(JSON.parse(data));
                                } catch (error) {
                                    reject(new Error('Failed to parse Google Sheets response'));
                                }
                            } else {
                                reject(new Error(`Google Sheets returned ${response.statusCode}`));
                            }
                        });
                    }).on('error', (error) => {
                        reject(error);
                    });
                });

                // ✅ تحويل البيانات من Google Sheets إلى الصيغة المطلوبة
                if (Array.isArray(sheetsData) && sheetsData.length > 0) {
                    const adsConfig = {
                        admob_banner: sheetsData[0]?.admob_banner || '',
                        admob_interstitial: sheetsData[0]?.admob_interstitial || '',
                        meta_banner: sheetsData[0]?.meta_banner || '',
                        meta_interstitial: sheetsData[0]?.meta_interstitial || ''
                    };

                    console.log('✅ Ads loaded from Google Sheets successfully');
                    return res.json(adsConfig);
                }
            } catch (sheetsError) {
                console.warn('⚠️ Failed to fetch from Google Sheets:', sheetsError.message);
                console.log('📁 Falling back to local ads.json');
            }
        }

        // ✅ إذا فشل Google Sheets أو لم يكن موجوداً، نستخدم الملف المحلي
        const adsPath = path.join(__dirname, 'ads.json');

        if (!fs.existsSync(adsPath)) {
            console.warn('⚠️ ads.json not found, returning empty ads');
            return res.json({
                admob_banner: '',
                admob_interstitial: '',
                meta_banner: '',
                meta_interstitial: ''
            });
        }

        const localAds = JSON.parse(fs.readFileSync(adsPath, 'utf8'));
        console.log('✅ Ads loaded from local file successfully');
        res.json(localAds);

    } catch (error) {
        console.error('❌ Ads error:', error.message);

        // ✅ إرجاع إعلانات فارغة في حالة الخطأ
        res.status(500).json({
            error: 'Failed to load ads',
            details: error.message,
            admob_banner: '',
            admob_interstitial: '',
            meta_banner: '',
            meta_interstitial: ''
        });
    }
};
