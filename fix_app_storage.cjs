const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /\.on\('postgres_changes', \{ event: '\*', schema: 'public', table: 'jadwal_les' \}, \(\) => \{/m;
const replacement = `.on('postgres_changes', { event: '*', schema: 'public', table: 'jadwal_les' }, () => {
        jadwalService.getJadwal().then(setLessonPeriods);
      })
      .on('postgres_changes', { event: '*', schema: 'storage', table: 'objects', filter: 'bucket_id=eq.galeri-emka' }, (payload) => {
        // Handle direct storage deletion to sync public.media
        if (payload.eventType === 'DELETE') {
          const filePath = payload.old?.name;
          if (filePath) {
            // Delete metadata from public.media implicitly
            // We can also trigger refreshMedia()
            supabase.from('media').delete().eq('file_path', filePath).then(() => {
              refreshMedia();
            });
            supabase.from('videos').delete().eq('file_path', filePath).then(() => {
              refreshMedia();
            });
          }
        }
        refreshMedia();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jadwal_les_dummy' }, () => {`;

// wait actually, I'll just use string replacement on `.subscribe();`
const subRegex = /\.subscribe\(\);/g;
const subReplacement = `.on('postgres_changes', { event: '*', schema: 'storage', table: 'objects', filter: 'bucket_id=eq.galeri-emka' }, (payload) => {
        if (payload.eventType === 'DELETE') {
          const filePath = payload.old?.name;
          if (filePath) {
            supabase.from('media').delete().eq('file_path', filePath).then(() => refreshMedia());
            supabase.from('videos').delete().eq('file_path', filePath).then(() => refreshMedia());
          }
        } else {
          refreshMedia();
        }
      })
      .subscribe();`;
      
content = content.replace(subRegex, subReplacement);
fs.writeFileSync('src/App.tsx', content);
