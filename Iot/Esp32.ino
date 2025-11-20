// ===== ESP32 - Telemetria FIWARE UltraLight + MQTT =====
// Pressão Arterial + Potenciômetro + LCD (sem LED no FIWARE)

#include <WiFi.h>
#include <PubSubClient.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ---------------- WIFI ----------------
const char* WIFI_SSID = "Wokwi-GUEST";
const char* WIFI_PASSWORD = "";

// ---------------- MQTT FIWARE ----------------
const char* BROKER_MQTT = "gvbtlro0r.localto.net";
const int BROKER_PORT = 7789; 


const char* ID_MQTT    = "device001";
const char* TOPICO_ATTR = "/smart/device001/attrs";



// ---------------- HARDWARE ----------------
#define PIN_POT 34
#define PIN_LED 2

LiquidCrystal_I2C lcd(0x27, 16, 2);

// ---------------- STATE ----------------
WiFiClient espClient;
PubSubClient mqtt(espClient);

int sysPressure = 0;
int diaPressure = 0;

// ---------------- WIFI INIT ----------------
void initWiFi() {
  WiFi.mode(WIFI_STA); // NECESSÁRIO NO WOKWI
  delay(100);

  Serial.print("Conectando ao WiFi: ");
  Serial.println(WIFI_SSID);

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int tentativas = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(200);
    Serial.print(".");
    tentativas++;

    // evita loop infinito quando o Wokwi bugado não conecta
    if (tentativas > 50) {
      Serial.println("\nFalha ao conectar. Reiniciando WiFi...");
      WiFi.disconnect(true);
      WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
      tentativas = 0;
    }
  }

  Serial.println("\nWiFi conectado!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}


// ---------------- MQTT ----------------
void connectMQTT() {
  while (!mqtt.connected()) {
    Serial.println("Conectando ao MQTT...");
    if (mqtt.connect(ID_MQTT)) {
      Serial.println("Conectado ao broker FIWARE!");
    } else {
      Serial.print("Falha MQTT. Código= ");
      Serial.println(mqtt.state());
      delay(2000);
    }
  }
}

// ---------------- SENSOR (POT) ----------------
void simulatePressure() {
  int raw = analogRead(PIN_POT);

  sysPressure = map(raw, 0, 4095, 100, 160);
  diaPressure = map(raw, 0, 4095, 60, 100);
}

// ---------------- LCD ----------------
void updateLCD() {
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Pressao:");
  lcd.setCursor(9, 0);
  lcd.print(sysPressure);
  lcd.print("/");
  lcd.print(diaPressure);

  lcd.setCursor(0, 1);
  lcd.print("Sistema OK");
}

// ---------------- MQTT PUBLISH ----------------
void publishUltraLight() {
  char msg[40];
  sprintf(msg, "sys|%d|dia|%d", sysPressure, diaPressure);

  mqtt.publish(TOPICO_ATTR, msg);

  Serial.print("[SEND] ");
  Serial.println(msg);
}

// ---------------- SETUP ----------------
void setup() {
  Serial.begin(115200);

  pinMode(PIN_LED, OUTPUT);

  lcd.init();
  lcd.backlight();
  lcd.print("Inicializando...");

  initWiFi();

  mqtt.setServer(BROKER_MQTT, BROKER_PORT);
}

// ---------------- LOOP ----------------
unsigned long lastSend = 0;

void loop() {
  if (!mqtt.connected()) connectMQTT();
  mqtt.loop();

  if (millis() - lastSend >= 3000) {
    lastSend = millis();

    simulatePressure();
    updateLCD();
    publishUltraLight();
  }
}
