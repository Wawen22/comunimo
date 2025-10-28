/**
 * Script to test SMTP connection with Brevo
 * Run with: node scripts/test-smtp.js
 */

const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=:#]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      let value = match[2].trim();
      // Remove quotes if present
      value = value.replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  });
}

async function testSMTP() {
  console.log('🔧 Testing SMTP Configuration...\n');

  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  };

  console.log('📋 Configuration:');
  console.log('  Host:', config.host);
  console.log('  Port:', config.port);
  console.log('  Secure:', config.secure);
  console.log('  User:', config.auth.user);
  console.log('  From:', process.env.SMTP_FROM);
  console.log('');

  if (!config.host || !config.auth.user || !config.auth.pass) {
    console.error('❌ Missing SMTP configuration in .env.local');
    process.exit(1);
  }

  console.log('🔌 Creating transporter...');
  const transporter = nodemailer.createTransport(config);

  try {
    console.log('✅ Verifying SMTP connection...');
    await transporter.verify();
    console.log('✅ SMTP connection verified successfully!\n');

    // Ask for test email address
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    readline.question('📧 Enter test email address (or press Enter to skip): ', async (email) => {
      readline.close();

      if (!email || !email.includes('@')) {
        console.log('⏭️  Skipping test email send');
        process.exit(0);
      }

      console.log(`\n📤 Sending test email to ${email}...`);

      try {
        const info = await transporter.sendMail({
          from: process.env.SMTP_FROM || config.auth.user,
          to: email,
          subject: 'Test Email from ComUniMo',
          text: 'This is a test email from ComUniMo to verify SMTP configuration.',
          html: '<p>This is a <strong>test email</strong> from ComUniMo to verify SMTP configuration.</p>',
        });

        console.log('✅ Test email sent successfully!');
        console.log('   Message ID:', info.messageId);
        console.log('   Response:', info.response);
        console.log('\n✨ SMTP is working correctly!');
        process.exit(0);
      } catch (error) {
        console.error('❌ Failed to send test email:', error.message);
        if (error.response) {
          console.error('   Server response:', error.response);
        }
        process.exit(1);
      }
    });
  } catch (error) {
    console.error('❌ SMTP verification failed:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.response) {
      console.error('   Server response:', error.response);
    }
    console.log('\n💡 Common issues:');
    console.log('   - Check that SMTP credentials are correct');
    console.log('   - Verify that the sender email is verified in Brevo');
    console.log('   - Check firewall/network settings');
    console.log('   - Try using port 465 with SMTP_SECURE=true');
    process.exit(1);
  }
}

testSMTP();

