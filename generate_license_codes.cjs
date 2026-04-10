const crypto = require('crypto');

function generateLicenseCodes(count) {
  const codes = [];
  const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');

  for (let i = 0; i < count; i++) {
    const randomBytes = crypto.randomBytes(8).toString('hex').toUpperCase();
    const code = `AI-${timestamp}-${randomBytes.slice(0, 4)}-${randomBytes.slice(4, 8)}`;

    codes.push({
      code: code,
      createdAt: new Date().toISOString(),
      isUsed: false
    });
  }

  return codes;
}

const codes = generateLicenseCodes(100);

const output = {
  version: '1.0',
  generatedAt: new Date().toISOString(),
  totalCodes: codes.length,
  codes: codes
};

console.log('Generated 100 license codes:');
codes.forEach((c, i) => {
  console.log(`${i + 1}. ${c.code}`);
});

const fs = require('fs');
fs.writeFileSync('license_codes.json', JSON.stringify(output, null, 2));
console.log('\nLicense codes saved to license_codes.json');
