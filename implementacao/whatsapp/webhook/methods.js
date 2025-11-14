const axios = require('axios');
const { executaQry } = require('/meso/whatsapp/webhook/db');
const { buscarMensagem } = require('./SocketConnection');

let send = async function (to, body, nome, res) {
  console.log(to, body, nome)


  let bodyLimpo = body.replace(/.*-PlugPhone\s*/, "");

  console.log('me ache aqui ', bodyLimpo)

  const requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      'Authorization': "Bearer SEU-TOKEN"
    },
    body: JSON.stringify({
      "messaging_product": "whatsapp", // Adicione o messaging_product aqui
      "recipient_type": "individual",
      to,
      "type": "text",
      "text": {
        "preview_url": false,
        body
      }
    })
  }
  try {
    const fetch = require('node-fetch');
    const response = await fetch("https://graph.facebook.com/v22.0/116793154851650/messages", requestOptions);
    const data = await response.json();
    console.log('data da mensagem enviada ao zap', data.messages[0].id);


    let qry = `insert into meso_mensagens_solicitante (telefone,nome,agent,wpnumber,mensagem, type, message_id) values ('${to}','${nome}','${nome}','551131646301','${bodyLimpo}','text', '${data.messages[0].id}');`
    ////console.log('furia berserk',qry)
    executaQry(qry)

    let qry4 = `update meso_contatos set estado = 'Aguardando Cliente', ultimamsg = '${body}' where telefone like '%${to}%';`
    console.log('manda pro telefone', qry4)
    await executaQry(qry4)
    await buscarMensagem(to)
    //res.json(data);
    return;
    //////console.log('eu sou msg', body)
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Erro ao enviar a mensagem" });
    }
  }
  ////console.log('sou o mensagem', requestOptions)

}

let sendGpt = async function (mensagem) {
  const axios = require('axios');

  let data = {
    "model": "gpt-4o-mini",
    "messages": [
      {
        "role": "user",
        "content": mensagem
      }
    ]
  };

  let config = {
    method: 'post',
    url: 'https://api.openai.com/v1/chat/completions',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer SEU-TOKEN-GPT',
    },
    data: data
  };

  try {
    let response = await axios.request(config);
    console.log(JSON.stringify(response.data)); // Log da resposta completa

    let resposta = response.data.choices[0].message.content;
    console.log('eu sou a resposta PLIN PLIN PLON', resposta);

    return resposta; // Retorna a resposta corretamente
  } catch (error) {
    console.error('Erro na requisição:', error);
    return 'Erro ao processar a resposta do GPT'; // Retorna uma mensagem de erro amigável
  }
};

function limparTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD") // remove acentos
    .replace(/[\u0300-\u036f]/g, "") // remove símbolos de acento
    .replace(/[^a-z0-9\s]/gi, ""); // remove caracteres especiais tipo @, *, $, etc
}

async function buscaExp(pergunta) {
  try {
    const palavras = pergunta
      .toLowerCase()
      .split(/\s+/)
      .filter(p => p.length > 3);

    if (palavras.length === 0) return "";

    const filtros = palavras
      .map(p => `palavras_chave LIKE '%${p}%' OR descricao LIKE '%${p}%'`)
      .join(" OR ");

    const qry = `
      SELECT titulo, descricao
      FROM meso_bot_exp
      WHERE ${filtros}
      ORDER BY datahora DESC
      LIMIT 5;
    `;

    const resultados = await executaQry(qry);

    if (!resultados || !resultados.dados || resultados.dados.length === 0)
      return "";

    return resultados.dados
      .map(r => `• ${r.titulo}: ${r.descricao}`)
      .join("\n\n");

  } catch (err) {
    console.error("[PlugBot] Erro ao buscar experiências:", err);
    return "";
  }
}





async function verificaPalavrao(mensagem) {
  try {
    console.log("🎯 Iniciando verificação de palavrões...");

    const palavroesExtras = [
      "puta", "merda", "caralho", "fdp", "bosta",
      "desgracado", "arrombado", "vagabunda", "escroto",
      "filho da puta", "vadia", "porra", "cacete", "corno", "cu"
    ];

    const textoLimpo = limparTexto(mensagem);

    // Cria regex com quebra de palavra (\b) para palavras inteiras
    const regex = new RegExp(`\\b(${palavroesExtras.join("|")})\\b`, "i");
    const temNaLista = regex.test(textoLimpo);

    if (temNaLista) {
      console.warn("🚫 Palavra ofensiva detectada na lista personalizada.");
      return true;
    }

    // 🔎 Fallback: API da OpenAI para detecção de conteúdo sensível
    const response = await axios.post(
      "https://api.openai.com/v1/moderations",
      { input: mensagem },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer SEU-TOKEN-GPT",
        },
      }
    );

    const resultado = response.data.results[0];
    const limite = 0.1;

    const temPalavrao =
      resultado.flagged ||
      resultado.category_scores["sexual"] > limite ||
      resultado.category_scores["harassment"] > limite ||
      resultado.category_scores["hate"] > limite ||
      resultado.category_scores["violence"] > limite ||
      resultado.category_scores["self-harm"] > limite;

    if (temPalavrao) {
      console.warn("🚨 Palavra ofensiva detectada via API da OpenAI:", resultado);
    }

    return temPalavrao;
  } catch (error) {
    console.error("⚠️ Erro na verificação de palavrão:", error);
    return false; // Falha na verificação não bloqueia por padrão
  }
}

let getDocument = async function (caminho) {
  const axios = require('axios');
  const FormData = require('form-data');
  const fs = require('fs');
  let data = new FormData();
  data.append('messaging_product', 'whatsapp');
  console.log('eu sou o caminho', caminho);
  data.append('file', fs.createReadStream(caminho));

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://graph.facebook.com/v17.0/116793154851650/media',
    headers: {
      'Authorization': 'Bearer SEU-TOKEN',
      ...data.getHeaders()
    },
    data: data
  };

  try {
    const response = await axios.request(config);
    let id = response.data.id;
    console.log(id);
    return id;
  } catch (error) {
    console.error(error);
    throw error;
  }
};


let getImage = async function (caminho) {
  const axios = require('axios');
  const FormData = require('form-data');
  const fs = require('fs');
  let data = new FormData();
  data.append('messaging_product', 'whatsapp');
  console.log('eu sou o caminho', caminho);
  data.append('file', fs.createReadStream(caminho));

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://graph.facebook.com/v17.0/116793154851650/media',
    headers: {
      'Authorization': 'Bearer SEU-TOKEN',
      ...data.getHeaders()
    },
    data: data
  };

  try {
    const response = await axios.request(config);
    let id = response.data.id;
    console.log(id);
    return id;
  } catch (error) {
    console.error(error);
    throw error;
  }
};


let getAudio = async function (caminho) {
  const axios = require('axios');
  const FormData = require('form-data');
  const fs = require('fs');
  let data = new FormData();
  data.append('messaging_product', 'whatsapp');
  // console.log('eu sou o caminho', caminho);
  data.append('file', fs.createReadStream(caminho));

  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://graph.facebook.com/v17.0/116793154851650/media',
    headers: {
      'Authorization': 'Bearer SEU-TOKEN',
      ...data.getHeaders()
    },
    data: data
  };

  try {
    const response = await axios.request(config);
    let id = response.data.id;
    // console.log(id);
    return id;
  } catch (error) {
    // console.error(error);
    throw error;
  }
};

let sendImage = async function (to, id, usuario, res) {



  ////console.log('oque vem sem link', link)
  const requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      'Authorization': "Bearer SEU-TOKEN"
    },
    body: JSON.stringify({
      "messaging_product": "whatsapp", // Adicione o messaging_product aqui
      "recipient_type": "individual",
      to,
      "type": "image",
      "image": {
        id,

      }
    })
  }
  try {
    const fetch = require('node-fetch');
    const response = await fetch("https://graph.facebook.com/v22.0/116793154851650/messages", requestOptions);
    const data = await response.json();
    //////console.log(data);


    let qry = `insert into meso_mensagens_solicitante (telefone,nome,agent,wpnumber,mensagem, type) values ('${to}','${usuario}','${usuario}','551131646301','${id}.jpeg','image');`
    ////console.log('furia berserk',qry)
    executaQry(qry)


    let qry4 = `update meso_contatos set estado = 'Aguardando Cliente' where telefone like '%${to}%';`
    console.log('manda pro telefone', qry4)
    await executaQry(qry4)
    res.status(200);
    res.status(200).json({ data })
    //////console.log('eu sou msg', body)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao enviar a mensagem" });
  }
  ////console.log('imagem aqui', requestOptions)
}



let sendAudio = async function (to, id, usuario, res) {



  ////console.log('oque vem sem link', link)
  const requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      'Authorization': "Bearer SEU-TOKEN"
    },
    body: JSON.stringify({
      "messaging_product": "whatsapp", // Adicione o messaging_product aqui
      "recipient_type": "individual",
      to,
      "type": "audio",
      "audio": {
        id,

      }
    })
  }
  try {
    const fetch = require('node-fetch');
    const response = await fetch("https://graph.facebook.com/v22.0/116793154851650/messages", requestOptions);
    const data = await response.json();
    //////console.log(data);


    let qry = `insert into meso_mensagens_solicitante (telefone,nome,agent,wpnumber,mensagem, type) values ('${to}','${usuario}','${usuario}','551131646301','${id}.mp3','audio');`
    ////console.log('furia berserk',qry)
    executaQry(qry)

    let qry4 = `update meso_contatos set estado = 'Aguardando Cliente' where telefone like '%${to}%';`
    console.log('manda pro telefone', qry4)
    await executaQry(qry4)
    res.status(200);
    res.status(200).json({ data })
    //////console.log('eu sou msg', body)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao enviar a mensagem" });
  }
  ////console.log('imagem aqui', requestOptions)
}

let reciveMediaLink = async function (id, res) {
  // Opções de requisição
  const requestOptions = {
    method: 'GET', // Mudança: Alterado de POST para GET para buscar informações
    headers: {
      "Content-Type": "application/json",
      'Authorization': "Bearer SEU-TOKEN" // Token de autorização
    }
  };

  try {
    const fetch = require('node-fetch');
    // Requisição para a API do Facebook
    const response = await fetch(`https://graph.facebook.com/v17.0/${id}`, requestOptions);
    const data = await response.json();
    console.log(data)
    // Mudança: Verifica se o campo url existe no retorno da API
    if (data && data.url) {
      // Retorna o JSON com as informações do áudio
      res.status(200).json(data);
    } else {
      // Retorna erro 404 se o áudio não for encontrado
      res.status(404).json({ error: "Áudio não encontrado" });
    }

  } catch (error) {
    // Tratamento de erro
    console.error(error);
    res.status(500).json({ error: "Erro ao obter o áudio" });
  }
};

let geraMedia = async function (url, res) {
  // Opções de requisição
  const requestOptions = {
    method: 'GET', // Mudança: Alterado de POST para GET para buscar informações
    headers: {
      "Content-Type": "application/json",
      'Authorization': "Bearer SEU-TOKEN" // Token de autorização
    }
  };

  try {
    const fetch = require('node-fetch');
    // Requisição para a API do Facebook
    const response = await fetch(`https://graph.facebook.com/v17.0/${id}`, requestOptions);
    const data = await response.json();
    console.log(data)
    // Mudança: Verifica se o campo url existe no retorno da API
    if (data && data.url) {
      // Retorna o JSON com as informações do áudio
      res.status(200).json(data);
    } else {
      // Retorna erro 404 se o áudio não for encontrado
      res.status(404).json({ error: "Áudio não encontrado" });
    }

  } catch (error) {
    // Tratamento de erro
    console.error(error);
    res.status(500).json({ error: "Erro ao obter o áudio" });
  }
};



let sendVideo = async function (to, id, link, res) {






  const requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      'Authorization': "Bearer SEU-TOKEN"
    },
    body: JSON.stringify({
      "messaging_product": "whatsapp", // Adicione o messaging_product aqui
      "recipient_type": "individual",
      to,
      "type": "video",
      "video": {
        id,
        link
      }
    })
  }
  ////console.log('Calabreso', requestOptions)
  try {

    const fetch = require('node-fetch');
    const response = await fetch("https://graph.facebook.com/v22.0/116793154851650/messages", requestOptions);
    const data = await response.json();
    //////console.log(data);


    let qry = `insert into meso_mensagens_solicitante (telefone,nome,agent,wpnumber,mensagem, type) values ('55${to}','Ian-PlugPhone','Ian-PlugPhone','551131646301','${body}','video');`
    ////console.log('furia berserk',qry)
    executaQry(qry)

    let qry4 = `update meso_contatos set estado = 'Aguardando Cliente' where telefone like '%${to}%';`
    console.log('manda pro telefone', qry4)
    await executaQry(qry4)
    res.status(200);
    res.status(200).json({ data })
    //////console.log('eu sou msg', body)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao enviar a mensagem" });
  }
}


let sendDocument = async (to, id, filename, usuario, extensao, res) => {

  let idLimpo = id.replace(/\D/g, "")
  console.log('eu sou o id limpo', idLimpo)

  const requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      'Authorization': "Bearer SEU-TOKEN"
    },
    body: JSON.stringify({
      "messaging_product": "whatsapp", // Adicione o messaging_product aqui
      "recipient_type": "individual",
      to,
      "type": "document",
      "document": {
        filename,
        "id": idLimpo,
      }
    })
  }
  try {
    const fetch = require('node-fetch');
    const response = await fetch("https://graph.facebook.com/v22.0/116793154851650/messages", requestOptions);
    const data = await response.json();
    //////console.log(data);


    let qry = `insert into meso_mensagens_solicitante (telefone,nome,agent,wpnumber,mensagem, type) values ('${to}','${usuario}','${usuario}','551131646301','https://meso.plugphone.cloud:4444/midia/${id}.${extensao}','midia-document');`
    console.log('furia berserk do sendDocument', qry)
    executaQry(qry)

    let qry4 = `update meso_contatos set estado = 'Aguardando Cliente' where telefone like '%${to}%';`
    console.log('manda pro telefone', qry4)
    await executaQry(qry4)
    res.status(200);
    res.status(200).json({ data })
    //////console.log('eu sou msg', body)
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao enviar a mensagem" });
  }
}

let sendAutenticacao = async (to, text, res) => {
  console.log("Two paypal")
  const requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      'Authorization': "Bearer SEU-TOKEN"
    },
    // O corpo DEVE ser uma string JSON
    body: JSON.stringify({
      "messaging_product": "whatsapp",
      to, // Variável JS 'to' atribuída à chave "to"
      "type": "template",
      "template": {
        "name": "autenticacao",
        "language": {
          "code": "pt_BR"
        },
        "components": [
          {
            "type": "body",
            "parameters": [
              {
                "type": "text",
                text // CORREÇÃO: Variável JS 'text' atribuída à chave "text"
              }
            ]
          },
          // Este componente de botão será enviado APENAS se o template 'boas_vindas_plugphone' for de AUTENTICAÇÃO
          {
            "type": "button",
            "sub_type": "url",
            "index": 0,
            "parameters": [
              {
                "type": "text",
                text
              }
            ]
          }
        ]
      }
    })
  };
  try {
    const fetch = require('node-fetch');

    const response = await fetch("https://graph.facebook.com/v22.0/116793154851650/messages", requestOptions);
    const data = await response.json();
    console.log("Priquito da Milena", data)
    // Retorna a resposta aqui
    if (!res.headersSent) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.error('Vish deu erro', error);

    // Verifica se os cabeçalhos já foram enviados antes de enviar a resposta de erro
    if (!res.headersSent) {
      return res.status(500).json({ error: "Erro ao enviar a mensagem" });
    }
  }
}

let sendTemplateMenu = async (to, name, res) => {
  console.log('Enviando template menu...')


  let qry = `select count(whatsappid) as quantNum from meso_mensagens_solicitante where whatsappid = '${to}' and DATE(datetime) = CURDATE()`;

  console.log('eu sou qry que retorna a quan', qry)
  let quantNumArray = await executaQry(qry);
  let quantNum = quantNumArray.dados[0].quantNum;

  // if (quantNum == 1) {
  const requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      'Authorization': "Bearer SEU-TOKEN"
    },
    body: JSON.stringify({
      "messaging_product": "whatsapp",
      to,
      "type": "template",
      "template": {
        name,
        "language": {
          "code": "pt_BR"
        }
      }
    })
  }
  try {
    const fetch = require('node-fetch');
    const response = await fetch("https://graph.facebook.com/v23.0/116793154851650/messages", requestOptions);
    const data = await response.json();

    // Inserir dados no banco após enviar a mensagem
    let qry = `insert into meso_mensagens_solicitante (telefone, whatsappid, nome,agent,wpnumber,mensagem, type) values ('${to}','${to}','Template-PlugPhone','Template-PlugPhone','551131646301','${name}','document');`
    await executaQry(qry);

    // Retorna a resposta aqui
    if (!res.headersSent) {
      return res.status(200).json({ data });
    }
  } catch (error) {
    console.error('Vish deu erro', error);

    // Verifica se os cabeçalhos já foram enviados antes de enviar a resposta de erro
    if (!res.headersSent) {
      return res.status(500).json({ error: "Erro ao enviar a mensagem" });
    }
  }
  // } else {
  //   console.log('não faça nada')
  // }
}

async function gerenciarAtendimento(msgObj, nome, meta, numRecebe, idEmpresa) {
  try {
    const numeroCliente = msgObj?.from;
    const tipoMsg = msgObj?.type || "text";
    const nomeCliente = msgObj?.profile?.name || "Desconhecido";
    const canal = "WhatsApp";

    // 🟦 1. Verifica se o contato já existe
    let contatoQry = `SELECT id FROM meso_contatos WHERE telefone = '${numeroCliente}' LIMIT 1;`;
    let contato = await executaQry(contatoQry);

    if (contato.dados.length === 0) {
      // 🔹 Cria novo contato
      let insertContato = `
                INSERT INTO meso_contatos (nome, telefone, id_empresa, estado)
                VALUES ('${nome}', '${numeroCliente}', '${idEmpresa}', 'Novo');
            `;
      await executaQry(insertContato);
      console.log(`👤 Novo contato criado: ${nome} (${numeroCliente})`);
      // Busca ID recém-criado
      contato = await executaQry(contatoQry);
    }

    const idContato = contato.dados[0].id;

    // 🟩 2. Verifica se há atendimento ativo
    let atendimentoQry = `
            SELECT id, status FROM meso_atendimentos 
            WHERE id_contato = ${idContato} 
            AND status IN ('Novo', 'Em andamento', 'Aguardando Atendimento', 'Concluído')
            ORDER BY id DESC LIMIT 1;
        `;
    let atendimento = await executaQry(atendimentoQry);

    if (atendimento.dados.length === 0) {
      // 🟨 3. Cria novo atendimento
      const insertAtendimento = `
                INSERT INTO meso_atendimentos 
                (id_contato, telefone, setor_origem, setor_atual, canal, status, data_inicio)
                VALUES (${idContato},'${numRecebe}', 'Bot', 'Bot', '${canal}', 'Novo', NOW());
            `;
      await executaQry(insertAtendimento);
      console.log(`🆕 Novo atendimento criado para ${nomeCliente} (${numeroCliente})`);
    } else {
      // 🟧 4. Atualiza o último atendimento existente
      const idAtendimento = atendimento.dados[0].id;
      const updateAtendimento = `
                UPDATE meso_atendimentos 
                SET ultima_mensagem = NOW(), atualizado_em = NOW() 
                WHERE id = ${idAtendimento};
            `;
      await executaQry(updateAtendimento);
      console.log(`🔁 Atendimento ${idAtendimento} atualizado (${numeroCliente})`);
    }

  } catch (erro) {
    console.error("❌ Erro ao gerenciar atendimento:", erro.message);
  }
}


let sendTemplate = async (to, name, usuario, text, res) => {
  console.log('Caramelo', to)
  const requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      'Authorization': "Bearer SEU-TOKEN"
    },
    body: JSON.stringify({
      "messaging_product": "whatsapp",
      to,
      "type": "template",
      "template": {
        "name": "boas_vindas_plugphone",
        "language": {
          "code": "pt_BR"
        },
        "components": [
          {
            "type": "body",
            "parameters": [
              {
                "type": "text",
                text,
                "parameter_name": "nome"
              }
            ]
          }
        ]
      }


    })
  }
  try {
    const fetch = require('node-fetch');
    const response = await fetch("https://graph.facebook.com/v22.0/116793154851650/messages", requestOptions);
    const data = await response.json();
    console.log('Olha aqui a data do sendTemplate', data);


    let qry = `insert into meso_mensagens_solicitante (whatsappid,telefone,nome,agent,wpnumber,mensagem, type) values ('${to}','${to}','${usuario}','${usuario}','551131646301','boas_vindas_plugphone','document');`
    console.log('furia berserk', qry)
    executaQry(qry)

    let qry4 = `update meso_contatos set estado = 'Aguardando Cliente' where telefone like '%${to}%';`
    console.log('manda pro telefone', qry4)
    await executaQry(qry4)
    res.status(200);
    res.status(200).json({ data })
    ///console.log('eu sou msg', body)
  } catch (error) {
    console.error(':( deu erro meu nobre', error);
    res.status(500).json({ error: "Erro ao enviar a mensagem" });
  }
}
let test = function () {
  return console.log('test')
}

let download = async function (id, nome, formato, res) {




  const requestOptions = {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer SEU-TOKEN"
    }
  };

  try {
    // Obter informações com base no ID
    const response = await axios.get(`https://graph.facebook.com/v17.0/${id}`, requestOptions);
    //////console.log('Ola eu sou response', response.data);

    // Baixar o arquivo usando a URL obtida acima
    const response1 = await axios.get(response.data.url, requestOptions);
    res.json(response1.data.url);

    // Configuração para download de arquivo em formato PDF
    const instance = axios.create({
      responseType: 'arraybuffer',
      headers: {
        "Content-Type": "application/pdf",
        'Authorization': "Bearer SEU-TOKEN"
      }
    });

    // Realiza o download do arquivo
    instance.get(response.data.url)
      .then(function (response) {
        //////console.log("ola eu sou o response", response.data);
        // Escrever o arquivo no sistema de arquivos
        fs.writeFile(`${nome}` + `.${formato}`, response.data, err => {
          if (err) {
            //////console.log(err);
          }
          //////console.log("Deu Certo Aleluia Gloria DEUS!!!!!!!!!!!");
        });
      })
      .catch(function (error) {
        //////console.log("Ola eu sou o erro", error);
      });
  } catch (erro) {
    console.error(erro, "Algo de errado não esta certo");
    res.status(500).json({ error: "Erro ao baixar a mensagem" });
  }
  ////console.log('Documento Aqui', requestOptions)
};

module.exports = { send, gerenciarAtendimento, buscaExp, sendImage, sendVideo, sendAudio, sendDocument, download, getImage, getAudio, sendTemplate, sendAutenticacao, sendTemplateMenu, getDocument, test, reciveMediaLink, geraMedia, sendGpt, verificaPalavrao }