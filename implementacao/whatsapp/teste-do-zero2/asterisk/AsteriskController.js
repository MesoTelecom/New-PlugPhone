class AsteriskController {
    constructor(asteriskManagerWrapper, db) {
      this.asteriskManagerWrapper = asteriskManagerWrapper;
      this.db = db
      
    }
  
    initializeAsteriskEvents() {
      this.asteriskManagerWrapper.on('managerevent', (evt) => {
        console.log('Manager Event:', evt);
        
      });
  
      this.asteriskManagerWrapper.on('hangup', (evt) => {
        console.log('Hangup Event:', evt);
        
      });
  
      this.asteriskManagerWrapper.on('confbridgejoin', (evt) => {
        console.log('ConfBridge Join Event:', evt);
        
      });
  
      this.asteriskManagerWrapper.on('response', (evt) => {
        console.log('Response Event:', evt);
        
      });
    }
  
    performAsteriskAction(actionData) {
      this.asteriskManagerWrapper.action(actionData, (err, res) => {
        if (err) {
          console.error('Error in action response:', err);
        } else {
          console.log('Action Response:', res);
          
        }
      });
    }
  }
  
  module.exports = AsteriskController;
  