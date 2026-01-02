const fs=require('fs'); 
const lines=fs.readFileSync('page.tsx','utf8').split(/\r?\n/); 
lines.forEach((l,i)= console.log((i+1)+': '+l)}); 
