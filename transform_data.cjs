const fs = require('fs');
const content = fs.readFileSync('src/data/algeriaData.js', 'utf8');
const startIndex = content.indexOf('[');
const endIndex = content.lastIndexOf(']') + 1;
const data = JSON.parse(content.substring(startIndex, endIndex));
const transformed = {};
const names = {};
data.forEach(w => {
    const id = w.id.toString().padStart(2, '0');
    names[id] = w.name_ar;
    transformed[id] = w.communes.map(c => c.name_ar);
});
fs.writeFileSync('src/data/algeriaData.js', `export const wilayaNames = ${JSON.stringify(names, null, 4)};\n\nexport const algeriaData = ${JSON.stringify(transformed, null, 4)};`);
console.log('TRANS_SUCCESS');
