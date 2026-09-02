const fs = require('fs');
let content = fs.readFileSync('src/components/admin/AdminMediaLibrary.tsx', 'utf8');

// Replace the UNGGAH FILE BARU button to open file picker directly
const regex = /<button[\s\S]*?onClick=\{\(\) => setIsAddModalOpen\(true\)\}[\s\S]*?<span>UNGGAH FILE BARU<\/span>[\s\S]*?<\/button>/m;
const replacement = `<label
            className="cursor-pointer bg-[#FFD166] hover:bg-[#F4C142] text-[#18181B] font-display font-black text-sm px-5 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] flex items-center gap-2 transition-all hover:translate-y-[-1px]"
          >
            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm" onChange={handleDirectUploadMediaLibrary} />
            <Plus className="w-4 h-4 text-[#18181B]" />
            <span>{isUploading ? 'MENGUNGGAH...' : 'UNGGAH FILE BARU'}</span>
          </label>`;
content = content.replace(regex, replacement);

// Now we need to define handleDirectUploadMediaLibrary near handleFileSelect
const directUpload = `
  const handleDirectUploadMediaLibrary = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    setUploadProgress(10);
    try {
      if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = async () => {
          window.URL.revokeObjectURL(video.src);
          const duration = Math.round(video.duration);
          try {
            await videoService.uploadVideo(file, { width: video.videoWidth, height: video.videoHeight, duration });
            setUploadProgress(100);
            setIsUploading(false);
          } catch (err) {
            console.error(err);
            alert('Gagal mengunggah video.');
            setIsUploading(false);
          }
        };
        video.src = window.URL.createObjectURL(file);
      } else {
        const img = new Image();
        img.onload = async () => {
          window.URL.revokeObjectURL(img.src);
          try {
            await mediaService.uploadMedia(file, {
              title: file.name,
              category: 'Umum',
              type: 'foto',
              width: img.width,
              height: img.height,
              orientation: img.width > img.height ? 'LANDSCAPE' : img.width < img.height ? 'PORTRAIT' : 'SQUARE'
            });
            setUploadProgress(100);
            setIsUploading(false);
          } catch (err) {
            console.error(err);
            alert('Gagal mengunggah gambar.');
            setIsUploading(false);
          }
        };
        img.src = window.URL.createObjectURL(file);
      }
    } catch (err) {
      console.error(err);
      alert('Gagal memproses file.');
      setIsUploading(false);
    }
  };
`;

const handlePos = content.indexOf('const handleFileSelect');
content = content.substring(0, handlePos) + directUpload + content.substring(handlePos);

fs.writeFileSync('src/components/admin/AdminMediaLibrary.tsx', content);
