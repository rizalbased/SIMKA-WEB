const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminMediaLibrary.tsx', 'utf8');

content = content.replace(
  /width: img\.width,\n\s*height: img\.height,\n\s*orientation: /g,
  "type: 'foto',\n              width: img.width,\n              height: img.height,\n              orientation: "
);
fs.writeFileSync('src/components/admin/AdminMediaLibrary.tsx', content);
