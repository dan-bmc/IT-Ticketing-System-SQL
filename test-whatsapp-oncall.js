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
 * Get current on-call person from database
 */
async function getCurrentOnCallPerson() {
    try {
        const pool = await sql.connect(dbConfig);
        
        const scheduleResult = await pool.request().query('SELECT * FROM OnCallSchedule ORDER BY RotationOrder ASC');
        const settingsResult = await pool.request().query("SELECT SettingValue FROM ApplicationSettings WHERE SettingKey = 'rotationStartWeek'");
        
        const schedule = scheduleResult.recordset;
        if (schedule.length === 0) {
            return null;
        }
        
        const startWeek = settingsResult.recordset.length > 0 ? parseInt(settingsResult.recordset[0].SettingValue, 10) : 1;
        
        // Calculate current week of year
        const now = new Date();
        const start = new Date(now.getFullYear(), 0, 1);
        const diff = now - start;
        const oneWeek = 1000 * 60 * 60 * 24 * 7;
        const weekOfYear = Math.floor(diff / oneWeek) + 1;
        
        // Calculate which person is on call
        const weeksElapsed = weekOfYear - startWeek;
        const currentIndex = weeksElapsed % schedule.length;
        const onCallPerson = schedule[currentIndex >= 0 ? currentIndex : schedule.length + currentIndex];
        
        return onCallPerson;
    } catch (error) {
        console.error('Error getting on-call person:', error);
        return null;
    }
}

/**
 * Send ticket details to on-call person via WhatsApp
 */
async function sendTicketToOnCallWhatsApp(ticketData) {
    try {
        const onCallPerson = await getCurrentOnCallPerson();
        
        if (!onCallPerson || !onCallPerson.Whatsapp) {
            console.log('❌ No on-call person found or WhatsApp number not available');
            console.log('On-call person data:', onCallPerson);
            return;
        }
        
        console.log(`✅ On-call person found: ${onCallPerson.StaffName}`);
        console.log(`   Position: ${onCallPerson.Position}`);
        console.log(`   WhatsApp: ${onCallPerson.Whatsapp}`);
        
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
        
        const whatsappNumber = onCallPerson.Whatsapp.replace(/[^0-9+]/g, ''); // Keep + for international format
        console.log(`\n📱 Sending to WhatsApp number: ${whatsappNumber}`);
        
        // Send via WA Sender API
        const apiUrl = 'https://wasenderapi.com/api/send-message';
        
        const postData = JSON.stringify({
            to: whatsappNumber,
            text: message
        });
        
        console.log('\n📤 Sending request to WA Sender API...');
        console.log(`   API URL: ${apiUrl}`);
        
        const options = {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer 85e5d75676db4abb4fee2d08afed4b270e1c710cc920f015f535323e01b98066',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        return new Promise((resolve, reject) => {
            const req = https.request(apiUrl, options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    console.log(`\n📬 Response Status: ${res.statusCode}`);
                    console.log(`   Response Data: ${responseData}`);
                    
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        console.log(`\n✅ SUCCESS: Ticket sent to ${onCallPerson.StaffName} (${onCallPerson.Whatsapp})`);
                        resolve(responseData);
                    } else {
                        console.error(`\n❌ ERROR: API returned status ${res.statusCode}`);
                        console.error(`   Response: ${responseData}`);
                        reject(new Error(`API returned status ${res.statusCode}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error('\n❌ Request Error:', error.message);
                reject(error);
            });
            
            req.write(postData);
            req.end();
        });
        
    } catch (error) {
        console.error('\n❌ Error in sendTicketToOnCallWhatsApp:', error.message);
        throw error;
    }
}

/**
 * Submit a test ticket and send WhatsApp notification
 */
async function submitTestTicket() {
    try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('  TESTING ON-CALL WHATSAPP NOTIFICATION');
        console.log('═══════════════════════════════════════════════════════\n');
        
        const pool = await sql.connect(dbConfig);
        
        // Generate a unique ticket number
        const ticketNumber = 'IT-' + Math.floor(Math.random() * 1000000);
        const now = new Date();
        
        console.log('📝 Creating test ticket...');
        console.log(`   Ticket ID: ${ticketNumber}`);
        
        // Insert the test ticket
        await pool.request()
            .input('TicketID', sql.VarChar, ticketNumber)
            .input('Name', sql.VarChar, 'Test User')
            .input('Department', sql.VarChar, 'IT')
            .input('Subject', sql.VarChar, 'Test WhatsApp Notification')
            .input('Description', sql.VarChar, 'This is a test ticket to verify WhatsApp notifications to on-call staff.')
            .input('Status', sql.VarChar, 'Open')
            .input('Priority', sql.VarChar, 'High')
            .input('IssueType', sql.VarChar, 'Network')
            .input('SubmitDate', sql.DateTime2, now)
            .input('SubmittedBy', sql.VarChar, 'testuser')
            .input('Urgent', sql.Bit, 1)
            .input('Restarted', sql.VarChar, 'Not specified')
            .query(`
                INSERT INTO Tickets 
                (TicketID, Name, Department, Subject, Description, Status, Priority, IssueType, SubmitDate, SubmittedBy, Urgent, Restarted, PCName, IPAddress, UserRole)
                VALUES 
                (@TicketID, @Name, @Department, @Subject, @Description, @Status, @Priority, @IssueType, @SubmitDate, @SubmittedBy, @Urgent, @Restarted, 'TEST-PC-001', '192.168.1.100', 'User')
            `);
        
        console.log('✅ Test ticket created successfully!\n');
        
        // Prepare ticket data for WhatsApp
        const ticketData = {
            id: ticketNumber,
            name: 'Test User',
            department: 'IT',
            subject: 'Test WhatsApp Notification',
            description: 'This is a test ticket to verify WhatsApp notifications to on-call staff.',
            priority: 'High',
            issueType: 'Network',
            pcName: 'TEST-PC-001',
            ipAddress: '192.168.1.100',
            submittedBy: 'testuser'
        };
        
        // Send WhatsApp notification
        console.log('═══════════════════════════════════════════════════════');
        console.log('  SENDING WHATSAPP NOTIFICATION');
        console.log('═══════════════════════════════════════════════════════\n');
        
        await sendTicketToOnCallWhatsApp(ticketData);
        
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  TEST COMPLETED');
        console.log('═══════════════════════════════════════════════════════\n');
        
        await pool.close();
    } catch (error) {
        console.error('\n❌ Error during test:', error.message);
        process.exit(1);
    }
}

// Run the test
submitTestTicket();
