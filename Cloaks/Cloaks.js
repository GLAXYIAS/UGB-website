export const cloaks = [
  {
    name: "Google Classroom",
    title: "Classes",
    icon: "https://ssl.gstatic.com/classroom/favicon.png"
  },
  {
    name: "Google Drive",
    title: "My Drive - Google Drive",
    icon: "https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png"
  }
];

export function applyCloak(cloakName) {
  const selected = cloaks.find(c => c.name === cloakName);
  if (selected) {
    document.title = selected.title;
    let link = document.querySelector("link[rel*='icon']") || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = selected.icon;
    document.getElementsByTagName('head')[0].appendChild(link);
    localStorage.setItem('savedCloak', cloakName);
  }
}
