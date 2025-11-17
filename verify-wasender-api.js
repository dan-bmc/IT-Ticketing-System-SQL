const https = require('https');
const http = require('http');

console.log('═══════════════════════════════════════════════════════');
console.log('  WA SENDER API CONNECTION TEST');
console.log('═══════════════════════════════════════════════════════\n');

// Test different possible API endpoints
const apiEndpoints = [
    'https://api.wasender.com/send',
    'https://app.wasender.com/api/v1/send',
    'https://wasender.com/api/send',
    'http://api.wasender.com/send'
];

console.log('📋 Testing API endpoints:\n');

apiEndpoints.forEach((url, index) => {
    console.log(`${index + 1}. ${url}`);
});

console.log('\n═══════════════════════════════════════════════════════');
console.log('  TEST RESULTS');
console.log('═══════════════════════════════════════════════════════\n');

let testCount = 0;

function testEndpoint(url) {
    return new Promise((resolve) => {
        const protocol = url.startsWith('https') ? https : http;
        const testData = JSON.stringify({
            phone: '60149431803',
            message: 'Test connection',
            api_key: '85e5d75676db4abb4fee2d08afed4b270e1c710cc920f015f535323e01b98066'
        });

        const options = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(testData)
            },
            timeout: 5000
        };

        console.log(`Testing: ${url}`);
        
        const req = protocol.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                console.log(`✅ Connected! Status: ${res.statusCode}`);
                console.log(`   Response: ${data.substring(0, 100)}${data.length > 100 ? '...' : ''}\n`);
                resolve({ url, success: true, status: res.statusCode, response: data });
            });
        });

        req.on('error', (error) => {
            console.log(`❌ Failed: ${error.message}\n`);
            resolve({ url, success: false, error: error.message });
        });

        req.on('timeout', () => {
            req.destroy();
            console.log(`⏱️  Timeout\n`);
            resolve({ url, success: false, error: 'Timeout' });
        });

        req.write(testData);
        req.end();
    });
}

async function runTests() {
    const results = [];
    
    for (const url of apiEndpoints) {
        const result = await testEndpoint(url);
        results.push(result);
        testCount++;
        
        // Wait a bit between requests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const successful = results.filter(r => r.success);
    if (successful.length > 0) {
        console.log('✅ Working endpoints:');
        successful.forEach(r => {
            console.log(`   - ${r.url} (Status: ${r.status})`);
        });
    } else {
        console.log('❌ No working endpoints found');
        console.log('\nℹ️  Possible issues:');
        console.log('   1. Check your internet connection');
        console.log('   2. Verify the WA Sender API URL is correct');
        console.log('   3. Check if firewall is blocking the connection');
        console.log('   4. Verify your WA Sender account status');
        console.log('\n💡 Recommended action:');
        console.log('   - Check WA Sender documentation for correct API endpoint');
        console.log('   - Verify your API key is valid');
        console.log('   - Contact WA Sender support if issue persists');
    }
    
    console.log('\n');
}

runTests();
