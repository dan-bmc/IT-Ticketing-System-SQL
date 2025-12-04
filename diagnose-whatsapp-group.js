const https = require('https');

/**
 * Comprehensive WhatsApp Group Messaging Diagnostic
 */

const apiKey = '85e5d75676db4abb4fee2d08afed4b270e1c710cc920f015f535323e01b98066';
const groupJid = '120363422327102368@g.us';

console.log('═══════════════════════════════════════════════════════');
console.log('  WHATSAPP GROUP MESSAGING DIAGNOSTIC');
console.log('═══════════════════════════════════════════════════════\n');

async function checkSessionStatus() {
    console.log('1️⃣  Checking Session Status...');
    
    return new Promise((resolve) => {
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        };
        
        const req = https.request('https://wasenderapi.com/api/status', options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.status === 'connected') {
                        console.log('   ✅ Session is CONNECTED\n');
                        resolve(true);
                    } else {
                        console.log('   ❌ Session is NOT connected\n');
                        resolve(false);
                    }
                } catch (e) {
                    console.log('   ⚠️  Could not verify session\n');
                    resolve(false);
                }
            });
        });
        req.on('error', () => {
            console.log('   ❌ Error checking session\n');
            resolve(false);
        });
        req.end();
    });
}

async function verifyGroup() {
    console.log('2️⃣  Verifying Group Exists...');
    
    return new Promise((resolve) => {
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        };
        
        const req = https.request('https://wasenderapi.com/api/groups', options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const groups = JSON.parse(data);
                    const found = groups.find(g => g.id === groupJid);
                    if (found) {
                        console.log(`   ✅ Group found: "${found.name || found.subject}"`);
                        console.log(`   JID: ${groupJid}\n`);
                        resolve(true);
                    } else {
                        console.log('   ❌ Group NOT found\n');
                        resolve(false);
                    }
                } catch (e) {
                    console.log('   ⚠️  Could not verify group\n');
                    resolve(false);
                }
            });
        });
        req.on('error', () => {
            console.log('   ❌ Error checking groups\n');
            resolve(false);
        });
        req.end();
    });
}

async function sendTestMessage() {
    console.log('3️⃣  Sending Test Message...');
    
    const message = `🧪 *Diagnostic Test*\n\nTime: ${new Date().toLocaleString('en-MY')}\n\nIf you receive this, group messaging is working!`;
    
    return new Promise((resolve) => {
        const postData = JSON.stringify({
            to: groupJid,
            text: message
        });
        
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = https.request('https://wasenderapi.com/api/send-message', options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                console.log(`   Status Code: ${res.statusCode}`);
                console.log(`   Response: ${data}`);
                
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.success === true) {
                        console.log(`   ✅ API accepted message`);
                        console.log(`   Message ID: ${parsed.data?.msgId}`);
                        console.log(`   Status: ${parsed.data?.status}\n`);
                        resolve({ success: true, status: parsed.data?.status, msgId: parsed.data?.msgId });
                    } else {
                        console.log(`   ❌ API rejected message: ${parsed.message}\n`);
                        resolve({ success: false, error: parsed.message });
                    }
                } catch (e) {
                    console.log(`   ⚠️  Unexpected response\n`);
                    resolve({ success: false, error: 'Parse error' });
                }
            });
        });
        req.on('error', (err) => {
            console.log(`   ❌ Request failed: ${err.message}\n`);
            resolve({ success: false, error: err.message });
        });
        req.write(postData);
        req.end();
    });
}

async function runDiagnostic() {
    const sessionOk = await checkSessionStatus();
    const groupOk = await verifyGroup();
    const messageResult = await sendTestMessage();
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('  DIAGNOSTIC SUMMARY');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log(`Session Connected: ${sessionOk ? '✅' : '❌'}`);
    console.log(`Group Verified: ${groupOk ? '✅' : '❌'}`);
    console.log(`Message Sent: ${messageResult.success ? '✅' : '❌'}`);
    
    if (messageResult.success) {
        console.log(`Message Status: ${messageResult.status}`);
        console.log(`Message ID: ${messageResult.msgId}`);
    }
    
    console.log('\n');
    
    if (sessionOk && groupOk && messageResult.success) {
        if (messageResult.status === 'in_progress') {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('  ⚠️  MESSAGES SHOW "IN_PROGRESS" STATUS');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
            console.log('This is NORMAL behavior. It means:');
            console.log('• The API has accepted your message');
            console.log('• The message is queued for delivery');
            console.log('• It should arrive in the WhatsApp group shortly\n');
            console.log('📱 ACTION REQUIRED:');
            console.log('   Check the "IT Help Desk" WhatsApp group');
            console.log('   to confirm the message actually arrived.\n');
            console.log('If messages are NOT arriving in the group:');
            console.log('   1. Verify your phone has internet connection');
            console.log('   2. Check WhatsApp Web is connected');
            console.log('   3. Visit: https://wasenderapi.com/dashboard');
            console.log('   4. Reconnect your WhatsApp session if needed\n');
        } else {
            console.log('✅ Everything appears to be working correctly!\n');
        }
    } else {
        console.log('❌ Issues detected. Please fix the errors above.\n');
    }
    
    console.log('═══════════════════════════════════════════════════════');
}

runDiagnostic().then(() => process.exit(0));
