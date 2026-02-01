import google.generativeai as genai
import speech_recognition as sr
import pyttsx3

# 1. Setup the Voice
engine = pyttsx3.init()
def speak(text):
    engine.say(text)
    engine.runAndWait()

# 2. Setup the Brain
genai.configure(api_key="YOUR_GEMINI_API_KEY")
model = genai.GenerativeModel('gemini-1.5-flash')

# 3. Main Logic
def start_jarvis():
    r = sr.Recognizer()
    with sr.Microphone() as source:
        print("Listening...")
        audio = r.listen(source)
        try:
            user_input = r.recognize_google(audio)
            print(f"You said: {user_input}")
            
            # Send to Gemini
            response = model.generate_content(user_input)
            print(f"Jarvis: {response.text}")
            speak(response.text)
            
        except Exception as e:
            print("Sorry, I didn't catch that.")

if __name__ == "__main__":
    speak("Systems online. How can I help, sir?")
    while True:
        start_jarvis()
