const sql = require('mssql');
const https = require('https');

const dbConfig = {
    server: '192.168.1.253',
    port: 1433,
    database: 'ITHELPDESK',
    user: 'bmc',
    password: 'Bmcbtu123!@#',
    options: { encrypt: false, trustServerCertificate: true }
};

/**
 * Send ticket to WhatsApp group (matches main.js implementation)
 */
async function sendTicketToWhatsAppGroup(ticketData, groupName = 'IT Help Desk') {
    try {
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
        
        const apiKey = '85e5d75676db4abb4fee2d08afed4b270e1c710cc920f015f535323e01b98066';
        
        console.log(`\n📱 Sending to WhatsApp group: ${groupName}`);
        
        // Use known Group JID for "IT Help Desk"
        const knownGroupJid = '120363422327102368@g.us';
        console.log(`   Group JID: ${knownGroupJid}`);
        
        // Send message to group using the JID
        const sendMessageUrl = 'https://wasenderapi.com/api/send-message';
        
        const postData = JSON.stringify({
            to: knownGroupJid,
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
                    console.log(`   API Response Status: ${res.statusCode}`);
                    console.log(`   API Response: ${responseData}`);
                    
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const parsedResponse = JSON.parse(responseData);
                            if (parsedResponse.success === false) {
                                console.error(`   ⚠️  ${parsedResponse.message}`);
                                reject(new Error(parsedResponse.message));
                            } else {
                                console.log(`   ✅ Message sent to group: ${groupName}`);
                                resolve(responseData);
                            }
                        } catch (e) {
                            console.log(`   ✅ Message sent to group: ${groupName}`);
                            resolve(responseData);
                        }
                    } else {
                        console.error(`   ❌ API Error: ${res.statusCode}`);
                        reject(new Error(`API returned status ${res.statusCode}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error(`   ❌ Request Error: ${error.message}`);
                reject(error);
            });
            
            req.write(postData);
            req.end();
        });
        
    } catch (error) {
        console.error('Error sending ticket to WhatsApp group:', error);
        throw error;
    }
}

/**
 * Submit test ticket with WhatsApp notification
 */
async function submitTestTicketWithWhatsApp() {
    try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('  TESTING FULL TICKET SUBMISSION WITH WHATSAPP');
        console.log('═══════════════════════════════════════════════════════\n');
        
        const pool = await sql.connect(dbConfig);
        
        // Generate ticket data (matching the real submission)
        const ticketNumber = 'IT-' + Math.floor(100000 + Math.random() * 900000);
        const now = new Date();
        const localDateString = now.toISOString().slice(0, 19).replace('T', ' ');
        
        const ticketData = {
            id: ticketNumber,
            name: 'Test User',
            department: 'IT Department',
            priority: 'High',
            issueType: 'Network',
            subject: 'Test Ticket - WhatsApp Group Integration',
            description: 'This is a test ticket to verify the WhatsApp group notification feature is working correctly.',
            restarted: 'Yes',
            urgent: true,
            status: 'Open',
            submittedBy: 'testuser',
            userRole: 'User',
            pcName: 'TEST-PC-001',
            ipAddress: '192.168.1.100'
        };
        
        console.log('📝 STEP 1: Creating Ticket in Database');
        console.log('─────────────────────────────────────────────────────');
        console.log(`   Ticket ID: ${ticketData.id}`);
        console.log(`   Name: ${ticketData.name}`);
        console.log(`   Department: ${ticketData.department}`);
        console.log(`   Priority: ${ticketData.priority}`);
        console.log(`   Issue Type: ${ticketData.issueType}`);
        console.log(`   Subject: ${ticketData.subject}`);
        
        // Insert ticket into database (matching the real query)
        const query = `
            INSERT INTO Tickets (
                TicketID, Name, Department, Priority, IssueType, 
                Subject, Description, Restarted, Urgent, Status, 
                SubmitDate, SubmittedBy, UserRole, PCName, IPAddress
            ) VALUES (
                '${ticketData.id}', '${ticketData.name}', '${ticketData.department}', 
                '${ticketData.priority}', '${ticketData.issueType}', '${ticketData.subject}', 
                '${ticketData.description}', '${ticketData.restarted}', ${ticketData.urgent ? 1 : 0}, 
                '${ticketData.status}', '${localDateString}', '${ticketData.submittedBy}', 
                '${ticketData.userRole}', '${ticketData.pcName}', '${ticketData.ipAddress}'
            )
        `;
        
        await pool.request().query(query);
        console.log(`   ✅ Ticket created successfully!\n`);
        
        console.log('📱 STEP 2: Sending WhatsApp Group Notification');
        console.log('─────────────────────────────────────────────────────');
        
        // Send to WhatsApp group (matching the real implementation)
        try {
            await sendTicketToWhatsAppGroup(ticketData, 'IT Help Desk');
        } catch (whatsappError) {
            console.error(`   ⚠️  WhatsApp Error: ${whatsappError.message}`);
            console.log('   (Ticket still saved in database)');
        }
        
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  TEST COMPLETED');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('✅ Ticket submission test completed!');
        console.log(`   Ticket ID: ${ticketData.id}`);
        console.log(`   Status: Saved in database`);
        console.log(`   WhatsApp: Attempted to send to "IT Help Desk" group\n`);
        console.log('📌 NOTE: If you see "Whatsapp Session is not connected",');
        console.log('   you need to connect your WhatsApp session at wasenderapi.com\n');
        
        await pool.close();
    } catch (error) {
        console.error('\n❌ Error during test:', error.message);
        process.exit(1);
    }
}

// Run the test
submitTestTicketWithWhatsApp();
