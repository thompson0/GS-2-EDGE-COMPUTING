# 🛰️ Projeto Edge - Sprint 4

# 👷 Integrantes  
Gabriel Thompson — RM563126 <br>
Nicolas Baradel — RM563245 <br>
Enzo Quarelo — RM61503 <br>


**Monitoramento de Batimentos Cardíacos e Calorias com ESP32 + FIWARE + Next.js**

---

## 📘 Descrição do Projeto

Este projeto tem como objetivo demonstrar a integração entre **dispositivos IoT (ESP32)** e a **plataforma FIWARE**, utilizando **MQTT** para comunicação e **Next.js** para visualização dos dados em tempo real.

O sistema simula um dispositivo que envia **batimentos cardíacos** e **calorias** a cada 5 segundos, armazena as informações no **FIWARE** (via Orion e STH-Comet), e exibe os resultados num **dashboard web interativo**.

---

## ⚙️ Arquitetura Geral

```
ESP32 → MQTT (IoT Agent) → Orion Context Broker → STH-Comet → Dashboard Next.js
```

### 🧩 Componentes principais:

* **ESP32 (simulado no Wokwi)** → Gera dados e envia via MQTT.
* **IoT Agent MQTT** → Traduz mensagens do ESP32 para o formato NGSI.
* **Orion Context Broker** → Armazena o estado atual do dispositivo.
* **STH-Comet** → Guarda o histórico das medições.
* **Next.js + Recharts + Shadcn/UI** → Exibe os dados em gráficos.

---

## 💻 Código do ESP32 (Resumo)

O código do microcontrolador realiza as seguintes etapas:

1. Conecta-se ao **Wi-Fi** e ao **broker MQTT**.
2. Simula sensores de **batimentos cardíacos** e **calorias**.
3. Publica os valores nos tópicos MQTT do IoT Agent.
4. Recebe comandos do FIWARE (ex: ligar/desligar LED).
5. Envia dados a cada 5 segundos para o Orion e o STH-Comet.

Essas informações são processadas e ficam disponíveis para visualização no dashboard.

---

## 🌐 Dashboard Next.js

O front-end foi desenvolvido com **Next.js 14**, **Recharts** e **Shadcn/UI** para um design limpo e responsivo.

### Estrutura

* `/app/page.jsx` → Página principal do dashboard
* `/components/DeviceHistoryChart.jsx` → Gráfico dinâmico que mostra HR e CAL
* `/api/sth/route.js` → Proxy interno para o STH-Comet (resolve CORS)

### Execução

```bash
npm install
npm run dev
```

Acesse em [http://localhost:3000](http://localhost:3000)

---

## 🧩 Fluxo de Dados Simplificado

1. O ESP32 envia os dados via **MQTT**.
2. O **IoT Agent** traduz para **NGSI** e envia ao **Orion**.
3. O **Orion** notifica o **STH-Comet**, que salva o histórico.
4. O **Next.js Dashboard** busca esses dados e exibe em gráficos.

---

## 🖥️ Tecnologias Utilizadas

* **ESP32 (Arduino + Wokwi)**
* **FIWARE Stack:** Orion, IoT Agent MQTT, Mosquitto, STH-Comet
* **MongoDB**
* **Next.js 14**
* **Recharts**
* **Shadcn/UI**
* **cURL / jq** (para configuração e debug)

---

## 📊 Resultado Final

O sistema exibe dois gráficos atualizados em tempo real:

* **Batimentos Cardíacos (HR)**
* **Calorias (CAL)**

Os dados são enviados automaticamente pelo ESP32, processados pelo FIWARE e exibidos no dashboard web.


---

## 🧠 Poc

### 🔹 Registro do dispositivo no IoT Agent
```bash
curl -iX POST "http://44.223.43.74:4041/iot/devices" \
  -H "Content-Type: application/json" \
  -H "fiware-service: smart" \
  -H "fiware-servicepath: /" \
  -d '{
    "devices": [{
      "device_id": "device001",
      "entity_name": "urn:ngsi-ld:device:001",
      "entity_type": "device",
      "protocol": "PDI-IoTA-UltraLight",
      "transport": "MQTT",
      "attributes": [
        { "object_id": "hr", "name": "hr", "type": "Integer" },
        { "object_id": "cal", "name": "cal", "type": "Integer" }
      ]
    }]
  }'
```

### 🔔 Subscription para enviar histórico ao STH-Comet
```bash
curl -iX POST "http://44.223.43.74:1026/v2/subscriptions" \
  -H "Content-Type: application/json" \
  -H "fiware-service: smart" \
  -H "fiware-servicepath: /" \
  -d '{
    "description": "Notify STH-Comet of HR/Cal changes",
    "subject": {
      "entities": [{ "id": "urn:ngsi-ld:device:001", "type": "device" }],
      "condition": { "attrs": ["hr", "cal"] }
    },
    "notification": {
      "http": { "url": "http://sth-comet:8666/notify" },
      "attrs": ["hr", "cal"],
      "attrsFormat": "legacy"
    },
    "throttling": 1
  }'
```

### 📦 Verificar dados no Orion
```bash
curl "http://44.223.43.74:1026/v2/entities/urn:ngsi-ld:device:001" \
  -H "fiware-service: smart" -H "fiware-servicepath: /" | jq .
```

### 📊 Ver histórico no STH-Comet
```bash
curl "http://44.223.43.74:8666/STH/v1/contextEntities/type/device/id/urn:ngsi-ld:device:001/attributes/hr?lastN=10" \
  -H "fiware-service: smart" -H "fiware-servicepath: /" | jq .
```



