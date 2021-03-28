const url = 'https://docs.google.com/forms/d/e/1FAIpQLSe1u6DrjQWrA-Llk9KusdmVj0kti3FgjejpdNHgnpUgq7eXxg/viewform?usp=sf_link';
const start = (process.platform == 'darwin' ? 'open' : process.platform == 'win32' ? 'start' : 'xdg-open');
// only do survey for 1 out of 100 people
if (!Math.floor(Math.random() * 100)) require('child_process').exec(start + ' ' + url);