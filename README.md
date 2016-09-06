# Xivelybot

This is an automated bot demo using Xively, Twilio, Heroku, and Salesforce.  The bot currently supports SMS and IP
Message interaction with a sample UI provided below for testing.  You can directly interact with the bot via SMS
using (19788177116).

## Bot Testing UI
http://xivelybotui.herokuapp.com/ First time you hit this might take a moment to spin up the Dynos.  First message
to the bot will also take a moment as it spins its dyno up.  After the first refresh of each you should expect
sub-second response time.

## Bot Deployed
http://xivelybot.herokuapp.com/

## Sample Commands

### Simple Interactions
"Hi", "Hello" - Greeting sample

"Who am I", "What is my name" - Personalization Demonstration

### SFDC Sample Interactions
\#(Any SFDC Object Name) - This will return the Total number of (Any SFDC Object Name) in Salesforce.

Y\#(Any SFDC Object Name) - This will return number of (Any SFDC Object Name) created in last year.

Q\#(Any SFDC Object Name) - This will return number of (Any SFDC Object Name) created in last quarter.

W\#(Any SFDC Object Name) - This will return number of (Any SFDC Object Name) created in last week.