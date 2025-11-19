const https = require('https');

/**
 * Test sending a message to WhatsApp group "IT Help Desk"
 */
async function testWhatsAppGroupMessage() {
    try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('  TESTING WHATSAPP GROUP NOTIFICATION');
        console.log('═══════════════════════════════════════════════════════\n');
        
        const groupName = 'IT Help Desk';
        const apiKey = '85e5d75676db4abb4fee2d08afed4b270e1c710cc920f015f535323e01b98066';
        
        // Create test ticket data
        const ticketData = {
            id: 'IT-' + Math.floor(100000 + Math.random() * 900000),
            name: 'Test User',
            department: 'IT Department',
            priority: 'High',
            issueType: 'Network',
            subject: 'Test WhatsApp Group Notification',
            description: 'This is a test to verify WhatsApp group notifications are working properly.',
            pcName: 'TEST-PC-001',
            ipAddress: '192.168.1.100',
            submittedBy: 'testuser'
        };
        
        console.log('📝 Test Ticket Details:');
        console.log(`   Ticket ID: ${ticketData.id}`);
        console.log(`   From: ${ticketData.name}`);
        console.log(`   Department: ${ticketData.department}`);
        console.log(`   Priority: ${ticketData.priority}\n`);
        
        // Format the submission date
        const submitDate = new Date();
        const formattedDate = submitDate.toLocaleString('en-MY', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
        
        // Format the message
        const message = `🎫 *New IT Support Ticket*

*Ticket ID:* ${ticketData.id}
*From:* ${ticketData.name}
*Department:* ${ticketData.department}
*Priority:* ${ticketData.priority}
*Issue Type:* ${ticketData.issueType}
*Date:* ${formattedDate}

*Subject:* ${ticketData.subject}
*Description:* ${ticketData.description}

*PC Name:* ${ticketData.pcName}
*IP Address:* ${ticketData.ipAddress}
*Submitted by:* ${ticketData.submittedBy}`;
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('  STEP 1: Using IT Help Desk Group');
        console.log('═══════════════════════════════════════════════════════\n');
        
        // Use the correct Group JID for "IT Help Desk"
        const groupId = '120363422327102368@g.us';
        console.log(`✅ Using group: ${groupName}`);
        console.log(`   Group JID: ${groupId}\n`);
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('  STEP 2: Sending Message to Group');
        console.log('═══════════════════════════════════════════════════════\n');
        
        // Send message to group
        const sendMessageUrl = 'https://wasenderapi.com/api/send-message';
        const postData = JSON.stringify({
            to: groupId,
            text: message,
            isGroup: true
        });
        
        console.log(`   Target JID: ${groupId}`);
        console.log(`   Message length: ${message.length} characters\n`);
        
        const sendOptions = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        await new Promise((resolve, reject) => {
            const req = https.request(sendMessageUrl, sendOptions, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    console.log(`   Response Status: ${res.statusCode}`);
                    console.log(`   Response Data: ${responseData}\n`);
                    
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log('═══════════════════════════════════════════════════════');
                        console.log('  ✅ SUCCESS!');
                        console.log('═══════════════════════════════════════════════════════\n');
                        console.log(`✅ Message sent to WhatsApp group: ${groupName}`);
                        console.log(`   Check the "${groupName}" group on WhatsApp!\n`);
                        resolve(responseData);
                    } else {
                        console.log('═══════════════════════════════════════════════════════');
                        console.log('  ❌ ERROR');
                        console.log('═══════════════════════════════════════════════════════\n');
                        console.error(`❌ API Error: Status ${res.statusCode}`);
                        console.error(`   Response: ${responseData}\n`);
                        reject(new Error(`API returned status ${res.statusCode}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                console.log('═══════════════════════════════════════════════════════');
                console.log('  ❌ ERROR');
                console.log('═══════════════════════════════════════════════════════\n');
                console.error(`❌ Request Error: ${error.message}\n`);
                reject(error);
            });
            
            req.write(postData);
            req.end();
        });
        
    } catch (error) {
        console.log('═══════════════════════════════════════════════════════');
        console.log('  ❌ TEST FAILED');
        console.log('═══════════════════════════════════════════════════════\n');
        console.error(`❌ Error: ${error.message}\n`);
        process.exit(1);
    }
}

// Run the test
testWhatsAppGroupMessage();
