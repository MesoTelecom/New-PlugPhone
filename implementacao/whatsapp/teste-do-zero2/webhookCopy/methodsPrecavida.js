const axios = require('axios');
const { executaQry } = require('/meso/whatsapp/webhook/db');


let send = async function (to, body, nome, res) {
    console.log(to, body, nome)
    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'Authorization': "Bearer EAAQo0FfBn30BO3rXyiWhjeQAZBSYXgdjIw5HhZBw6uj9pHpBQWyzSjX5tcDpE4ZBW6nT4GHHeajZCgjbfVITlEfpuIJ5L51OlSC0KZC3NfwLvmpQT3RyMSLZCYFU0dzzBr73CwiDrdrFkIJTAQ0NZA3KLklZBrs94Jj4JM0fC42NZBz4FSuZClbjOwvf0yGUuu2Fg0kAZDZD"
        },
          body: JSON.stringify({
           "messaging_product": "whatsapp", 
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
        const response = await fetch("https://graph.facebook.com/v20.0/446094655243921/messages", requestOptions);
        const data = await response.json();
        //////console.log(data);


        let qry = `insert into meso_mensagens_solicitante (telefone,nome,agent,wpnumber,mensagem, type) values ('${to}','${nome}','${nome}','553198720162','${body}','text');`
        ////console.log('furia berserk',qry)
        executaQry(qry)

        res.json(data);
        //////console.log('eu sou msg', body)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao enviar a mensagem" });
    }
    ////console.log('sou o mensagem', requestOptions)

}



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
        url: 'https://graph.facebook.com/v20.0/446094655243921/messages',
        headers: { 
            'Authorization': 'Bearer EAAQo0FfBn30BO3rXyiWhjeQAZBSYXgdjIw5HhZBw6uj9pHpBQWyzSjX5tcDpE4ZBW6nT4GHHeajZCgjbfVITlEfpuIJ5L51OlSC0KZC3NfwLvmpQT3RyMSLZCYFU0dzzBr73CwiDrdrFkIJTAQ0NZA3KLklZBrs94Jj4JM0fC42NZBz4FSuZClbjOwvf0yGUuu2Fg0kAZDZD', 
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
    console.log('eu sou o caminho', caminho);
    data.append('file', fs.createReadStream(caminho));
    
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://graph.facebook.com/v20.0/446094655243921/messages',
        headers: { 
            'Authorization': 'Bearer EAAQo0FfBn30BO3rXyiWhjeQAZBSYXgdjIw5HhZBw6uj9pHpBQWyzSjX5tcDpE4ZBW6nT4GHHeajZCgjbfVITlEfpuIJ5L51OlSC0KZC3NfwLvmpQT3RyMSLZCYFU0dzzBr73CwiDrdrFkIJTAQ0NZA3KLklZBrs94Jj4JM0fC42NZBz4FSuZClbjOwvf0yGUuu2Fg0kAZDZD', 
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

let sendImage = async function (to, id, res) {



    ////console.log('oque vem sem link', link)
    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'Authorization': "Bearer EAAQo0FfBn30BO3rXyiWhjeQAZBSYXgdjIw5HhZBw6uj9pHpBQWyzSjX5tcDpE4ZBW6nT4GHHeajZCgjbfVITlEfpuIJ5L51OlSC0KZC3NfwLvmpQT3RyMSLZCYFU0dzzBr73CwiDrdrFkIJTAQ0NZA3KLklZBrs94Jj4JM0fC42NZBz4FSuZClbjOwvf0yGUuu2Fg0kAZDZD"
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
        const response = await fetch("https://graph.facebook.com/v20.0/446094655243921/messages", requestOptions);
        const data = await response.json();
        //////console.log(data);


        let qry = `insert into meso_mensagens_solicitante (telefone,nome,agent,wpnumber,mensagem, type) values ('${to}','Ian-Meso','Ian-Meso','553198720162','${id}','image');`
        ////console.log('furia berserk',qry)
        executaQry(qry)

        res.status(200);
        res.status(200).json({ data })
        //////console.log('eu sou msg', body)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao enviar a mensagem" });
    }
    ////console.log('imagem aqui', requestOptions)
}

let sendVideo = async function (to, id, link, res) {






    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'Authorization': "Bearer EAAQo0FfBn30BO3rXyiWhjeQAZBSYXgdjIw5HhZBw6uj9pHpBQWyzSjX5tcDpE4ZBW6nT4GHHeajZCgjbfVITlEfpuIJ5L51OlSC0KZC3NfwLvmpQT3RyMSLZCYFU0dzzBr73CwiDrdrFkIJTAQ0NZA3KLklZBrs94Jj4JM0fC42NZBz4FSuZClbjOwvf0yGUuu2Fg0kAZDZD"
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
        const response = await fetch("https://graph.facebook.com/v20.0/446094655243921/messages", requestOptions);
        const data = await response.json();
        //////console.log(data);


        let qry = `insert into meso_mensagens_solicitante (telefone,nome,agent,wpnumber,mensagem, type) values ('55${to}','Ian-Meso','Ian-Meso','553198720162','${body}','video');`
        ////console.log('furia berserk',qry)
        executaQry(qry)

        res.status(200);
        res.status(200).json({ data })
        //////console.log('eu sou msg', body)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao enviar a mensagem" });
    }
}


let sendAudio = async function (to, id, res) {





    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'Authorization': "Bearer EAAQo0FfBn30BO3rXyiWhjeQAZBSYXgdjIw5HhZBw6uj9pHpBQWyzSjX5tcDpE4ZBW6nT4GHHeajZCgjbfVITlEfpuIJ5L51OlSC0KZC3NfwLvmpQT3RyMSLZCYFU0dzzBr73CwiDrdrFkIJTAQ0NZA3KLklZBrs94Jj4JM0fC42NZBz4FSuZClbjOwvf0yGUuu2Fg0kAZDZD"
        },
        body: JSON.stringify({
            "messaging_product": "whatsapp", // Adicione o messaging_product aqui
            "recipient_type": "individual",
            to,
            "type": "audio",
            "audio": {
               
                id
            }
        })
    }
    try {
        const fetch = require('node-fetch');
        const response = await fetch("https://graph.facebook.com/v20.0/446094655243921/messages", requestOptions);
        const data = await response.json();
        //////console.log(data);


        let qry = `insert into meso_mensagens_solicitante (telefone,agent,wpnumber,mensagem,tipo) values ('55${to}','Ian-Meso','553198720162','${id}','audio');`
        ////console.log('furia berserk',qry)
        executaQry(qry)

        res.status(200);
        res.status(200).json({ data })
        //////console.log('eu sou msg', body)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao enviar a mensagem" });
    }
}

let sendDocument = async (to, id, filename, res) => {






    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'Authorization': "Bearer EAAQo0FfBn30BO3rXyiWhjeQAZBSYXgdjIw5HhZBw6uj9pHpBQWyzSjX5tcDpE4ZBW6nT4GHHeajZCgjbfVITlEfpuIJ5L51OlSC0KZC3NfwLvmpQT3RyMSLZCYFU0dzzBr73CwiDrdrFkIJTAQ0NZA3KLklZBrs94Jj4JM0fC42NZBz4FSuZClbjOwvf0yGUuu2Fg0kAZDZD"
        },
        body: JSON.stringify({
            "messaging_product": "whatsapp", // Adicione o messaging_product aqui
            "recipient_type": "individual",
            to,
            "type": "document",
            "document": {
                id,
                filename
            }
        })
    }
    try {
        const fetch = require('node-fetch');
        const response = await fetch("https://graph.facebook.com/v20.0/446094655243921/messages", requestOptions);
        const data = await response.json();
        //////console.log(data);


        let qry = `insert into meso_mensagens_solicitante (telefone,nome,agent,wpnumber,mensagem, type) values ('55${to}','Ian-Meso','Ian-Meso','553198720162','${body}','document');`
        ////console.log('furia berserk',qry)
        executaQry(qry)

        res.status(200);
        res.status(200).json({ data })
        //////console.log('eu sou msg', body)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao enviar a mensagem" });
    }
}


let sendTemplate = async (to, name, usuario, res) => {






    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            'Authorization': "Bearer EAAQo0FfBn30BO3rXyiWhjeQAZBSYXgdjIw5HhZBw6uj9pHpBQWyzSjX5tcDpE4ZBW6nT4GHHeajZCgjbfVITlEfpuIJ5L51OlSC0KZC3NfwLvmpQT3RyMSLZCYFU0dzzBr73CwiDrdrFkIJTAQ0NZA3KLklZBrs94Jj4JM0fC42NZBz4FSuZClbjOwvf0yGUuu2Fg0kAZDZD"
        },
        body: JSON.stringify({
             "messaging_product": "whatsapp",
                to,
                "type": "template",
                "template": { 
                   name,
                   "language": { 
                       "code": 
                       "pt_BR" } } 
               
        })
    }
    try {
        const fetch = require('node-fetch');
        const response = await fetch("https://graph.facebook.com/v20.0/446094655243921/messages", requestOptions);
        const data = await response.json();
        //////console.log(data);


        let qry = `insert into meso_mensagens_solicitante (telefone,nome,agent,wpnumber,mensagem, type) values ('${to}','${usuario}','${usuario}','553198720162','${name}','document');`
        ////console.log('furia berserk',qry)
        executaQry(qry)

        res.status(200);
        res.status(200).json({ data })
        //////console.log('eu sou msg', body)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao enviar a mensagem" });
    }
}

let download = async function (id, nome, formato, res) {




    const requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer EAAQo0FfBn30BO3rXyiWhjeQAZBSYXgdjIw5HhZBw6uj9pHpBQWyzSjX5tcDpE4ZBW6nT4GHHeajZCgjbfVITlEfpuIJ5L51OlSC0KZC3NfwLvmpQT3RyMSLZCYFU0dzzBr73CwiDrdrFkIJTAQ0NZA3KLklZBrs94Jj4JM0fC42NZBz4FSuZClbjOwvf0yGUuu2Fg0kAZDZD"
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
                'Authorization': "Bearer EAAQo0FfBn30BO3rXyiWhjeQAZBSYXgdjIw5HhZBw6uj9pHpBQWyzSjX5tcDpE4ZBW6nT4GHHeajZCgjbfVITlEfpuIJ5L51OlSC0KZC3NfwLvmpQT3RyMSLZCYFU0dzzBr73CwiDrdrFkIJTAQ0NZA3KLklZBrs94Jj4JM0fC42NZBz4FSuZClbjOwvf0yGUuu2Fg0kAZDZD"
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

module.exports = { send, sendImage, sendVideo, sendAudio, sendDocument, download, getImage, getAudio, sendTemplate }