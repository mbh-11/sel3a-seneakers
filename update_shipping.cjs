const fs = require('fs');
const content = fs.readFileSync('src/data/shippingData.js', 'utf8');

// regex to find keys like "1": or "2": and replace with "01": etc.
let newContent = content.replace(/"(\d)":/g, '"0$1":');

// regex to remove 59 through 69
// they look like "59": { ... },
for(let i=59; i<=69; i++) {
    const regex = new RegExp(`\\s*"${i}": \\{ [\\s\\S]*? \\},?`, 'g');
    newContent = newContent.replace(regex, '');
}

// Remove trailing comma if any after truncation
newContent = newContent.replace(/},\s*};/, '}\n};');

fs.writeFileSync('src/data/shippingData.js', newContent);
console.log('Shipping data updated');
