const http = require('http');

// ========================================
// اختبار شامل لجميع endpoints في السيرفر
// ========================================

const BASE_URL = 'http://localhost:10000';
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

let testsPassed = 0;
let testsFailed = 0;

// ✅ دالة مساعدة للطلبات
function makeRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(path, BASE_URL);
        const options = {
            method: method,
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({
                        status: res.statusCode,
                        data: JSON.parse(body)
                    });
                } catch {
                    resolve({
                        status: res.statusCode,
                        data: body
                    });
                }
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

// ✅ دالة طباعة النتائج
function logTest(name, passed, details = '') {
    if (passed) {
        console.log(`${colors.green}✅ PASS${colors.reset} - ${name}`);
        if (details) console.log(`   ${colors.cyan}${details}${colors.reset}`);
        testsPassed++;
    } else {
        console.log(`${colors.red}❌ FAIL${colors.reset} - ${name}`);
        if (details) console.log(`   ${colors.red}${details}${colors.reset}`);
        testsFailed++;
    }
}

// ========================================
// الاختبارات
// ========================================

async function runTests() {
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.blue}🧪 Starting API Tests...${colors.reset}`);
    console.log('='.repeat(60) + '\n');

    try {
        // ==================== Test 1: GET / ====================
        console.log(`${colors.yellow}Test 1: GET /${colors.reset}`);
        try {
            const res = await makeRequest('GET', '/');
            logTest(
                'Server Status',
                res.status === 200 && res.data.status === 'running',
                `Status: ${res.status}, Message: ${res.data.message}`
            );
        } catch (error) {
            logTest('Server Status', false, error.message);
        }

        // ==================== Test 2: GET /config ====================
        console.log(`\n${colors.yellow}Test 2: GET /config${colors.reset}`);
        try {
            const res = await makeRequest('GET', '/config');
            logTest(
                'Config Endpoint',
                res.status === 200 && res.data.baseURL,
                `BaseURL: ${res.data.baseURL}`
            );
        } catch (error) {
            logTest('Config Endpoint', false, error.message);
        }

        // ==================== Test 3: GET /ads ====================
        console.log(`\n${colors.yellow}Test 3: GET /ads${colors.reset}`);
        try {
            const res = await makeRequest('GET', '/ads');
            logTest(
                'Ads Endpoint',
                res.status === 200 && typeof res.data === 'object',
                `Has admob_banner: ${res.data.admob_banner !== undefined}`
            );
        } catch (error) {
            logTest('Ads Endpoint', false, error.message);
        }

        // ==================== Test 4: POST /doctor (without API key) ====================
        console.log(`\n${colors.yellow}Test 4: POST /doctor (without API key)${colors.reset}`);
        try {
            const res = await makeRequest('POST', '/doctor', {
                question: 'ما هو أفضل وقت لري النباتات؟',
                language: 'ar'
            });

            // يجب أن يفشل بسبب عدم وجود API key أو ينجح إذا كان موجوداً
            if (res.status === 500 && res.data.error) {
                logTest(
                    'Doctor AI (No API Key)',
                    true,
                    `Expected error: ${res.data.error}`
                );
            } else if (res.status === 200 && res.data.answer) {
                logTest(
                    'Doctor AI (With API Key)',
                    true,
                    `Answer received: ${res.data.answer.substring(0, 50)}...`
                );
            } else {
                logTest('Doctor AI', false, `Unexpected response: ${JSON.stringify(res.data)}`);
            }
        } catch (error) {
            logTest('Doctor AI', false, error.message);
        }

        // ==================== Test 5: POST /analyze (without API key) ====================
        console.log(`\n${colors.yellow}Test 5: POST /analyze (without image)${colors.reset}`);
        try {
            const res = await makeRequest('POST', '/analyze', {
                language: 'ar'
            });
            logTest(
                'Analyze Validation',
                res.status === 400 && res.data.error,
                `Expected error: ${res.data.error}`
            );
        } catch (error) {
            logTest('Analyze Validation', false, error.message);
        }

        // ==================== Test 6: POST /analyze (with dummy base64) ====================
        console.log(`\n${colors.yellow}Test 6: POST /analyze (with dummy image)${colors.reset}`);
        try {
            const res = await makeRequest('POST', '/analyze', {
                base64Image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg==',
                language: 'ar'
            });

            if (res.status === 500 && res.data.error) {
                logTest(
                    'Analyze (No API Key)',
                    true,
                    `Expected error: ${res.data.error}`
                );
            } else if (res.status === 200 && res.data.plantName) {
                logTest(
                    'Analyze (With API Key)',
                    true,
                    `Plant: ${res.data.plantName}`
                );
            } else {
                logTest('Analyze', false, `Unexpected response: ${JSON.stringify(res.data)}`);
            }
        } catch (error) {
            logTest('Analyze', false, error.message);
        }

        // ==================== Test 7: 404 Test ====================
        console.log(`\n${colors.yellow}Test 7: GET /nonexistent (404 test)${colors.reset}`);
        try {
            const res = await makeRequest('GET', '/nonexistent');
            logTest(
                '404 Handler',
                res.status === 404 && res.data.error === 'Not Found',
                `Message: ${res.data.message}`
            );
        } catch (error) {
            logTest('404 Handler', false, error.message);
        }

        // ==================== Test 8: Wrong Method Test ====================
        console.log(`\n${colors.yellow}Test 8: GET /doctor (wrong method)${colors.reset}`);
        try {
            const res = await makeRequest('GET', '/doctor');
            logTest(
                'Wrong Method Handler',
                res.status === 404,
                `Correctly rejected GET request to POST endpoint`
            );
        } catch (error) {
            logTest('Wrong Method Handler', false, error.message);
        }

    } catch (error) {
        console.error(`${colors.red}Fatal error during tests:${colors.reset}`, error);
    }

    // ========================================
    // النتيجة النهائية
    // ========================================
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.blue}📊 Test Results${colors.reset}`);
    console.log('='.repeat(60));
    console.log(`${colors.green}✅ Passed: ${testsPassed}${colors.reset}`);
    console.log(`${colors.red}❌ Failed: ${testsFailed}${colors.reset}`);
    console.log(`${colors.cyan}📈 Total:  ${testsPassed + testsFailed}${colors.reset}`);
    console.log('='.repeat(60) + '\n');

    if (testsFailed === 0) {
        console.log(`${colors.green}🎉 All tests passed! Server is working correctly.${colors.reset}\n`);
    } else {
        console.log(`${colors.yellow}⚠️  Some tests failed. Check the details above.${colors.reset}\n`);
    }
}

// ========================================
// تشغيل الاختبارات
// ========================================

console.log(`${colors.cyan}Waiting for server to start...${colors.reset}`);
setTimeout(() => {
    runTests().catch(error => {
        console.error(`${colors.red}Test suite failed:${colors.reset}`, error);
        process.exit(1);
    });
}, 2000);
