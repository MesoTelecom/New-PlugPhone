const axios = require('axios')
let msg;
let envia ={
  to: "",
  body: ""
}

let numMsg = 0

async function mensagem() {
  try {
    const response = await axios.get('https://poc.plugphone.cloud:3000/recebidas');
    console.log(response.data);
    msg = response.data;
    console.log('eu sou msg',msg)
    const status = await axios.get('https://poc.plugphone.cloud:3000/gerarprotocolo/aberto');
    console.log(status.data)
    return msg;
  } catch (error) {
    console.error('Erro ao fazer a requisição:', error);
    throw error; // Rejete a promise para que o erro seja propagado
  }
}

async function enviaMsg(env){
  try{
    const response = await axios.post('https://poc.plugphone.cloud:3000/send', envia)
    console.log('eu sou envia', envia)
    console.log( 'enviado!')
    
  
  }catch(error){}
}

async function segundaPergunta(numMsg){
  if(numMsg ==2){

  envia.body = " Data de inicio do problema"
  await enviaMsg(envia)
  }
}

// Como a função mensagem() é assíncrona, você precisa esperar sua execução
// antes de atribuir o valor de msg.
async function main() {
  try {
    msg = await mensagem();
    numMsg = 1
    console.log(msg); // Agora msg contém o valor retornado pela função mensagem()
    if(numMsg ==1){
      
      envia.to = msg.from
      envia.body = "Ola obrigado por entrar em nosso sistema de denuncia! informe o numero que mais se identifica com sua resposta\n \n Notificação de denuncia realizada por: \n \n1) Proprietário ou responsável pelo cuidado com os animais        \n \n2) Funcionário ou prestador de serviço no estabelecimento de criação animal    \n \n3) Profissional que atua em laboratório de diagnóstico, instituição de ensino ou pesquisa, ou outras instituições públicas ou privadas de interesse veterinário          \n \n4) Médico veterinário que atua no serviço privado          \n \n5) Médico veterinário habilitado pelo SVO          \n\n6) Médico veterinário do Serviço de Inspeção Oficial    "
      const status = await axios.get('https://poc.plugphone.cloud:3000/gerarprotocolo/atendimento');
      console.log(status.data)
      await enviaMsg(envia)
      numMsg = 2
    }
    else{
      console.log('erro na mensagem')
    }
  } catch (error) {
    console.error('Erro:', error);
  }
}

main(); // Chama a função main para iniciar o processo
