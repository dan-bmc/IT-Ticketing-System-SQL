const https = require('https');

/**
 * Test sending a simple message to the WhatsApp group
 */
async function testGroupMessage() {
    const apiKey = '85e5d75676db4abb4fee2d08afed4b270e1c710cc920f015f535323e01b98066';
    const groupJid = '120363422327102368@g.us'; // IT Help Desk
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('  TESTING WHATSAPP GROUP MESSAGE');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('Group JID:', groupJid);
    console.log('Sending test message...\n');
    
    const message = '🧪 Test message from IT Ticketing System\n\nThis is a test to verify group messaging is working.';
    
    const sendMessageUrl = 'https://wasenderapi.com/api/send-message';
    
    const postData = JSON.stringify({
        to: groupJid,
        text: message
    });
    
    const sendOptions = {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(sendMessageUrl, sendOptions, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                console.log('═══════════════════════════════════════════════════════');
                console.log('  API RESPONSE');
                console.log('═══════════════════════════════════════════════════════\n');
                console.log(`Status Code: ${res.statusCode}`);
                console.log(`Raw Response: ${responseData}\n`);
                
                try {
                    const parsed = JSON.parse(responseData);
                    console.log('Parsed Response:');
                    console.log(JSON.stringify(parsed, null, 2));
                    console.log('\n');
                    
                    if (parsed.success === true) {
                        console.log('✅ Message sent successfully!');
                        console.log(`   Message ID: ${parsed.data?.msgId}`);
                        console.log(`   Status: ${parsed.data?.status}`);
                        
                        if (parsed.data?.status === 'in_progress') {
                            console.log('\n⚠️  Message is "in_progress"');
                            console.log('   This usually means:');
                            console.log('   - Message is queued and will be sent soon');
                            console.log('   - Check your WhatsApp to see if it arrived');
                        }
                    } else {
                        console.log('❌ Message failed!');
                        console.log(`   Error: ${parsed.message}`);
                    }
                    
                    resolve(parsed);
                } catch (e) {
                    console.log('⚠️  Could not parse response as JSON');
                    console.log(responseData);
                    resolve(responseData);
                }
            });
        });
        
        req.on('error', (error) => {
            console.error('❌ Request Error:', error.message);
            reject(error);
        });
        
        req.write(postData);
        req.end();
    });
}

// Run the test
testGroupMessage()
    .then(() => {
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  TEST COMPLETED');
        console.log('═══════════════════════════════════════════════════════');
        console.log('\n💡 TIP: Check the WhatsApp group to verify the message');
        console.log('   was actually delivered.\n');
        process.exit(0);
    })
    .catch(error => {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    });
