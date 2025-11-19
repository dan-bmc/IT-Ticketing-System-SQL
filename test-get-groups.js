const https = require('https');

/**
 * Get all WhatsApp groups
 */
async function getWhatsAppGroups() {
    try {
        console.log('═══════════════════════════════════════════════════════');
        console.log('  GETTING WHATSAPP GROUPS');
        console.log('═══════════════════════════════════════════════════════\n');
        
        const apiKey = '85e5d75676db4abb4fee2d08afed4b270e1c710cc920f015f535323e01b98066';
        const apiUrl = 'https://wasenderapi.com/api/groups';
        
        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        };
        
        return new Promise((resolve, reject) => {
            const req = https.request(apiUrl, options, (res) => {
                let responseData = '';
                
                res.on('data', (chunk) => {
                    responseData += chunk;
                });
                
                res.on('end', () => {
                    console.log(`Response Status: ${res.statusCode}\n`);
                    
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        try {
                            const parsedData = JSON.parse(responseData);
                            console.log('Available WhatsApp Groups:');
                            console.log('─────────────────────────────────────────────────────\n');
                            
                            if (Array.isArray(parsedData)) {
                                parsedData.forEach((group, index) => {
                                    console.log(`${index + 1}. ${group.name || group.subject}`);
                                    console.log(`   ID: ${group.id}`);
                                    console.log(`   JID: ${group.jid || group.id}\n`);
                                });
                                
                                // Look for "IT Help Desk" group
                                const itHelpDesk = parsedData.find(g => 
                                    (g.name && g.name.toLowerCase().includes('it help desk')) ||
                                    (g.subject && g.subject.toLowerCase().includes('it help desk'))
                                );
                                
                                if (itHelpDesk) {
                                    console.log('═══════════════════════════════════════════════════════');
                                    console.log('  ✅ FOUND "IT Help Desk" GROUP!');
                                    console.log('═══════════════════════════════════════════════════════\n');
                                    console.log(`Name: ${itHelpDesk.name || itHelpDesk.subject}`);
                                    console.log(`ID: ${itHelpDesk.id}`);
                                    console.log(`JID: ${itHelpDesk.jid || itHelpDesk.id}\n`);
                                } else {
                                    console.log('═══════════════════════════════════════════════════════');
                                    console.log('  ⚠️  "IT Help Desk" GROUP NOT FOUND');
                                    console.log('═══════════════════════════════════════════════════════\n');
                                    console.log('Please create a WhatsApp group named "IT Help Desk"\n');
                                }
                            } else if (parsedData.data && Array.isArray(parsedData.data)) {
                                parsedData.data.forEach((group, index) => {
                                    console.log(`${index + 1}. ${group.name || group.subject}`);
                                    console.log(`   ID: ${group.id}`);
                                    console.log(`   JID: ${group.jid || group.id}\n`);
                                });
                            } else {
                                console.log('Response:', JSON.stringify(parsedData, null, 2));
                            }
                            
                            resolve(parsedData);
                        } catch (e) {
                            console.log('Response Data:', responseData);
                            resolve(responseData);
                        }
                    } else {
                        console.error(`❌ API Error: Status ${res.statusCode}`);
                        console.error(`Response: ${responseData}\n`);
                        reject(new Error(`API returned status ${res.statusCode}`));
                    }
                });
            });
            
            req.on('error', (error) => {
                console.error(`❌ Request Error: ${error.message}\n`);
                reject(error);
            });
            
            req.end();
        });
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the test
getWhatsAppGroups();
