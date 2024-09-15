# hamsterKombatAbuse

This is a research project on Telegram's ecosystem.

Hamster Kombat tap/click automation script.<br>
This utility is designed to run in a browser.


# Setting up

1. Sign in to Telegram Web version (https://web.telegram.org/k).
2. Install Resource Override browser extension (https://github.com/kylepaulsen/ResourceOverride).
3. Create a resource injection rule in Resource Override as follows:
   
      ![изображение](https://github.com/user-attachments/assets/1fe19dc6-ad92-4b42-b2da-27e38aa718be)
      
      Tap URL: https://hamsterkombatgame.io/*
      
      **Note:** this address ***may change*** so check the actual url in your browser's dev console (F12 -> Network tab).

5. Click on "Edit File" button under the rule you just created.
6. Copy the content of "script.js" file into injecting resource's script.
7. Replace placeholders with your Telegram account credentails and current api url:

    ![изображение](https://github.com/user-attachments/assets/0c9ec59b-6490-4f07-85c1-42e14ae9b08b)
     
     For ***url*** parameter: "https://api.hamsterkombatgame.io" by default. This may change.<br>
     For ***token*** parameter: see "Obtaining auth token" section.
   
9. Reload Telegram page.
10. In the result you should see such logs:

      ![изображение](https://github.com/user-attachments/assets/13fb9ff9-1125-4512-aefb-c797419680e0)
      
      **Hint:** You can filter the console's output by "[HK Automation Utility]" key.


# Obtaining auth token

1. Press ***F12*** to access dev console.
2. Navigate to ***Network*** tab.
3. Pick any request to Hamster Kombat's actual url.
5. In the request details section to the right scroll down to ***Request headers*** section.
6. See the ***Authorization*** header.
7. Copy its content starting with "Bearer" keyword.


# Available commands
```
hkAutomationUtility.start()
hkAutomationUtility.stop()
hkAutomationUtility.sendTapRequest(count, availableTaps)
```
