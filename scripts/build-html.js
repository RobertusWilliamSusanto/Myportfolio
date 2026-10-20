const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Remove mismatched aria-labels
html = html.replace('href="#about" aria-label="Portfolio Home"', 'href="#about"');
html = html.replace('href="#about" aria-label="Overview Section"', 'href="#about"');
html = html.replace('href="#projects" aria-label="Projects Section"', 'href="#projects"');
html = html.replace('href="#experience" aria-label="Experience & Track Record"', 'href="#experience"');
html = html.replace('href="#skills" aria-label="Skills & Capabilities"', 'href="#skills"');
html = html.replace('href="#contact" aria-label="Contact Section"', 'href="#contact"');

// 2. Replace external link with inlined compiled CSS for 0 render blocking
const css = fs.readFileSync('css/style.css', 'utf8');
if (html.includes('<link rel="stylesheet" href="/css/style.css">')) {
  html = html.replace(
    '<link rel="stylesheet" href="/css/style.css">',
    `<style id="main-styles">\n${css}\n</style>`
  );
} else if (html.includes('<style id="main-styles">')) {
  html = html.replace(
    /<style id="main-styles">[\s\S]*?<\/style>/,
    `<style id="main-styles">\n${css}\n</style>`
  );
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Successfully updated index.html with inlined CSS and accessibility fixes!');
