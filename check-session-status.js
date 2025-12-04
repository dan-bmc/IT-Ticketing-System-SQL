const https = require('https');

/**
 * Check WASender API session status
 */
async function checkSessionStatus() {
    const apiKey = '85e5d75676db4abb4fee2d08afed4b270e1c710cc920f015f535323e01b98066';
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('  CHECKING WASENDER API SESSION STATUS');
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Check session status
    const sessionUrl = 'https://wasenderapi.com/api/status';
    
    const options = {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        }
    };
    
    return new Promise((resolve, reject) => {
        console.log('📡 Checking session status...\n');
        
        const req = https.request(sessionUrl, options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                console.log(`Status Code: ${res.statusCode}`);
                console.log(`Response: ${responseData}\n`);
                
                try {
                    const parsed = JSON.parse(responseData);
                    console.log('═══════════════════════════════════════════════════════');
                    console.log('  PARSED RESPONSE');
                    console.log('═══════════════════════════════════════════════════════\n');
                    console.log(JSON.stringify(parsed, null, 2));
                    console.log('\n');
                    
                    if (parsed.connected === true || parsed.status === 'connected') {
                        console.log('✅ WhatsApp session is CONNECTED');
                    } else if (parsed.connected === false || parsed.status === 'disconnected') {
                        console.log('❌ WhatsApp session is DISCONNECTED');
                        console.log('\n⚠️  You need to connect your WhatsApp at:');
                        console.log('   https://wasenderapi.com/dashboard');
                    } else {
                        console.log('⚠️  Unknown session status');
                    }
                    
                    resolve(parsed);
                } catch (e) {
                    console.log('⚠️  Could not parse response as JSON');
                    resolve(responseData);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Error:', error.message);
            reject(error);
        });
        
        req.end();
    });
}

// Run the check
checkSessionStatus()
    .then(() => {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  CHECK COMPLETED');
        console.log('═══════════════════════════════════════════════════════');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Failed to check session status:', error);
        process.exit(1);
    });
