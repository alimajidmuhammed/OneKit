
import * as Icons from 'lucide-react';
const requiredIcons = ['Mail', 'Phone', 'MapPin', 'Linkedin', 'Globe', 'FileText', 'Image', 'Plus', 'X', 'Download', 'Wand2', 'Loader2', 'ArrowLeft', 'Upload', 'ChevronDown', 'User', 'CheckCircle', 'AlertCircle', 'RotateCcw', 'RotateCw', 'Trash2', 'Edit3', 'Sparkles', 'Layout', 'Type', 'Palette', 'Languages', 'Award', 'Users', 'Briefcase', 'GraduationCap', 'Info', 'ExternalLink', 'Maximize2', 'MousePointer2', 'Save', 'FileType', 'FileImage'];

console.log('--- Checking Icons ---');
requiredIcons.forEach(icon => {
  if (Icons[icon]) {
    // Found
  } else {
    console.error('MISSING ICON:', icon);
  }
});
console.log('--- Check Complete ---');
