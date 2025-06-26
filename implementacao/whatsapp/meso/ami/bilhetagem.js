var ami = new require('asterisk-manager')('5038','localhost','admin','Mtes0206', true);

// In case of any connectiviy problems we got you coverd.
ami.keepConnected();

ami.on( 'managerevent',function(evt){
if(

evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event !="VarSet"
){
    console.log(evt)

}


});