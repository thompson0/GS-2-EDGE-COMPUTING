# 🩺 Projeto Edge — Sprint 4  
### **Monitoramento de Pressão Arterial com ESP32 + MQTT + FIWARE + Next.js**

## 👷 Integrantes  
- **Gabriel Thompson** — RM563126  
- **Nicolas Baradel** — RM563245  
- **Enzo Quarelo** — RM61503  

---

# 📘 Descrição do Projeto

Este projeto apresenta um sistema completo de **monitoramento de pressão arterial** utilizando:

- **ESP32** (simulado no Wokwi)  
- **MQTT (Mosquitto)**  
- **FIWARE IoT Agent UL**  
- **Orion Context Broker**  
- **STH-Comet**  
- **Next.js** para visualização dos dados  

As medições simuladas de:

- **Pressão Sistólica (SYS)**
- **Pressão Diastólica (DIA)**

são enviadas pelo ESP32 → FIWARE → Dashboard web em tempo real.

---

# ⚙️ Arquitetura Geral

```
ESP32
  ↓ MQTT (Mosquitto)
IoT Agent UL
  ↓ NGSI
Orion Context Broker
  ↓ Notificação
STH-Comet (Histórico)
  ↓ API Proxy
Dashboard Next.js
```

---

# 🧩 Componentes Utilizados

| Componente | Função |
|-----------|--------|
| **ESP32** | Gera leituras e envia via MQTT |
| **Mosquitto** | Broker MQTT |
| **IoT Agent UL** | Traduz UltraLight → NGSI |
| **Orion CB** | Armazena estado atual do dispositivo |
| **STH-Comet** | Guarda o histórico (time-series) |
| **MongoDB** | Armazenamento |
| **Next.js 14** | Front-end do dashboard |
| **Recharts** | Gráficos |
| **Shadcn/UI** | Layout |

---

# 💻 ESP32 — Publicação UL

O dispositivo publica no tópico:

```
12345/Sensor001/attrs
```

Com payload UltraLight:

```
sys|120|dia|80
```

Enviado a cada **3 segundos**.

---

# 🗂️ Registro do Device no IoT Agent

```bash
curl -iX POST "http://localhost:4041/iot/devices"   -H "Content-Type: application/json"   -H "fiware-service: smart"   -H "fiware-servicepath: /"   -d '{
    "devices": [{
      "device_id": "Sensor001",
      "entity_name": "Sensor001",
      "entity_type": "Device",
      "transport": "MQTT",
      "protocol": "PDI-IoTA-UltraLight",
      "attributes": [
        { "object_id": "sys", "name": "sys", "type": "Number" },
        { "object_id": "dia", "name": "dia", "type": "Number" }
      ]
    }]
  }'
```

---

# 🔔 Criar Subscription → STH-Comet

```bash
curl -iX POST "http://localhost:1026/v2/subscriptions"   -H "Content-Type: application/json"   -H "fiware-service": "smart"   -H "fiware-servicepath": "/"   -d '{
    "description": "Salvar historico SYS/DIA no STH-Comet",
    "subject": {
      "entities": [{ "id": "Sensor001", "type": "Device" }],
      "condition": { "attrs": ["sys", "dia"] }
    },
    "notification": {
      "http": { "url": "http://fiware-sth-comet:8666/notify" },
      "attrs": ["sys","dia"],
      "attrsFormat": "legacy"
    },
    "throttling": 1
  }'
```

---

# 📦 Consultar estado atual no Orion

```bash
curl "http://localhost:1026/v2/entities/Sensor001"   -H "fiware-service: smart"   -H "fiware-servicepath: /" | jq
```

---

# 📊 Buscar histórico no STH-Comet

SYS:

```bash
curl "http://localhost:8666/STH/v1/contextEntities/type/Device/id/Sensor001/attributes/sys?lastN=10"   -H "fiware-service: smart"   -H "fiware-servicepath: /" | jq
```

DIA:

```bash
curl "http://localhost:8666/STH/v1/contextEntities/type/Device/id/Sensor001/attributes/dia?lastN=10"   -H "fiware-service: smart"   -H "fiware-servicepath: /" | jq
```

---

# 🌐 Dashboard Next.js (Front-End)

O Next.js não pode acessar diretamente o LocalToNet (CORS).  
Então criamos uma rota proxy:

---

# 📡 `/api/sth` — Proxy interno (resolve CORS + SSL)

```js
import https from "https";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const attr = searchParams.get("attr") || "sys";
  const lastN = searchParams.get("lastN") || 20;

  const agent = new https.Agent({ rejectUnauthorized: false });

  const STH = "https://SEU_TUNEL.localto.net";

  const url = `${STH}/STH/v1/contextEntities/type/Device/id/Sensor001/attributes/${attr}?lastN=${lastN}`;

  const res = await fetch(url, {
    headers: {
      "fiware-service": "smart",
      "fiware-servicepath": "/",
    },
    agent,
  });

  return Response.json(await res.json());
}
```

---

# 📈 Gráficos (SYS/DIA)

- Atualização automática  
- Dados reais do STH-Comet  
- Tabela com últimos valores  
- Interface moderna com Shadcn/UI  

---

# 🖥️ Executar Projeto

```bash
npm install
npm run dev
```

Acesse:

```
http://localhost:3000
```

---

# 🎉 Resultado Final

O dashboard exibe:

- Pressão Sistólica (SYS)
- Pressão Diastólica (DIA)
- Gráficos históricos
- Dados em tempo real

Sistema completo ESP32 → FIWARE → Web Dashboard.
