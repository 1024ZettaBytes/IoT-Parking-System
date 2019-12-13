# Practica ESP32
# Equipo:
# Jes煤s Eduardo Ram铆rez Cota. Ariel Aramburo Barraza, Carlos Eduardo Ruiz Parra

from umqttsimple import MQTTClient
import ubinascii
import machine
import micropython  
import network
import time
import esp
import os
from machine import Pin, ADC
esp.osdebug(None)
import gc


gc.collect()

ssid = 'ITSON_IoT'
password = 'ITSON_2019'
station = network.WLAN(network.STA_IF)
station.active(True)
print('[*] Conectando a la red Wi-fi...')
station.connect(ssid, password)

while station.isconnected() == False:
  pass

# Hasta que se conecta a la red wifi llega aqu铆
print('[*] Se ha conectado a la red!')
print(station.ifconfig())




mqtt_server = '10.170.0.21'
client_id = ubinascii.hexlify(machine.unique_id())
topic_pub = b'readings'
def connect_and_subscribe():
  global client_id, mqtt_server
  client = MQTTClient('Esp32', mqtt_server)
  client.connect()
  print('[*]Connected to %s MQTT broker' % (mqtt_server))
  return client

def restart_and_reconnect():
  print('Failed to connect to MQTT broker. Reconnecting...')
  time.sleep(3)
  machine.reset()

try:
  client = connect_and_subscribe()
except OSError as e:
  restart_and_reconnect()

s1 = ADC(Pin(36))
s1.atten(ADC.ATTN_11DB)

s2 = ADC(Pin(39))
s2.atten(ADC.ATTN_11DB) 

s3 = ADC(Pin(34))
s3.atten(ADC.ATTN_11DB)

s4 = ADC(Pin(35))
s4.atten(ADC.ATTN_11DB) 
try:
  
  lastStatus1 = False
  lastStatus2 = False 
  lastStatus3 = False 
  lastStatus4 = False 
  #print('Se publicó el mesaje')
  while True:
    
    sensorId = 1
    status = s1.read()<100
    reading = '{ "sensorId": '+str(sensorId)+', "status": '+ str(status).lower()+'}'
    if(status!=lastStatus1):
      lastStatus1 = status
      client.publish(topic_pub, reading)
    print(reading)
    
    sensorId = 2
    status = s2.read()<100
    reading = '{ "sensorId": '+str(sensorId)+', "status": '+ str(status).lower()+'}'
    if(status!=lastStatus2):
      lastStatus2 = status
      client.publish(topic_pub, reading)
    print(reading)
    
    sensorId = 3
    status = s3.read()<100
    reading = '{ "sensorId": '+str(sensorId)+', "status": '+ str(status).lower()+'}'
    if(status!=lastStatus3):
      lastStatus3 = status
      client.publish(topic_pub, reading)
    print(reading)
    
    sensorId = 4
    status = s4.read()<100
    reading = '{ "sensorId": '+str(sensorId)+', "status": '+ str(status).lower()+'}'
    if(status!=lastStatus4):
      lastStatus4  = status
      client.publish(topic_pub, reading)
    print(reading)
    time.sleep(1)
    print('Lecturas enviadas')
except OSError as e:
  restart_and_reconnect()






