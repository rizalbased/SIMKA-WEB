const fs = require('fs');
let content = fs.readFileSync('src/services/slideService.ts', 'utf8');

const regex = /if \(slide\.tipe === 'GALERI' \|\| slide\.tipe === 'PENGUMUMAN' \|\| slide\.tipe === 'GRID'\) \{[\s\S]*?\} else if \(slide\.tipe === 'VIDEO'\) \{[\s\S]*?\}/m;

const replacement = `// Intelligent mapping based on slide_media relations so that Fullscreen renders correctly
          const mappedUrls = mediaItems.map((m: any) => getPublicUrl(m.file_path || m.url));
          
          if (slide.tipe === '3_FOTO' || slide.tipe === 'GALERI') {
            content.photos = mappedUrls.slice(0, 3) as [string, string, string];
          } else if (slide.tipe === 'FOTO_GRID' || slide.tipe === 'GRID') {
            content.gridPhotos = mappedUrls.slice(0, 4) as [string, string, string, string];
          } else if (slide.tipe === '1_POSTER') {
            content.posterUrl = mappedUrls[0];
          } else if (slide.tipe === '3_POSTER') {
            content.posters = mappedUrls.slice(0, 3) as [string, string, string];
          } else if (slide.tipe === 'FOTO_INFORMASI' || slide.tipe === 'SPLIT') {
            content.splitPhotoUrl = mappedUrls[0];
          } else if (slide.tipe === 'VIDEO') {
            content.videoUrl = mappedUrls[0];
          }`;
          
content = content.replace(regex, replacement);
fs.writeFileSync('src/services/slideService.ts', content);
