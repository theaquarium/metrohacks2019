#include <ESP8266HTTPClient.h>
#include <ESP8266WiFi.h>
#define VIN A0 // define the Arduino pin A0 as voltage input (V in)
const float VCC   = 3.3;// supply voltage is from 4.5 to 5.5V. Normally 5V.
const int model = 1;   // enter the model number (see below)
float newabscurrent;
int t1; // timer 1
int t2; // timer 2
float current;
float cutOffLimit = 0;// set the current which below that value, doesn't matter. Or set 0.5
float c1;
int n;
float sum;
float avgcurrent;
/*
          "ACS712ELCTR-05B-T",// for model use 0
          "ACS712ELCTR-20A-T",// for model use 1
          "ACS712ELCTR-30A-T"// for model use 2  
sensitivity array is holding the sensitivy of the  ACS712
current sensors. Do not change. All values are from page 5  of data sheet          
*/
float sensitivity[] ={
          0.185,// for ACS712ELCTR-05B-T
          0.100,// for ACS712ELCTR-20A-T
          0.066// for ACS712ELCTR-30A-T
     
         }; 


const float QOV =   VCC/2;// half the voltage (due to current sensor)
float voltage;// internal variable for voltage

void setup() {

  Serial.begin(115200);                                  //Serial connection
  WiFi.begin("Kevin's WiFi", "cnpku123");   //WiFi connection
 
  while (WiFi.status() != WL_CONNECTED) {  //Wait for the WiFI connection completion
 
    delay(500);
    Serial.println("Waiting for connection");
 
  }
}
 

 
void loop() 
{
  for (int i=0; i<100; i++){ 
 float voltage_raw =   (VCC/ 1023.0)* analogRead(VIN);// Read the voltage from sensor
  voltage =  voltage_raw - QOV + 0.000 ;// 0.000 is a value to make voltage zero when there is no current
  float raw_current = (voltage / sensitivity[model]); //current that may be posstive or negetive
  float abscurrent = sqrt(raw_current*raw_current); //current that is postive
  
  if (t2 <= 10) {
      if (t1 <= 10){
        if  (newabscurrent < abscurrent){
          newabscurrent = abscurrent;
        }
  
        }
        else { 
          newabscurrent = 0;
          t1 = 0;
          t2++;
          }
          
    if (current < newabscurrent){
      current = newabscurrent;
    }
  }
  else {
    current = newabscurrent;
    t2 = 0;
  }
  sum += current;
  if (n=10){
    avgcurrent = (sum/2) -.6;
    Serial.print("I: "); 
    Serial.print(avgcurrent,2); // print the current with 2 decimal places
    Serial.println("A");
    n=0;
    sum=0;
  }
  n++;
  t1++;
  delay(100);
  }
  
 if(WiFi.status()== WL_CONNECTED){   //Check WiFi connection status
 
   HTTPClient http;    //Declare object of class HTTPClient
 
   http.begin("http://192.168.137.167:5849/report-powerstrip");      //Specify request destination
   http.addHeader("Content-Type", "application/json");  //Specify content-type header
   String stcurrent = String(avgcurrent);
   int httpCode = http.POST("{\"current\":\"" + stcurrent + "\", \"token\": \"f8308382-40dd-46dc-b188-6c613ca9f112\", \"id\": \"92944f48-c331-4057-82d4-d8e81d9a3a64\" }");   //Send the request
   String payload = http.getString();                  //Get the response payload
 
   Serial.println(httpCode);   //Print HTTP return code
   Serial.println(payload);    //Print request response payload
 
   http.end();  //Close connection
 
 }else{
 
    Serial.println("Error in WiFi connection");   
 
 }
 
  delay(1);  //Send a request every 10 seconds

}
