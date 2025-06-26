
function datanow() {
    let dataagora = new Date();
    let dia = dataagora.getDate().toString().padStart(2, "0");
    let mes = (dataagora.getMonth() + 1).toString().padStart(2, "0");
    let ano = dataagora.getFullYear().toString();
    let hora = dataagora.getHours().toString().padStart(2, "0");
    let min = dataagora.getMinutes().toString().padStart(2, "0");
    let seg = dataagora.getSeconds().toString().padStart(2, "0");
    return `${ano}-${mes}-${dia} ${hora}:${min}:${seg}`;
}

function retornaRamal(canal) {
    console.log("canal corta", canal);
    let ramal;
    var regexp;
    if (canal.startsWith("SIP")) {
      regexp = new RegExp(/\/.+-/i);
      ramal = regexp.exec(canal)[0];
      console.log("sip corta", ramal);
    } else {
      regexp = new RegExp(/\/.+@/i);
      ramal = regexp.exec(canal)[0];
      console.log("corta", ramal);
    }
  
    return ramal.replace("/", "").replace("-", "").replace("@", "");
  }

module.exports = { datanow,retornaRamal }