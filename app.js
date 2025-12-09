function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 +
            Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*
            Math.sin(dLon/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function pontoMaisProximo(latUser, lonUser) {
  let melhor = null, menor = Infinity;
  pontos.forEach(p => {
    const d = distanciaKm(latUser, lonUser, p.lat, p.lon);
    if (d < menor) { menor = d; melhor = {...p, distancia:d}; }
  });
  return melhor;
}

async function processar() {
  const end = document.getElementById("endereco").value;
  const r = document.getElementById("resultado");
  r.innerHTML = "Processando...";

  const url = "https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(end);
  const resp = await fetch(url);
  const dados = await resp.json();

  if (!dados.length) {
    r.innerHTML = "Endereço não encontrado!";
    return;
  }

  const lat = parseFloat(dados[0].lat);
  const lon = parseFloat(dados[0].lon);

  const p = pontoMaisProximo(lat, lon);

  const link = `https://www.google.com/maps/dir/?api=1&origin=${lat},${lon}&destination=${p.lat},${p.lon}&travelmode=driving`;

  r.innerHTML = `
    <p>Ponto mais próximo: <b>${p.nome}</b></p>
    <p>Distância: ${p.distancia.toFixed(2)} km</p>
    <a href="${link}" target="_blank" style="color:#81cfff;">Abrir rota no Google Maps</a>
  `;
}
