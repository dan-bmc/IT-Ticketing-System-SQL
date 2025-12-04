const https = require('https');

// Test if WA Sender API is reachable
const apiKey = '85e5d75676db4abb4fee2d08afed4b270e1c710cc920f015f535323e01b98066';

console.log('🔍 Testing WhatsApp API connection...\n');

// Try a simple status check
const options = {
    hostname: 'wasenderapi.com',
    path: '/api/status',
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${apiKey}`
    },
    timeout: 10000
};

const req = https.request(options, (res) => {
    console.log('📥 Response Status:', res.statusCode);
    console.log('📥 Response Headers:', res.headers);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        console.log('📥 Response Data:', data);
        
        if (res.statusCode === 200) {
            console.log('\n✅ API is reachable!');
        } else {
            console.log('\n⚠️  API returned status:', res.statusCode);
        }
        process.exit(0);
    });
});

req.on('error', (error) => {
    console.error('❌ Connection Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
});

req.on('timeout', () => {
    console.error('❌ Request Timeout - Could not connect to API');
    req.destroy();
    process.exit(1);
});

req.end();

setTimeout(() => {
    console.error('\n❌ Test timeout after 15 seconds');
    process.exit(1);
}, 15000);
