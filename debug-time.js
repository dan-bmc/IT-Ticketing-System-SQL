const sql = require('mssql');

const dbConfig = {
    server: '192.168.1.253',
    port: 1433,
    database: 'ITHELPDESK',
    user: 'bmc',
    password: 'Bmcbtu123!@#',
    options: { encrypt: false, trustServerCertificate: true }
};

sql.connect(dbConfig).then(pool => {
    return pool.request().query('SELECT TOP 1 TicketID, SubmitDate FROM Tickets WHERE TicketID = \'IT-483136\'')
        .then(result => {
            const ticket = result.recordset[0];
            console.log('Ticket ID:', ticket.TicketID);
            console.log('SubmitDate:', ticket.SubmitDate);
            console.log('SubmitDate as ISO:', ticket.SubmitDate.toISOString());
            console.log('Current Time:', new Date());
            console.log('Current Time as ISO:', new Date().toISOString());
            
            const diff = new Date() - ticket.SubmitDate;
            const hours = diff / (1000 * 60 * 60);
            console.log('Duration (hours):', hours);
            console.log('Duration (formatted):', Math.floor(hours) + 'h ' + Math.floor((hours % 1) * 60) + 'm');
        });
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
