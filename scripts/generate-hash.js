import bcrypt from 'bcrypt';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('====================================');
console.log('🔑 Master Password Hash Generator 🔑');
console.log('====================================\n');

rl.question('Enter the Master Password you want to use: ', async (password) => {
  if (!password) {
    console.error('Password cannot be empty.');
    rl.close();
    return;
  }

  try {
    const saltRounds = 12; // Standard secure salt rounds for bcrypt
    console.log(`\nGenerating bcrypt hash (Cost: ${saltRounds})...\n`);
    
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('✅ Hash generated successfully!\n');
    console.log('--------------------------------------------------');
    console.log(hash);
    console.log('--------------------------------------------------\n');
    console.log('Copy the hash above and paste it into Vercel as your ADMIN_MASTER_PASSWORD_HASH Environment Variable.');
  } catch (error) {
    console.error('Error generating hash:', error);
  } finally {
    rl.close();
  }
});
