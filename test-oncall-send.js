/**
 * Test script to simulate on-call WhatsApp sending
 */

const sql = require('mssql');
const https = require('https');

const dbConfig = {
    server: '192.168.1.253',
    port: 1433,
    database: 'ITHELPDESK',
    user: 'bmc',
    password: 'Bmcbtu123!@#',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        connectTimeout: 30000
    }
};

async function getWhatsAppSettings() {
    try {
        const result = await sql.query("SELECT * FROM ApplicationSettings WHERE SettingKey = 'whatsappApiKey'");
        if (result.recordset.length > 0) {
            return {
                apiKey: result.recordset[0].SettingValue
            };
        }
        return null;
    } catch (error) {
        console.error('Error getting WhatsApp settings:', error);
        return null;
    }
}

async function getCurrentOnCallPerson() {
    try {
        console.log('🔍 Getting current on-call person...');
        const scheduleResult = await sql.query('SELECT * FROM OnCallSchedule ORDER BY RotationOrder ASC');
        const settingsResult = await sql.query("SELECT SettingValue FROM ApplicationSettings WHERE SettingKey = 'rotationStartWeek'");
        
        const schedule = scheduleResult.recordset;
        console.log('📋 On-call schedule entries:', schedule.length);
        
        if (schedule.length === 0) {
            console.error('❌ No on-call schedule found in database!');
            return null;
        }
        
        // 🧪 TESTING MODE: Force Mohd Shahidan as on-call person
        const testPerson = schedule.find(person => person.StaffName === 'Mohd Shahidan');
        if (testPerson) {
            console.log('🧪 TESTING MODE: Using Mohd Shahidan for on-call');
            console.log('✅ Test on-call person:', {
                name: testPerson.StaffName,
                whatsapp: testPerson.Whatsapp,
                position: testPerson.Position
            });
            return testPerson;
        }
        
        const startWeek = settingsResult.recordset.length > 0 ? parseInt(settingsResult.recordset[0].SettingValue, 10) : 1;
        console.log('📅 Start week:', startWeek);
        
        // Calculate current week of year
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now - start;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        const weekOfYear = Math.floor(diff / oneWeek) + 1;
        
        // Calculate which person is on call
        const weeksElapsed = weekOfYear - startWeek;
        // Handle negative weeks with proper modulo calculation
        const currentIndex = ((weeksElapsed % schedule.length) + schedule.length) % schedule.length;
        const onCallPerson = schedule[currentIndex];
        
        console.log('✅ Current on-call person:', {
            name: onCallPerson?.StaffName,
            whatsapp: onCallPerson?.Whatsapp,
            position: onCallPerson?.Position,
            weekOfYear: weekOfYear,
            weeksElapsed: weeksElapsed,
            currentIndex: currentIndex
        });
        
        return onCallPerson;
    } catch (error) {
        console.error('❌ Error getting on-call person:', error);
        return null;
    }
}

async function sendTestMessage() {
    try {
        console.log('🔌 Connecting to database...');
        await sql.connect(dbConfig);
        console.log('✅ Connected\n');

        console.log('📞 === TESTING ON-CALL WHATSAPP SENDING ===\n');
        const onCallPerson = await getCurrentOnCallPerson();
        
        if (!onCallPerson) {
            console.error('❌ No on-call person returned from database!');
            return;
        }
        
        if (!onCallPerson.Whatsapp) {
            console.error('❌ On-call person has no WhatsApp number:', onCallPerson.StaffName);
            return;
        }
        
        console.log('✅ On-call person found:', onCallPerson.StaffName, 'WhatsApp:', onCallPerson.Whatsapp);

        // Create test ticket data
        const ticketData = {
            id: 'TEST-' + Math.floor(100000 + Math.random() * 900000),
            name: 'Test User',
            department: 'IT',
            priority: 'High',
            issueType: 'Hardware',
            subject: 'Test On-Call Submission',
            description: 'This is a test to verify on-call WhatsApp sending works after 5 PM',
            pcName: 'TEST-PC',
            ipAddress: '192.168.1.100',
            submittedBy: 'test.user'
        };

        // Format the message
        const message = `🎫 *New IT Support Ticket*

*Ticket ID:* ${ticketData.id}
*From:* ${ticketData.name}
*Department:* ${ticketData.department}
*Priority:* ${ticketData.priority}
*Issue Type:* ${ticketData.issueType}

*Subject:* ${ticketData.subject}
*Description:* ${ticketData.description}

*PC Name:* ${ticketData.pcName}
*IP Address:* ${ticketData.ipAddress}
*Submitted by:* ${ticketData.submittedBy}`;

        const whatsappNumber = onCallPerson.Whatsapp.replace(/[^0-9+]/g, '');
        console.log('📱 Formatted WhatsApp number:', whatsappNumber);
        
        // Get WhatsApp settings from database
        const whatsappSettings = await getWhatsAppSettings();
        const apiKey = whatsappSettings?.apiKey || '85e5d75676db4abb4fee2d08afed4b270e1c710cc920f015f535323e01b98066';
        console.log('🔑 Using API Key:', apiKey.substring(0, 20) + '...');
        
        // Send via WA Sender API
        const apiUrl = 'https://wasenderapi.com/api/send-message';
        
        const postData = JSON.stringify({
            to: whatsappNumber,
            text: message
        });
        
        console.log('📤 Sending WhatsApp message to:', whatsappNumber);
        console.log('📝 Message length:', message.length, 'characters\n');

        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        return new Promise((resolve, reject) => {
            // Add 30 second timeout
            const timeout = setTimeout(() => {
                console.error('\n❌ REQUEST TIMEOUT - No response from WhatsApp API after 30 seconds');
                reject(new Error('Request timeout'));
            }, 30000);
            
            const req = https.request(apiUrl, options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    clearTimeout(timeout);
                    console.log('📥 WA Sender API Response Status:', res.statusCode);
                    console.log('📥 WA Sender API Response Data:', responseData);
                    
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log(`\n✅ SUCCESS! Test message sent to on-call person: ${onCallPerson.StaffName} (${onCallPerson.Whatsapp})`);
                        resolve(responseData);
                    } else {
                        console.error('\n❌ WA Sender API Error:', res.statusCode, responseData);
                        reject(new Error(`API returned status ${res.statusCode}: ${responseData}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                clearTimeout(timeout);
                console.error('❌ Error sending to WA Sender API:', error);
                reject(error);
            });
            
            req.write(postData);
            req.end();
        });

    } catch (error) {
        console.error('❌ CRITICAL ERROR:', error.message);
        console.error('Full error:', error);
    } finally {
        await sql.close();
        process.exit(0);
    }
}

sendTestMessage();
