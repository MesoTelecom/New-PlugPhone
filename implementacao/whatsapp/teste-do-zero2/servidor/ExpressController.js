const express = require("express");
const csv = require('csv-parser');
const router = express.Router();
const { executaQry } = require("../banco/bd");
const { geraToken } = require("./jwt/jwt");
const { send, sendImage, sendVideo, sendAudio, sendDocument, sendTemplate, download, test, getImage, getAudio, getDocument, reciveMediaLink, geraMedia, sendprotocolo, gerarProtocolo, verificaPalavrao } = require('/meso/whatsapp/webhook/methods.js');
const axios = require("axios");
const { executaQryServer } = require('../banco/dbServer');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const e = require("express");
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
var proxy = require('express-http-proxy');
const { exec } = require("child_process");
const zlib = require('zlib');
const { aniversariantes } = require("../methods");
const upload = multer({ dest: 'uploads/' });
class ExpressController {
  constructor(expressAppWrapper, porta) {
    this.expressAppWrapper = expressAppWrapper;
    this.porta = porta;
  }

  initializeRoutes() {
    this.expressAppWrapper.use(require('cors')());
    this.expressAppWrapper.use(require('helmet')());
    this.expressAppWrapper.use(require('express').json());
    this.expressAppWrapper.use(require('express').urlencoded({ extended: true }));

    // Verifica se o servidor está funcionando
    this.expressAppWrapper.get('/', (req, res) => {
      res.send('API ZAP');
    });

    this.expressAppWrapper.app.use('/whatsapp', proxy('https://whatsapp.sicoob.plugphone.cloud:3000/'));
    this.expressAppWrapper.app.use('/midia', express.static(path.join(__dirname, 'uploads')));


    // Rota de dados
    this.expressAppWrapper.get('/api/data', (req, res) => {
      res.son({ message: 'This is some data' });
    });

    this.expressAppWrapper.post('/api/data', (req, res) => {
      res.status(201).json({ message: 'Data saved' });
    });

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Voltar a usar data e números aleatórios
      }
    });
    // Filtro para arquivos de imagem
    const imageFilter = (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif/;
      if (allowedTypes.test(path.extname(file.originalname).toLowerCase())) {
        cb(null, true);
      } else {
        cb(new Error('Arquivo de imagem inválido. Apenas JPG, JPEG, PNG e GIF são permitidos.'), false);
      }
    };

    // Filtro para arquivos de áudio
    const audioFilter = (req, file, cb) => {
      ////console.log('Nome do arquivo recebido:', file.originalname); // Log para verificar o nome do arquivo
      ////console.log('MIME type recebido:', file.mimetype);
      const allowedTypes = /audio\/mpeg|audio\/wav/;
      if (allowedTypes.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Arquivo de áudio inválido. Apenas MP3 e WAV são permitidos.'), false);
      }
    };

    const documentFilter = (req, file, cb) => {
      const allowedTypes = /pdf|msword|vnd.openxmlformats-officedocument.wordprocessingml.document/;
      if (allowedTypes.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Tipo de documento inválido. Apenas PDF, DOC e DOCX são permitidos.'), false);
      }
    };


    // Middleware de upload para imagens
    const uploadImage = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter });

    // Middleware de upload para áudios
    const uploadAudio = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: audioFilter });

    const uploadDocument = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: documentFilter });

    // Rota para upload de imagem
    this.expressAppWrapper.post('/upload-image', uploadImage.single('image'), async (req, res) => {
      if (!req.file) {
        return res.status(400).send('Nenhuma imagem recebida.');
      }
      res.json(`Imagem recebida: ${req.file.filename}`);
    });

    this.expressAppWrapper.post('/upload-image', async (req, res) => {

      ////console.log('Requisição recebida na rota /upload'); // Log para verificar se a rota é acessada
      ////console.log('Body da requisição:', req.body); // Log do corpo da requisição
      ////console.log('Arquivo recebido:', req.file); // Log do arquivo recebido

      if (!req.file) {
        return res.status(400).send('Nenhuma imagem recebida.');
      }
      ////console.log('Arquivo salvo com sucesso:', req.file);
      let caminho = req.file.path
      let idImage = await getImage(caminho)
      const ext = path.extname(caminho);
      console.log("Hi It's my idImage", idImage);
      const novoCaminho = path.join(path.dirname(caminho), idImage + ext);

      const parts = caminho.split('/');
      console.log('parts e novocaminho', caminho, parts)
      const idImageFinal = parts.slice(6).join('/');  // Adapte isso para seu cenário

      ////console.log('ID do áudio:', idaudio);
      console.log('Caminho final do arquivo:', idImageFinal);

      res.json({ id: idImage, idImageFinal: idImageFinal });

    });

    this.expressAppWrapper.get('/lidamsg/:num', async (req, res, next) => {
      let num = req.params.num

      let qry1 = `update meso_contatos set estadomsg = NULL where telefone = '${num}'`
      ////console.log(qry1)
      let res1 = await executaQry(qry1)
      ////console.log(qry1)

      res.json(res1)
    })


    this.expressAppWrapper.get('/importarAniversariante', async (req, res, next) => {
      try {
        let dados = await aniversariantes();
        res.json(dados);

      } catch (error) {
        console.error('Erro ao importar aniversariantes:', error);
        res.status(500).json({ erro: 'Erro ao buscar aniversariantes' });
      }
    });


    this.expressAppWrapper.post('/cadastrarcontato', async (req, res) => {
      let nome = req.body.nome
      let telefone = req.body.telefone

      let qry = `insert into meso_contatos (nome,telefone,estado,datahora) values ('${nome}','${telefone}','Novo',now())`
      console.log('bumbum profundo', qry)
      await executaQry(qry)
      res.json("Usuário Cadastrado");
    })

    this.expressAppWrapper.get('/finalizaprotocolo/:telefone', async (req, res) => {
      let telefone = req.params.telefone
      let qry = `update meso_mensagens_solicitante set estado = 'fechado', datafinal_protocolo = NOW() where telefone = '${telefone}' and estado = 'aberto' `
      let res1 = await executaQry(qry)

      let qry2 = `update meso_contatos set estado = 'Concluido' where telefone like '%${telefone}%'`
      await executaQry(qry2)
      res.json(res1);
      ////console.log('Vai bora não zé', qry)
    });

    this.expressAppWrapper.get('/listaprotocolo/:telefone', async (req, res) => {
      let telefone = req.params.telefone
      let qry = `select protocolo,DATE_FORMAT(datetime, '%d/%m/%Y %H:%i:%s') as datetime from meso_mensagens_solicitante where type = 'protocolo' and telefone = '${telefone}' and estado = 'fechado'`
      console.log('dataaqui', qry)
      let res1 = await executaQry(qry)
      res.json(res1);
      ////console.log('Vai bora não zé', qry)
    });

    this.expressAppWrapper.get('/mudamsg/:num', async (req, res, next) => {
      let num = req.params.num

      let qry1 = `update meso_contatos set estadomsg ='novamsg' where telefone = '${num}'`
      let res1 = await executaQry(qry1)
      ////console.log(qry1)

      res.json(res1)
    })

    this.expressAppWrapper.get('/get-image/:id', async (req, res) => {
      let id = req.params.id;

      if (!id) {
        return res.status(400).send('ID da imagem não fornecido.');
      }

      const imagePath = path.join(__dirname, 'uploads', id); // Caminho para a pasta uploads

      try {
        // Verifica se a imagem existe de forma assíncrona
        await fs.promises.access(imagePath, fs.constants.F_OK);

        // Retorna a imagem
        res.sendFile(imagePath);
      } catch (err) {
        // Caso a imagem não seja encontrada
        return res.status(404).send('Imagem não encontrada.');
      }
    });

    this.expressAppWrapper.get('/get-audio/:id', async (req, res) => {
      let id = req.params.id;

      if (!id) {
        return res.status(400).send('ID da imagem não fornecido.');
      }

      const imagePath = path.join(__dirname, 'uploads', id); // Caminho para a pasta uploads

      try {
        // Verifica se a Audio existe de forma assíncrona
        await fs.promises.access(imagePath, fs.constants.F_OK);

        // Retorna a Audio
        res.sendFile(imagePath);
      } catch (err) {
        // Caso a Audio não seja encontrada
        return res.status(404).send('Audio não encontrada.');
      }
    });




    this.expressAppWrapper.post('/upload-document', uploadDocument.single('file'), async (req, res) => {
      if (!req.file) {
        return res.status(400).send('Nenhum documento recebido.');
      }
      let caminho = req.file.path;
      ////console.log(caminho);

      let idDocumento = await getDocument(caminho)
      ////console.log('id documento', idDocumento)

      // Aqui você pode processar o documento ou salvar as informações no banco


      res.json({ id: idDocumento });
    });

    this.expressAppWrapper.post('/upload-document', async (req, res) => {
      ////console.log('oi')

      if (!req.file) {
        return res.status(400).send('Nenhum áudio recebido.');
      }

      ////console.log('eu sou o req.file', req.file.path);

      let caminho = req.file.path;
      let idocument = await getDocument(caminho);  // Esse é o ID que você quer usar para renomear
      const ext = path.extname(caminho);      // Pega a extensão do arquivo, por exemplo, .mp3 ou .wav
      const novoCaminho = path.join(path.dirname(caminho), idocument + ext);  // Novo nome do arquivo com o idocument

      // Renomeia o arquivo
      fs.rename(caminho, novoCaminho, (err) => {
        if (err) {
          //console.error('Erro ao renomear o arquivo:', err);
          return res.status(500).send('Erro ao processar o arquivo.');
        }

        // Divide o caminho para retornar apenas a parte final, se necessário
        const parts = novoCaminho.split('/');
        const caminhoFinal = parts.slice(5).join('/');  // Adapte isso para seu cenário

        ////console.log('ID do áudio:', idocument);
        ////console.log('Caminho final do arquivo:', caminhoFinal);

        res.json({ id: idocument, caminhoFinal: caminhoFinal });
      });

    });




    // Rota para upload de áudio
    this.expressAppWrapper.post('/upload-audio', uploadAudio.single('audio'), async (req, res) => {
      if (!req.file) {
        return res.status(400).send('Nenhum áudio recebido.');
      }
      let caminho = req.file.path
      ////console.log(caminho)
      let idaudio = await getAudio(caminho)
      //////console.log(id)
      res.json({ id: idaudio });
    });


    this.expressAppWrapper.post('/upload-audio', async (req, res) => {
      ////console.log('entrei aqui');

      if (!req.file) {
        return res.status(400).send('Nenhum áudio recebido.');
      }

      ////console.log('eu sou o req.file', req.file.path);

      let caminho = req.file.path;
      let idaudio = await getAudio(caminho);  // Esse é o ID que você quer usar para renomear
      const ext = path.extname(caminho);      // Pega a extensão do arquivo, por exemplo, .mp3 ou .wav
      const novoCaminho = path.join(path.dirname(caminho), idaudio + ext);  // Novo nome do arquivo com o idaudio

      // Renomeia o arquivo
      fs.rename(caminho, novoCaminho, (err) => {
        if (err) {
          //console.error('Erro ao renomear o arquivo:', err);
          return res.status(500).send('Erro ao processar o arquivo.');
        }

        // Divide o caminho para retornar apenas a parte final, se necessário
        const parts = novoCaminho.split('/');
        const caminhoFinal = parts.slice(5).join('/');  // Adapte isso para seu cenário

        ////console.log('ID do áudio:', idaudio);
        ////console.log('Caminho final do arquivo:', caminhoFinal);

        res.json({ id: idaudio, caminhoFinal: caminhoFinal });
      });
    });






    this.expressAppWrapper.post('/idimagem', async (req, res) => {

      let nome = req.body.nome

      //////console.log('Nome certo', nome)
      res.json('certo', nome);

    });


    // Middleware para tratamento de erros
    this.expressAppWrapper.use((err, req, res, next) => {
      //console.error(err.stack);
      res.status(500).send('Algo deu errado!');
    });

    this.expressAppWrapper.get("/pegaURL/:id", async (req, res, next) => {
      let id = req.params.id;


      //////console.log(qry);
      let res2 = await reciveMediaLink(id, res)
      res.json(res2);
      ////console.log("Jesus Cristo eu estou aqui")
      console.log('me mostra o res2 por favor', res2);

    });

    this.expressAppWrapper.post("/geraImage", async (req, res, next) => {
      let url = req.body.url;
      let id = req.body.id
      console.log("me acha por favor", url, id);
      try {
        const response = await axios({
          method: 'get',
          url: url,
          responseType: 'stream',
          headers: {
            'Authorization': 'Bearer EABpILka8Wz0BO2G1rtqYyWSXcueuIsbQZCMYxt6xd3Dp39MB9CIVJxs1yBv9G8W0ZCdnpIdPi5ZAC3pgsqjDZCLwtCMefB5SSdj6p9KeZC56FxdjZBwENoK6B0vlm7jJo1induvWW3tpVQ9mElh1HPJVl8byZBnYACtcnKl4ZCfFemPoOZBLaDsQmIarSCTKDiKMq'
          }
        });

        // Log para verificar o cabeçalho
        ////console.log("Content-Encoding:", response.headers['content-encoding']);

        let stream = response.data;
        const contentEncoding = response.headers['content-encoding'];

        if (contentEncoding && contentEncoding.includes('br')) {
          stream = stream.pipe(zlib.createBrotliDecompress());
        } else if (contentEncoding && contentEncoding.includes('gzip')) {
          stream = stream.pipe(zlib.createGunzip());
        }

        const uploadPath = path.join(__dirname, 'uploads', `${id}.jpeg`);

        const writer = fs.createWriteStream(uploadPath);
        stream.pipe(writer);

        writer.on('finish', () => {
          ////console.log('Mídia salva com sucesso:', uploadPath);
          res.status(200).send({ message: 'Mídia salva com sucesso!', path: uploadPath });
        });

        writer.on('error', (err) => {
          //console.error("Erro ao salvar a mídia:", err.message);
          res.status(500).send("Erro ao salvar a mídia.");
        });

      } catch (error) {
        //console.error("Erro ao baixar a mídia:", error.response ? error.response.data : error.message);
        res.status(500).send("Erro ao baixar a mídia.");
      }
    });

    this.expressAppWrapper.post("/geraAudio", async (req, res, next) => {
      let url = req.body.url;
      let id = req.body.id;

      try {
        const response = await axios({
          method: 'get',
          url: url,
          responseType: 'stream',
          headers: {
            'Authorization': 'Bearer EABpILka8Wz0BO2G1rtqYyWSXcueuIsbQZCMYxt6xd3Dp39MB9CIVJxs1yBv9G8W0ZCdnpIdPi5ZAC3pgsqjDZCLwtCMefB5SSdj6p9KeZC56FxdjZBwENoK6B0vlm7jJo1induvWW3tpVQ9mElh1HPJVl8byZBnYACtcnKl4ZCfFemPoOZBLaDsQmIarSCTKDiKMq'
          }
        });

        ////console.log("Content-Encoding:", response.headers['content-encoding']);

        let stream = response.data;
        const contentEncoding = response.headers['content-encoding'];

        // Somente descomprime se o encoding for "br" ou "gzip"
        if (contentEncoding && contentEncoding.includes('br')) {
          ////console.log("Descompressão Brotli");
          stream = stream.pipe(zlib.createBrotliDecompress());
        } else if (contentEncoding && contentEncoding.includes('gzip')) {
          ////console.log("Descompressão Gzip");
          stream = stream.pipe(zlib.createGunzip());
        }

        const uploadPath = path.join(__dirname, 'uploads', `${id}.mp3`);
        const writer = fs.createWriteStream(uploadPath);

        stream.pipe(writer);

        writer.on('finish', () => {
          ////console.log('Mídia salva com sucesso:', uploadPath);
          res.status(200).send({ message: 'Mídia salva com sucesso!', path: uploadPath });
        });

        writer.on('error', (err) => {
          //console.error("Erro ao salvar a mídia:", err.message);
          res.status(500).send("Erro ao salvar a mídia.");
        });

      } catch (error) {
        //console.error("Erro ao baixar a mídia:", error.response ? error.response.data : error.message);
        res.status(500).send("Erro ao baixar a mídia.");
      }
    });


    this.expressAppWrapper.post("/geraDocument", async (req, res, next) => {
      let url = req.body.url;
      let id = req.body.id;

      try {
        const response = await axios({
          method: 'get',
          url: url,
          responseType: 'stream',
          headers: {
            'Authorization': 'Bearer EABpILka8Wz0BO2G1rtqYyWSXcueuIsbQZCMYxt6xd3Dp39MB9CIVJxs1yBv9G8W0ZCdnpIdPi5ZAC3pgsqjDZCLwtCMefB5SSdj6p9KeZC56FxdjZBwENoK6B0vlm7jJo1induvWW3tpVQ9mElh1HPJVl8byZBnYACtcnKl4ZCfFemPoOZBLaDsQmIarSCTKDiKMq'
          }
        });

        ////console.log("Content-Encoding:", response.headers['content-encoding']);

        let stream = response.data;
        const contentEncoding = response.headers['content-encoding'];

        // Somente descomprime se o encoding for "br" ou "gzip"
        if (contentEncoding && contentEncoding.includes('br')) {
          ////console.log("Descompressão Brotli");
          stream = stream.pipe(zlib.createBrotliDecompress());
        } else if (contentEncoding && contentEncoding.includes('gzip')) {
          ////console.log("Descompressão Gzip");
          stream = stream.pipe(zlib.createGunzip());
        }

        const uploadPath = path.join(__dirname, 'uploads', `${id}.pdf`);
        const writer = fs.createWriteStream(uploadPath);

        stream.pipe(writer);

        writer.on('finish', () => {
          ////console.log('Mídia salva com sucesso:', uploadPath);
          res.status(200).send({ message: 'Mídia salva com sucesso!', path: uploadPath });
        });

        writer.on('error', (err) => {
          //console.error("Erro ao salvar a mídia:", err.message);
          res.status(500).send("Erro ao salvar a mídia.");
        });

      } catch (error) {
        //console.error("Erro ao baixar a mídia:", error.response ? error.response.data : error.message);
        res.status(500).send("Erro ao baixar a mídia.");
      }
    });


    this.expressAppWrapper.get('/concluido/:telefone', async (req, res, next) => {
      let telefone = req.params.telefone

      let qry = `update meso_contatos set estado = 'Concluido' where telefone like '%${telefone}%' `
      let res2 = await executaQry(qry)
      res.json(res2)
    })

    //Pesquisa de satisfação

    this.expressAppWrapper.get("/pesquisa/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}' `;
      //////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      //////console.log(res1);

    });

    let funcBuscarMensagem = async function () {

    }

    this.expressAppWrapper.get("/buscarcontatosDart/:tipo", async (req, res, next) => {
      let qry

      let tipo = req.params.tipo

      if (tipo == 'admin') {
        qry = `select * from meso_contatos order by datahora desc`

      } else {

        qry = `select * from meso_contatos where setor = '${tipo}' order by datahora desc`


        ////console.log('contato', qry)
        ////console.log('contatos resposta', res20)
      }
      let res20 = await executaQry(qry)
      res.json(res20)

    })

    this.expressAppWrapper.get("/buscarcontatos/:tipo/:filtro/:valorfiltro/:estado/:id_agencia", async (req, res, next) => {
      let tipo = req.params.tipo
      let filtro = req.params.filtro
      let filtroValor = req.params.valorfiltro
      let estadoContato = req.params.estado
      let idAgencia = req.params.id_agencia
      let qry

      console.log("tipo ", tipo,)
      console.log("filtro ", filtro)
      console.log("filtroValor ", filtroValor)
      console.log("estadoContato", estadoContato)
      console.log("id_agencia", idAgencia)

      console.log(`tipo recebido bruto => [${tipo}]`);
      console.log("tipo == 'Root'?", tipo == 'Root');

      if (tipo == 'Root' || tipo == 'Monitor') {
        qry = `select * from meso_contatos order by datahora desc`
        console.log(qry)
        if (filtro == "Nome") {
          if (estadoContato == 'Todos') {
            qry = `select * from meso_contatos where nome like '${filtroValor}%' ORDER BY datahora DESC`
            console.log("bala kuku ", qry)
          } else {
            qry = `select * from meso_contatos where nome like '${filtroValor}%' and estado = '${estadoContato}' ORDER BY datahora DESC`
          }
          console.log('Olha estou aqui qry nome', qry)
        } else if (filtro == "Cpf") {
          if (estadoContato == 'Todos') {
            qry = `select * from meso_contatos where documento like '${filtroValor}%' ORDER BY datahora DESC`
            console.log("Bumbum guloso", qry)
          } else {
            qry = `select * from meso_contatos where documento like '${filtroValor}%' and estado = '${estadoContato}' ORDER BY datahora DESC`
          }
          console.log('Olha estou aqui qry cpf', qry)
        }
        else if (filtro == "Campanha") {
          if (estadoContato == 'Todos') {
            qry = `select * from meso_contatos where campanha like '${filtroValor}%' ORDER BY datahora DESC`
            console.log("Bumbum guloso", qry)
          } else {
            qry = `select * from meso_contatos where campanha like '${filtroValor}%' and estado = '${estadoContato}' ORDER BY datahora DESC`
          }
          console.log('Olha estou aqui qry cpf', qry)
        }
        else if (filtro == "Geral") {
          if (estadoContato == "Todos") {
            qry = `select * from meso_contatos ORDER BY datahora DESC`
          } else {
            qry = `select * from meso_contatos WHERE estado = '${estadoContato}' ORDER BY datahora DESC`
          }
        }
      }
      else {
        console.log('Olha estou aqui tipo', tipo, filtro, filtroValor, estadoContato)

        if (filtro == "Nome") {
          if (estadoContato == 'Todos') {
            qry = `select * from meso_contatos where nome like '${filtroValor}%' and id_agencia = '${idAgencia}' ORDER BY datahora DESC`
            console.log("bala kuku ", qry)
          } else {
            qry = `select * from meso_contatos where nome like '${filtroValor}%' and id_agencia = '${idAgencia}' and estado = '${estadoContato}' ORDER BY datahora DESC`
          }
          console.log('Olha estou aqui qry nome', qry)
        }
        else if (filtro == "Campanha") {
          if (estadoContato == 'Todos') {
            qry = `select * from meso_contatos where campanha like '${filtroValor}%' and id_agencia = '${idAgencia}' ORDER BY datahora DESC`
            console.log("Bumbum guloso", qry)
          } else {
            qry = `select * from meso_contatos where campanha like '${filtroValor}%' and id_agencia = '${idAgencia}' and estado = '${estadoContato}' ORDER BY datahora DESC`
          }
          console.log('Olha estou aqui qry cpf', qry)
        }
        else if (filtro == "Cpf") {
          if (estadoContato == 'Todos') {
            qry = `select * from meso_contatos where documento like '${filtroValor}%' and id_agencia = '${idAgencia}' ORDER BY datahora DESC`
            console.log("Bumbum guloso", qry)
          } else {
            qry = `select * from meso_contatos where documento like '${filtroValor}%' and id_agencia = '${idAgencia}' and estado = '${estadoContato}' ORDER BY datahora DESC`
          }
          console.log('Olha estou aqui qry cpf', qry)
        } else if (filtro == "Geral") {
          if (estadoContato == "Todos") {
            qry = `select * from meso_contatos where id_agencia = '${idAgencia}' ORDER BY datahora DESC`
            console.log("Aqui Venezuela", qry)
          } else {
            qry = `select * from meso_contatos where id_agencia = '${idAgencia}' and estado = '${estadoContato}' ORDER BY datahora DESC`
          }

        }

      }

      console.log('contato', qry)
      let res20 = await executaQry(qry)
      res.json(res20)
      //////console.log('contatos resposta', res20)

    });


    this.expressAppWrapper.get("/buscarcontatos1/:tipo/:filtro/:valorfiltro", async (req, res, next) => {
      let qry

      let tipo = req.params.tipo
      let filtro = req.params.filtro
      let filtroValor = req.params.valorfiltro


      ////console.log('Olha estou aqui tipo', tipo, filtro, filtroValor)
      if (filtro == "Nome") {
        qry = `select * from meso_contatos where nome like '${filtroValor}%' and setor = '${tipo}' ORDER BY datahora DESC`
        ////console.log('Olha estou aqui qry', qry)
      } else if (filtro == "Cpf") {
        qry = `select * from meso_contatos where documento like '${filtroValor}%' and setor = '${tipo}' ORDER BY datahora DESC`
        ////console.log('Olha estou aqui qry', qry)
      } else if (filtro == "Geral") {
        ////console.log("Aqui Vazio")
        qry = `select * from meso_contatos where setor = 'Técnico' ORDER BY datahora DESC`
        ////console.log("Aqui Qry", qry)
      }
      //////console.log('contato', qry)
      let res20 = await executaQry(qry)
      res.json(res20)
      //////console.log('contatos resposta', res20)

    })

    this.expressAppWrapper.get("/buscarcontatomealing/:usuario/:tipo/", async (req, res, next) => {
      let qry
      let usuario = req.params.usuario
      let tipo = req.params.tipo

      if (tipo === 'Analista') {
        qry = `select distinct credor as nome, Telefone, processo from meso_mealing where idAgente = (select id from meso_usuariologin where usuario = '${usuario}')`
      } else if (tipo === 'Especialista') {
        qry = `select distinct m.credor as nome, m.Telefone, m.processo, m.estado from meso_mealing as m inner join meso_oportunidade as o on (m.idMealing = o.idMealing) where o.estado = 'aprovado';`
      }

      //////console.log('contato', qry)
      let res20 = await executaQry(qry)
      res.json(res20)
      //////console.log('contatos resposta', res20)

    })

    this.expressAppWrapper.get("/filtrocontatos/:usuario/:tipo/:estado", async (req, res, next) => {
      let qry
      let usuario = req.params.usuario
      let tipo = req.params.tipo
      let estado = req.params.estado

      if (tipo === 'Analista') {
        qry = `select distinct m.credor as nome, m.Telefone, m.processo,o.estado from meso_mealing as m inner join meso_oportunidade as o on (m.idMealing = o.idMealing) where idAgente = (select id from meso_usuariologin where usuario = '${usuario}') and o.estado = '${estado}' `
      } else if (tipo === 'Especialista') {
        qry = `select distinct m.credor as nome, m.Telefone, m.processo,o.estado from meso_mealing as m inner join meso_oportunidade as o on (m.idMealing = o.idMealing) where o.estado = '${estado}';`
      }

      //////console.log('contato', qry)
      let res20 = await executaQry(qry)
      res.json(res20)
      //////console.log('contatos resposta', res20)

    })

    this.expressAppWrapper.get("/mediapesquisa/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select avg(nota) as medianota from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}' AND gostaria like '%SIM%' `;
      //////console.log(qry);
      let res2 = await executaQry(qry);
      res.json(res2);
      //////console.log(res2);

    });

    //teste MedPesq1---------------------------------------------------------------------------------------------------------------------------------------------------
    this.expressAppWrapper.get("/mediapesquisa1/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select sum(pergunta1 + pergunta2) as medianota from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}'`;
      //////console.log(qry);
      let res2 = await executaQry(qry);
      res.json(res2);
      //////console.log(res2);

    });
    this.expressAppWrapper.get("/verificamensagem/:telefone/", async (req, res, next) => {
      let qry

      let telefone = req.params.telefone

      qry = `select telefone, setor, usuario from meso_contatos where telefone = '${telefone}'`

      console.log('Verifica mensagem', qry)
      let res20 = await executaQry(qry)
      res.json(res20)
      //console.log('contatos resposta', res20)

    })

    this.expressAppWrapper.post("/reciveMsg", async (req, res, next) => {
      ////console.log('estou aqui só pra vc saber ta?')
      let telefone = req.body.telefone
      let telFormatado = telefone

      if (telefone.length == 13) {
      }

      let qry = ` select * from meso_mensagens_solicitante where telefone like "${telFormatado}"`;

      ////console.log('qry:', qry)
      let res3 = await executaQry(qry);
      res.json(res3);
      ////console.log(res3);

    });

    let buscarTelefone = async function () {
      let qry = `SELECT distinct telefone FROM meso_contatos`;
      return await executaQry(qry);
    };

    this.expressAppWrapper.get("/reciveMsgDart", async (req, res, next) => {
      try {
        let resultado = await buscarTelefone();
        let telefones = resultado?.dados || [];

        if (!Array.isArray(telefones)) {
          console.error("Erro: 'dados' não é um array!", telefones);
          telefones = [];
        }

        ////console.log("Meus telefones:", telefones);

        let queries = telefones.map(({ telefone }) => {
          let qry = `
            SELECT nome, mensagem, if(date_format(now(),"%d-%m-%Y") = date_format(datetime,"%d-%m-%Y"), date_format(datetime,"%H:%i:%S"),date_format(datetime,"%d-%m-%Y")) as datetime,telefone
            FROM meso_mensagens_solicitante 
            WHERE id = (
              SELECT MAX(id) 
              FROM meso_mensagens_solicitante 
              WHERE telefone = '${telefone}' and nome not like '%-Meso%' and nome not like '%Template%' and mensagem is not null
            );
          `;
          ////console.log("escreve aqui", qry)
          return executaQry(qry);
        });

        let resultados = await Promise.all(queries);

        // Filtramos os resultados para pegar apenas os itens dentro de "dados"
        let telefoneArray = resultados
          .map(resultado => resultado?.dados || []) // Pega só o conteúdo de "dados"
          .flat() // Achata o array para evitar listas dentro de listas
          .filter(item => Object.keys(item).length > 0); // Remove objetos vazios

        ////console.log(`Sou o telefone array:`, telefoneArray);

        res.json({ dados: telefoneArray }); // Agora retorna só os objetos dentro de "dados"

      } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        res.status(500).json({ error: "Erro interno do servidor" });
      }
    });





    this.expressAppWrapper.post("/reciveMsgFiltrado", async (req, res, next) => {
      ////console.log('estou aqui só pra vc saber ta?')
      let telefone = req.body.telefone
      let protocolo = req.body.protocolo
      let telFormatado = telefone
      let data1 = req.body.data1 + ' 00:00:00'
      let data2 = req.body.data2 + ' 23:59:59'
      let qry

      ////console.log('pirulito1', data1.length)
      ////console.log('pirulito2', data2.length)

      if (data1.length == 19 && data2.length == 19) {
        qry = ` select * from meso_mensagens_solicitante where telefone like "${telFormatado}" and datetime > '${data1}' and datetime < '${data2}'`;
      } else {
        let protocoloFormatado = protocolo.split(" ")
        qry = ` select * from meso_mensagens_solicitante where telefone like "${telFormatado}" and protocolo like '${protocoloFormatado[0]}'`;
      }

      ////console.log('qry:', qry)
      let res3 = await executaQry(qry);
      res.json(res3);
      ////console.log(res3);

    });

    this.expressAppWrapper.get("/mediapesquisaconta/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(pergunta1)as contapesq from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}'`;
      //////console.log(qry);
      let res2 = await executaQry(qry);
      res.json(res2);
      //////console.log(res2);

    });

    this.expressAppWrapper.get("/listaanalista", async (req, res, next) => {
      let qry = `select * from meso_usuariologin where tipo = 'Analista'`;

      let res27 = await executaQry(qry);

      //////console.log('socaminha', res27)
      res.json(res27);

    });

    this.expressAppWrapper.get("/listaespecialista", async (req, res, next) => {
      let qry = `select * from meso_usuariologin where tipo = 'Especialista'`;

      let res27 = await executaQry(qry);

      //////console.log('socaminha', res27)
      res.json(res27);

    });

    //Campanha fila

    //Segunda bolinha do painel de filas - Chamadas em fila//
    this.expressAppWrapper.get("/listajoin/:fila", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let qry = `select * from meso_join_rt where fila = '${filacompleta}'`;
      //////console.log(qry);

      let res30 = await executaQry(qry);
      res.json(res30);
      //////console.log(res30);

    });
    //Primeira bolinha do painel das filas

    this.expressAppWrapper.get("/listajointotal/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_entrar where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      //////console.log(qry);

      let res31 = await executaQry(qry);
      res.json(res31);
      //////console.log(res31);

    });

    //Terceira bolinha de chamadas conectadas na fila, isto é, aquelas chamadas que estão em curso

    this.expressAppWrapper.get("/filaconectada/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;

      let qry = `select * from meso_call_connected_rt where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'`;
      //////console.log(qry);

      //////console.log(qry)

      let res32 = await executaQry(qry);
      res.json(res32);
      //////console.log(res32);

    });
    //Quarta bolinha de chamadas da fila - Abandonadas do dia

    this.expressAppWrapper.get("/filasabandonadas/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_abandon where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      //////console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      //////console.log(res33);

    });
    //Sexta bolinha tma

    this.expressAppWrapper.get("/tmafilas/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'


      let qry = `select avg(talktime) as mediaANNA from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      //////console.log(qry);

      let res99 = await executaQry(qry);
      res.json(res99);
      //////console.log(res99);

    });

    this.expressAppWrapper.get("/mediatmasainte/:ramal/:d1/:d2", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select time_format(sec_to_time(avg(billsec)), '%H:%i:%s') as mediaTma from cdr where calldate >= '${data1}' and calldate <= '${data2}' and cnum = '${ramal}' and disposition = 'ANSWERED' and lastapp = 'Dial'`;
      //////console.log(qry)

      let res1 = await executaQry(qry);
      res.json(res1)
      //////console.log(res1);
    })

    //Setima bolinha TME Atendidas

    this.expressAppWrapper.get("/tmefilas/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select avg(holdtime) as mediaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      //////console.log(qry);

      let res35 = await executaQry(qry);
      res.json(res35);
      //////console.log(res35);

    });

    this.expressAppWrapper.get("/tmesainte/:d1/:d2/:ramal", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sum(duration - billsec) as duracao, count(*) as contduracao from cdr where calldate > '${data1}' and calldate < '${data2}' where cnum = '${ramal}'`;
      //////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      //////console.log(res1);
    })

    //Oitava bolinha TME do abandono

    this.expressAppWrapper.get("/tmefilasabandonadas/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select avg(holdtime) as mediaesperaabandonada from meso_abandon where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      //////console.log(qry);

      let res35 = await executaQry(qry);
      res.json(res35);
      //////console.log(res35);

    });


    this.expressAppWrapper.get('/listargrupo', async (req, res, next) => {
      try {
        let qry = `select * from meso_agencias`
        let res1 = await executaQry(qry)
        res.json(res1)
      } catch (error) {
        ////////console.log(e)
      }
    });


    this.expressAppWrapper.get(`/listargrupofiltrado/:idAgencia`, async (req, res, next) => {
      let idAgencia = req.params.idAgencia
      try {
        let qry = `select * from meso_agencias where id_agencia = ${idAgencia}`
        let res1 = await executaQry(qry)
        res.json(res1)
      } catch (error) {
        ////////console.log(e)
      }
    });


    this.expressAppWrapper.get(`/listarcampanhafiltrado/:idAgencia`, async (req, res, next) => {
      let idAgencia = req.params.idAgencia;
      try {
        let qry = `
          SELECT DISTINCT mc.id_campanha, mc.campanha
          FROM meso_campanhas mc
          JOIN meso_contatos c ON c.campanha = mc.campanha
          WHERE c.id_agencia = ${idAgencia}
        `;
        let res1 = await executaQry(qry);
        res.json(res1);
      } catch (error) {
        console.error("Erro ao buscar campanhas filtradas:", error);
        res.status(500).send("Erro interno");
      }
    });


    this.expressAppWrapper.get('/basecontatos/:campanha', async (req, res, next) => {
      let campanha = req.params.campanha
      try {
        let qry = `select count(*) as baseContatos from meso_contatos where campanha = '${campanha}'`
        let res1 = await executaQry(qry)
        res.json(res1)
      } catch (error) {
        ////////console.log(e)
      }
    });
    //select * from meso_contatos where estado = 'Novo' and campanha like '%desempenho%';
    this.expressAppWrapper.get('/msgEntregues/:campanha/:d1/:d2', async (req, res, next) => {
      let campanha = req.params.campanha
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      try {
        let qry = `select count(*) as msgEntregues from meso_contatos where campanha = '${campanha}' and estado = 'Aguardando Cliente' and datahora >= '${data1}' and datahora <= '${data2}' `
        let res1 = await executaQry(qry)
        res.json(res1)
      } catch (error) {
        ////////console.log(e)
      }
    });

    this.expressAppWrapper.get('/msgRecebidas/:campanha/:d1/:d2', async (req, res, next) => {
      let campanha = req.params.campanha
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      try {
        let qry = `select count(*) as msgRecebidas from meso_contatos where campanha = '${campanha}' and estado = 'Aguardando Atendimento' and datahora >= '${data1}' and datahora <= '${data2}' `
        let res1 = await executaQry(qry)
        res.json(res1)
      } catch (error) {
        ////////console.log(e)
      }
    });

    this.expressAppWrapper.get('/msgConcluido/:campanha/:d1/:d2', async (req, res, next) => {
      let campanha = req.params.campanha
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      try {
        let qry = `select count(*) as msgConcluido from meso_contatos where campanha = '${campanha}' and estado = 'Concluido' and datahora >= '${data1}' and datahora <= '${data2}' `
        let res1 = await executaQry(qry)
        res.json(res1)
      } catch (error) {
        ////////console.log(e)
      }
    });

    this.expressAppWrapper.get('/detalhescampanha/:idcampanha', async (req, res, next) => {
      let id = req.params.idcampanha
      try {
        let qry = `select * from meso_campanhas where id_campanha = '${id}'`
        let res1 = await executaQry(qry)
        res.json(res1)
      } catch (error) {
        ////////console.log(e)
      }
    });

    this.expressAppWrapper.get('/detalhescampanha/:idcampanha', async (req, res, next) => {
      let id = req.params.idcampanha
      try {
        let qry = `select * from meso_campanhas where id_campanha = '${id}'`
        let res1 = await executaQry(qry)
        res.json(res1)
      } catch (error) {
        ////////console.log(e)
      }
    });

    this.expressAppWrapper.get("tmeabandonadassainte/:ramal/:d1/:d2", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sum(duration - billsec) as duracao, count(*) as contduracao from cdr where calldate > '${data1}' and calldate < '${data2}' where cnum = '${ramal}'`;
      //////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      //////console.log(res1);
    });
    //Fim da campanha fila
    //Listar filas
    this.expressAppWrapper.get("/listafilastotais", async (req, res, next) => {

      let qry = `select extension, descr from queues_config `;
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    //FIM de Listar filas
    //Listar ramais
    this.expressAppWrapper.get("/listaramais", async (req, res, next) => {

      let qry = `select extension, name from users `;
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });



    //FIM listar ramais
    this.expressAppWrapper.get("/realramal", async (req, res, next) => {
      // let filacompleta = req.params.fila;
      //let data1 = req.params.d1 + ' 00:00:00'
      //let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select * from meso_operadores_rt`;
      //////console.log(qry);

      let res36 = await executaQry(qry);
      res.json(res36);
      //////console.log(res36);

    });

    this.expressAppWrapper.get("/detalhesligacoes/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select distinct * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid and table1.datahora > '${data1}' and table1.datahora < '${data2};' `;
      //////console.log(qry);

      //////console.log(qry)
      let res20 = await executaQry(qry);
      res.json(res20);
      //////console.log(res20);


    });


    this.expressAppWrapper.get("/detalhecampanha/:d1/:d2/:idAgencia", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let idAgencia = req.params.idAgencia
      let qry
      if (idAgencia == "null") {
        qry = `select * from meso_contatos where datahora >= '${data1}' and datahora <= '${data2}'`
        //////console.log(qry);
      } else {
        qry = `select * from meso_contatos where datahora >= '${data1}' and datahora <= '${data2}' and id_agencia = '${idAgencia}'`
      }
      console.log(qry)
      let res20 = await executaQry(qry);
      res.json(res20);
      //////console.log(res20);


    });

    //Listar operadores
    this.expressAppWrapper.get("/listaoperadores", async (req, res, next) => {

      let qry = `select * from meso_operadores `;
      //////console.log(qry);
      /*select *  from meso_logado msl
      left join meso_operadores mso on msl.pin = mso.pin
      where mso.id is not null
      */

      let res4 = await executaQry(qry);
      res.json(res4);
      //////console.log(res4);

    });
    //Ligações de entrada
    this.expressAppWrapper.get("/recebidafila/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select * from meso_entrar where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'; `

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      //////console.log(qry);

      let res20 = await executaQry(qry);
      res.json(res20);
      //////console.log(res20);

    });

    this.expressAppWrapper.get("/recebidasucesso/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select * from meso_agent_complete where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'; `

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      //////console.log(qry);

      let res20 = await executaQry(qry);
      res.json(res20);
      //////console.log(res20);

    });

    this.expressAppWrapper.get("/recebidaabandon/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select * from meso_abandon where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'; `

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      //////console.log(qry);

      let res20 = await executaQry(qry);
      res.json(res20);
      //////console.log(res20);

    });
    this.expressAppWrapper.get("/recebidajoin/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select * from meso_entrar where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'; `

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      //////console.log(qry);

      let res20 = await executaQry(qry);
      res.json(res20);
      //////console.log(res20);

    });
    this.expressAppWrapper.get("/recebidaespera/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select sec_to_time(sum(meso_abandon.holdtime))as espera from meso_abandon  where meso_abandon.fila= '${filacompleta}' and meso_abandon.datahora > '${data1}' and meso_abandon.datahora < '${data2}';`

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      //////console.log(qry);
      //////console.log(qry)
      let res20 = await executaQry(qry);
      res.json(res20);
      //////console.log(res20);

    });
    this.expressAppWrapper.get("/recebidaesperaatende/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select sec_to_time(sum(meso_agent_complete.holdtime))as esperaAtende from meso_agent_complete  where meso_agent_complete.fila= '${filacompleta}' and meso_agent_complete.datahora > '${data1}' and meso_agent_complete.datahora < '${data2}';`

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      //////console.log(qry);
      let res20 = await executaQry(qry);
      res.json(res20);
      //////console.log(res20);

    });
    //FIM DE ligações de entrada

    //FLUXO DE LIGAÇÃO POR HORA
    this.expressAppWrapper.get("/dashpizza/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_entrar where datahora > '${data1}' and datahora < '${data2}'`;
      //////console.log(qry);


      let res24 = await executaQry(qry);
      res.json(res24);
      //////console.log(res24);

    });

    //FIM DO FLUXO DE CHAMADA

    //PAUSA
    this.expressAppWrapper.get("/pausa/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1
      let data2 = req.params.d2

      // let data2 = req.params.d2 + ' 23:59:59'

      let qry = ` select *, timediff(meso_pausa_fila.despausado, meso_pausa_fila.datahora) as duracao from meso_pausa_fila, logs where meso_pausa_fila.despausado != '0000-00-00 00:00:00' and  meso_pausa_fila.datahora = logs.datahora or logs.datahora = meso_pausa_fila.datahora -1 and logs.datahora = meso_pausa_fila.datahora and meso_pausa_fila.datahora > '${data1}'  and meso_pausa_fila.datahora < '${data2}';
      `;
      //////console.log(qry);

      let res17 = await executaQry(qry);
      res.json(res17);
      //////console.log(res17);

    });

    //DASHBOARD

    this.expressAppWrapper.get("/filaabandono/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_abandon where datahora > '${data1}' and datahora < '${data2}' `;
      //////console.log(qry);

      let res25 = await executaQry(qry);
      res.json(res25);
      //////console.log(res25);

    });

    //Circulo do painel principal Em Ligação cor Azul [como fazer o calculo?]
    //Na verdade o que eu fiz foi atendidas e não realtime do em ligação.... ;(
    this.expressAppWrapper.get("/dashligacao", async (req, res, next) => {

      let qry = `select distinct uniqueid1 from meso_operadores_em_ligacao `;
      //////console.log(qry);


      let res5 = await executaQry(qry);
      res.json(res5);
      //////console.log(res5);

    });

    //Circulo do painel principal Logados cor Verde

    this.expressAppWrapper.get("/dashlogados", async (req, res, next) => {

      let qry = `select distinct pin from meso_logado `;
      //////console.log(qry);


      let res2 = await executaQry(qry);
      res.json(res2);
      //////console.log(res2);

    });

    //Circulo do painel principal Pausados cor Amarela

    this.expressAppWrapper.get("/dashpausados", async (req, res, next) => {

      let qry = `select * from meso_pausado `;
      //////console.log(qry);


      let res3 = await executaQry(qry);
      res.json(res3);
      //////console.log(res3);

    });

    this.expressAppWrapper.get("/dashdeslogados", async (req, res, next) => {

      let qry = `select * from users `;
      //////console.log(qry);
      /*select *  from meso_logado msl
      left join meso_operadores mso on msl.pin = mso.pin
      where mso.id is not null
      */

      let res4 = await executaQry(qry);
      res.json(res4);
      //////console.log(res4);

    });

    this.expressAppWrapper.get("/fluxohora/:d1", async (req, res, next) => {
      let data1 = req.params.d1

      let qry = `select * from meso_fluxo_ligacao where datahora = '${data1}' `;
      //////console.log(qry);

      let res23 = await executaQry(qry);
      res.json(res23);
      //////console.log(res23);

    });


    this.expressAppWrapper.get("/estoque/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1
      let data2 = req.params.d2
      let qry = `select * from meso_estoque where diaatual >= '${data1}' and diaatual <= '${data2}' `;
      //////console.log(qry);

      let res32 = await executaQry(qry);
      res.json(res32);
      //////console.log(res32);

    });

    this.expressAppWrapper.get("/gravacao/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select src, dst, duration, recordingfile from cdr where calldate > '${data1}' and calldate < '${data2}' `;
      //////console.log(qry);

      let res199 = await executaQry(qry);
      res.json(res199);
      //////console.log(res199);

    });


    //novo fluxo para finalizar o testeligahora

    this.expressAppWrapper.get("/fluxoteste/:d1", async (req, res, next) => {

      let data1 = req.params.d1

      let qry = `select * from meso_entrar where datahora like '${data1}%'  order by 'datahora';`;
      //////console.log('teste qualquer coisa', qry);

      //////console.log('aaaaaaaaaaaaaaaaaaaaaaa', qry)
      let res6 = await executaQry(qry);
      res.json(res6);
      //////console.log(res6);

    });



    //Login-------------------------------------------------------------------------------------

    this.expressAppWrapper.post("/loginconfere", async (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Request-Width, Content-Type, Accept");
      let usuario = req.body.login;
      let senha = req.body.senha;
      //////console.log(usuario, senha);
      try {
        let qry = `
              select * from meso_usuariologin where
              senha= MD5('${senha}') and 
              usuario= '${usuario}'
            `;
        ////console.log(qry);

        let res1 = await executaQry(qry);
        ////console.log('log:', res1.dados[0].usuario)
        const token = geraToken(res1.dados[0].usuario)
        const tipo = res1.dados[0].tipo

        json({ token, tipo });
        ////console.log('pega token', token, tipo);
      } catch (e) {
        //////console.log(e);
      }
    });

    this.expressAppWrapper.app.post('/enviar-audio', upload.single('audio'), (req, res) => {
      const audioFile = req.file;
      if (!audioFile) {
        return res.status(400).send('Nenhum arquivo de áudio recebido');
      }

      const filePath = audioFile.path;
      ////console.log(`Áudio recebido: ${filePath}`);

      // Você pode optar por armazenar o arquivo ou manipular como desejar
      // Por exemplo, salvar a informação no banco de dados, se necessário

      // Retorna uma resposta ao cliente indicando que o áudio foi recebido
      res.json({ message: 'Áudio recebido com sucesso!', filePath: filePath });
    });

    let uploadArquivo = function () {
      const uploadPath = path.join(__dirname, 'documentos')
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, uploadPath)
        },
        filename: function (req, file, cb) {
          cb(null, file.originalname)

        }
      })
      return multer({ storage: storage })
    }
    let lerCsv = async function (filePathCompleto) {
      const results = [];

      return new Promise((resolve, reject) => {
        fs.createReadStream(filePathCompleto)
          .pipe(csv())
          .on('data', (row) => {
            results.push({
              nome: row['nome'] || '',
              telefone: row['telefone_1'] || '',
              documento: row['documento'] || '',
              email: row['email'] || '',
              data_nascimento: row['dtNascimento'] || '',
              sexo: row['sexo'] || '',
              estado_civil: row['estadoCivil'] || '',
              escolaridade: row['escolaridade'] || '',
              logradouro: row['endereco'] || '',
              numero: row['numeroEndereco'] || '',
              complemento: row['complemento'] || '',
              bairro: row['bairro'] || '',
              municipio: row['municipio'] || '',
              uf: row['uf'] || '',
              cep: row['cep'] || '',
              tipo_renda: row['tipoRenda'] || '',
              vinculo_empregaticio: row['vinculoEmpregaticio'] || '',
              profissao: row['profissao'] || '',
              atividade_economica: row['atividadeEconomica'] || '',
              gerente_nome: row['nome_gerente'] || '',
              mei: row['mei'] || '',
              pa_descricao: row['nome_pa'] || '',
              id_pa: row['id_pa'] || null,
              id_agencia: row['id_agencia'] || null,
              is_funcionario: row['is_funcionario'] || 0,
              setor: row['setor'] || '',
            });

          })
          .on('end', () => {
            resolve(results);
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    };




    let terminou = false;

    //const uploadCSV3 = uploadArquivo();
    let inserirCsv = async (resultadoCsv, usuario, campanha) => {
      for (const e of resultadoCsv) {
        // Query para inserir na tabela meso_contato
        let qry = `
      INSERT INTO meso_contatos (
        nome, telefone, documento, email, data_nascimento, sexo, estado_civil, escolaridade,
        logradouro, numero, complemento, bairro, municipio, uf, cep, tipo_renda,
        vinculo_empregaticio, profissao, atividade_economica, gerente_nome, mei, pa_descricao, usuario, id_agencia, 
        campanha, datahora
      ) VALUES (
        '${e.nome}', '${e.telefone}', '${e.documento}', '${e.email}', '${e.data_nascimento}', '${e.sexo}',
        '${e.estado_civil}', '${e.escolaridade}', '${e.logradouro}', '${e.numero}', '${e.complemento}',
        '${e.bairro}', '${e.municipio}', '${e.uf}', '${e.cep}', '${e.tipo_renda}',
        '${e.vinculo_empregaticio}', '${e.profissao}', '${e.atividade_economica}', '${e.gerente_nome}',
        '${e.mei}', '${e.pa_descricao}', '${usuario}','${e.id_pa}','${campanha}', now()
      );
    `;

        console.log('eu sou inserir csv', qry);
        await executaQry(qry);

        // Se quiser adicionar delay entre inserções:
        // await new Promise(resolve => setTimeout(resolve, 1000));
      }

      terminou = true;
    };



    /*
    idMealing INT(11) NOT NULL AUTO_INCREMENT,
    ano
    orgao
    processo
    liquidacao
    valor_da_face
    credor
    documento
    idade
    renda
    tipo
    telefone
    idAgente
    
    */



    this.expressAppWrapper.get('/oportunidade/:processo/:plataforma', async (req, res, next) => {

      let processo = req.params.processo
      let plataforma = req.params.plataforma
      let ids


      let qry1 = `select idMealing,idAgente from meso_mealing where processo = '${processo}' order by idMealing limit 1 `
      ids = await executaQry(qry1)

      let qry3 = `select idPlatarforma from meso_plataforma where platarforma = '${plataforma}' order by idPlatarforma limit 1`
      //////console.log('casca de bala', qry3)
      let idPlataforma = await executaQry(qry3);
      //////console.log('chupeta de baleia', idPlataforma.dados[0])

      let qry4 = `select idMealing from meso_oportunidade where idMealing = ${ids.dados[0].idMealing}`
      let isCadastrado = await executaQry(qry4)
      //////console.log('estou cadastrado?', isCadastrado.dados.length)

      if (isCadastrado.dados.length == 0) {
        let qry = `insert into meso_oportunidade (idMealing, idAnalista, idPlataforma,dataInicio,estado) values (${ids.dados[0].idMealing}, ${ids.dados[0].idAgente}, ${idPlataforma.dados[0].idPlatarforma},now(),'em andamento') `
        let res29 = await executaQry(qry);
        //////console.log('sou qry', qry)
        res.json(res29);
      }
    })

    this.expressAppWrapper.get('/oportunidadeespecialista/:processo/:plataforma/:usuario', async (req, res, next) => {
      let processo = req.params.processo
      let plataforma = req.params.plataforma
      let usuario = req.params.usuario
      let ids

      let qry1 = `select o.idMealing,o.idOportunidade from meso_mealing as m inner join meso_oportunidade as o on (m.idMealing = o.idMealing) where m.processo = '${processo}'`
      //////console.log('cadelo', qry1)
      ids = await executaQry(qry1)
      //////console.log('Xoxota aqui', ids)

      let qry3 = `select idPlatarforma from meso_plataforma where platarforma = '${plataforma}' order by idPlatarforma limit 1`
      let idPlataforma = await executaQry(qry3);
      //////console.log('chupeta de baleia', idPlataforma.dados[0])

      let qry5 = `select idMealing from meso_finaliza where idMealing = ${ids.dados[0].idMealing}`
      let isCadastrado = await executaQry(qry5)
      //////console.log('estou cadastrado?', isCadastrado.dados.length)

      if (isCadastrado.dados.length == 0) {
        let qry = `insert into meso_finaliza (idMealing,idOportunidade,idPlataforma,idEspecialista,observacao,estado,dataInicio) values (${ids.dados[0].idMealing}, ${ids.dados[0].idOportunidade},${idPlataforma.dados[0].idPlatarforma},(select id from meso_usuariologin where usuario = '${usuario}'),(select observacao from meso_oportunidade where idMealing = ${ids.dados[0].idMealing}),'em atendimento especialista',now())`
        let res29 = await executaQry(qry);
        //////console.log('sou qry', qry)
        res.json(res29);
      }
    })

    this.expressAppWrapper.get('/finaliza/:processo/:estado', async (req, res, next) => {
      let processo = req.params.processo
      let estado = req.params.estado
      let qry = `update meso_finaliza set dataFim = now(), estado = '${estado}' where idMealing = (select idMealing from meso_mealing where processo = '${processo}')`
      let res2 = await executaQry(qry)
      res.json(res2)
    })
    const uploadCSV3 = multer({ storage: storage });


    this.expressAppWrapper.app.post('/upload', uploadCSV3.single('file'), async (req, res) => {
      let usuario = req.body.usuario
      let grupo = req.body.grupo
      let campanha = req.body.campanha

      console.log('Olha o usuario aqui gente', usuario)
      //console.log('Arquivo recebido');
      const file = req.file;
      if (!file) {
        return res.status(400).send('Nenhum arquivo enviado');
      }
      try {
        const dadosCsv = await lerCsv(file.path);
        await inserirCsv(dadosCsv, usuario, campanha

        );
        res.send('Arquivo recebido e salvo com sucesso');
      } catch (error) {
        console.error('Erro ao processar o arquivo:', error);
        res.status(500).send('Erro ao processar o arquivo');
      }
    });


    this.expressAppWrapper.get('/concluido/:telefone', async (req, res, next) => {
      let telefone = req.params.telefone

      let qry = `update meso_contatos set estado = Concluido where telefone like '%${telefone}%' `
      let res2 = await executaQry(qry)
      res.json(res2)
    })



    this.expressAppWrapper.get('/atendimentogeral/:d1/:d2', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00"
      //////console.log('chapisco')
      let data2 = req.params.d2 + " 23:59:59"
      let qry1 = `select u.usuario,count(o.idPlataforma) as quantPlataforma,sum(case when o.atendeu = 1 then 1 else 0 end) as atendeu,p.platarforma from meso_oportunidade as o inner join meso_usuariologin as u on (o.idAnalista = u.id) inner join meso_plataforma as p on (o.idPlataforma = p.idPlatarforma) where idPlataforma IN (1, 2) and  o.dataInicio >= '${data1}' and o.dataInicio <= '${data2}' group by u.usuario, p.platarforma;`
      let res1 = await executaQry(qry1)
      //////console.log(qry1)

      res.json(res1)
    })

    this.expressAppWrapper.get('/atendimentogeralespecialista/:d1/:d2', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00"
      //////console.log('chapisco')
      let data2 = req.params.d2 + " 23:59:59"
      let qry1 = `select u.usuario,count(f.idPlataforma) as quantPlataforma,sum(case when f.estado = 'aprovado' then 1 else 0 end) as atendeu,p.platarforma from meso_finaliza as f inner join meso_usuariologin as u on (f.idEspecialista = u.id) inner join meso_plataforma as p on (f.idPlataforma = p.idPlatarforma) where idPlataforma IN (1, 2) and  f.dataInicio >= '${data1}' and f.dataInicio <= '${data2}' group by u.usuario, p.platarforma;`
      let res1 = await executaQry(qry1)
      //////console.log(qry1)

      res.json(res1)
    })

    this.expressAppWrapper.get('/tmazap/:analista/:d1/:d2', async (req, res, next) => {
      let analista = req.params.analista
      let data1 = req.params.d1 + " 00:00:00"
      let data2 = req.params.d2 + " 23:59:59"

      let qry1 = `select u.usuario as nome,p.platarforma as plataforma,count(o.idOportunidade)as quantidade,sec_to_time(sum(time_to_sec(timediff(o.dataFim,o.dataInicio)))) as tempo  from meso_oportunidade as o inner join meso_plataforma as p on (o.idPlataforma = p.idPlatarforma) inner join meso_usuariologin as u on (o.idAnalista = u.id) where p.idPlatarforma = 1 and u.usuario = '${analista}' and dataInicio >= '${data1}' and dataInicio <= '${data2}';`
      let res1 = await executaQry(qry1)
      let qry2 = `select u.usuario as nome,p.platarforma as plataforma,count(o.idOportunidade)as quantidade,sec_to_time(sum(time_to_sec(timediff(o.dataFim,o.dataInicio)))) as tempo from meso_oportunidade as o inner join meso_plataforma as p on (o.idPlataforma = p.idPlatarforma) inner join meso_usuariologin as u on (o.idAnalista = u.id) where p.idPlatarforma = 2 and u.usuario = '${analista}' and dataInicio >= '${data1}' and dataInicio <= '${data2}';`
      let res2 = await executaQry(qry2)
      let qry3 = `select avg(TIMESTAMPDIFF(SECOND, dataInicio, dataFim)) as media,max(TIMESTAMPDIFF(SECOND, dataInicio, dataFim))  as maxDuracao  from meso_oportunidade where idAnalista = (select id from meso_usuariologin where usuario = '${analista}' and idPlataforma = 1);`
      let res3 = await executaQry(qry3)
      let qry4 = `select avg(TIMESTAMPDIFF(SECOND, dataInicio, dataFim)) as media,max(TIMESTAMPDIFF(SECOND, dataInicio, dataFim)) as maxDuracao from meso_oportunidade where idAnalista = (select id from meso_usuariologin where usuario = '${analista}' and idPlataforma = 2);`
      let res4 = await executaQry(qry4)

      //////console.log('qry1', qry1)
      //////console.log('qry2', qry2)

      let tudo = {
        whastzap: res1.dados[0], // Supondo que res1 retorne um array com um único objeto
        telefone: res2.dados[0],
        zap1: res3.dados[0],   // O mesmo para res2
        tel1: res4.dados[0],
      }

      let whastzap = { ...tudo.whastzap, ...tudo.zap1 }

      let telefone = { ...tudo.telefone, ...tudo.tel1 }


      let tudo1 = {
        whastzap,
        telefone
      }

      res.json(tudo1)

      //////console.log(tudo1)
    })

    this.expressAppWrapper.get('/tmazapespecialista/:especialista/:d1/:d2', async (req, res, next) => {
      let especialista = req.params.especialista
      let data1 = req.params.d1 + " 00:00:00"
      let data2 = req.params.d2 + " 23:59:59"

      let qry1 = `select u.usuario as nome,p.platarforma as plataforma,count(f.idEspecialista)as quantidade,sec_to_time(sum(time_to_sec(timediff(f.dataFim,f.dataInicio)))) as tempo  from meso_finaliza as f inner join meso_plataforma as p on (f.idPlataforma = p.idPlatarforma) inner join meso_usuariologin as u on (f.idEspecialista = u.id) where p.idPlatarforma = 1 and u.usuario =  '${especialista}' and dataInicio >= '${data1}' and dataInicio <= '${data2}';`
      let res1 = await executaQry(qry1)
      let qry2 = `select u.usuario as nome,p.platarforma as plataforma,count(f.idFinaliza)as quantidade,sec_to_time(sum(time_to_sec(timediff(f.dataFim,f.dataInicio)))) as tempo from meso_finaliza as f inner join meso_plataforma as p on (f.idPlataforma = p.idPlatarforma) inner join meso_usuariologin as u on (f.idEspecialista = u.id) where p.idPlatarforma = 2 and u.usuario = '${especialista}' and dataInicio >= '${data1}' and dataInicio <= '${data2}';`
      let res2 = await executaQry(qry2)
      let qry3 = `select avg(TIMESTAMPDIFF(SECOND, dataInicio, dataFim)) as media,max(TIMESTAMPDIFF(SECOND, dataInicio, dataFim))  as maxDuracao  from meso_finaliza  where idEspecialista = (select id from meso_usuariologin where usuario = '${especialista}' and idPlataforma = 1);`
      let res3 = await executaQry(qry3)
      let qry4 = `select avg(TIMESTAMPDIFF(SECOND, dataInicio, dataFim)) as media,max(TIMESTAMPDIFF(SECOND, dataInicio, dataFim))  as maxDuracao  from meso_finaliza  where idEspecialista = (select id from meso_usuariologin where usuario = '${especialista}' and idPlataforma = 2);`
      let res4 = await executaQry(qry4)

      //////console.log('qry1', qry1)
      //////console.log('qry2', qry2)

      let tudo = {
        whastzap: res1.dados[0], // Supondo que res1 retorne um array com um único objeto
        telefone: res2.dados[0],
        zap1: res3.dados[0],   // O mesmo para res2
        tel1: res4.dados[0],
      }

      let whastzap = { ...tudo.whastzap, ...tudo.zap1 }

      let telefone = { ...tudo.telefone, ...tudo.tel1 }


      let tudo1 = {
        whastzap,
        telefone
      }

      res.json(tudo1)

      //////console.log(tudo1)
    })

    this.expressAppWrapper.get('/detalhezap/:d1/:d2', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00"
      let data2 = req.params.d2 + " 23:59:59"
      let qry = `select u.usuario, m.credor,m.processo,o.estado,date_format(o.dataInicio,'%d-%m-%Y %H:%i:%S') as dataInicio,date_format(o.dataFim,'%d-%m-%Y %H:%i:%S') as dataFim,p.Platarforma from meso_usuariologin as u inner join meso_mealing as m on (u.id = m.idAgente) inner join meso_oportunidade as o on (o.idMealing = m.idMealing) inner join meso_plataforma as p on (p.idPlatarforma = o.idPlataforma) where o.dataInicio >= '${data1}' and o.dataFim <= '${data2}'`
      //////console.log(qry)
      let res1 = await executaQry(qry)
      res.json(res1)
      //////console.log(res1)
    })

    this.expressAppWrapper.get('/detalhezapespecialista/:d1/:d2', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00"
      let data2 = req.params.d2 + " 23:59:59"
      let qry = `select u.usuario, m.credor,m.processo,f.estado,date_format(f.dataInicio,'%d-%m-%Y %H:%i:%S') as dataInicio,date_format(f.dataFim,'%d-%m-%Y %H:%i:%S') as dataFim,p.Platarforma from meso_usuariologin as u inner join meso_finaliza as f on (u.id = f.idEspecialista) inner join meso_mealing as m on (m.idMealing = f.idMealing)  inner join meso_plataforma as p on (p.idPlatarforma = f.idPlataforma) where f.dataInicio >= '${data1}' and f.dataFim <= '${data2}'`
      //////console.log(qry)
      let res1 = await executaQry(qry)
      res.json(res1)
      //////console.log(res1)
    })

    this.expressAppWrapper.get('/buscarcsv/:campanha', async (req, res, next) => {
      let campanha = req.params.campanha
      if (terminou) {
        let qry = `select * from meso_contatos where campanha = '${campanha}'`
        //////console.log(qry)
        let res1 = await executaQry(qry)
        res.json(res1)
        //////console.log('to aqui')
        terminou = false;
      }
    })

    this.expressAppWrapper.get('/buscarcsv/:campanha', async (req, res, next) => {
      let campanha = req.params.campanha
      if (terminou) {
        let qry = `select * from meso_contatos where campanha = '${campanha}'`
        //////console.log(qry)
        let res1 = await executaQry(qry)
        res.json(res1)
        //////console.log('to aqui')
        terminou = false;
      }
    })

    //select * from meso_contatos where estado = 'Novo' and campanha like '%desempenho%';


    this.expressAppWrapper.get('/apinexum', async (req, res, next) => {

      let qry = `select credor as nome, documento as cnpf_cnpj, telefone as phone_number1, datahora as data_liberacao_credito, tipo as produto_credito from meso_mealing;`
      //////console.log(qry)
      let res1 = await executaQry(qry)
      res.json(res1)
      //////console.log('to aqui')

    })

    //fim de login--------------------------------------------------------------------------

    //TMA ----------------------------------------------------------------------------------
    this.expressAppWrapper.get("/tma/:d1/:d2/:fila/:ramal", async (req, res, next) => {
      let fila = req.params.fila;
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'


      let qry = `select * from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${fila}'  and connectedlinenum = '${ramal}'`;
      //////console.log(qry);

      let res99 = await executaQry(qry);
      res.json(res99);
      //////console.log(res99);

    });



    this.expressAppWrapper.get("/nomeramal/:fila/:ramal", async (req, res, next) => {
      let fila = req.params.fila;
      let ramal = req.params.ramal;



      let qry = `select distinct connectedlinename as usuario from meso_agent_complete where fila = '${fila}'  and connectedlinenum = '${ramal}'`;
      //////console.log(qry);

      let res99 = await executaQry(qry);
      res.json(res99);
      //////console.log(res99);

    });

    this.expressAppWrapper.get("/nomeramalsainte/:ramal", async (req, res, next) => {
      let ramal = req.params.ramal;
      let qry = `select distinct cnam as usuario from cdr where cnum = '${ramal}'`;
      //////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      //////console.log(res1);

    });

    this.expressAppWrapper.get("/ramaltma/:fila/:ramal", async (req, res, next) => {
      let fila = req.params.fila;
      let ramal = req.params.ramal;



      let qry = `select distinct connectedlinenum as ramal from meso_agent_complete where fila = '${fila}'  and connectedlinenum = '${ramal}'`;
      //////console.log(qry);

      let res99 = await executaQry(qry);
      res.json(res99);
      //////console.log(res99);

    });

    this.expressAppWrapper.get("/ramaltmasainte/:ramal", async (req, res, next) => {
      let ramal = req.params.ramal;
      let qry = `select distinct cnum as ramal from cdr where cnum = '${ramal}'`
      //////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      //////console.log(res1);
    })

    this.expressAppWrapper.get("/mediatma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select avg(talktime) as mediatma from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'
      and connectedlinenum = '${ramal}' `;
      //////console.log(qry);

      let res39 = await executaQry(qry);
      res.json(res39);
      //////console.log(res39);

    });

    this.expressAppWrapper.get("/totalchamadastma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select * from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'
      and connectedlinenum = '${ramal}' `;
      //////console.log(qry);

      let res40 = await executaQry(qry);
      res.json(res40);
      //////console.log(res40);

    });

    this.expressAppWrapper.get("/totalchamadastmasainte/:d1/:d2/:ramal", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d1 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select * from cdr where calldate >= '${data1}' and calldate <= '${data2}' and cnum = '${ramal}' and disposition = 'ANSWERED' and lastapp = 'Dial'`;
      //////console.log('xereco', qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      ////console.log(res1)
    })

    this.expressAppWrapper.get("/totalduracaotma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select sum(talktime) as duracaototal from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'
      and connectedlinenum = '${ramal}' `;
      //////console.log(qry);

      let res41 = await executaQry(qry);
      res.json(res41);
      //////console.log(res41);

    });

    this.expressAppWrapper.get("/totalduracaotmasainte/:d1/:d2/:ramal", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select sum(billsec) as duracaototal from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`
      //////console.log(qry)

      let res1 = await executaQry(qry)
      res.json(res1)
      //////console.log(res1)
    })

    this.expressAppWrapper.get("/maximaduracaotma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select max(talktime) as duracaomaxima from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'
      and connectedlinenum = '${ramal}' `;
      //////console.log(qry);

      let res42 = await executaQry(qry);
      res.json(res42);
      //////console.log(res42);

    });

    this.expressAppWrapper.get("/maximaduracaotmasainte/:d1/:d2/:ramal", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select max(billsec) as duracaomaxima from cdr where calldate  > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      //////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      //////console.log(res1)
    })
    //Iinicio conexões---------------------------------------------------------------------------------
    this.expressAppWrapper.get("/listnum/:agent", async (req, res, next) => {

      let agent = req.params.agent
      let qry = `select extension from users where name = '${agent}'`;
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/primeiracon/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select min(datahora) as mindata from meso_login_fila where membername= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/primeiraconsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select min(datahora) as mindata from meso_login_fila where membername= '${ramal}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      //////console.log('#ReginaldoCompraUmArCondicionadoParaGente', qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/ultimacon/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select max(datahora) as maxdata from meso_login_fila where membername= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });



    this.expressAppWrapper.get("/ultimaconsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select max(datahora) as maxdata from meso_login_fila where membername= '${ramal}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/numcount/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select count(evento) as numcon from meso_login_fila where membername= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/numchamada/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select count(evento) as ligacoes from meso_agent_connect where connectedlinenum = '${ramal}' and uniqueid = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/numcall/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select count(evento) as acalled from meso_agent_called where connectedlinenum = '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/durpausa/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select distinct SEC_TO_TIME(sum(time_to_sec(TIMEDIFF(despausado, datahora)))) as durpause from meso_pausa_fila where membername = '${ramal}' and datahora >= '${data1}' and datahora <= '${data2};
      '
      `;
      //////console.log(qry);




      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/talktime/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let fila = req.params.fila
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select distinct SEC_TO_TIME(sum(talktime)) as talktime from meso_agent_complete where connectedlinenum = '${ramal}' or calleridnum= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2};
      '
      `;
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/talktimesainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let data1 = req.params.d1
      let data2 = req.params.d2
      let qry = `select sec_to_time(sum(time_to_sec(timediff(terminoligacao,inicioligacao)))) as talktime from meso_detalhe_sainte where solicitante = '${ramal}' `
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/duracon/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let fila = req.params.fila
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select sec_to_time(SUM(time_to_sec(TIMEDIFF(desloga, datahora)))) as durcon from meso_login_fila where membername = '${ramal}' and fila ='${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      //////console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });



    this.expressAppWrapper.get("/duracomsainte/:ramal/:d1/:d2", async (req, res, next) => {
      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sec_to_time(SUM(time_to_sec(TIMEDIFF(desloga, datahora)))) as durcon from meso_login_fila where membername = '${ramal}' and datahora > '${data1}' and datahora < '${data2}'`;
      //////console.log('wof wof wof, só as cachorras', qry)

      let res1 = await executaQry(qry);
      res.json(res1);
      //////console.log(res1)
    })

    this.expressAppWrapper.get("/numpausa/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select count(evento) as pausas from meso_pausa_fila where membername = '${ramal}' and fila = '${fila}' and datahora >= '${data1}' and datahora <= '${data2}'
      `;
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });



    //Fim conexões--------------------------------------------------------------------------------------------------------------

    //Inicio service-----------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.get("/duraconsec/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let fila = req.params.fila
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select SUM(time_to_sec(TIMEDIFF(desloga, datahora))) as durconsec from meso_login_fila where membername = '${ramal}' and fila ='${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      //////console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/duraconsecsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select SUM(time_to_sec(TIMEDIFF(desloga, datahora))) as durconsec from meso_login_fila where membername = '${ramal}'  and datahora > '${data1}' and datahora < '${data2}'
      `;
      //////console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/verificadur/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let fila = req.params.fila
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select SUM(TIMEDIFF(desloga, datahora)) as verificadur from meso_login_fila where membername = '${ramal}' and fila ='${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      //////console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/verificadursainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select SUM(TIMEDIFF(desloga, datahora)) as verificadur from meso_login_fila where membername = '${ramal}' and datahora > '${data1}' and datahora < '${data2}'`;
      //////console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/talktimesec/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let fila = req.params.fila
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select distinct sum(talktime) as talktimesec from meso_agent_complete where connectedlinenum = '${ramal}' or calleridnum= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2};
      '
      `;
      //////console.log(qry);
      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/talktimesecsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select sum(time_to_sec(timediff(terminoligacao,inicioligacao))) as talktimesec from meso_detalhe_sainte where solicitante = '${ramal}' and datahora > '${data1}' and datahora < '${data2}'`;
      //////console.log('salve', qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/ultimologoff/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select MAX(datahora) as maxlogoff from meso_desloga_fila where membername= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/ultimologoffsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select MAX(datahora) as maxlogoff from meso_desloga_fila where membername= '${ramal}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    //Fim service----------------------------------------------------------------------------------------------------------------------------------------------
    //Inicio tme-----------------------------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.get("/somaespera/:fila/:d1/:d2/", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sum(holdtime) as somaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
      //////console.log(qry);

      let res43 = await executaQry(qry);
      res.json(res43);
      //////console.log(res43);

    });

    this.expressAppWrapper.get("/somasainte/:ramal/:d1/:d2/", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sum(duration - billsec) as somasainte from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      //////console.log('eu sou a melodia', qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      //////console.log(res1);
    })

    this.expressAppWrapper.get("/mediaespera/:fila/:d1/:d2/", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select avg(holdtime) as mediaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
      //////console.log(qry);

      let res44 = await executaQry(qry);
      res.json(res44);
      //////console.log(res44);

    });

    this.expressAppWrapper.get("/mediaesperasainte/:ramal/:d1/:d2/", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sum(duration - billsec) as duracao, count(*) as contduracao from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      //////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      //////console.log(res1);
    })

    this.expressAppWrapper.get("/minimoespera/:fila/:d1/:d2/", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select min(holdtime) as minimaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
      //////console.log(qry);

      let res45 = await executaQry(qry);
      res.json(res45);
      //////console.log(res45);

    });

    this.expressAppWrapper.get("/minimoesperasainte/:ramal/:d1/:d2/", async (req, res, netx) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select min(billsec) as minimaesperasainte from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      //////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      //////console.log(res1);
    })

    this.expressAppWrapper.get("/maximoespera/:fila/:d1/:d2/", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select max(holdtime) as maximaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
      //////console.log(qry);

      let res45 = await executaQry(qry);
      res.json(res45);
      //////console.log(res45);

    });

    this.expressAppWrapper.get("/maximoesperasainte/:ramal/:d1/:d2/", async (req, res, netx) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select max(billsec) as maximoesperasainte from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      //////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      //////console.log(res1);
    })


    this.expressAppWrapper.get("/totalchamadasespera/:fila/:d1/:d2/", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select * from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
      //////console.log(qry);

      let res46 = await executaQry(qry);
      res.json(res46);
      //////console.log(res46);

    });

    this.expressAppWrapper.get("/totalchamadasesperasainte/:ramal/:d1/:d2/", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select * from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      //////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      //////console.log(res1);
    })

    //FIM TME----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    //inicio relaório de tronco

    this.expressAppWrapper.get("/listartronco", async (req, res, next) => {

      let qry = `select * from trunks `;
      //////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      //////console.log(res38);

    });

    this.expressAppWrapper.get("/troncoabandonadas/:tronco/:d1/:d2", async (req, res, next) => {
      let tronco = req.params.tronco
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(*) as abandon from meso_abandon where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
      //////console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      //////console.log(res33);

    });

    this.expressAppWrapper.get("/troncoentrar/:tronco/:d1/:d2", async (req, res, next) => {
      let tronco = req.params.tronco
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(*) as entrada from meso_entrar where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
      //////console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      //////console.log(res33);

    });

    this.expressAppWrapper.get("/troncocomplete/:tronco/:d1/:d2", async (req, res, next) => {
      let tronco = req.params.tronco
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(*) as complete from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
      //////console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      //////console.log(res33);

    });

    this.expressAppWrapper.get("/troncoentrarrt/:tronco/:d1/:d2", async (req, res, next) => {
      let tronco = req.params.tronco
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(*) as entradart from meso_join_rt where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
      //////console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      //////console.log(res33);

    });


    this.expressAppWrapper.get("/ligar/:ramal/:telefone", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let telefone = req.params.telefone;
      let ramal = 'SIP/' + req.params.ramal;
      let ramal2 = req.params.ramal;

      //////console.log('teoricamente eu sou o telefone', telefone)
      //////console.log('talvez eu seja o ramal', ramal)



      var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
      // In case of any connectiviy problems we got you coverd.
      ami.keepConnected();

      ami.action(
        {
          action: "Originate",
          actionid: "321",
          Channel: ramal,
          Exten: telefone,
          priority: 1,
          Context: "from-internal",

        })
      res.status(200).send('ok')

    })



    //------------------------------------------------------------------------------------------------------------------------------------------------------------

    //Inicio meso estoque--------------------------------------------------------------------------------------------
    this.expressAppWrapper.get("/acciolyliga/:ramal/:telefone", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let ramal = req.params.ramal;
      let telefone = 'SIP/' + req.params.telefone;
      let telefone2 = req.params.telefone;

      let qry = ` update meso_estoque set situacao = 'Concluído' where ramalvendedor = '${telefone2}' and cliente = '${ramal}' `;
      //////console.log(qry);
      //////console.log(qry);
      let res132 = await executaQry(qry);
      res.json(res132);
      //////console.log(res132);


      var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
      // In case of any connectiviy problems we got you coverd.
      ami.keepConnected();

      ami.action(
        {
          action: "Originate",
          actionid: "321",
          Channel: telefone,
          Exten: ramal,
          priority: 1,
          Context: "from-internal",

        })

    })


    this.expressAppWrapper.get("/atualizausuario/:usuario/:telefone", async (req, res, next) => {
      let qry


      let usuario = req.params.usuario
      let telefone = req.params.telefone

      qry = `update meso_contatos set usuario = '${usuario}' where telefone = ${telefone}`


      //console.log('contato', qry)
      let res20 = await executaQry(qry)
      res.json(res20)
      //console.log('contatos resposta', res20)

    })

    this.expressAppWrapper.post("/acciolyaltera/", async (req, res, next) => {
      let id = req.body.id;
      let pedido = req.body.pedido;
      let situacao = req.body.situacao;
      let ramal = req.body.ramalvendedor;
      let telefone = req.body.cliente
      let d1 = req.body.diaatual
      let d2 = req.body.diaatual


      let qry = `update meso_estoque set pedido = '${pedido}', situacao = '${situacao}' where ramalvendedor ='${ramal}' and cliente='${telefone}' and diaatual >= '${d1}' and diaatual <= '${d2}'`;
      //////console.log(qry);


      //////console.log(qry)
      let res99 = await executaQry(qry);

      res.json(res99);
      //////console.log(res99);

    });


    //Operadores realtime--------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.get("/realoperadorrt", async (req, res, next) => {
      // let filacompleta = req.params.fila;
      //let data1 = req.params.d1 + ' 00:00:00'
      //let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select * from meso_operadores_realtime`;
      //////console.log(qry);

      let res36 = await executaQry(qry);
      res.json(res36);
      //////console.log(res36);

    });

    this.expressAppWrapper.get("/ajustaEstado", async (req, res, next) => {
      // let filacompleta = req.params.fila;
      //let data1 = req.params.d1 + ' 00:00:00'
      //let data2 = req.params.d2 + ' 23:59:59'

      let qry = `update users set estado = 'deslogado' where fila = 0 and estado = 'logado';`;
      //////console.log(qry);

      let res36 = await executaQry(qry);
      res.json(res36);
      //////console.log(res36);



    });

    //REAL OPERADOR------------------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.post("/logarpainel", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = 'SIP/' + req.body.extension;
      let extensionsempin = req.body.extension;

      let fila = req.body.fila;


      var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
      // In case of any connectiviy problems we got you coverd.
      ami.keepConnected();

      ami.action(
        {
          action: "QueueAdd",
          actionid: "123",
          Queue: fila,
          Interface: extension

        })
      try {
        let qry = `
                    insert into meso_logado(ramal ,pin, fila)
                    values ('${extensionsempin}','${extensionsempin}', '${fila}')
                  `;
        //////console.log(qry);

        //////console.log(qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        //////console.log(e);
      }

    });

    this.expressAppWrapper.post("/estadoperador", async (req, res) => {

      let extension = req.body.extension;



      try {
        let qry = `
                          update users set estado = 'logado' where extension = '${extension}'
                        `;
        //////console.log(qry);
        //////console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        //////console.log(e);
      }

    });

    this.expressAppWrapper.post("/estadoperadorfila", async (req, res) => {
      let extension = req.body.extension;

      let fila = req.body.fila;



      try {
        let qry = `
                          update users set fila = '${fila}' where extension = '${extension}'
                        `;
        //////console.log(qry);
        //////console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        //////console.log(e);
      }

    });

    this.expressAppWrapper.post("/logslogin", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = req.body.extension;
      let fila = req.body.fila;

      try {
        let qry = `
                                insert into logs(user, ramal, fila, motivo, datahora)
                                values ('${extension}','${extension}', '${fila}','login', now())
                              `;
        //////console.log(qry);
        let res47 = await executaQry(qry);
        res.json(res47);
      } catch (e) {
        //////console.log(e);
      }

    });




    //-------------------------------------------------------------------------------------------------------------------------


    this.expressAppWrapper.get("/realoperadorlogados2/:ramal/:d1/:d2/", async (req, res, next) => {
      // let filacompleta = req.params.fila;
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select * from logs where ramal like '%${ramal}%' and datahora >= '${data1}' and datahora <= '${data2}' order by '${data1}' `;
      //////console.log(`Les't go boys real opereador`, qry)

      let res37 = await executaQry(qry);
      res.json(res37);
      //////////console.log(res37);

    });


    this.expressAppWrapper.post("/deslogarpainel", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = 'SIP/' + req.body.extension;
      let extensionsempin = req.body.extension;

      let fila = req.body.fila;


      var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
      // In case of any connectiviy problems we got you coverd.
      ami.keepConnected();

      ami.action(
        {
          action: "QueueRemove",
          actionid: "123",
          Queue: fila,
          Interface: extension

        })
      try {
        let qry = `                      delete from meso_logado where pin = '${extensionsempin}'
    
                  `;
        //////console.log(qry);

        //////console.log(qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        //////console.log(e);
      }

    });

    this.expressAppWrapper.post("/estadoperadordesloga", async (req, res) => {

      let extension = req.body.extension;



      try {
        let qry = `
                          update users set estado = 'deslogado' where extension = '${extension}'
                        `;
        //////console.log(qry);
        //////console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        //////console.log(e);
      }

    });

    this.expressAppWrapper.post("/deslogaestadorfila", async (req, res) => {
      let extension = req.body.extension;

      let fila = req.body.fila;



      try {
        let qry = `
                          update users set fila = '0' where extension = '${extension}'
                        `;
        //////console.log(qry);
        //////console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        //////console.log(e);
      }

    });

    this.expressAppWrapper.post("/logsdeslogar", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = req.body.extension;
      let fila = req.body.fila;

      try {
        let qry = `
                                insert into logs(user, ramal, fila, motivo, datahora)
                                values ('${extension}','${extension}', '${fila}','logout', now())
                              `;
        //////console.log(qry);
        let res47 = await executaQry(qry);
        res.json(res47);
      } catch (e) {
        //////console.log(e);
      }

    });

    //-------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.post("/pausarpainelrt", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = 'SIP/' + req.body.extension;
      let extensionsempin = req.body.extension;

      let fila = req.body.fila;


      var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
      // In case of any connectiviy problems we got you coverd.
      ami.keepConnected();

      ami.action(
        {
          Action: "QueuePause",
          Actionid: "1234",
          Queue: fila,
          Interface: extension,
          Paused: true,
          Reason: 'teste razao'

        })
      try {
        let qry = `                      
        insert into meso_pausado(ramal ,pin, fila)
        values ('${extensionsempin}','${extensionsempin}', '${fila}')
                  `;
        //////console.log(qry);

        //////console.log(qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        //////console.log(e);
      }

    });

    this.expressAppWrapper.post("/pausarestado", async (req, res) => {

      let extension = req.body.extension;



      try {
        let qry = `
                          update users set estado = 'pausado' where extension = '${extension}'
                        `;
        //////console.log(qry);
        //////console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        //////console.log(e);
      }

    });


    this.expressAppWrapper.post("/logspausarrt", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = req.body.extension;
      let fila = req.body.fila;

      try {
        let qry = `
                                insert into logs(user, ramal, fila, motivo, datahora)
                                values ('${extension}','${extension}', '${fila}','pausain', now())
                              `;
        //////console.log(qry);
        let res47 = await executaQry(qry);
        res.json(res47);
      } catch (e) {
        //////console.log(e);
      }

    });


    //------------------------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.post("/despausarpainelrt", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = 'SIP/' + req.body.extension;
      let extensionsempin = req.body.extension;

      let fila = req.body.fila;


      var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
      // In case of any connectiviy problems we got you coverd.
      ami.keepConnected();

      ami.action(
        {
          Action: "QueuePause",
          Actionid: "1234",
          Queue: fila,
          Interface: extension,
          Paused: false,
          Reason: 'teste razao'

        })
      try {
        let qry = `                      
        delete from meso_pausado where pin =
        '${extensionsempin}'
                  `;
        //////console.log(qry);

        //////console.log(qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        //////console.log(e);
      }

    });




    this.expressAppWrapper.post("/logsdespausarrt", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = req.body.extension;
      let fila = req.body.fila;

      try {
        let qry = `
                                insert into logs(user, ramal, fila, motivo, datahora)
                                values ('${extension}','${extension}', '${fila}','pausaout', now())
                              `;
        //////console.log(qry);
        let res47 = await executaQry(qry);
        res.json(res47);
      } catch (e) {
        //////console.log(e);
      }

    });



    this.expressAppWrapper.get("/getsetores", async (req, res) => {
      try {
        let qry = `
        select * from meso_agencias
        `;
        let res27 = await executaQry(qry);
        res.json(res27);
      } catch (e) {
        //console.log(e);
      }
    });

    this.expressAppWrapper.get("/listausuariotipo/:tipo", async (req, res) => {
      let tipo = req.params.tipo
      try {
        let qry = `
        select * from meso_usuariologin where id_agencia = '${tipo}'
        `;
        let res27 = await executaQry(qry);
        res.json(res27);
      } catch (e) {
        //console.log(e);
      }
    });

    //Cadastro de usuário ----------------------------------------------------------------------------------


    this.expressAppWrapper.get("/listausuario", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      try {
        let qry = `
        select * from meso_usuariologin
        `;
        let res27 = await executaQry(qry);
        res.json(res27);
      } catch (e) {
        //////console.log(e);
      }
    });

    this.expressAppWrapper.get("/listausuarioAgencia/:id", async (req, res) => {
      let id = req.params.id

      try {
        let qry = `
        select id_agencia from meso_usuariologin where id = '${id}'
        `;
        let res27 = await executaQry(qry);
        res.json(res27);
      } catch (e) {
        //////console.log(e);
      }
    });

    this.expressAppWrapper.post("/insereusuario", async (req, res, next) => {
      let usuario = req.body.usuario + "-Meso";
      let senha = req.body.senha;
      let tipo = req.body.tipo;
      try {
        let qry = `
              insert into meso_usuariologin(usuario, senha)
              values ('${usuario}', MD5('${senha}'))
            `;
        console.log(qry)
        let res26 = await executaQry(qry);
        res.json(res26);
      } catch (e) {
        console.log(e);
      }
    });



    this.expressAppWrapper.get("/usuariotira/:id", async (req, res, next) => {
      let id = req.params.id;
      //////console.log(id)
      try {
        let qry = `
              delete from meso_usuariologin where id = ${id}
            `;
        let res28 = await executaQry(qry);
        res.json(res28);
      } catch (e) {
        //////console.log(e);
      }
    });


    this.expressAppWrapper.post("/usuarioaltera", async (req, res, next) => {
      //////console.log(req.body)
      let mostra = req.body;
      let { id, usuario, senha } = mostra;
      //////console.log(id, usuario, senha, tipo);

      try {
        let qry = `
              update meso_usuariologin set usuario='${usuario}', senha =MD5('${senha}') where id = ${id}
            `;
        let res14 = await executaQry(qry);
        res.json(res14);
      } catch (e) {
        res.json({ message: e.message })
      }
    });

    //FIM Cadastro de usuário ----------------------------------------------------------------------------------

    //MESO DETALHES --------------------------------------------------------------------------------------------

    this.expressAppWrapper.get("/detalhes/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_detalhe where datahora > '${data1}' and datahora < '${data2}' `;
      //////console.log(qry);


      let res1 = await executaQry(qry);
      res.json(res1);
      //////console.log(res1);

    });


    this.expressAppWrapper.get("/detalhessainte/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select *,timediff(terminoligacao,inicioligacao) as duracao,timediff(dialend,datahora) as holdtime from meso_detalhe_sainte where datahora > '${data1}' and datahora < '${data2}' `;
      //////console.log(qry);


      let res1 = await executaQry(qry);
      res.json(res1);
      //////console.log(res1);

    })

    this.expressAppWrapper.post("/send", async (req, res) => {

      let to = req.body.to
      let body = req.body.body
      let nome = req.body.nome
      let agente = req.body.agent
      console.log('me mostra agente', agente)
      ////console.log('dificil heim kkkkkkk', to, body, nome)
      let palavrao = await verificaPalavrao(body)
      ////console.log('palavrão nãokkkkkkk', palavrao)
      if (palavrao) {
        let qry = `insert into meso_mensagens_banidas (nome, mensagem) VALUES ('${nome}', '${body}')`
        await executaQry(qry)
        res.json({ "dados": "mensagem não tolerada" });
      } else {
        ////console.log('passei mesmo kkkkk')
        send(to, body, nome, agente, res)
        res.json({ "dados": "mensagem enviada" });
      }
    })

    this.expressAppWrapper.get('/updateprotocolo', async (req, res) => {
      let query = `SELECT protocolo,id  FROM meso_mensagens_solicitante  WHERE protocolo IS NOT NULL  ORDER BY id DESC limit 1;`
      let protocolo = await executaQry(query)
      let query1 = `update meso_mensagens_solicitante set protocolo = '${protocolo.dados[0].protocolo}' WHERE id > ${protocolo.dados[0].id}`
      await executaQry(query1)
      res.json(protocolo)
    })

    this.expressAppWrapper.post("/sendprotocolo", async (req, res) => {

      let to = req.body.to
      let body = req.body.body
      let nome = req.body.nome
      console.log('dificil heim kkkkkkk', to, body, nome)
      sendprotocolo(to, body, nome, res)
    })

    this.expressAppWrapper.post("/sendimage", async (req, res) => {



      let to = req.body.to
      let id = req.body.id
      let usuario = req.body.usuario

      console.log('toctoc', to, id, usuario, res)
      //////console.log('oque vem sem link', link)
      sendImage(to, id, usuario, res)
    })


    this.expressAppWrapper.post("/sendvideo", async (req, res) => {

      let to = req.body.to
      let id = req.body.id

      let link = req.body.link

      sendVideo(to, id, link, res)
    })

    this.expressAppWrapper.post("/sendaudio", async (req, res) => {

      let to = req.body.to
      let id = req.body.id
      let usuario = req.body.usuario

      sendAudio(to, id, usuario, res)
    })


    this.expressAppWrapper.post("/sendtemplate", async (req, res) => {

      let to = req.body.to
      let name = req.body.name
      let usuario = req.body.usuario

      sendTemplate(to, name, usuario, res)
    })

    this.expressAppWrapper.post("/senddocument", async (req, res) => {

      let to = req.body.to
      let id = req.body.id
      let usuario = req.body.usuario
      let filename = req.body.nomeArquivo


      sendDocument(to, id, filename, usuario, res)
    })




    this.expressAppWrapper.get("/estadoMealing/:processo/:atendeu/:reagendar/:interesse/:negociar/:observacao", async (req, res, next) => {
      //////console.log('entrei aqui')
      let processo = req.params.processo
      let atendeu = req.params.atendeu
      let reagendar = req.params.reagendar
      let interesse = req.params.interesse
      let negociar = req.params.negociar
      let observacao = req.params.observacao


      let intatendeu = 0
      let intreagendar = 0
      let intinteresse = 0
      let intnegociar = 0

      if (atendeu == 'sim') {
        intatendeu = 1
      }

      if (reagendar == 'sim') {
        intreagendar = 1
      }

      if (interesse == 'sim') {
        intinteresse = 1
      }

      if (negociar == 'sim') {
        intnegociar = 1
      }

      if (observacao == 'undefined' || observacao == 'NULL') {
        observacao = ''
      }

      //////console.log(processo, atendeu, reagendar, interesse, negociar)
      if (atendeu == 'sim') {

        if (interesse == 'sim' || negociar == 'sim') {
          let qry = `update meso_oportunidade set estado = 'aprovado', atendeu ='${intatendeu}', reagenda='${intreagendar}', interesse='${intinteresse}', negociar = '${intnegociar}', observacao = '${observacao}',dataFim = now() where idMealing= (select idMealing from meso_mealing where processo ="${processo}" order by idMealing limit 1 )`
          //////console.log('query', qry)
          let res1 = await executaQry(qry)
          res.json(res1)
        } else {
          let qry = `update meso_oportunidade set estado = 'reprovado',dataFim = now(), observacao = '${observacao}' where idMealing= (select idMealing from meso_mealing where processo ="${processo}") `
          //////console.log('query', qry)
          let res1 = await executaQry(qry)
          res.json(res1)
        }
      } else if (reagendar == 'sim') {
        let qry = `update meso_oportunidade set estado = 'reagendar', atendeu ='${intatendeu}', reagenda='${intreagendar}', interesse='${intinteresse}', negociar = '${intnegociar}', observacao = '${observacao}',dataFim = now() where idMealing= (select idMealing from meso_mealing where processo ="${processo}" order by idMealing limit 1 )`
        //////console.log('query', qry)

        let res1 = await executaQry(qry)
        res.json(res1)
      } else {
        let qry = `update meso_oportunidade set estado = 'reprovado',dataFim = now(), observacao = '${observacao}' where idMealing = (select idMealing from meso_mealing where processo = '${processo}')`
        let res1 = await executaQry(qry)
        res.json(res1)
      }

    });


    this.expressAppWrapper.get('/buscarmealing/:telefone', async (req, res, next) => {
      let telefone = req.params.telefone
      let qry = `select * from meso_contatos where telefone = '${telefone}'`
      console.log('sou qry mealing', qry)
      let res1 = await executaQry(qry)
      res.json(res1)
    });

    this.expressAppWrapper.get('/permissao/busca-permissao/:id_usuario', async (req, res) => {
      const id_usuario = req.params.id_usuario;
      try {
        const qry = `
          SELECT p.permissao
          FROM meso_usuario_permissao up
          JOIN meso_permissoes p ON up.id_permissao = p.id_permissao
          WHERE up.id_usuario = '${id_usuario}'
        `;
        const resultado = await executaQry(qry);

        if (resultado.dados.length === 0) {
          return res.status(404).json({ erro: "Permissão não encontrada para este usuário." });
        }

        const permissao = resultado.dados[0].permissao;

        res.json({ permissao });
      } catch (e) {
        console.error("Erro ao buscar permissao binária:", e);
        res.status(500).json({ erro: "Erro ao buscar permissões do usuário." });
      }
    });

    this.expressAppWrapper.get(`/adicionaContato/:nome/:telefone/:grupo/:nomeCampanha`, async (req, res, next) => {
      let nome = req.params.nome;
      let telefone = req.params.telefone;
      let grupo = req.params.grupo;
      let campanha = req.params.nomeCampanha
      try {
        let qry = `
              update meso_contatos set nome= '${nome}', id_agencia = '${grupo}', campanha = '${campanha}' where telefone = '${telefone}'
            `;
        console.log(qry)
        let res26 = await executaQry(qry);
        res.json(res26);
      } catch (e) {
        ////console.log(e);
      }
    });


    this.expressAppWrapper.get(`/criaCampanha/:nome/:nomeCampanha/`, async (req, res, next) => {
      let nome = req.params.nome;
      let campanha = req.params.nomeCampanha
      let grupo = req.params.grupo
      try {
        let qry = `
              insert into meso_campanhas(criador,  campanha ) values ('${nome}', '${campanha}')
            `;
        console.log(qry)
        let res26 = await executaQry(qry);
        res.json(res26);
      } catch (e) {
        ////console.log(e);
      }
    });


    this.expressAppWrapper.listen(this.porta, '0.0.0.0', () =>
      console.log('🔥 Servidor rodando na porta ' + this.porta + ' em 0.0.0.0')
    );
  }
}

module.exports = ExpressController;
