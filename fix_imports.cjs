const fs = require('fs');

// 1. Fix AdminBoardDisplay.tsx
let content1 = fs.readFileSync('src/components/admin/AdminBoardDisplay.tsx', 'utf8');
if (!content1.includes('import { supabase, getPublicUrl }')) {
  content1 = content1.replace(
    "import { Plus, GripVertical, Trash2, Edit2, Play, Settings, X, Calendar, Image as ImageIcon, LayoutGrid, Sparkles, Tv, Maximize } from 'lucide-react';",
    "import { Plus, GripVertical, Trash2, Edit2, Play, Settings, X, Calendar, Image as ImageIcon, LayoutGrid, Sparkles, Tv, Maximize } from 'lucide-react';\nimport { supabase, getPublicUrl, isSupabaseConfigured } from '../../lib/supabase';"
  );
  // wait, isSupabaseConfigured might already be imported. Let's just import supabase and getPublicUrl.
  content1 = content1.replace("import { isSupabaseConfigured } from '../../lib/supabase';", "import { isSupabaseConfigured, supabase, getPublicUrl } from '../../lib/supabase';");
  fs.writeFileSync('src/components/admin/AdminBoardDisplay.tsx', content1);
}

// 2. Fix AdminMediaLibrary.tsx
let content2 = fs.readFileSync('src/components/admin/AdminMediaLibrary.tsx', 'utf8');
content2 = content2.replace(/title: file\.name,\n\s*category: 'Umum',\n\s*type: 'foto',\n/g, ""); // mediaService.uploadMedia doesn't accept title/category in metadata payload.
fs.writeFileSync('src/components/admin/AdminMediaLibrary.tsx', content2);
