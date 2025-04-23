#include <Wire.h>
#include <OneWire.h>
#include <DallasTemperature.h>

//========== PIN DEFINITIONS ==========
#define OV7670_ADDR 0x21
#define PIN_VSYNC 2
#define PIN_HREF 3
#define PIN_PCLK 4
#define PIN_XCLK 9

const int pixelPins[8] = {13, 5, 6, 7, 8, 10, 11, 12}; //D0–D7
const int tempPin = A0;
const int soundPin = A1;
const int lightPin = A2;

OneWire oneWire(tempPin);
DallasTemperature tempSensor(&oneWire);

void setup() {
  Serial.begin(115200);
  Wire.begin();

  pinMode(PIN_VSYNC, INPUT);
  pinMode(PIN_HREF, INPUT);
  pinMode(PIN_PCLK, INPUT);
  pinMode(PIN_XCLK, OUTPUT);
  for (int i = 0; i < 8; i++) pinMode(pixelPins[i], INPUT);

  setupXCLK();
  setupCamera();
  tempSensor.begin();

  Serial.println("Starting entropy sampler...");
}

void loop() {
  byte entropy[32] = {0};  //256-bit entropy pool
  byte imageMatrix[10][10];  //store the pixel matrix

  //=== Read Light Sensor ===
  int light = analogRead(lightPin);
  entropy[0] ^= light & 0xFF;
  entropy[1] ^= (light >> 2) & 0xFF;

  //=== Read Sound Sensor ===
  int sound = analogRead(soundPin);
  entropy[2] ^= sound & 0xFF;
  entropy[3] ^= (sound >> 3) & 0xFF;

  //=== Read Temperature ===
  tempSensor.requestTemperatures();
  float tempC = tempSensor.getTempCByIndex(0);
  int tempScaled = (int)(tempC * 100);
  entropy[4] ^= tempScaled & 0xFF;
  entropy[5] ^= (tempScaled >> 8) & 0xFF;

  //=== Capture Camera Data ===
  waitForVsync();
  delayMicroseconds(500);

  for (int row = 0; row < 10; row++) {
    waitForHref();
    delayMicroseconds(200);
    for (int col = 0; col < 10; col++) {
      waitForPclk(); delayMicroseconds(1);
      byte pixel = readPixelByte();
      waitForPclk(); delayMicroseconds(1); 
      imageMatrix[row][col] = pixel;

      int idx = (row * 10 + col) % 32;
      entropy[idx] ^= pixel;
    }
    delayMicroseconds(50);
  }

  //=== Output Values ===
  Serial.println("---- ENTROPY FRAME ----");
  Serial.print("Light: "); Serial.println(light);
  Serial.print("Sound: "); Serial.println(sound);
  Serial.print("Temp (°C): "); Serial.println(tempC);

  Serial.println("Camera Matrix (10x10):");
  for (int r = 0; r < 10; r++) {
    for (int c = 0; c < 10; c++) {
      Serial.print(imageMatrix[r][c]);
      Serial.print("\t");
    }
    Serial.println();
  }

  Serial.print("ENTROPY: ");
  for (int i = 0; i < 32; i++) {
    if (entropy[i] < 16) Serial.print("0");
    Serial.print(entropy[i], HEX);
  }
  Serial.println("\n------------------------");

  delay(2000);
}

//========== LOW-LEVEL CAMERA I/O ==========
void waitForVsync() {
  while (digitalRead(PIN_VSYNC) == HIGH);
  while (digitalRead(PIN_VSYNC) == LOW);
}

void waitForHref() {
  while (digitalRead(PIN_HREF) == LOW);
  while (digitalRead(PIN_HREF) == HIGH);
}

void waitForPclk() {
  while (digitalRead(PIN_PCLK) == LOW);
  while (digitalRead(PIN_PCLK) == HIGH);
}

byte readPixelByte() {
  byte val = 0;
  for (int i = 0; i < 8; i++) {
    val |= (digitalRead(pixelPins[i]) << i);
  }
  return val;
}

//========== CAMERA SETUP ==========
void setupXCLK() {
  pinMode(PIN_XCLK, OUTPUT);
  TCCR1A = _BV(COM1A0);
  TCCR1B = _BV(WGM12) | _BV(CS10);
  OCR1A = 1; // ~8 MHz
}

void setupCamera() {
  writeReg(0x12, 0x80); delay(100);
  writeReg(0x12, 0x20); // YUV
  writeReg(0x11, 0x01);
  writeReg(0x0C, 0x00);
  writeReg(0x3E, 0x00);
  writeReg(0x40, 0x10);
}

void writeReg(uint8_t reg, uint8_t val) {
  Wire.beginTransmission(OV7670_ADDR);
  Wire.write(reg);
  Wire.write(val);
  Wire.endTransmission();
}
