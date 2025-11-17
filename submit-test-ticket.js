const sql = require('mssql');

const dbConfig = {
    server: '192.168.1.253',
    port: 1433,
    database: 'ITHELPDESK',
    user: 'bmc',
    password: 'Bmcbtu123!@#',
    options: { encrypt: false, trustServerCertificate: true }
};

async function submitTestTicket() {
    try {
        const pool = await sql.connect(dbConfig);
        
        // Generate a unique ticket number
        const ticketNumber = 'IT-' + Math.floor(Math.random() * 1000000);
        const now = new Date();
        
        // Insert the test ticket
        const result = await pool.request()
            .input('TicketID', sql.VarChar, ticketNumber)
            .input('Name', sql.VarChar, 'Test User')
            .input('Department', sql.VarChar, 'IT')
            .input('Subject', sql.VarChar, 'Test Notification Ticket')
            .input('Description', sql.VarChar, 'This is a test ticket to check if notifications are working properly.')
            .input('Status', sql.VarChar, 'Open')
            .input('Priority', sql.VarChar, 'Medium')
            .input('IssueType', sql.VarChar, 'Hardware')
            .input('SubmitDate', sql.DateTime2, now)
            .input('SubmittedBy', sql.VarChar, 'testuser')
            .input('Urgent', sql.Bit, 1)
            .input('Restarted', sql.VarChar, 'Not specified')
            .query(`
                INSERT INTO Tickets 
                (TicketID, Name, Department, Subject, Description, Status, Priority, IssueType, SubmitDate, SubmittedBy, Urgent, Restarted, PCName, IPAddress, UserRole)
                VALUES 
                (@TicketID, @Name, @Department, @Subject, @Description, @Status, @Priority, @IssueType, @SubmitDate, @SubmittedBy, @Urgent, @Restarted, 'TEST-PC', '192.168.1.100', 'User')
            `);
        
        console.log('✅ Test ticket submitted successfully!');
        console.log('   Ticket ID: ' + ticketNumber);
        console.log('   Subject: Test Notification Ticket');
        console.log('   Status: Open');
        console.log('\n📢 Check your notification alert in the IT Help Desk app!');
        
        await pool.close();
    } catch (error) {
        console.error('❌ Error submitting test ticket:', error.message);
        process.exit(1);
    }
}

submitTestTicket();
