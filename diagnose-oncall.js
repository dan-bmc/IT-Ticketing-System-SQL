/**
 * Diagnostic script to check on-call schedule and WhatsApp sending
 */

const sql = require('mssql');

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

async function diagnose() {
    try {
        console.log('🔌 Connecting to database...');
        await sql.connect(dbConfig);
        console.log('✅ Connected to database\n');

        // Check on-call schedule
        console.log('📋 Checking OnCallSchedule table...');
        const scheduleResult = await sql.query('SELECT * FROM OnCallSchedule ORDER BY RotationOrder ASC');
        console.log('Schedule entries found:', scheduleResult.recordset.length);
        
        if (scheduleResult.recordset.length === 0) {
            console.error('❌ NO ON-CALL SCHEDULE ENTRIES FOUND!');
            console.log('\nThis is the problem! You need to add on-call staff to the database.');
            console.log('Go to the On Call tab in the application and set up the rotation schedule.\n');
        } else {
            console.log('\n📋 On-call schedule:');
            scheduleResult.recordset.forEach((person, index) => {
                console.log(`  ${index + 1}. ${person.StaffName} (${person.Position})`);
                console.log(`     WhatsApp: ${person.Whatsapp || 'NOT SET!'}`);
                console.log(`     Rotation Order: ${person.RotationOrder}`);
            });
        }

        // Check rotation start week
        console.log('\n📅 Checking rotation start week...');
        const settingsResult = await sql.query("SELECT SettingValue FROM ApplicationSettings WHERE SettingKey = 'rotationStartWeek'");
        
        if (settingsResult.recordset.length > 0) {
            const startWeek = parseInt(settingsResult.recordset[0].SettingValue, 10);
            console.log('Start week:', startWeek);
        } else {
            console.log('⚠️  No rotation start week set, defaulting to 1');
        }

        // Calculate current on-call person
        if (scheduleResult.recordset.length > 0) {
            const schedule = scheduleResult.recordset;
            const startWeek = settingsResult.recordset.length > 0 ? parseInt(settingsResult.recordset[0].SettingValue, 10) : 1;
            
            const now = new Date();
            const start = new Date(now.getFullYear(), 0, 1);
            const diff = now - start;
            const oneWeek = 1000 * 60 * 60 * 24 * 7;
            const weekOfYear = Math.floor(diff / oneWeek) + 1;
            
            const weeksElapsed = weekOfYear - startWeek;
            // Handle negative weeks with proper modulo calculation
            const currentIndex = ((weeksElapsed % schedule.length) + schedule.length) % schedule.length;
            const onCallPerson = schedule[currentIndex];
            
            console.log('\n🎯 CURRENT ON-CALL PERSON:');
            console.log('  Name:', onCallPerson.StaffName);
            console.log('  Position:', onCallPerson.Position);
            console.log('  WhatsApp:', onCallPerson.Whatsapp || '❌ NOT SET!');
            console.log('  Current week:', weekOfYear);
            console.log('  Weeks elapsed:', weeksElapsed);
            console.log('  Index:', currentIndex);
            
            if (!onCallPerson.Whatsapp) {
                console.log('\n❌ PROBLEM FOUND: Current on-call person has no WhatsApp number!');
                console.log('Please update the WhatsApp number in the On Call tab.\n');
            } else {
                console.log('\n✅ On-call person has WhatsApp number set correctly.');
            }
        }

        // Check current time
        console.log('\n⏰ Current time check:');
        const now = new Date();
        const currentHour = now.getHours();
        console.log('  Current hour:', currentHour);
        console.log('  Is after 5 PM (17)?', currentHour >= 17);
        console.log('  Is before 8 AM (8)?', currentHour < 8);
        console.log('  Should send to on-call?', (currentHour >= 17 || currentHour < 8));
        
        if (currentHour >= 17 || currentHour < 8) {
            console.log('\n✅ Current time is OUTSIDE business hours - tickets should go to on-call person');
        } else {
            console.log('\n⚠️  Current time is WITHIN business hours (8 AM - 5 PM) - tickets will NOT go to on-call person');
        }

        await sql.close();
        console.log('\n✅ Diagnosis complete');
        
    } catch (error) {
        console.error('❌ Error during diagnosis:', error);
    } finally {
        process.exit(0);
    }
}

diagnose();
