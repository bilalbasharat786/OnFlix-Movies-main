export const generateSlug = (title) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // Special characters aur spaces ko dash (-) se replace karega
    .replace(/(^-|-$)+/g, '');   // Shuru ya aakhir mein agar dash ho to hata dega
};