function distanciaKm(a,b,c,d){
 const R=6371, dLat=(c-a)*Math.PI/180, dLon=(d-b)*Math.PI/180;
 const h=Math.sin(dLat/2)**2+Math.cos(a*Math.PI/180)*Math.cos(c*Math.PI/180)*Math.sin(dLon/2)**2;
 return 2*R*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
}
function ordenar(lat,lon){
 return pontos.map(p=>({...p,dist:distanciaKm(lat,lon,p.lat,p.lon)})).sort((x,y)=>x.dist-y.dist);
}
function rotaGeo(latDest,lonDest,label){
 return `geo:${latDest},${lonDest}?q=${latDest},${lonDest}(${encodeURIComponent(label)})`;
}
function mostrar(lat,lon,origem){
 const r=document.getElementById("resultado");
 const ord=ordenar(lat,lon);
 let h=`<p><b>Origem:</b> ${origem}</p><ul class='lista-pontos'>`;
 ord.forEach((p,i)=>{
   const link=rotaGeo(p.lat,p.lon,p.nome);
   h+=`<li><b>${i+1}. ${p.nome}</b><br>Distância: ${p.dist.toFixed(2)} km<br>
        <a class='btn-mini' href='${link}'>Traçar rota</a></li>`;
 });
 r.innerHTML=h+"</ul>";
}
async function geocod(end){
 const u="https://nominatim.openstreetmap.org/search?format=json&q="+encodeURIComponent(end);
 const r=await fetch(u); const j=await r.json();
 if(!j.length) throw("Endereço não encontrado");
 return {lat:parseFloat(j[0].lat), lon:parseFloat(j[0].lon)};
}
async function processarEndereco(){
 const e=document.getElementById("endereco").value.trim();
 const r=document.getElementById("resultado");
 if(!e){ r.innerHTML="Digite um endereço."; return; }
 r.innerHTML="Localizando...";
 try{ const {lat,lon}=await geocod(e); mostrar(lat,lon,"Endereço digitado"); }
 catch(err){ r.innerHTML="Erro: "+err; }
}
function processarGPS(){
 const r=document.getElementById("resultado");
 if(!navigator.geolocation){ r.innerHTML="GPS não suportado."; return; }
 r.innerHTML="Obtendo localização...";
 navigator.geolocation.getCurrentPosition(pos=>{
   mostrar(pos.coords.latitude,pos.coords.longitude,"Minha localização (GPS)");
 },()=>r.innerHTML="Não foi possível obter localização.");
}
