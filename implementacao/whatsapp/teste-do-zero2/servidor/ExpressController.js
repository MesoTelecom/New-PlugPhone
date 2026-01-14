const express = require("express");
const router = express.Router();
const { executaQry } = require("../banco/bd");
const { executaQry2 } = require("../banco/db2");
const { geraToken } = require("./jwt/jwt");
const { send, sendImage, sendVideo, sendAudio, sendDocument, sendTemplate, download, test, getImage, getAudio, getDocument, reciveMediaLink, geraMedia, sendGpt, verificaPalavrao, sendAutenticacao } = require('/meso/whatsapp/webhook/methods.js');
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
const crypto = require('crypto');
const { buscarMensagem } = require("../../webhook/SocketConnection");
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
      res.send('Servidor rodando!');
    });

    this.expressAppWrapper.app.use('/whatsapp', proxy('https://meso.plugphone.cloud:3333/'));
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

    this.expressAppWrapper.post('/resetaToken', async (req, res, next) => {
      let usuario = req.body.usuario

      let qry1 = `update meso_usuariologin set token = null, logadoWeb = 0 where usuario = '${usuario}'  `
      let resultado = await executaQry(qry1)

      if (resultado?.dados.affectedRows > 0) {
        console.log('chegou aqui no insert');
        res.json({ success: true, mensagem: 'Token Atualizado Com Sucesso!' });
      } else {
        console.log('não chegou aqui no insert');
        res.json({ success: false, mensagem: 'Não foi possível atualizar o token!' });
      }
    })

    this.expressAppWrapper.post('/resetaTokenMobile', async (req, res, next) => {
      let usuario = req.body.usuario
      let qry1 = `update meso_usuariologin set tokenMobile = null, logadoMobile = 0 where usuario = '${usuario}'  `
      console.log("query aleatória", qry1)
      let resultado = await executaQry(qry1)

      if (resultado?.dados.affectedRows > 0) {
        console.log('chegou aqui no insert');
        res.json({ success: true, mensagem: 'Token Atualizado Com Sucesso!' });
      } else {
        console.log('não chegou aqui no insert');
        res.json({ success: false, mensagem: 'Não foi possível atualizar o token!' });
      }
    })

    this.expressAppWrapper.post('/cadastrarcontato', async (req, res) => {
      const { nome, telefone, setor, email, empresa, idEmpresa } = req.body;

      let existe = await executaQry(`select exists (select 1 from meso_contatos where telefone = '${telefone}' and id_empresa ='${idEmpresa}') as existe;`)

      if (existe.dados[0].existe == 0) {
        const qry = `
    INSERT INTO meso_contatos 
      (nome, telefone, estado, datahora, setor, email, empresa, id_empresa)
    VALUES 
      ('${nome}', '${telefone}', 'Novo', NOW(), '${setor}', '${email}', '${empresa}', '${idEmpresa}')
  `;

        console.log('bumbum profundo', qry);

        let resultado = await executaQry(qry);
        console.log('só pra debug', resultado)
        try {
          if (resultado?.dados.affectedRows > 0) {
            console.log('chegou aqui no insert');
            res.json({ success: true, mensagem: 'Usuário cadastrado com sucesso!' });
          } else {
            console.log('não chegou aqui no insert');
            res.json({ success: false, mensagem: 'Não foi possível cadastrar usuário!' });
          }
        } catch (error) {
          console.error("Erro ao cadastrar contato:", error);
          res.status(500).json({ sucesso: false, mensagem: "Erro ao cadastrar usuário", erro: error.message });
        }
      } else {
        res.json({ success: true, mensagem: 'Este usuário já foi cadastrado' });
        console.log("Esse usuário já foi cadastrado")
      }
    });

    this.expressAppWrapper.post('/editarcontato', async (req, res) => {
      const { id, nome, telefone, setor, email, empresa, idEmpresa } = req.body;

      const qry = `
    UPDATE meso_contatos 
    SET 
      nome = '${nome}', 
      telefone = '${telefone}', 
      setor = '${setor}', 
      email = '${email}', 
      empresa = '${empresa}', 
      id_empresa ='${idEmpresa}',
      datahora = NOW()
    WHERE telefone ='${telefone}'
  `;

      console.log('bumbum profundo', qry);


      let resultado = await executaQry(qry);
      console.log('só pra debug', resultado);

      try {
        if (resultado?.dados.affectedRows > 0) {
          console.log('chegou aqui no update');
          res.json({ success: true, mensagem: 'Usuário atualizado com sucesso!' });
        } else {
          console.log('não chegou aqui no update');
          res.json({ success: false, mensagem: 'Não foi possível atualizar o usuário!r' });
        }
      } catch (error) {
        console.error("Erro ao editar contato:", error);
        res.status(500).json({ sucesso: false, mensagem: "Erro ao editar usuário", erro: error.message });
      }
    });



    // Filtro para arquivos de áudio
    const audioFilter = (req, file, cb) => {
      //console.log('Nome do arquivo recebido:', file.originalname); // Log para verificar o nome do arquivo
      //console.log('MIME type recebido:', file.mimetype);
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

    const uploadDocument = multer({
      storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // Limite de 10MB por arquivo
      fileFilter: documentFilter
    });
    // Middleware de upload para imagens
    const uploadImage = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: imageFilter });

    // Middleware de upload para áudios
    const uploadAudio = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: audioFilter });

    // Rota para upload de imagem
    this.expressAppWrapper.post('/upload-image', uploadImage.single('image'), async (req, res) => {
      if (!req.file) {
        return res.status(400).send('Nenhuma imagem recebida.');
      }
      res.json(`Imagem recebida: ${req.file.filename}`);
    });

    this.expressAppWrapper.post('/upload-image', async (req, res) => {

      //console.log('Requisição recebida na rota /upload'); // Log para verificar se a rota é acessada
      //console.log('Body da requisição:', req.body); // Log do corpo da requisição
      //console.log('Arquivo recebido:', req.file); // Log do arquivo recebido

      if (!req.file) {
        return res.status(400).send('Nenhuma imagem recebida.');
      }
      //console.log('Arquivo salvo com sucesso:', req.file);
      let caminho = req.file.path
      let idImage = await getImage(caminho)
      ////console.log(id)
      res.json({ id: idImage });

    });

    this.expressAppWrapper.get('/lidamsg/:num', async (req, res, next) => {
      let num = req.params.num

      let qry1 = `update meso_contatos set estadomsg = NULL where telefone = '${num}'`
      //console.log(qry1)
      let res1 = await executaQry(qry1)
      //console.log(qry1)

      res.json(res1)
    })

    this.expressAppWrapper.get('/inserircontato/:nome/:telefone/:setor/:usuario', async (req, res, next) => {
      let nome = req.params.nome
      let telefone = req.params.telefone
      let setor = req.params.setor;
      let usuario = req.params.usuario

      let qry = `insert into meso_contatos (nome,telefone,setor,usuario) values ('${nome}','${telefone}','${setor}','${usuario}')`
      await executaQry(qry)
      res.send("Inserido Com Sucesso")
    })



    this.expressAppWrapper.get('/mudamsg/:num', async (req, res, next) => {
      let num = req.params.num

      let qry1 = `update meso_contatos set estadomsg ='novamsg' where telefone = '${num}'`
      let res1 = await executaQry(qry1)
      //console.log(qry1)

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
    });;

    this.expressAppWrapper.get('/pegaIdEmpresa/:telefone', async (req, res, next) => {
      let telefone = req.params.telefone
      let qry = `select id_empresa, wpp_id from meso_empresas where telefone = '${telefone}'`
      console.log('sou qry mealing', qry)
      let res1 = await executaQry(qry)
      res.json(res1)
    })
    this.expressAppWrapper.get('/pegaTelEmpresa/:idEmpresa', async (req, res, next) => {
      let id_empresa = req.params.idEmpresa
      let qry = `select telefone from meso_empresas where id_empresa = '${id_empresa}'`
      console.log('sou qry mealing', qry)
      let res1 = await executaQry(qry)
      res.json(res1)
    })


    this.expressAppWrapper.post('/upload-document', async (req, res) => {
      //////console.log('oi')

      if (!req.file) {
        return res.status(400).send('Nenhum áudio recebido.');
      }

      //////console.log('eu sou o req.file', req.file.path);

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

        //////console.log('ID do áudio:', idocument);
        //////console.log('Caminho final do arquivo:', caminhoFinal);

        res.json({ id: idocument, caminhoFinal: caminhoFinal });
      });

    });


    // Rota para upload de áudio
    this.expressAppWrapper.post('/upload-audio', uploadAudio.single('audio'), async (req, res) => {
      if (!req.file) {
        return res.status(400).send('Nenhum áudio recebido.');
      }
      let caminho = req.file.path
      console.log(caminho)
      let idaudio = await getAudio(caminho)
      console.log(id)
      res.json({ id: idaudio });
    });


    this.expressAppWrapper.post('/upload-audio', async (req, res) => {
      //console.log('entrei aqui');

      if (!req.file) {
        return res.status(400).send('Nenhum áudio recebido.');
      }

      console.log('eu sou o req.file', req.file.path);

      let caminho = req.file.path;
      let idaudio = await getAudio(caminho);  // Esse é o ID que você quer usar para renomear
      const ext = path.extname(caminho);      // Pega a extensão do arquivo, por exemplo, .mp3 ou .wav
      const novoCaminho = path.join(path.dirname(caminho), idaudio + ext);  // Novo nome do arquivo com o idaudio

      // Renomeia o arquivo
      fs.rename(caminho, novoCaminho, (err) => {
        if (err) {
          console.error('Erro ao renomear o arquivo:', err);
          return res.status(500).send('Erro ao processar o arquivo.');
        }

        // Divide o caminho para retornar apenas a parte final, se necessário
        const parts = novoCaminho.split('/');
        const caminhoFinal = parts.slice(5).join('/');  // Adapte isso para seu cenário

        //console.log('ID do áudio:', idaudio);
        //console.log('Caminho final do arquivo:', caminhoFinal);

        res.json({ id: idaudio, caminhoFinal: caminhoFinal });
      });
    });






    this.expressAppWrapper.post('/idimagem', async (req, res) => {

      let nome = req.body.nome

      ////console.log('Nome certo', nome)
      res.json('certo', nome);

    });


    // Middleware para tratamento de erros
    this.expressAppWrapper.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).send('Algo deu errado!');
    });

    this.expressAppWrapper.get("/pegaURL/:id", async (req, res, next) => {
      let id = req.params.id;


      ////console.log(qry);
      let res2 = await reciveMediaLink(id, res)
      res.json(res2);
      //console.log("Jesus Cristo eu estou aqui")
      ////console.log(res2);

    });

    this.expressAppWrapper.get("/transferirchamado/:setor/:telefone/:usuario", async (req, res, next) => {
      let setor = req.params.setor;
      let telefone = req.params.telefone;
      let usuario = req.params.usuario
      let qry = `UPDATE meso_contatos SET atendimento_ai = 0, setor = '${setor}', usuario = ${usuario === 'undefined' ? 'NULL' : `'${usuario}'`} WHERE telefone = '${telefone}'`;
      console.log("transferindo contato", qry)

      let qry22 = `update meso_atendimentos set status= 'Transferido', setor_atual ='${setor}', agenteTransferido = ${usuario === 'undefined' ? 'NULL' : `'${usuario}'`} where telefone ='${telefone}' and status <> 'Concluído';`
      console.log('c', qry22)
      let res3 = await executaQry(qry22)
      console.log(res3)

      let resultado = await executaQry(qry);
      if (resultado?.dados?.affectedRows > 0) {
        res.json({
          sucesso: true,
          mensagem: "Contato transferido com sucesso.",
          insertId: resultado.dados.insertId,
        });
      } else {
        res.status(400).json({
          sucesso: false,
          mensagem: "Não foi possível transferir o contato.",
        });
      }
    })

    this.expressAppWrapper.get('/buscarAtendimentos/:telefone/:idEmpresa', async (req, res, next) => {
      try {
        let telefone = req.params.telefone;
        let id_empresa = req.params.idEmpresa




        let qry = `
      SELECT 
       *
      FROM meso_atendimentos
      WHERE telefone LIKE ${telefone} and id_empresa='${id_empresa}'
      ORDER BY data_inicio DESC;
    `;

        let result = await executaQry(qry);
        res.json(result);

      } catch (err) {
        console.error('Erro ao buscar atendimentos por telefone:', err);
        res.status(500).json({ error: err.message });
      }
    });


    this.expressAppWrapper.post("/geraImage/", async (req, res, next) => {
      let url = req.body.url;
      let id = req.body.id

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
        //console.log("Content-Encoding:", response.headers['content-encoding']);

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
          //console.log('Mídia salva com sucesso:', uploadPath);
          res.status(200).send({ message: 'Mídia salva com sucesso!', path: uploadPath });
        });

        writer.on('error', (err) => {
          console.error("Erro ao salvar a mídia:", err.message);
          res.status(500).send("Erro ao salvar a mídia.");
        });

      } catch (error) {
        console.error("Erro ao baixar a mídia:", error.response ? error.response.data : error.message);
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

        //console.log("Content-Encoding:", response.headers['content-encoding']);

        let stream = response.data;
        const contentEncoding = response.headers['content-encoding'];

        // Somente descomprime se o encoding for "br" ou "gzip"
        if (contentEncoding && contentEncoding.includes('br')) {
          //console.log("Descompressão Brotli");
          stream = stream.pipe(zlib.createBrotliDecompress());
        } else if (contentEncoding && contentEncoding.includes('gzip')) {
          //console.log("Descompressão Gzip");
          stream = stream.pipe(zlib.createGunzip());
        }

        const uploadPath = path.join(__dirname, 'uploads', `${id}.mp3`);
        const writer = fs.createWriteStream(uploadPath);

        stream.pipe(writer);

        writer.on('finish', () => {
          //console.log('Mídia salva com sucesso:', uploadPath);
          res.status(200).send({ message: 'Mídia salva com sucesso!', path: uploadPath });
        });

        writer.on('error', (err) => {
          console.error("Erro ao salvar a mídia:", err.message);
          res.status(500).send("Erro ao salvar a mídia.");
        });

      } catch (error) {
        console.error("Erro ao baixar a mídia:", error.response ? error.response.data : error.message);
        res.status(500).send("Erro ao baixar a mídia.");
      }
    });



    this.expressAppWrapper.post("/geraDocument", async (req, res, next) => {
      let url = req.body.url;
      let id = req.body.id;
      let extensao = req.body.extensao
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

        const uploadPath = path.join(__dirname, 'uploads', `${id}.${extensao}`);
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


    //Pesquisa de satisfação

    this.expressAppWrapper.get("/pesquisa/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}' `;
      ////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      ////console.log(res1);

    });

    this.expressAppWrapper.get("/atualizausuario/:usuario/:telefone", async (req, res, next) => {
      let qry

      let usuario = req.params.usuario
      let telefone = req.params.telefone

      //console.log("Olha que bonito", usuario, telefone)

      qry = `update meso_contatos set usuario = '${usuario}', atendimento_ai = 0 where telefone = '${telefone}'`

      console.log('contato', qry)
      let res20 = await executaQry(qry)

      let qry22 = `UPDATE meso_atendimentos
SET 
  status = 'Em Andamento',
  agenteTransferido = CASE 
    WHEN status = 'Transferido' THEN '${usuario}' 
    ELSE agenteTransferido 
  END,
  agente = CASE 
    WHEN agente IS NULL OR agente = '' THEN '${usuario}' 
    ELSE agente 
  END
WHERE telefone = '${telefone}'
  AND status <> 'Concluído' AND status <> 'Transferido';
;
`
      console.log('grau de relevância', qry22)
      let res3 = await executaQry(qry22)
      let qry33 = `update meso_atendimentos set agenteTransferido = '${usuario}' where status ='Transferido'`
      console.log('grau de relevância', qry33)
      let res4 = await executaQry(qry33)
      console.log(res4)
      res.json(res20)
      ////console.log('contatos resposta', res20)

    })

    this.expressAppWrapper.get("/verificamensagem/:telefone/", async (req, res, next) => {
      let qry

      let telefone = req.params.telefone

      qry = `select telefone, setor, usuario, id_empresa from meso_contatos where telefone = '${telefone}'`

      //console.log('contato', qry)
      let res20 = await executaQry(qry)
      res.json(res20)
      ////console.log('contatos resposta', res20)

    })

    this.expressAppWrapper.get("/buscarcontatostel/:telefone", async (req, res, next) => {
      let telefone = req.params.telefone
      let qry = `select * from meso_contatos where telefone = '${telefone}'`
      let res20 = await executaQry(qry)
      //console.log("pesadão fala lobin", res20.dados[0])
      res.json(res20.dados[0])
    })

    this.expressAppWrapper.get("/buscarcontatos/:tipo/:usuario", async (req, res, next) => {
      let qry

      let tipo = req.params.tipo
      let usuario = req.params.usuario

      if (tipo == 'admin') {
        qry = `select * from meso_contatos order by datahora desc`
      } else if (tipo == 'Técnico Externo') {
        qry = `select * from meso_contatos where eAris = 'sim';`
      } else {
        qry = `select * from meso_contatos where usuario = '${usuario}' or usuario is NULL and setor = '${tipo}' order by datahora desc`
      }

      let res20 = await executaQry(qry)
      res.json(res20)

    })


    this.expressAppWrapper.get("/buscarcontatos2/:tipo/:usuario/:estado", async (req, res, next) => {
      let qry

      let tipo = req.params.tipo
      let usuario = req.params.usuario
      let estado = req.params.estado



      if (tipo === 'admin') {
        // Admin com filtro de estado
        if (estado === 'Todos') {
          qry = `SELECT * FROM meso_contatos order by datahora DESC`
        } else {
          qry = `SELECT * FROM meso_contatos WHERE estado = '${estado}'  order by datahora DESC`
        }
      } else {
        // Usuário comum
        if (estado === 'Todos') {
          qry = `
            SELECT * FROM meso_contatos
            WHERE (usuario = '${usuario}' OR usuario IS NULL)
            AND setor = '${tipo}'
            ORDER BY datahora DESC`;
        } else {
          qry = `
            SELECT * FROM meso_contatos
            WHERE (usuario = '${usuario}' OR usuario IS NULL)
            AND setor = '${tipo}'
            AND estado = '${estado}'
            ORDER BY datahora DESC`;
        }
      }
      console.log('oq retornou aqui no contato', qry)
      ////console.log('contatos resposta', res20)

      let res20 = await executaQry(qry)
      res.json(res20)

    })

    this.expressAppWrapper.get("/buscarcontatos3/:tipo/:usuario/:estado/:filtro", async (req, res, next) => {
      let qry

      let tipo = req.params.tipo
      let usuario = req.params.usuario
      let estado = req.params.estado
      let filtro = req.params.filtro

      console.log("Olha meu filtro no buscar contato", filtro)

      if (tipo === 'admin') {
        // Admin com filtro de estado
        if (estado === 'Todos') {
          qry = `SELECT * FROM meso_contatos ${filtro != 'null' ? `where nome like '%${filtro}%' or telefone like '%${filtro}%' or email like '%${filtro}%' ORDER BY datahora DESC` : "ORDER BY datahora DESC"}`;
        } else {
          qry = `SELECT * FROM meso_contatos WHERE estado = '${estado}' ${filtro != 'null' ? `AND (nome LIKE '%${filtro}%' OR telefone LIKE '%${filtro}%' OR email LIKE '%${filtro}%')` : "ORDER BY datahora DESC"}`;
        }
      } else {
        // Usuário comum
        if (estado === 'Todos') {
          qry = `
              SELECT * FROM meso_contatos
              WHERE (usuario like '%${usuario}%' OR usuario IS NULL)
              AND setor = '${tipo}'
              ${filtro != 'null'
              ? `AND (nome LIKE '%${filtro}%' OR telefone LIKE '%${filtro}%' OR email LIKE '%${filtro}%')`
              : "ORDER BY datahora DESC"}`;
        } else {
          qry = `
              SELECT * FROM meso_contatos
              WHERE (usuario like '%${usuario}%' OR usuario IS NULL)
              AND setor = '${tipo}'
              AND estado = '${estado}'
              ${filtro != 'null'
              ? `AND (nome LIKE '%${filtro}%' OR telefone LIKE '%${filtro}%' OR email LIKE '%${filtro}%')`
              : "ORDER BY datahora DESC"}`;
        }

      }
      console.log('oq retornou aqui no contato', qry)
      ////console.log('contatos resposta', res20)

      let res20 = await executaQry(qry)
      res.json(res20)

    })


    this.expressAppWrapper.get("/buscarcontatos4/:tipo/:usuario/:estado/:filtro/:offset", async (req, res, next) => {
      let qry

      let tipo = req.params.tipo
      let usuario = req.params.usuario
      let estado = req.params.estado
      let filtro = req.params.filtro
      let offset = req.params.offset

      console.log('OFFSET RAPAAAA', offset)
      if (offset == 'undefined') {
        offset = 0
        console.log(offset)
      }

      console.log("Olha meu filtro no buscar contato", filtro)

      if (tipo === 'admin') {
        // Admin com filtro de estado
        if (estado === 'Todos') {
          qry = `SELECT * FROM meso_contatos ${filtro != 'null' ? `where nome like '%${filtro}%' or telefone like '%${filtro}%' or email like '%${filtro}%' ORDER BY datahora DESC` : "ORDER BY datahora DESC"}  LIMIT 100 OFFSET ${offset}`;
        } else {
          qry = `SELECT * FROM meso_contatos WHERE estado = '${estado}' ${filtro != 'null' ? `AND (nome LIKE '%${filtro}%' OR telefone LIKE '%${filtro}%' OR email LIKE '%${filtro}%')` : "ORDER BY datahora DESC"}  LIMIT 100 OFFSET ${offset}`;
        }
      } else {
        // Usuário comum
        if (estado === 'Todos') {
          qry = `
              SELECT * FROM meso_contatos
              WHERE (usuario like '%${usuario}%' OR usuario IS NULL)
              AND setor = '${tipo}'
              ${filtro != 'null'
              ? `AND (nome LIKE '%${filtro}%' OR telefone LIKE '%${filtro}%' OR email LIKE '%${filtro}%')`
              : "ORDER BY datahora DESC"}  LIMIT 100 OFFSET ${offset}`;
        } else {
          qry = `
              SELECT * FROM meso_contatos
              WHERE (usuario like '%${usuario}%' OR usuario IS NULL)
              AND setor = '${tipo}'
              AND estado = '${estado}'
              ${filtro != 'null'
              ? `AND (nome LIKE '%${filtro}%' OR telefone LIKE '%${filtro}%' OR email LIKE '%${filtro}%')`
              : "ORDER BY datahora DESC"}  LIMIT 100 OFFSET ${offset}`;
        }

      }
      console.log('oq retornou aqui no contato', qry)
      ////console.log('contatos resposta', res20)

      let res20 = await executaQry(qry)
      res.json(res20)

    })

    this.expressAppWrapper.get("/buscarcontatos5/:tipo/:usuario/:estado/:filtro/:offset/:idEmpresa", async (req, res, next) => {
      let qry

      let tipo = req.params.tipo
      let usuario = req.params.usuario
      let estado = req.params.estado
      let filtro = req.params.filtro
      let offset = req.params.offset
      let id_empresa = req.params.idEmpresa

      console.log('OFFSET RAPAAAA', offset)
      if (offset == 'undefined') {
        offset = 0
        console.log(offset)
      }

      console.log("Olha meu filtro no buscar contato", filtro)

      if (tipo === 'admin') {
        // Admin com filtro de estado
        if (estado === 'Todos') {
          qry = `
    SELECT * FROM meso_contatos
    WHERE id_empresa = '${id_empresa}'
    ${filtro != 'null' ? `AND (nome LIKE '%${filtro}%' OR telefone LIKE '%${filtro}%' OR email LIKE '%${filtro}%')` : ''}
    ORDER BY datahora DESC
    LIMIT 100 OFFSET ${offset}
  `;
        } else {
          qry = `
    SELECT * FROM meso_contatos
    WHERE estado = '${estado}'
      AND id_empresa = '${id_empresa}'
      ${filtro != 'null' ? `AND (nome LIKE '%${filtro}%' OR telefone LIKE '%${filtro}%' OR email LIKE '%${filtro}%')` : ''}
    ORDER BY datahora DESC
    LIMIT 100 OFFSET ${offset}
  `;
        }

      } else {
        // Usuário comum
        if (estado === 'Todos') {
          qry = `
      SELECT * FROM meso_contatos
      WHERE (usuario LIKE '%${usuario}%' OR usuario IS NULL)
        AND setor = '${tipo}'
        ${filtro != 'null'
              ? `AND (nome LIKE '%${filtro}%' OR telefone LIKE '%${filtro}%' OR email LIKE '%${filtro}%')`
              : ''}
      ORDER BY datahora DESC
      LIMIT 100 OFFSET ${offset}
    `;
        } else {
          qry = `
      SELECT * FROM meso_contatos
      WHERE (usuario LIKE '%${usuario}%' OR usuario IS NULL)
        AND setor = '${tipo}'
        AND estado = '${estado}'
        ${filtro != 'null'
              ? `AND (nome LIKE '%${filtro}%' OR telefone LIKE '%${filtro}%' OR email LIKE '%${filtro}%')`
              : ''}
      ORDER BY datahora DESC
      LIMIT 100 OFFSET ${offset}
    `;
        }
      }

      console.log('oq retornou aqui no contato', qry)
      ////console.log('contatos resposta', res20)

      let res20 = await executaQry(qry)
      res.json(res20)

    })


    this.expressAppWrapper.get("/buscarcontatos5/:tipo/:usuario/:estado/:filtro/:offset", async (req, res, next) => {
      let qry

      let tipo = req.params.tipo
      let usuario = req.params.usuario
      let estado = req.params.estado
      let filtro = req.params.filtro
      let offset = req.params.offset

      let idEmpresaArray = await executaQry(`select id_empresa from meso_usuariologin where usuario = '${usuario}'`)

      console.log('eu sou o idEmpresa', idEmpresaArray)

      let idEmpresa = idEmpresaArray.dados[0].id_empresa
      console.log('OFFSET RAPAAAA', offset)
      if (offset == 'undefined') {
        offset = 0
        console.log(offset)
      }

      console.log("Olha meu filtro no buscar contato", filtro)

      if (tipo === 'admin') {
        // Admin com filtro de estado
        if (estado === 'Todos') {
          qry = `SELECT * FROM meso_contatos ${filtro != 'null' ? `where id_empresa= '${idEmpresa}' and nome like '%${filtro}%' or telefone like '%${filtro}%' or email like '%${filtro}%' ORDER BY datahora DESC` : ` where id_empresa= '${idEmpresa}' ORDER BY datahora DESC`}  LIMIT 100 OFFSET ${offset}`;
        } else {
          qry = `SELECT * FROM meso_contatos WHERE estado = '${estado}' and id_empresa= '${idEmpresa}' ${filtro != 'null' ? `AND   (nome LIKE '%${filtro}%' OR telefone LIKE '%${filtro}%' OR email LIKE '%${filtro}%')` : "ORDER BY datahora DESC"}  LIMIT 100 OFFSET ${offset}`;
        }
      } else {
        // Usuário comum
        if (estado === 'Todos') {
          qry = `
              SELECT * FROM meso_contatos
              WHERE  id_empresa= '${idEmpresa}' and (usuario like '%${usuario}%' OR usuario IS NULL)
              AND setor = '${tipo}'
              ${filtro != 'null'
              ? `AND (nome LIKE '%${filtro}%' OR telefone LIKE '%${filtro}%' OR email LIKE '%${filtro}%')`
              : "ORDER BY datahora DESC"}  LIMIT 100 OFFSET ${offset}`;
        } else {
          qry = `
              SELECT * FROM meso_contatos
              WHERE  id_empresa= '${idEmpresa}' and (usuario like '%${usuario}%' OR usuario IS NULL)
              AND setor = '${tipo}'
              AND estado = '${estado}'
              ${filtro != 'null'
              ? `AND (nome LIKE '%${filtro}%' OR telefone LIKE '%${filtro}%' OR email LIKE '%${filtro}%')`
              : "ORDER BY datahora DESC"}  LIMIT 100 OFFSET ${offset}`;
        }

      }
      console.log('oq retornou aqui no contato', qry)
      ////console.log('contatos resposta', res20)

      let res20 = await executaQry(qry)
      res.json(res20)

    })



    this.expressAppWrapper.get("/buscarcontatos1/:tipo/:usuario/:estado", async (req, res, next) => {
      let qry

      let tipo = req.params.tipo
      let usuario = req.params.usuario
      let estado = req.params.estado
      if (tipo === 'admin') {
        if (estado === 'Todos') {
          qry = `
      SELECT 
        c.*,
        IFNULL(m.ultima_data, c.datahora) AS datahora
      FROM meso_contatos c
      LEFT JOIN (
        SELECT telefone, mensagem, MAX(datetime) AS ultima_data
        FROM meso_mensagens_solicitante
        GROUP BY telefone, mensagem
      ) m
        ON m.telefone = c.telefone
       AND m.mensagem = c.ultimamsg
      ORDER BY datahora DESC
    `;
        } else {
          qry = `
      SELECT 
        c.*,
        IFNULL(m.ultima_data, c.datahora) AS datahora
      FROM meso_contatos c
      LEFT JOIN (
        SELECT telefone, mensagem, MAX(datetime) AS ultima_data
        FROM meso_mensagens_solicitante
        GROUP BY telefone, mensagem
      ) m
        ON m.telefone = c.telefone
       AND m.mensagem = c.ultimamsg
      WHERE c.estado = '${estado}'
      ORDER BY datahora DESC
    `;
        }
      } else {
        if (estado === 'Todos') {
          qry = `
      SELECT 
        c.*,
        IFNULL(m.ultima_data, c.datahora) AS datahora
      FROM meso_contatos c
      LEFT JOIN (
        SELECT telefone, mensagem, MAX(datetime) AS ultima_data
        FROM meso_mensagens_solicitante
        GROUP BY telefone, mensagem
      ) m
        ON m.telefone = c.telefone
       AND m.mensagem = c.ultimamsg
      WHERE (c.usuario = '${usuario}' OR c.usuario IS NULL)
        AND c.setor = '${tipo}'
      ORDER BY datahora DESC
    `;
        } else {
          qry = `
      SELECT 
        c.*,
        IFNULL(m.ultima_data, c.datahora) AS datahora
      FROM meso_contatos c
      LEFT JOIN (
        SELECT telefone, mensagem, MAX(datetime) AS ultima_data
        FROM meso_mensagens_solicitante
        GROUP BY telefone, mensagem
      ) m
        ON m.telefone = c.telefone
       AND m.mensagem = c.ultimamsg
      WHERE (c.usuario = '${usuario}' OR c.usuario IS NULL)
        AND c.setor = '${tipo}'
        AND c.estado = '${estado}'
      ORDER BY datahora DESC
    `;
        }
      }

      //console.log('contato', qry)
      ////console.log('contatos resposta', res20)

      let res20 = await executaQry(qry)
      res.json(res20)

    })

    this.expressAppWrapper.get("/buscarcontatos6/:tipo/:usuario/:estado/:filtro/:offset", async (req, res, next) => {
      let { tipo, usuario, estado, filtro, offset } = req.params;

      if (!offset || offset === 'undefined') offset = 0;

      // Busca id da empresa do usuário
      let idEmpresaArray = await executaQry(`SELECT id_empresa FROM meso_usuariologin WHERE usuario = '${usuario}'`);
      let idEmpresa = idEmpresaArray.dados[0].id_empresa;

      let where = [`id_empresa = '${idEmpresa}'`];

      // Usuário comum => filtra apenas dele
      if (tipo !== "admin" && tipo !== "Técnico") {
        where.push(`(usuario LIKE '%${usuario}%' OR usuario IS NULL)`);
        where.push(`setor = '${tipo}'`);
      }

      // Técnico => vê tudo do setor técnico
      if (tipo === "Técnico") {
        where.push(`setor = 'Técnico'`);
      }

      // Admin => vê tudo da empresa, sem filtro extra
      // (não precisa adicionar nada)

      // Filtro de estado
      if (estado !== "Todos") {
        where.push(`estado = '${estado}'`);
      }

      // Filtro de texto
      if (filtro !== "null") {
        where.push(`(nome LIKE '%${filtro}%' OR telefone LIKE '%${filtro}%' OR email LIKE '%${filtro}%')`);
      }

      // Query final
      let qry = `
    SELECT * FROM meso_contatos
    ${where.length ? "WHERE " + where.join(" AND ") : ""}
    ORDER BY datahora DESC
    LIMIT 100 OFFSET ${offset}
  `;

      console.log("QUERY FINAL:", qry);

      let resultado = await executaQry(qry);
      return res.json(resultado);
    });

    this.expressAppWrapper.get("/buscarcontatomealing/:usuario/:tipo/", async (req, res, next) => {
      let qry
      let usuario = req.params.usuario
      let tipo = req.params.tipo

      if (tipo === 'Analista') {
        qry = `select distinct credor as nome, Telefone, processo from meso_mealing where idAgente = (select id from meso_usuariologin where usuario = '${usuario}')`
      } else if (tipo === 'Especialista') {
        qry = `select distinct m.credor as nome, m.Telefone, m.processo, m.estado from meso_mealing as m inner join meso_oportunidade as o on (m.idMealing = o.idMealing) where o.estado = 'aprovado';`
      }

      ////console.log('contato', qry)
      let res20 = await executaQry(qry)
      res.json(res20)
      ////console.log('contatos resposta', res20)

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

      ////console.log('contato', qry)
      let res20 = await executaQry(qry)
      res.json(res20)
      ////console.log('contatos resposta', res20)

    })

    this.expressAppWrapper.get("/mediapesquisa/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select avg(nota) as medianota from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}' AND gostaria like '%SIM%' `;
      ////console.log(qry);
      let res2 = await executaQry(qry);
      res.json(res2);
      ////console.log(res2);

    });


    this.expressAppWrapper.post("/som-notificacao", async (req, res, next) => {
      let som = req.body.som;
      let usuario = req.body.usuario;

      let qry = `update meso_usuariologin set somNotificacaoMobile = "${som}" where usuario like '%${usuario}%'`;
      console.log("Mostrar tem som");
      let res13 = await executaQry(qry);
      res.json(res13);
    });




    //teste MedPesq1---------------------------------------------------------------------------------------------------------------------------------------------------
    this.expressAppWrapper.get("/mediapesquisa1/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select sum(pergunta1 + pergunta2) as medianota from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}'`;
      ////console.log(qry);
      let res2 = await executaQry(qry);
      res.json(res2);
      ////console.log(res2);

    });

    this.expressAppWrapper.post("/reciveMsg", async (req, res, next) => {

      let telefone = req.body.telefone
      let telFormatado = telefone
      let id_empresa = req.body.idEmpresa


      let qry55 = `select telefone from meso_empresas where id_empresa = '${id_empresa}'`
      console.log('me ensinou a beber', qry55)
      let wpp = await executaQry(qry55)
      let wpnumber = wpp.dados[0].telefone


      if (telefone.length == 13) {
      }

      let qry = ` select * from meso_mensagens_solicitante where telefone like "${telFormatado}" and wpnumber = '${wpnumber}'`;

      console.log('qry: chama papai', qry)
      let res3 = await executaQry(qry);
      res.json(res3);
      //console.log(res3);

    });

    this.expressAppWrapper.get("/mediapesquisaconta/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(pergunta1)as contapesq from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}'`;
      ////console.log(qry);
      let res2 = await executaQry(qry);
      res.json(res2);
      ////console.log(res2);

    });

    this.expressAppWrapper.get("/listaanalista", async (req, res, next) => {
      let qry = `select * from meso_usuariologin where tipo = 'Analista'`;

      let res27 = await executaQry(qry);

      ////console.log('socaminha', res27)
      res.json(res27);

    });

    this.expressAppWrapper.get("/listaespecialista", async (req, res, next) => {
      let qry = `select * from meso_usuariologin where tipo = 'Especialista'`;

      let res27 = await executaQry(qry);

      ////console.log('socaminha', res27)
      res.json(res27);

    });

    //Campanha fila

    //Segunda bolinha do painel de filas - Chamadas em fila//
    this.expressAppWrapper.get("/listajoin/:fila", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let qry = `select * from meso_join_rt where fila = '${filacompleta}'`;
      ////console.log(qry);

      let res30 = await executaQry(qry);
      res.json(res30);
      ////console.log(res30);

    });
    //Primeira bolinha do painel das filas

    this.expressAppWrapper.get("/listajointotal/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_entrar where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      ////console.log(qry);

      let res31 = await executaQry(qry);
      res.json(res31);
      ////console.log(res31);

    });

    //Terceira bolinha de chamadas conectadas na fila, isto é, aquelas chamadas que estão em curso

    this.expressAppWrapper.get("/filaconectada/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;

      let qry = `select * from meso_call_connected_rt where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'`;
      ////console.log(qry);

      ////console.log(qry)

      let res32 = await executaQry(qry);
      res.json(res32);
      ////console.log(res32);

    });
    //Quarta bolinha de chamadas da fila - Abandonadas do dia

    this.expressAppWrapper.get("/filasabandonadas/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_abandon where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      ////console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      ////console.log(res33);

    });
    //Sexta bolinha tma

    this.expressAppWrapper.get("/tmafilas/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'


      let qry = `select avg(talktime) as mediaANNA from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      ////console.log(qry);

      let res99 = await executaQry(qry);
      res.json(res99);
      ////console.log(res99);

    });



    this.expressAppWrapper.get("/mediatmasainte/:ramal/:d1/:d2", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select time_format(sec_to_time(avg(billsec)), '%H:%i:%s') as mediaTma from cdr where calldate >= '${data1}' and calldate <= '${data2}' and cnum = '${ramal}' and disposition = 'ANSWERED' and lastapp = 'Dial'`;
      console.log(qry)

      let res1 = await executaQry(qry);
      res.json(res1)
      ////console.log(res1);
    })

    //Setima bolinha TME Atendidas

    this.expressAppWrapper.get("/tmefilas/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select avg(holdtime) as mediaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      ////console.log(qry);

      let res35 = await executaQry(qry);
      res.json(res35);
      ////console.log(res35);

    });

    this.expressAppWrapper.get("/tmesainte/:d1/:d2/:ramal", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sum(duration - billsec) as duracao, count(*) as contduracao from cdr where calldate > '${data1}' and calldate < '${data2}' where cnum = '${ramal}'`;
      ////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      ////console.log(res1);
    })

    //Oitava bolinha TME do abandono

    this.expressAppWrapper.get("/tmefilasabandonadas/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select avg(holdtime) as mediaesperaabandonada from meso_abandon where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      ////console.log(qry);

      let res35 = await executaQry(qry);
      res.json(res35);
      ////console.log(res35);

    });

    this.expressAppWrapper.get("tmeabandonadassainte/:ramal/:d1/:d2", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sum(duration - billsec) as duracao, count(*) as contduracao from cdr where calldate > '${data1}' and calldate < '${data2}' where cnum = '${ramal}'`;
      ////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      ////console.log(res1);
    });
    //Fim da campanha fila
    //Listar filas

    this.expressAppWrapper.get("/listafilastotais", async (req, res, next) => {

      let qry = `select extension, descr from queues_config `;
      ////console.log(qry);

      let res38 = await executaQry2(qry);
      res.json(res38);
      ////console.log(res38);

    });

    //FIM de Listar filas
    //Listar ramais
    this.expressAppWrapper.get("/listaramais", async (req, res, next) => {

      let qry = `select extension, name from users `;
      ////console.log(qry);

      let res38 = await executaQry2(qry);
      res.json(res38);
      ////console.log(res38);

    });
    //FIM listar ramais
    this.expressAppWrapper.get("/realramal", async (req, res, next) => {
      // let filacompleta = req.params.fila;
      //let data1 = req.params.d1 + ' 00:00:00'
      //let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select * from meso_operadores_rt`;
      ////console.log(qry);

      let res36 = await executaQry(qry);
      res.json(res36);
      ////console.log(res36);

    });

    this.expressAppWrapper.get("/detalhesligacoes/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select distinct * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid and table1.datahora > '${data1}' and table1.datahora < '${data2};' `;
      ////console.log(qry);

      ////console.log(qry)
      let res20 = await executaQry(qry);
      res.json(res20);
      ////console.log(res20);


    });

    //Listar operadores
    this.expressAppWrapper.get("/listaoperadores", async (req, res, next) => {

      let qry = `select * from meso_operadores `;
      ////console.log(qry);
      /*select *  from meso_logado msl
      left join meso_operadores mso on msl.pin = mso.pin
      where mso.id is not null
      */

      let res4 = await executaQry(qry);
      res.json(res4);
      ////console.log(res4);

    });
    //Ligações de entrada
    this.expressAppWrapper.get("/recebidafila/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select * from meso_entrar where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'; `

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      ////console.log(qry);

      let res20 = await executaQry(qry);
      res.json(res20);
      ////console.log(res20);

    });

    this.expressAppWrapper.get("/buscar-usuario-tipo/:tipo", async (req, res, next) => {
      let tipo = req.params.tipo
      let qry = `select usuario from meso_usuariologin where tipo = '${tipo}'`
      let res20 = await executaQry(qry);
      let res21 = [];
      for (let x = 0; x < res20.dados.length; x++) {
        res21.push(res20.dados[x].usuario);
      }

      res.json(res21)

      // //console.log("neve cobre o chão",qry)
      //console.log("res20 dados", res21)
    })

    this.expressAppWrapper.get("/buscar-usuario/:nome", async (req, res, next) => {
      let nome = req.params.nome
      let nomeSemPlug;

      if (nome.includes('-PlugPhone')) {
        nomeSemPlug = nome.replace('-PlugPhone', '');
        console.log("Caiu aquii será?")
      } else {
        nomeSemPlug = nome
      }

      let res20 = await executaQry(`select usuario, id, senha,tipo from meso_usuariologin where usuario like '%${nomeSemPlug}%'`);
      console.log(`oi tô aqui`, res20.dados[0]);

      if (res20.dados[0]) {
        res.json(res20.dados[0])
      } else {
        res.json("Usuário não encontrado")
      }

      // //console.log("neve cobre o chão",qry)
      //console.log("res20 dados", res21)
    })

    this.expressAppWrapper.get("/recebidasucesso/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select * from meso_agent_complete where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'; `

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      ////console.log(qry);

      let res20 = await executaQry(qry);
      res.json(res20);
      ////console.log(res20);

    });

    this.expressAppWrapper.get("/recebidaabandon/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select * from meso_abandon where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'; `

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      ////console.log(qry);

      let res20 = await executaQry(qry);
      res.json(res20);
      ////console.log(res20);

    });
    this.expressAppWrapper.get("/recebidajoin/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select * from meso_entrar where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'; `

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      ////console.log(qry);

      let res20 = await executaQry(qry);
      res.json(res20);
      ////console.log(res20);

    });
    this.expressAppWrapper.get("/recebidaespera/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select sec_to_time(sum(meso_abandon.holdtime))as espera from meso_abandon  where meso_abandon.fila= '${filacompleta}' and meso_abandon.datahora > '${data1}' and meso_abandon.datahora < '${data2}';`

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      ////console.log(qry);
      ////console.log(qry)
      let res20 = await executaQry(qry);
      res.json(res20);
      ////console.log(res20);

    });
    this.expressAppWrapper.get("/recebidaesperaatende/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select sec_to_time(sum(meso_agent_complete.holdtime))as esperaAtende from meso_agent_complete  where meso_agent_complete.fila= '${filacompleta}' and meso_agent_complete.datahora > '${data1}' and meso_agent_complete.datahora < '${data2}';`

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      ////console.log(qry);
      let res20 = await executaQry(qry);
      res.json(res20);
      ////console.log(res20);

    });
    //FIM DE ligações de entrada

    //FLUXO DE LIGAÇÃO POR HORA
    this.expressAppWrapper.get("/dashpizza/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select *, DataHora as datahora from meso_entrar where datahora > '${data1}' and datahora < '${data2}'`;
      // //console.log(qry);


      let res24 = await executaQry(qry);
      res.json(res24);
      ////console.log(res24);

    });

    //FIM DO FLUXO DE CHAMADA

    //PAUSA
    this.expressAppWrapper.get("/pausa/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1
      let data2 = req.params.d2

      // let data2 = req.params.d2 + ' 23:59:59'

      let qry = ` select *, timediff(meso_pausa_fila.despausado, meso_pausa_fila.datahora) as duracao from meso_pausa_fila, logs where meso_pausa_fila.despausado != '0000-00-00 00:00:00' and  meso_pausa_fila.datahora = logs.datahora or logs.datahora = meso_pausa_fila.datahora -1 and logs.datahora = meso_pausa_fila.datahora and meso_pausa_fila.datahora > '${data1}'  and meso_pausa_fila.datahora < '${data2}';
      `;
      ////console.log(qry);

      let res17 = await executaQry(qry);
      res.json(res17);
      ////console.log(res17);

    });

    //DASHBOARD

    this.expressAppWrapper.get("/filaabandono/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_abandon where datahora > '${data1}' and datahora < '${data2}' `;
      ////console.log(qry);

      let res25 = await executaQry(qry);
      res.json(res25);
      ////console.log(res25);

    });

    //Circulo do painel principal Em Ligação cor Azul [como fazer o calculo?]
    //Na verdade o que eu fiz foi atendidas e não realtime do em ligação.... ;(
    this.expressAppWrapper.get("/dashligacao/:id_empresa", async (req, res, next) => {
      let id_empresa = req.params.id_empresa
      let qry = `select status from meso_atendimentos where status = 'Em Andamento' and id_empresa = '${id_empresa}' `;
      //console.log('sérginho groisma', qry);


      let res5 = await executaQry(qry);
      res.json(res5);
      ////console.log(res5);

    });



    //Circulo do painel principal Logados cor Verde

    this.expressAppWrapper.get("/dashlogados/:id_empresa", async (req, res, next) => {
      let id_empresa = req.params.id_empresa
      let qry = `select estado from meso_usuariologin where estado = 'logado' and id_empresa ='${id_empresa}'`;
      ////console.log(qry);


      let res2 = await executaQry(qry);
      res.json(res2);
      ////console.log(res2);

    });

    //Circulo do painel principal Pausados cor Amarela

    this.expressAppWrapper.get("/dashpausados/:id_empresa", async (req, res, next) => {
      let id_empresa = req.params.id_empresa

      let qry = `select * from meso_usuariologin where estado = 'pausado' and id_empresa ='${id_empresa}'`;
      ////console.log(qry);

      let res3 = await executaQry(qry);
      res.json(res3);
      ////console.log(res3);

    });

    this.expressAppWrapper.get("/dashdeslogados/:id_empresa", async (req, res, next) => {
      let id_empresa = req.params.id_empresa
      let qry = `select * from meso_usuariologin where estado = 'deslogado' and id_empresa ='${id_empresa}'`;
      ////console.log(qry);
      /*select *  from meso_logado msl
      left join meso_operadores mso on msl.pin = mso.pin
      where mso.id is not null
      */

      let res4 = await executaQry(qry);
      res.json(res4);
      ////console.log(res4);

    });

    this.expressAppWrapper.get("/esperaMsg/:id_empresa", async (req, res, next) => {
      let id_empresa = req.params.id_empresa
      let qry = `select estado from meso_usuariologin where estado = 'logado' and id_empresa ='${id_empresa}'`;
      ////console.log(qry);


      let res2 = await executaQry(qry);
      res.json(res2);
      ////console.log(res2);

    });



    this.expressAppWrapper.get("/totalMsg/:id_empresa/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1
      let data2 = req.params.d2
      let id_empresa = req.params.id_empresa
      let qry = `select * from meso_mensagens_solicitante where id_empresa = '${id_empresa}' and datetime between '${data1}' and '${data2}' `;
      console.log('TotalMsg', qry);

      let res30 = await executaQry(qry);
      res.json(res30);
      ////console.log(res30);

    });

    this.expressAppWrapper.get("/msgAndamento/:id_empresa/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let id_empresa = req.params.id_empresa
      let qry = `select * from meso_atendimentos where id_empresa = '${id_empresa}' and data_inicio <= '${data1}' and data_inicio >= '${data2}' `;
      console.log('2 players', qry);

      let res30 = await executaQry(qry);
      res.json(res30);
      ////console.log(res30);

    });

    this.expressAppWrapper.get("/aguardandoAtendimento/:id_empresa/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let id_empresa = req.params.id_empresa
      let qry = `select * from meso_contatos where  estado = 'Aguardando Atendimento' and id_empresa = '${id_empresa}'`;
      console.log('2 players', qry);

      let res30 = await executaQry(qry);
      res.json(res30);
      ////console.log(res30);

    });

    this.expressAppWrapper.get("/concluidoAtendimento/:id_empresa/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let id_empresa = req.params.id_empresa
      let qry = `select * from meso_contatos where  estado = 'Concluído' and id_empresa = '${id_empresa}'`;
      console.log('4 players', qry);

      let res30 = await executaQry(qry);
      res.json(res30);
      ////console.log(res30);

    });

    this.expressAppWrapper.get('/tmrGeral/:d1/:d2/:telefone', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00";
      let data2 = req.params.d2 + " 23:59:59";
      let telefone = req.params.telefone;

      let qry = `
    SELECT 
        AVG(
            TIME_TO_SEC(
                TIMEDIFF(r.resposta_datetime, r.cliente_datetime)
            )
        ) / 60 AS tmr_min
    FROM (
        SELECT 
            c.id AS cliente_id,
            c.datetime AS cliente_datetime,
            MIN(a.datetime) AS resposta_datetime
        FROM meso_mensagens_solicitante c
        LEFT JOIN meso_mensagens_solicitante a
            ON a.telefone = c.telefone
            AND a.datetime > c.datetime
            AND a.wpnumber = ${telefone}
            AND a.datetime BETWEEN '${data1}' AND '${data2}'
        WHERE 
            c.agent IS NULL
            AND c.wpnumber = ${telefone}
            AND c.datetime BETWEEN '${data1}' AND '${data2}'
        GROUP BY c.id, c.datetime
    ) r
    WHERE r.resposta_datetime IS NOT NULL;
  `;

      let resultado = await executaQry(qry);
      res.json(resultado);
    });


    this.expressAppWrapper.get("/fluxohora/:d1", async (req, res, next) => {
      let data1 = req.params.d1

      let qry = `select * from meso_fluxo_ligacao where datahora = '${data1}' `;
      ////console.log(qry);

      let res23 = await executaQry(qry);
      res.json(res23);
      ////console.log(res23);

    });


    this.expressAppWrapper.get("/estoque/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1
      let data2 = req.params.d2
      let qry = `select * from meso_estoque where diaatual >= '${data1}' and diaatual <= '${data2}' `;
      ////console.log(qry);

      let res32 = await executaQry(qry);
      res.json(res32);
      ////console.log(res32);

    });

    this.expressAppWrapper.get("/gravacao/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select src, dst, duration, recordingfile from cdr where calldate > '${data1}' and calldate < '${data2}' `;
      ////console.log(qry);

      let res199 = await executaQry(qry);
      res.json(res199);
      ////console.log(res199);

    });


    //novo fluxo para finalizar o testeligahora

    this.expressAppWrapper.get("/fluxoteste/:d1", async (req, res, next) => {


      let data1 = req.params.d1

      let qry = `select * from meso_entrar where datahora like '${data1}%'  order by 'datahora';`;
      // //console.log('teste qualquer coisa', qry);

      ////console.log('aaaaaaaaaaaaaaaaaaaaaaa', qry)
      let res6 = await executaQry(qry);
      res.json(res6);
      ////console.log(res6);

    });

    this.expressAppWrapper.post("/loginconfere", async (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Request-Width, Content-Type, Accept");
      let usuario = req.body.login;
      let senha = req.body.senha;
      console.log('me mostre o usuario e senha', usuario, senha);
      try {
        let qry = `
              select * from meso_usuariologin where
              senha= MD5('${senha}') and 
              usuario= '${usuario}'
            `;
        console.log('aqui esta o qry', qry);

        let res1 = await executaQry(qry);
        console.log('log:', res1)
        if (res1.dados.length > 0) {
          const token = geraToken(res1.dados[0].usuario)
          const tipo = res1.dados[0].tipo
          const usuario2 = res1.dados[0].id
          const idPermissao = res1.dados[0].id_permissao
          const ramal = res1.dados[0].ramal

          console.log('CAIDO', { token, tipo, usuario2, idPermissao, ramal })
          res.json({ token, tipo, usuario2, idPermissao, ramal });
          console.log('pega token', token, tipo);
        } else {
          //console.log('Usuario ou senha incorretos.');
          res.status(401).json({ erro: "Usuario ou senha incorretos." });
        }
      } catch (e) {
        //console.log(e);
      }
    });
    //Login-------------------------------------------------------------------------------------


    this.expressAppWrapper.post("/loginconfere2", async (req, res) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Headers", "Origin, X-Request-Width, Content-Type, Accept");

      const usuario = req.body.login;
      const senha = req.body.senha;
      const codigo = req.body.codigo;

      console.log('🔔 /loginconfere ->', { usuario, codigoProvided: !!codigo });

      try {
        // 1) Verifica usuário e senha (interpolado - conforme tu pediu)
        const qryLogin = `
      SELECT *
      FROM meso_usuariologin
      WHERE usuario = '${usuario}'
        AND senha = MD5('${senha}')
      LIMIT 1;
    `;
        const resLogin = await executaQry(qryLogin);
        if (!resLogin.dados || resLogin.dados.length === 0) {
          console.log('❌ Usuário/senha inválidos');
          return res.status(401).json({ erro: "Usuario ou senha incorretos." });
        }
        const user = resLogin.dados[0];

        // 2) Exige que o código seja enviado
        if (!codigo) {
          return res.status(400).json({ erro: "Código 2FA obrigatório." });
        }

        // 3) Verifica código 2FA — só aceita se código corresponder, não usado e não expirado
        const qryCodigoValido = `
      SELECT id_dois_fatores, telefone, codigo, criado_em, expira_em, usado
      FROM meso_dois_fatores
      WHERE id_usuario = ${user.id}
        AND codigo = '${codigo}'
        AND usado = 0
        AND expira_em > NOW()
      ORDER BY criado_em DESC
      LIMIT 1;
    `;
        const resCodigoValido = await executaQry(qryCodigoValido);

        if (!resCodigoValido.dados || resCodigoValido.dados.length === 0) {
          // Diferencia pra mensagens mais informativas (opcional)
          // Busca o último registro do usuário pra saber por que falhou
          const qryUltimo = `
        SELECT id_dois_fatores, codigo, criado_em, expira_em, usado
        FROM meso_dois_fatores
        WHERE id_usuario = ${user.id}
        ORDER BY criado_em DESC
        LIMIT 1;
      `;
          const resUltimo = await executaQry(qryUltimo);

          if (!resUltimo.dados || resUltimo.dados.length === 0) {
            return res.status(400).json({ erro: "Nenhum código cadastrado. Gere um novo código 2FA." });
          }

          const rec = resUltimo.dados[0];
          if (rec.usado == 1) return res.status(400).json({ erro: "Código já usado. Gere um novo." });
          if (new Date(rec.expira_em) <= new Date()) return res.status(400).json({ erro: "Código expirado. Gere um novo." });

          // Se chegou aqui, provavelmente o código digitado está incorreto
          return res.status(400).json({ erro: "Código inválido." });
        }

        // 4) Marca o código como usado (prevenir replay)
        const idDois = resCodigoValido.dados[0].id_dois_fatores;
        const qryMarcaUsado = `
      UPDATE meso_dois_fatores
      SET usado = 1
      WHERE id_dois_fatores = ${idDois};
    `;
        await executaQry(qryMarcaUsado);

        // 5) Gera token e retorna dados do login (só após código válido)
        const token = geraToken(user.usuario); // tua função existente
        const tipo = user.tipo;
        const usuario2 = user.id;
        const idPermissao = user.id_permissao;
        const ramal = user.ramal;
        const telefone = user.telefone;
        const id_empresa = user.id_empresa

        console.log('✅ Login 2FA ok', { usuario2, telefone });
        return res.json({ token, tipo, usuario2, idPermissao, ramal, telefone, id_empresa });

      } catch (e) {
        console.error('Erro em /loginconfere:', e);
        return res.status(500).json({ erro: 'Erro interno' });
      }
    });




    this.expressAppWrapper.app.post('/enviar-audio', upload.single('audio'), (req, res) => {
      const audioFile = req.file;
      if (!audioFile) {
        return res.status(400).send('Nenhum arquivo de áudio recebido');
      }

      const filePath = audioFile.path;
      //console.log(`Áudio recebido: ${filePath}`);

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
    let lerCsv = async function (fileName) {
      const filePath = path.join(__dirname, 'documentos', fileName);
      const results = [];

      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => {
            resolve(results);
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    };


    let terminou = false;

    //    const upload = uploadArquivo();
    let inserirCsv = async (resultadoCsv, usuario) => {
      for (const e of resultadoCsv) {
        // Primeira query para inserir em meso_mealing
        ////console.log(e.Telefone)
        let qry = `INSERT INTO meso_mealing VALUES (0, '${e.Ano}', '${e.Orgao}', '${e.Processo}', '${e.Liquidacao}', '${e.Valorface}', '${e.Credor}', '${e.Documento}', '${e.Idade}', '${e.Renda}', '${e.Tipo}', '${e.Telefone}', (SELECT id FROM meso_usuariologin WHERE usuario = '${usuario}'), NOW())`;

        ////console.log('eu sou inserir csv', qry);
        await executaQry(qry);

        // Adicionando um delay de 1 segundo

        // Segunda query para inserir em meso_oportunidade
        /*let qry1 = `INSERT INTO meso_oportunidade (telefone, idAgente, idMealing) 
                    VALUES ('${e.Telefone}', 
                    (SELECT id FROM meso_usuariologin WHERE usuario = '${usuario}'), 
                    (SELECT idMealing FROM meso_mealing WHERE processo = '${e.Processo}' ORDER BY idMealing DESC LIMIT 1))`;
        
        await executaQry(qry1);*/
      }
    }



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
      ////console.log('casca de bala', qry3)
      let idPlataforma = await executaQry(qry3);
      ////console.log('chupeta de baleia', idPlataforma.dados[0])

      let qry4 = `select idMealing from meso_oportunidade where idMealing = ${ids.dados[0].idMealing}`
      let isCadastrado = await executaQry(qry4)
      ////console.log('estou cadastrado?', isCadastrado.dados.length)

      if (isCadastrado.dados.length == 0) {
        let qry = `insert into meso_oportunidade (idMealing, idAnalista, idPlataforma,dataInicio,estado) values (${ids.dados[0].idMealing}, ${ids.dados[0].idAgente}, ${idPlataforma.dados[0].idPlatarforma},now(),'em andamento') `
        let res29 = await executaQry(qry);
        ////console.log('sou qry', qry)
        res.json(res29);
      }
    })

    this.expressAppWrapper.get('/oportunidadeespecialista/:processo/:plataforma/:usuario', async (req, res, next) => {
      let processo = req.params.processo
      let plataforma = req.params.plataforma
      let usuario = req.params.usuario
      let ids

      let qry1 = `select o.idMealing,o.idOportunidade from meso_mealing as m inner join meso_oportunidade as o on (m.idMealing = o.idMealing) where m.processo = '${processo}'`
      ////console.log('cadelo', qry1)
      ids = await executaQry(qry1)
      ////console.log('Xoxota aqui', ids)

      let qry3 = `select idPlatarforma from meso_plataforma where platarforma = '${plataforma}' order by idPlatarforma limit 1`
      let idPlataforma = await executaQry(qry3);
      ////console.log('chupeta de baleia', idPlataforma.dados[0])

      let qry5 = `select idMealing from meso_finaliza where idMealing = ${ids.dados[0].idMealing}`
      let isCadastrado = await executaQry(qry5)
      ////console.log('estou cadastrado?', isCadastrado.dados.length)

      if (isCadastrado.dados.length == 0) {
        let qry = `insert into meso_finaliza (idMealing,idOportunidade,idPlataforma,idEspecialista,observacao,estado,dataInicio) values (${ids.dados[0].idMealing}, ${ids.dados[0].idOportunidade},${idPlataforma.dados[0].idPlatarforma},(select id from meso_usuariologin where usuario = '${usuario}'),(select observacao from meso_oportunidade where idMealing = ${ids.dados[0].idMealing}),'em atendimento especialista',now())`
        let res29 = await executaQry(qry);
        ////console.log('sou qry', qry)
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

    this.expressAppWrapper.get('/atendimentogeral/:d1/:d2', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00"
      ////console.log('chapisco')
      let data2 = req.params.d2 + " 23:59:59"
      let qry1 = `select u.usuario,count(o.idPlataforma) as quantPlataforma,sum(case when o.atendeu = 1 then 1 else 0 end) as atendeu,p.platarforma from meso_oportunidade as o inner join meso_usuariologin as u on (o.idAnalista = u.id) inner join meso_plataforma as p on (o.idPlataforma = p.idPlatarforma) where idPlataforma IN (1, 2) and  o.dataInicio >= '${data1}' and o.dataInicio <= '${data2}' group by u.usuario, p.platarforma;`
      let res1 = await executaQry(qry1)
      ////console.log(qry1)

      res.json(res1)
    })

    this.expressAppWrapper.get('/atendimentogeralespecialista/:d1/:d2', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00"
      ////console.log('chapisco')
      let data2 = req.params.d2 + " 23:59:59"
      let qry1 = `select u.usuario,count(f.idPlataforma) as quantPlataforma,sum(case when f.estado = 'aprovado' then 1 else 0 end) as atendeu,p.platarforma from meso_finaliza as f inner join meso_usuariologin as u on (f.idEspecialista = u.id) inner join meso_plataforma as p on (f.idPlataforma = p.idPlatarforma) where idPlataforma IN (1, 2) and  f.dataInicio >= '${data1}' and f.dataInicio <= '${data2}' group by u.usuario, p.platarforma;`
      let res1 = await executaQry(qry1)
      ////console.log(qry1)

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

      ////console.log('qry1', qry1)
      ////console.log('qry2', qry2)

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

      ////console.log(tudo1)
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

      ////console.log('qry1', qry1)
      ////console.log('qry2', qry2)

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

      ////console.log(tudo1)
    })

    this.expressAppWrapper.get('/detalhezap/:d1/:d2/:idEmpresa', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00"
      let data2 = req.params.d2 + " 23:59:59"
      let id_empresa = req.params.idEmpresa
      let qry = `select * from meso_atendimentos where data_inicio >= '${data1}' and data_inicio <= '${data2}' and id_empresa = '${id_empresa}'`
      ////console.log(qry)
      let res1 = await executaQry(qry)
      res.json(res1)
      ////console.log(res1)
    })


    this.expressAppWrapper.get('/TotalTempResp/:d1/:d2/:usuario/:telefone', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00";
      let data2 = req.params.d2 + " 23:59:59";
      let usuario = req.params.usuario;
      let telefone = req.params.telefone;

      let qry = `
        SELECT 
            SUM(TIME_TO_SEC(TIMEDIFF(r.resposta_datetime, r.cliente_datetime))) / 60 
            AS TempResp
        FROM (
            SELECT 
                c.id AS cliente_id,
                c.datetime AS cliente_datetime,
                MIN(a.datetime) AS resposta_datetime
            FROM meso_mensagens_solicitante c
            LEFT JOIN meso_mensagens_solicitante a
                ON a.telefone = c.telefone
                AND a.datetime > c.datetime
                AND a.agent = '${usuario}'
                AND a.wpnumber = ${telefone}
                AND a.datetime BETWEEN '${data1}' AND '${data2}'
            WHERE 
                c.agent IS NULL
                AND c.wpnumber = ${telefone}
                AND c.datetime BETWEEN '${data1}' AND '${data2}'
            GROUP BY c.id, c.datetime
        ) r
        WHERE r.resposta_datetime IS NOT NULL;
    `;

      let resultado = await executaQry(qry);
      res.json(resultado);
    });


    this.expressAppWrapper.get('/tmr/:d1/:d2/:usuario/:telefone', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00";
      let data2 = req.params.d2 + " 23:59:59";
      let usuario = req.params.usuario;
      let telefone = req.params.telefone;

      let qry = `
        SELECT 
    AVG(
        TIME_TO_SEC(
            TIMEDIFF(r.resposta_datetime, r.cliente_datetime)
        )
    ) / 60 AS tmr_min
FROM (
    SELECT 
        c.id AS cliente_id,
        c.datetime AS cliente_datetime,
        MIN(a.datetime) AS resposta_datetime
    FROM meso_mensagens_solicitante c
    LEFT JOIN meso_mensagens_solicitante a
        ON a.telefone = c.telefone
        AND a.datetime > c.datetime
        AND a.agent = '${usuario}'
        AND a.wpnumber = ${telefone}
        AND a.datetime BETWEEN '${data1}' AND '${data2}'
    WHERE 
        c.agent IS NULL
        AND c.wpnumber = ${telefone}
        AND c.datetime BETWEEN '${data1}' AND '${data2}'
    GROUP BY c.id, c.datetime
) r
WHERE r.resposta_datetime IS NOT NULL;

    `;

      let resultado = await executaQry(qry);
      res.json(resultado);
    });



    this.expressAppWrapper.get('/tmrMinimo/:d1/:d2/:usuario/:telefone', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00";
      let data2 = req.params.d2 + " 23:59:59";
      let usuario = req.params.usuario;
      let telefone = req.params.telefone;

      let qry = `
    SELECT 
        MIN(
            TIME_TO_SEC(
                TIMEDIFF(r.resposta_datetime, r.cliente_datetime)
            )
        ) / 60.0 AS min_tempo_resposta_min
    FROM (
        SELECT 
            c.id AS cliente_id,
            c.datetime AS cliente_datetime,
            MIN(a.datetime) AS resposta_datetime
        FROM meso_mensagens_solicitante c
        LEFT JOIN meso_mensagens_solicitante a
            ON a.telefone = c.telefone
            AND a.datetime > c.datetime
            AND a.agent = '${usuario}'
            AND a.wpnumber = '${telefone}'
            AND a.datetime BETWEEN '${data1}' AND '${data2}'
        WHERE 
            c.agent IS NULL
            AND c.wpnumber = '${telefone}'
            AND c.datetime BETWEEN '${data1}' AND '${data2}'
        GROUP BY c.id, c.datetime
    ) r
    WHERE r.resposta_datetime IS NOT NULL;
  `;

      let resultado = await executaQry(qry);
      res.json(resultado);
    });

    this.expressAppWrapper.get('/tmrMaximo/:d1/:d2/:usuario/:telefone', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00";
      let data2 = req.params.d2 + " 23:59:59";
      let usuario = req.params.usuario;
      let telefone = req.params.telefone;

      let qry = `
    SELECT 
        MAX(
            TIME_TO_SEC(
                TIMEDIFF(r.resposta_datetime, r.cliente_datetime)
            )
        ) / 60.0 AS max_min
    FROM (
        SELECT 
            c.id AS cliente_id,
            c.datetime AS cliente_datetime,
            MIN(a.datetime) AS resposta_datetime
        FROM meso_mensagens_solicitante c
        LEFT JOIN meso_mensagens_solicitante a
            ON a.telefone = c.telefone
            AND a.datetime > c.datetime
            AND a.agent = '${usuario}'
            AND a.wpnumber = '${telefone}'
            AND a.datetime BETWEEN '${data1}' AND '${data2}'
        WHERE 
            c.agent IS NULL
            AND c.wpnumber = '${telefone}'
            AND c.datetime BETWEEN '${data1}' AND '${data2}'
        GROUP BY c.id, c.datetime
    ) r
    WHERE r.resposta_datetime IS NOT NULL;
  `;

      let resultado = await executaQry(qry);
      res.json(resultado);
    });

    this.expressAppWrapper.get('/detalhezapespecialista/:d1/:d2', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00"
      let data2 = req.params.d2 + " 23:59:59"
      let qry = `select u.usuario, m.credor,m.processo,f.estado,date_format(f.dataInicio,'%d-%m-%Y %H:%i:%S') as dataInicio,date_format(f.dataFim,'%d-%m-%Y %H:%i:%S') as dataFim,p.Platarforma from meso_usuariologin as u inner join meso_finaliza as f on (u.id = f.idEspecialista) inner join meso_mealing as m on (m.idMealing = f.idMealing)  inner join meso_plataforma as p on (p.idPlatarforma = f.idPlataforma) where f.dataInicio >= '${data1}' and f.dataFim <= '${data2}'`
      ////console.log(qry)
      let res1 = await executaQry(qry)
      res.json(res1)
      ////console.log(res1)
    })

    this.expressAppWrapper.get('/buscarcsv', async (req, res, next) => {
      if (terminou) {
        let qry = `select * from meso_mealing`
        ////console.log(qry)
        let res1 = await executaQry(qry)
        res.json(res1)
        ////console.log('to aqui')
        terminou = false;
      }
    })

    //fim de login--------------------------------------------------------------------------

    //TMA ----------------------------------------------------------------------------------
    this.expressAppWrapper.get("/tma/:d1/:d2/:fila/:ramal", async (req, res, next) => {
      let fila = req.params.fila;
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'


      let qry = `select * from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${fila}'  and membername like '%${ramal}%'`;
      ////console.log(qry);

      let res99 = await executaQry(qry);
      res.json(res99);
      ////console.log(res99);

    });



    this.expressAppWrapper.get("/nomeramal/:fila/:ramal", async (req, res, next) => {
      let fila = req.params.fila;
      let ramal = req.params.ramal;



      let qry = `select distinct membername as usuario from meso_agent_complete where fila = '${fila}'  and membername like '%${ramal}%'`;
      ////console.log(qry);

      let res99 = await executaQry(qry);
      res.json(res99);
      ////console.log(res99);

    });

    this.expressAppWrapper.get("/nomeramalsainte/:ramal", async (req, res, next) => {
      let ramal = req.params.ramal;
      let qry = `select distinct cnam as usuario from cdr where cnum = '${ramal}'`;
      ////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      ////console.log(res1);

    });

    this.expressAppWrapper.get("/ramaltma/:fila/:ramal", async (req, res, next) => {
      let fila = req.params.fila;
      let ramal = req.params.ramal;



      let qry = `select distinct membername as ramal from meso_agent_complete where fila = '${fila}'  and membername like '%${ramal}%'`;
      ////console.log(qry);

      let res99 = await executaQry(qry);
      res.json(res99);
      ////console.log(res99);

    });

    this.expressAppWrapper.get("/ramaltmasainte/:ramal", async (req, res, next) => {
      let ramal = req.params.ramal;
      let qry = `select distinct cnum as ramal from cdr where cnum = '${ramal}'`
      ////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      ////console.log(res1);
    })


    this.expressAppWrapper.get("/listacontatos", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      try {
        let qry = `
        select * from meso_contatos
        `;
        let res27 = await executaQry(qry);
        res.json(res27);
      } catch (e) {
        ////////console.log(e);
      }
    });

    this.expressAppWrapper.get("/contatotira/:id", async (req, res, next) => {
      let id = req.params.id;
      ////////console.log(id)
      try {
        let qry = `
              delete from meso_contatos where id = ${id}
            `;
        let res28 = await executaQry(qry);
        res.json(res28);
      } catch (e) {
        ////////console.log(e);
      }
    });

    this.expressAppWrapper.post("/contatoaltera", async (req, res, next) => {
      //console.log(req.body)
      let mostra = req.body;
      let { id, nome, telefone, campanha, id_agencia } = mostra;
      ////console.log(id,  senha, tipo);

      try {
        let qry = `
              update meso_contatos set nome = '${nome}', telefone='${telefone}' where id = ${id}
            `;
        let res14 = await executaQry(qry);
        res.json(res14);
      } catch (e) {
        res.json({ message: e.message })
      }
    });



    this.expressAppWrapper.get("/mediatma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `SELECT 
  AVG(duracao) AS mediatma
FROM meso_detalhe
WHERE estado = 'atendida'
  AND fila = '${filacompleta}'
  AND teleatendente = '${ramal}'
  AND datahora BETWEEN '${data1}' AND '${data2}';
`;
      console.log(qry);

      let res39 = await executaQry(qry);
      res.json(res39);
      ////console.log(res39);

    });

    this.expressAppWrapper.get("/mediatmazap/:d1/:d2/:usuario/:idEmpresa", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00';
      let data2 = req.params.d2 + ' 23:59:59';
      let usuario = req.params.usuario;
      let id_empresa = req.params.idEmpresa

      let qry = `
        SELECT AVG(TIME_TO_SEC(TIMEDIFF(data_fim, data_inicio))) AS tma_segundos
        FROM meso_atendimentos
        WHERE agente = '${usuario}'
        AND data_inicio >= '${data1}'
        AND data_inicio <= '${data2}'
        AND id_empresa = '${id_empresa}'
    `;

      console.log(qry);

      let resultado = await executaQry(qry);
      res.json(resultado);
    });

    this.expressAppWrapper.get("/quantMsg/:d1/:d2/:usuario/:telefone", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00';
      let data2 = req.params.d2 + ' 23:59:59';
      let usuario = req.params.usuario;
      let telefone = req.params.telefone

      let qry = `
SELECT COUNT(*) AS quantMsg
FROM meso_mensagens_solicitante
WHERE datetime BETWEEN '${data1}' AND '${data2}'
  AND agent = '${usuario}' and wpnumber = '${telefone}';
    `;

      console.log(qry);

      let resultado = await executaQry(qry);
      res.json(resultado);
    });

    this.expressAppWrapper.get("/tempoMsg/:d1/:d2/:usuario/:idEmpresa", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00';
      let data2 = req.params.d2 + ' 23:59:59';
      let usuario = req.params.usuario;
      let id_empresa = req.params.idEmpresa

      let qry = `
SELECT SEC_TO_TIME(
         SUM(
           TIME_TO_SEC(TIMEDIFF(data_fim, data_inicio))
         )
       ) AS tempoMsg
FROM meso_atendimentos
WHERE data_inicio BETWEEN '${data1}' AND '${data2}'
  AND agente = '${usuario}'
  AND data_fim IS NOT NULL and id_empresa='${id_empresa}';

    `;



      console.log(qry);

      let resultado = await executaQry(qry);
      res.json(resultado);
    });

    this.expressAppWrapper.get("/maxZap/:d1/:d2/:usuario/:idEmpresa", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00';
      let data2 = req.params.d2 + ' 23:59:59';
      let usuario = req.params.usuario;
      let id_empresa = req.params.idEmpresa
      let qry = `
SELECT MAX(TIMEDIFF(data_fim, data_inicio)) AS MaxAtendimentos
FROM meso_atendimentos
WHERE data_inicio BETWEEN '${data1}' AND '${data2}'
  AND agente = '${usuario}' and data_fim is not null and id_empresa = '${id_empresa}';
    `;



      console.log(qry);

      let resultado = await executaQry(qry);
      res.json(resultado);
    });

    this.expressAppWrapper.get("/totalchamadastma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `SELECT COUNT(*) AS total
FROM meso_agent_complete
WHERE datahora BETWEEN '${data1}' AND '${data2}'
  AND fila = '${filacompleta}'
  AND membername = '${ramal}'
  AND reason IN ('caller', 'agent');
`;
      ////console.log(qry);

      let res40 = await executaQry(qry);
      res.json(res40);
      ////console.log(res40);

    });

    this.expressAppWrapper.get("/totalchamadastmasainte/:d1/:d2/:ramal", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d1 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select * from cdr where calldate >= '${data1}' and calldate <= '${data2}' and cnum = '${ramal}' and disposition = 'ANSWERED' and lastapp = 'Dial'`;
      ////console.log('xereco', qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      //console.log(res1)
    })

    this.expressAppWrapper.get("/cdr/:d1/:d2/", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d1 + ' 23:59:59'
      let qry = `SELECT
  *,
  CASE
    WHEN dcontext IN ('from-internal', 'outbound', 'macro-dialout-trunk')
         OR dstchannel LIKE 'SIP/meso_%'
         OR dst NOT REGEXP '^[0-9]{3}$'  -- não é ramal
      THEN 'Sainte'
    WHEN dcontext IN ('ext-queues', 'from-trunk', 'from-pstn')
         OR channel LIKE 'SIP/%-trunk%'
         OR dst REGEXP '^[0-9]{3}$'      -- é ramal
      THEN 'Entrante'
    ELSE 'Indefinido'
  END AS tipo_chamada
FROM cdr
WHERE calldate >= '${data1}' AND calldate <= '${data2}';
`;
      console.log('ja to de voltakkkkkkkkkkk', qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      //console.log(res1)
    })

    this.expressAppWrapper.get("/totalduracaotma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select sum(talktime) as duracaototal from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'
      and membername like '%${ramal}%' `;
      ////console.log(qry);

      let res41 = await executaQry(qry);
      res.json(res41);
      ////console.log(res41);

    });

    this.expressAppWrapper.get("/totalduracaotmasainte/:d1/:d2/:ramal", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select sum(billsec) as duracaototal from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`
      ////console.log(qry)

      let res1 = await executaQry(qry)
      res.json(res1)
      ////console.log(res1)
    })

    this.expressAppWrapper.get("/maximaduracaotma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `SELECT MAX(talktime) AS duracaomaxima
FROM meso_agent_complete
WHERE datahora BETWEEN '${data1}' AND '${data2}'
  AND fila = '${filacompleta}'
  AND membername = '${ramal}'
  AND talktime > 0;
`;
      ////console.log(qry);

      let res42 = await executaQry(qry);
      res.json(res42);
      ////console.log(res42);

    });

    this.expressAppWrapper.get("/maximaduracaotmasainte/:d1/:d2/:ramal", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select max(billsec) as duracaomaxima from cdr where calldate  > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      ////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      ////console.log(res1)
    })
    //Iinicio conexões---------------------------------------------------------------------------------
    this.expressAppWrapper.get("/listnum/:agent", async (req, res, next) => {

      let agent = req.params.agent
      let qry = `select extension from users where name = '${agent}'`;
      ////console.log(qry);

      let res38 = await executaQry2(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/primeiracon/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select min(datahora) as mindata from meso_login_fila where membername= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      ////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });


    this.expressAppWrapper.get("/verificaramal/:ramal", async (req, res, next) => {

      let ramal = req.params.ramal
      let qry = `select count(extension) as ramal from users where extension = '${ramal}' `;
      //console.log(qry);

      let res38 = await executaQry2(qry);
      res.json(res38);
      //console.log(res38);

    });

    this.expressAppWrapper.get("/primeiraconsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select min(datahora) as mindata from meso_login_fila where membername= '${ramal}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      ////console.log('#ReginaldoCompraUmArCondicionadoParaGente', qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/ultimacon/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select max(datahora) as maxdata from meso_login_fila where membername= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      ////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });



    this.expressAppWrapper.get("/ultimaconsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select max(datahora) as maxdata from meso_login_fila where membername= '${ramal}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      ////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/numcount/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select count(evento) as numcon from meso_login_fila where membername= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      ////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/numchamada/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select count(evento) as ligacoes from meso_agent_connect where connectedlinenum = '${ramal}' and uniqueid = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      ////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/numcall/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select count(evento) as acalled from meso_agent_called where connectedlinenum = '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      ////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/durpausa/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select distinct SEC_TO_TIME(sum(time_to_sec(TIMEDIFF(despausado, dataPausa)))) as durpause from meso_pausa_fila where membername = '${ramal}' and dataPausa >= '${data1}' and dataPausa <= '${data2};
      '
      `;
      console.log('caderno', qry);




      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/talktime/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let fila = req.params.fila
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select distinct SEC_TO_TIME(sum(talktime)) as talktime from meso_agent_complete where membername like '%${ramal}%' or calleridnum= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2};
      '
      `;
      console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/talktimesainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let data1 = req.params.d1
      let data2 = req.params.d2
      let qry = `select sec_to_time(sum(time_to_sec(timediff(terminoligacao,inicioligacao)))) as talktime from meso_detalhe_sainte where solicitante = '${ramal}' `
      ////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/duracon/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let fila = req.params.fila
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select sec_to_time(SUM(time_to_sec(TIMEDIFF(desloga, datahora)))) as durcon from meso_login_fila where membername = '${ramal}' and fila ='${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      ////console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });



    this.expressAppWrapper.get("/duracomsainte/:ramal/:d1/:d2", async (req, res, next) => {
      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sec_to_time(SUM(time_to_sec(TIMEDIFF(desloga, datahora)))) as durcon from meso_login_fila where membername = '${ramal}' and datahora > '${data1}' and datahora < '${data2}'`;
      ////console.log('wof wof wof, só as cachorras', qry)

      let res1 = await executaQry(qry);
      res.json(res1);
      ////console.log(res1)
    })

    this.expressAppWrapper.get("/numpausa/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select count(evento) as pausas from meso_pausa_fila where membername = '${ramal}' and fila = '${fila}' and dataPausa >= '${data1}' and dataPausa <= '${data2}'
      `;
      ////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

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
      ////console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/duraconsecsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select SUM(time_to_sec(TIMEDIFF(desloga, datahora))) as durconsec from meso_login_fila where membername = '${ramal}'  and datahora > '${data1}' and datahora < '${data2}'
      `;
      ////console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/verificadur/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let fila = req.params.fila
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select SUM(TIMEDIFF(desloga, datahora)) as verificadur from meso_login_fila where membername = '${ramal}' and fila ='${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      ////console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/verificadursainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select SUM(TIMEDIFF(desloga, datahora)) as verificadur from meso_login_fila where membername = '${ramal}' and datahora > '${data1}' and datahora < '${data2}'`;
      ////console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/talktimesec/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let fila = req.params.fila
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select distinct sum(talktime) as talktimesec from meso_agent_complete where membername = '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2};
      '
      `;
      ////console.log(qry);
      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/talktimesecsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select sum(time_to_sec(timediff(terminoligacao,inicioligacao))) as talktimesec from meso_detalhe_sainte where solicitante = '${ramal}' and datahora > '${data1}' and datahora < '${data2}'`;
      ////console.log('salve', qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/ultimologoff/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select MAX(datahora) as maxlogoff from meso_desloga_fila where membername= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      ////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/ultimologoffsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select MAX(datahora) as maxlogoff from meso_desloga_fila where membername= '${ramal}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      ////console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      ////console.log(res38);

    });

    //Fim service----------------------------------------------------------------------------------------------------------------------------------------------
    //Inicio tme-----------------------------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.get("/somaespera/:fila/:d1/:d2", async (req, res, next) => {
      const filacompleta = req.params.fila;
      const data1 = req.params.d1 + " 00:00:00";
      const data2 = req.params.d2 + " 23:59:59";

      const qry = `
    SELECT 
      SUM(holdtime) AS somaespera
    FROM (
      SELECT 
        uniqueid,
        MAX(holdtime) AS holdtime
      FROM meso_detalhe
      WHERE datahora BETWEEN '${data1}' AND '${data2}'
        AND fila = '${filacompleta}'
        AND holdtime IS NOT NULL
      GROUP BY uniqueid
    ) t
  `;

      const resultado = await executaQry(qry);
      res.json(resultado);
    });


    this.expressAppWrapper.get("/somasainte/:ramal/:d1/:d2/", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sum(duration - billsec) as somasainte from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      ////console.log('eu sou a melodia', qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      ////console.log(res1);
    })

    this.expressAppWrapper.get("/mediaespera/:fila/:d1/:d2/", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select avg(holdtime) as mediaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
      ////console.log(qry);

      let res44 = await executaQry(qry);
      res.json(res44);
      ////console.log(res44);

    });

    this.expressAppWrapper.get("/mediaesperasainte/:ramal/:d1/:d2/", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sum(duration - billsec) as duracao, count(*) as contduracao from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      ////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      ////console.log(res1);
    })

    this.expressAppWrapper.get("/minimoespera/:fila/:d1/:d2/", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select min(holdtime) as minimaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
      ////console.log(qry);

      let res45 = await executaQry(qry);
      res.json(res45);
      ////console.log(res45);

    });

    this.expressAppWrapper.get("/minimoesperasainte/:ramal/:d1/:d2/", async (req, res, netx) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select min(billsec) as minimaesperasainte from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      ////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      ////console.log(res1);
    })

    this.expressAppWrapper.get("/maximoespera/:fila/:d1/:d2/", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select max(holdtime) as maximaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
      ////console.log(qry);

      let res45 = await executaQry(qry);
      res.json(res45);
      ////console.log(res45);

    });

    this.expressAppWrapper.get("/maximoesperasainte/:ramal/:d1/:d2/", async (req, res, netx) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select max(billsec) as maximoesperasainte from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      ////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      ////console.log(res1);
    })


    this.expressAppWrapper.get("/totalchamadasespera/:fila/:d1/:d2/", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select * from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
      ////console.log(qry);

      let res46 = await executaQry(qry);
      res.json(res46);
      ////console.log(res46);

    });

    this.expressAppWrapper.get("/totalchamadasesperasainte/:ramal/:d1/:d2/", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select * from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      ////console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      ////console.log(res1);
    })

    this.expressAppWrapper.post("/enviar-email-erro", async (req, res, next) => {
      console.log("Ai entrei no sendEmail")
      try {
        const { message, error, stack, platform, route } = req.body;



        await transporter.sendMail({
          from: `"App Monitor" <matheus@mesotelecom.com.br>`,
          to: "plugsoftwareltda@gmail.com", // ex: dev@meuapp.com
          subject: "🔥 Erro no App",
          text: `Mensagem: ${message}\n\nErro:\n${error}\n\nStack:\n${stack}\n\nPlataforma: ${platform}\n\nrota: ${route}`,

        });


        res.status(200).json({ ok: true });
        console.log("Ai sai do sendEmail")
      } catch (e) {
        console.error(e);
        res.status(500).json({ ok: false, message: "Falha ao enviar email" });
      }
    })

    //FIM TME----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    //inicio relaório de tronco

    this.expressAppWrapper.get("/listartronco", async (req, res, next) => {

      let qry = `select * from trunks `;
      ////console.log(qry);

      let res38 = await executaQry2(qry);
      res.json(res38);
      ////console.log(res38);

    });

    this.expressAppWrapper.get("/troncoabandonadas/:tronco/:d1/:d2", async (req, res, next) => {
      let tronco = req.params.tronco
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(*) as abandon from meso_abandon where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
      ////console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      ////console.log(res33);

    });

    this.expressAppWrapper.get("/troncoentrar/:tronco/:d1/:d2", async (req, res, next) => {
      let tronco = req.params.tronco
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(*) as entrada from meso_entrar where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
      ////console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      ////console.log(res33);

    });

    this.expressAppWrapper.get("/troncocomplete/:tronco/:d1/:d2", async (req, res, next) => {
      let tronco = req.params.tronco
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(*) as complete from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
      ////console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      ////console.log(res33);

    });

    this.expressAppWrapper.get("/troncoentrarrt/:tronco/:d1/:d2", async (req, res, next) => {
      let tronco = req.params.tronco
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(*) as entradart from meso_join_rt where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
      ////console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      ////console.log(res33);

    });


    this.expressAppWrapper.get('/concluido/:telefone', async (req, res, next) => {
      let telefone = req.params.telefone

      let qry = `update meso_contatos set estado = 'Concluído' where telefone like '%${telefone}%'`
      console.log('som de milhões? hmmmmm', qry)
      let res2 = await executaQry(qry)

      let qry2 = `update meso_atendimentos set status= 'Concluído', data_fim = now() where telefone ='${telefone}' and status <> 'Concluído';`
      console.log('cocô com gliter', qry2)
      let res3 = await executaQry(qry2)
      console.log(res3)
      res.json(res2)
    })

    this.expressAppWrapper.post('/concluidoPendente', async (req, res, next) => {
      let telefone = req.body.telefone
      let pendencia = req.body.pendencia
      let id_empresa = req.body.idEmpresa

      console.log("Olha a pendencia", telefone, pendencia);

      let qry = `update meso_contatos set estado = 'Concluído' where telefone like '%${telefone}%' and id_empresa = '${id_empresa}'`
      console.log('som de milhões? hmmmmm', qry)
      let res2 = await executaQry(qry)

      let qry2 = `update meso_atendimentos set pendencia ='${pendencia}', status= 'Concluído', data_fim = now() where telefone ='${telefone}' and id_empresa = '${id_empresa}' and status <> 'Concluído'`
      console.log('cocô com gliter', qry2)
      let res3 = await executaQry(qry2)

      console.log("Oq é isso rapaz", res3);

      if (res3.dados.affectedRows > 0) {
        res.json({ success: true, message: "Atendimento finalizado com sucesso" });
        console.log("Olha deu certo ne");
      } else {
        res.json({ success: false, message: "Erro ao finalizar atendimento" });
        console.log("Olha deu errado ne");
      }
    }
    )



    this.expressAppWrapper.get("/ligar/:ramal/:telefone", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let telefone = req.params.telefone;
      let ramal = 'PJSIP/' + req.params.ramal;
      let ramal2 = req.params.ramal;

      ////console.log('teoricamente eu sou o telefone', telefone)
      ////console.log('talvez eu seja o ramal', ramal)

      if (telefone.startsWith("5531")) {
        telefone = telefone.slice(4)
        telefone = "9" + telefone
      } else {
        telefone = telefone.slice(2)
        telefone = telefone.slice(0, 3) + "9" + telefone.slice(3);

      }


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
    this.expressAppWrapper.get('/logar/:ramal/:tipo/:usuario', async (req, res) => {

      try {
        // ────────────────────────────────────────────────────────────
        // 1. Parâmetros
        // ────────────────────────────────────────────────────────────
        const numeroRamal = req.params.ramal;       // só o número
        const tipo = req.params.tipo;
        const usuario = req.params.usuario;


        console.log('tudo culpa sua', numeroRamal,
          tipo,
          usuario,)
        // ────────────────────────────────────────────────────────────
        // 2. Busca a fila no banco (use bind params p/ evitar SQLi)
        // ────────────────────────────────────────────────────────────
        const qry = `SELECT fila FROM meso_usuariologin WHERE usuario = '${usuario}'`;
        const getFilaArray = await executaQry(qry);
        if (!getFilaArray.dados.length) {
          return res.status(404).send('Fila não encontrada');
        }

        const fila = getFilaArray.dados[0].fila;
        console.log('eu sou tipo a fila', fila)

        // ────────────────────────────────────────────────────────────
        // 3. Conecta no AMI
        // ────────────────────────────────────────────────────────────
        const AmiClient = require('asterisk-manager');
        const ami = new AmiClient(5038, '127.0.0.1', 'admin', 'Mtes0206', true);

        // Encerra a conexão caso perca link
        ami.keepConnected();

        // Usa promise pra esperar resposta
        const amiAction = (params) =>
          new Promise((resolve, reject) => {
            ami.action(params, (err, res) => (err ? reject(err) : resolve(res)));
          });

        // ────────────────────────────────────────────────────────────
        // 4. Adiciona o agente
        // ────────────────────────────────────────────────────────────
        const response = await amiAction({
          Action: 'QueueAdd',
          Queue: fila,
          Interface: `PJSIP/${numeroRamal}`,
          Penalty: 0,
          Paused: 'no',
        });

        //console.log('AMI ->', response);

        // ────────────────────────────────────────────────────────────
        // 5. Desconecta do AMI
        // ────────────────────────────────────────────────────────────
        ami.disconnect();

        // ────────────────────────────────────────────────────────────
        // 6. HTTP OK
        // ────────────────────────────────────────────────────────────

        let qry2 = `update meso_usuariologin set estado = 'logado', fila ='${fila}' where ramal = '${numeroRamal}'`
        console.log('venha aqui', qry2)
        await executaQry(qry2)
        let qry3 = `insert into logs (user,ramal, fila, motivo, datahora)values ('PJSIP/${numeroRamal}','PJSIP/${numeroRamal}','${fila}','Login', now())`
        console.log('talvez seja minha culpa', qry3)
        await executaQry(qry3)

        res.status(200).send('Agente logado na fila com sucesso');
      } catch (err) {
        console.error('Erro ao logar agente:', err);
        res.status(200).send('Falha ao logar agente');
      }
    });


    this.expressAppWrapper.get('/deslogar/:ramal/:tipo/:usuario', async (req, res) => {
      try {
        // ────────────────────────────────────────────────────────────
        // 1. Parâmetros
        // ────────────────────────────────────────────────────────────
        const numeroRamal = req.params.ramal;       // só o número
        const tipo = req.params.tipo;
        const usuario = req.params.usuario;
        console.log('eu sou tudo', numeroRamal,
          tipo,
          usuario,)

        // ────────────────────────────────────────────────────────────
        // 2. Busca a fila no banco (use bind params p/ evitar SQLi)
        // ────────────────────────────────────────────────────────────
        const qry = `SELECT fila FROM meso_usuariologin WHERE usuario = '${usuario}'`;
        const getFilaArray = await executaQry(qry);

        if (!getFilaArray.dados.length) {
          return res.status(404).send('Fila não encontrada');
        }

        const fila = getFilaArray.dados[0].fila;

        // ────────────────────────────────────────────────────────────
        // 3. Conecta no AMI
        // ────────────────────────────────────────────────────────────
        const AmiClient = require('asterisk-manager');
        const ami = new AmiClient(5038, '127.0.0.1', 'admin', 'Mtes0206', true);

        // Encerra a conexão caso perca link
        ami.keepConnected();

        // Usa promise pra esperar resposta
        const amiAction = (params) =>
          new Promise((resolve, reject) => {
            ami.action(params, (err, res) => (err ? reject(err) : resolve(res)));
          });

        // ────────────────────────────────────────────────────────────
        // 4. Adiciona o agente
        // ────────────────────────────────────────────────────────────
        const response = await amiAction({
          Action: 'QueueRemove',
          Queue: fila,
          Interface: `PJSIP/${numeroRamal}`,
          Penalty: 0,
          Paused: 'no',
        });

        //console.log('AMI ->', response);

        // ────────────────────────────────────────────────────────────
        // 5. Desconecta do AMI
        // ────────────────────────────────────────────────────────────
        ami.disconnect();

        // ────────────────────────────────────────────────────────────
        // 6. HTTP OK
        // ────────────────────────────────────────────────────────────

        let qry2 = `update meso_usuariologin set estado = 'deslogado' where ramal = '${numeroRamal}'`
        console.log('SORRIA! :D', qry2)
        await executaQry(qry2)

        let qry3 = `insert into logs (user,ramal, fila, motivo, datahora)values ('PJSIP/${numeroRamal}','PJSIP/${numeroRamal}','${fila}','Logout', now())`
        console.log('talvez seja minha culpa', qry3)
        await executaQry(qry3)
        res.status(200).send('Agente logado na fila com sucesso');
      } catch (err) {
        console.error('Erro ao logar agente:', err);
        res.status(200).send('Falha ao logar agente');
      }
    });



    //------------------------------------------------------------------------------------------------------------------------------------------------------------

    //Inicio meso estoque--------------------------------------------------------------------------------------------
    this.expressAppWrapper.get("/acciolyliga/:ramal/:telefone", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let ramal = req.params.ramal;
      let telefone = 'SIP/' + req.params.telefone;
      let telefone2 = req.params.telefone;

      let qry = ` update meso_estoque set situacao = 'Concluído' where ramalvendedor = '${telefone2}' and cliente = '${ramal}' `;
      ////console.log(qry);
      ////console.log(qry);
      let res132 = await executaQry(qry);
      res.json(res132);
      ////console.log(res132);


      var ami = new require('asterisk-manager')('5038', '127.0.0.1', 'admin', 'Mtes0206', true);
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

    this.expressAppWrapper.post("/acciolyaltera/", async (req, res, next) => {
      let id = req.body.id;
      let pedido = req.body.pedido;
      let situacao = req.body.situacao;
      let ramal = req.body.ramalvendedor;
      let telefone = req.body.cliente
      let d1 = req.body.diaatual
      let d2 = req.body.diaatual


      let qry = `update meso_estoque set pedido = '${pedido}', situacao = '${situacao}' where ramalvendedor ='${ramal}' and cliente='${telefone}' and diaatual >= '${d1}' and diaatual <= '${d2}'`;
      ////console.log(qry);


      ////console.log(qry)
      let res99 = await executaQry(qry);

      res.json(res99);
      ////console.log(res99);

    });

    //Operadores realtime--------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.get("/realoperadorrt", async (req, res, next) => {
      // let filacompleta = req.params.fila;
      //let data1 = req.params.d1 + ' 00:00:00'
      //let data2 = req.params.d2 + ' 23:59:59'

      let qry = `SELECT * FROM meso_usuariologin ORDER BY FIELD(estado, 'em ligação', 'logado', 'pausado', 'deslogado');`;
      ////console.log(qry);

      let res36 = await executaQry(qry);
      res.json(res36);
      ////console.log(res36);

    });

    this.expressAppWrapper.get("/ajustaEstado", async (req, res, next) => {
      // let filacompleta = req.params.fila;
      //let data1 = req.params.d1 + ' 00:00:00'
      //let data2 = req.params.d2 + ' 23:59:59'

      let qry = `update users set estado = 'deslogado' where fila = 0 and estado = 'logado';`;
      ////console.log(qry);

      let res36 = await executaQry2(qry);
      res.json(res36);
      ////console.log(res36);



    });

    //REAL OPERADOR------------------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.post("/logarpainel", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = 'SIP/' + req.body.extension;
      let extensionsempin = req.body.extension;

      let fila = req.body.fila;


      var ami = new require('asterisk-manager')('5038', '127.0.0.1', 'admin', 'Mtes0206', true);
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
        ////console.log(qry);

        ////console.log(qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        ////console.log(e);
      }

    });

    this.expressAppWrapper.post("/estadoperador", async (req, res) => {

      let extension = req.body.extension;



      try {
        let qry = `
                          update users set estado = 'logado' where extension = '${extension}'
                        `;
        ////console.log(qry);
        ////console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry2(qry);
        res.json(res47);


      } catch (e) {
        ////console.log(e);
      }

    });

    this.expressAppWrapper.post("/estadoperadorfila", async (req, res) => {
      let extension = req.body.extension;

      let fila = req.body.fila;



      try {
        let qry = `
                          update users set fila = '${fila}' where extension = '${extension}'
                        `;
        ////console.log(qry);
        ////console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry2(qry);
        res.json(res47);


      } catch (e) {
        ////console.log(e);
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
        ////console.log(qry);
        let res47 = await executaQry(qry);
        res.json(res47);
      } catch (e) {
        ////console.log(e);
      }

    });




    //-------------------------------------------------------------------------------------------------------------------------


    this.expressAppWrapper.get("/realoperadorlogados2/:ramal/:d1/:d2/", async (req, res, next) => {
      // let filacompleta = req.params.fila;
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select * from logs where ramal like '%${ramal}%' and datahora >= '${data1}' and datahora <= '${data2}' order by '${data1}' `;
      ////console.log(`Les't go boys real opereador`, qry)

      let res37 = await executaQry(qry);
      res.json(res37);
      ////////console.log(res37);

    });


    this.expressAppWrapper.post("/deslogarpainel", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = 'SIP/' + req.body.extension;
      let extensionsempin = req.body.extension;

      let fila = req.body.fila;


      var ami = new require('asterisk-manager')('5038', '127.0.0.1', 'admin', 'Mtes0206', true);
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
        ////console.log(qry);

        ////console.log(qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        ////console.log(e);
      }

    });

    this.expressAppWrapper.post("/estadoperadordesloga", async (req, res) => {

      let extension = req.body.extension;



      try {
        let qry = `
                          update users set estado = 'deslogado' where extension = '${extension}'
                        `;
        ////console.log(qry);
        ////console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry2(qry);
        res.json(res47);


      } catch (e) {
        ////console.log(e);
      }

    });

    this.expressAppWrapper.post("/deslogaestadorfila", async (req, res) => {
      let extension = req.body.extension;

      let fila = req.body.fila;



      try {
        let qry = `
                          update users set fila = '0' where extension = '${extension}'
                        `;
        ////console.log(qry);
        ////console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry2(qry);
        res.json(res47);


      } catch (e) {
        ////console.log(e);
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
        ////console.log(qry);
        let res47 = await executaQry(qry);
        res.json(res47);
      } catch (e) {
        ////console.log(e);
      }

    });

    //-------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.post("/pausarpainelrt", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = 'SIP/' + req.body.extension;
      let extensionsempin = req.body.extension;

      let fila = req.body.fila;


      var ami = new require('asterisk-manager')('5038', '127.0.0.1', 'admin', 'Mtes0206', true);
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
        ////console.log(qry);

        ////console.log(qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        ////console.log(e);
      }

    });

    this.expressAppWrapper.post("/pausarestado", async (req, res) => {

      let extension = req.body.extension;



      try {
        let qry = `
                          update users set estado = 'pausado' where extension = '${extension}'
                        `;
        ////console.log(qry);
        ////console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry2(qry);
        res.json(res47);


      } catch (e) {
        ////console.log(e);
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
        ////console.log(qry);
        let res47 = await executaQry(qry);
        res.json(res47);
      } catch (e) {
        ////console.log(e);
      }

    });

    this.expressAppWrapper.post("/enviaExp", async (req, res) => {

      let titulo = req.body.titulo
      let descricao = req.body.descricao
      let palavrasChave = req.body.palavrasChave
      let usuario = req.body.usuario

      try {
        let qry = `insert into meso_bot_exp(titulo, descricao,  palavras_chave, autor)
        values ('${titulo}','${descricao}', '${palavrasChave}','${usuario}')`;
        ////console.log(qry);
        let res47 = await executaQry(qry);
        res.json(res47);
      } catch (e) {
        ////console.log(e);
      }

    });


    //------------------------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.post("/despausarpainelrt", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = 'SIP/' + req.body.extension;
      let extensionsempin = req.body.extension;

      let fila = req.body.fila;


      var ami = new require('asterisk-manager')('5038', '127.0.0.1', 'admin', 'Mtes0206', true);
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
        ////console.log(qry);

        ////console.log(qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        ////console.log(e);
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
        ////console.log(qry);
        let res47 = await executaQry(qry);
        res.json(res47);
      } catch (e) {
        ////console.log(e);
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
        ////console.log(e);
      }
    });

    this.expressAppWrapper.get("/listausuariotipo/:tipo/:idEmpresa", async (req, res) => {
      let tipo = req.params.tipo
      let id_empresa = req.params.idEmpresa

      try {
        let qry = `
        select * from meso_usuariologin where tipo = '${tipo}' and id_empresa = ${id_empresa}
        `;

        console.log('veio do nada', qry)
        let res27 = await executaQry(qry);
        res.json(res27);
      } catch (e) {
        ////console.log(e);
      }
    });

    this.expressAppWrapper.get("/listausuariorelat/:idEmpresa", async (req, res) => {
      let id_empresa = req.params.idEmpresa

      try {
        let qry = `
        select * from meso_usuariologin where id_empresa = ${id_empresa}
        `;

        console.log('veio do nada', qry)
        let res27 = await executaQry(qry);
        res.json(res27);
      } catch (e) {
        ////console.log(e);
      }
    });

    this.expressAppWrapper.post("/insereusuario", async (req, res, next) => {
      let usuario = req.body.usuario + "-PlugPhone";
      let senha = req.body.senha;
      let tipo = req.body.tipo;

      try {
        let qry = `
      INSERT INTO meso_usuariologin(usuario, senha, tipo)
      VALUES ('${usuario}', MD5('${senha}'), '${tipo}')
    `;

        let resultado = await executaQry(qry);
        console.log('caveira na sala da faculdade', resultado);

        if (resultado?.dados?.affectedRows > 0) {
          res.json({
            sucesso: true,
            mensagem: "Usuário cadastrado com sucesso.",
            insertId: resultado.dados.insertId,
          });
        } else {
          res.status(400).json({
            sucesso: false,
            mensagem: "Não foi possível cadastrar o usuário.",
          });
        }
      } catch (e) {
        console.error(e);
        res.status(500).json({ sucesso: false, mensagem: "Erro ao cadastrar usuário.", erro: e.message });
      }
    });


    this.expressAppWrapper.get("/usuariotira/:id", async (req, res, next) => {
      let id = req.params.id;
      ////console.log(id)
      try {
        let qry = `
              delete from meso_usuariologin where id = ${id}
            `;
        let res28 = await executaQry(qry);
        res.json(res28);
      } catch (e) {
        ////console.log(e);
      }
    });

    this.expressAppWrapper.get("/buscar-preferencia-notificacao/:usuario", async (req, res, next) => {
      let usuario = req.params.usuario
      let qry = `select somNotificacaoMobile from meso_usuariologin where usuario like '%${usuario}%'`;
      console.log("qry do som da notificacao", qry);
      let res1 = await executaQry(qry)
      res.json(res1);
    });


    this.expressAppWrapper.post("/usuarioaltera", async (req, res, next) => {
      ////console.log(req.body)
      let mostra = req.body;
      let { id, usuario, senha, tipo } = mostra;
      ////console.log(id, usuario, senha, tipo);

      try {
        let qry = `
              update meso_usuariologin set usuario='${usuario}', senha =MD5('${senha}'), tipo='${tipo}' where id = ${id}
            `;
        let res14 = await executaQry(qry);
        res.json(res14);
      } catch (e) {
        res.json({ message: e.message })
      }
    });

    this.expressAppWrapper.post("/alterar-usuario", async (req, res, next) => {
      console.log("fazendo o som")
      try {
        let usuario = req.body.usuario;
        let usuarioSemPlug = usuario;
        if (usuario.includes('-PlugPhone')) {
          usuarioSemPlug = usuario.replace('-PlugPhone', '');
          console.log("Caiu aquii será?");
        }

        let senha = req.body.senha;
        let tipo = req.body.tipo;
        let id = req.body.id






        let updateUsuario = await executaQry(`
      UPDATE meso_usuariologin
      SET usuario='${usuario}', senha=MD5('${senha}'), tipo='${tipo}'
      WHERE id=${id}
    `);

        // Aqui depende de como o executaQry retorna — geralmente:
        // updateUsuario.affectedRows OU updateUsuario.dados.affectedRows
        if (updateUsuario.affectedRows > 0 || updateUsuario.dados?.affectedRows > 0) {
          return res.json({ message: "Usuário atualizado com sucesso!" });
        } else {
          return res.status(200).json({ message: "Nenhuma alteração foi feita (dados já estavam iguais)." });
        }
      } catch (e) {
        console.error("Erro ao atualizar usuário:", e);
        return res.status(500).json({ message: "Erro interno: " + e.message });
      }
    });

    //FIM Cadastro de usuário ----------------------------------------------------------------------------------

    //MESO DETALHES --------------------------------------------------------------------------------------------

    this.expressAppWrapper.get("/detalhes/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_detalhe where datahora > '${data1}' and datahora < '${data2}' `;
      ////console.log(qry);


      let res1 = await executaQry(qry);
      res.json(res1);
      ////console.log(res1);

    });


    this.expressAppWrapper.post("/sendGpt", async (req, res, next) => {

      let msg = req.body.message

      let resposta = await sendGpt(msg)
      //console.log('será que eu peguei a resposta? PLIN PLIN PLON?', resposta)
      res.json(resposta);


    })

    this.expressAppWrapper.get("/verificaPalavrao", async (req, res, next) => {

      let msg = await verificaPalavrao('whore')
      //console.log(msg)


    })


    this.expressAppWrapper.post("/send", async (req, res) => {

      let to = req.body.to
      let body = req.body.body
      let nome = req.body.nome
      let id_empresa = req.body.idEmpresa

      //////console.log('dificil heim kkkkkkk', to, body, nome)
      let palavrao = await verificaPalavrao(body)
      //////console.log('palavrão nãokkkkkkk', palavrao)
      if (palavrao) {
        let qry = `insert into meso_mensagens_banidas (nome, mensagem) VALUES ('${nome}', '${body}')`
        await executaQry(qry)
        res.json({ "dados": "mensagem não tolerada" });
      } else {
        console.log('passei mesmo kkkkk')
        let qry = `update meso_contatos set ultimamsg = '${body}' where telefone = ${to}`
        console.log('eu sou a ultimamsg', qry)
        await executaQry(qry)
        send(to, body, nome, res)

        //console.log('chorava em vão')
        buscarMensagem(to);

        res.json({ "dados": "mensagem enviada" });
      }

    })

    this.expressAppWrapper.post("/atualizausuario", async (req, res) => {
      let nome = req.body.nome;
      let telefone = req.body.telefone;
      let empresa = req.body.empresa;
      let email = req.body.email;
      let setor = req.body.setor;
      let oldTelefone = req.body.oldTelefone;

      console.log('eu chego aqui?')
      if (setor == 'admin') {
        let qry = `
    UPDATE meso_contatos 
    SET atendimento_ai = 0 WHERE telefone = '${oldTelefone}'
    
  `;
        console.log('ooooh potencia', qry)
        await executaQry(qry);

      } else {
        let qry = `
    UPDATE meso_contatos 
    SET nome = '${nome}', telefone = '${telefone}', empresa = '${empresa}',atendimento_ai = 0, email = '${email}', setor = '${setor}'
    WHERE telefone = '${oldTelefone}'
  `;

        console.log("simple jardineiro", qry);


        try {
          let resultado = await executaQry(qry);
          console.log("oldTelefone", resultado.dados.affectedRows);

          if (resultado.dados.affectedRows > 0) {
            res.json({ success: true, message: "Cliente atualizado com sucesso!" });
          } else {
            res.json({ success: false, message: "Nenhum cliente encontrado para atualizar." });
          }

        } catch (error) {
          console.error("Erro ao atualizar cliente:", error);
          res.status(500).json({ success: false, message: "Erro ao atualizar cliente!", error: error.message });
        }
      }
    });


    this.expressAppWrapper.post("/sendimage", async (req, res) => {



      let to = req.body.to
      let id = req.body.id
      let usuario = req.body.usuario
      let id_empresa = req.body.idEmpresa


      let qry = `select wpp_id, telefone from meso_empresas where id_empresa = '${id_empresa}'`
      console.log('me ensinou a beber', qry)
      let wpp = await executaQry(qry)
      let wpp_id = wpp.dados[0].wpp_id
      let wpnumber = wpp.dados[0].telefone

      ////console.log(to, id, link, res)
      ////console.log('oque vem sem link', link)
      sendImage(to, id, usuario, res, wpp_id, wpnumber)
    })


    this.expressAppWrapper.post("/sendvideo", async (req, res) => {

      let to = req.body.to
      let id = req.body.id
      let link = req.body.link
      let id_empresa = req.body.idEmpresa

      let qry = `select wpp_id, telefone from meso_empresas where id_empresa = '${id_empresa}'`
      let wpp = await executaQry(qry)
      let wpp_id = wpp.dados[0].wpp_id
      let wpnumber = wpp.dados[0].telefone

      sendVideo(to, id, link, res, wpp_id, wpnumber)
    })

    this.expressAppWrapper.post("/sendaudio", async (req, res) => {

      let to = req.body.to
      let id = req.body.id
      let usuario = req.body.usuario
      let id_empresa = req.body.idEmpresa

      let qry = `select wpp_id, telefone from meso_empresas where id_empresa = '${id_empresa}'`
      let wpp = await executaQry(qry)
      let wpp_id = wpp.dados[0].wpp_id
      let wpnumber = wpp.dados[0].telefone

      sendAudio(to, id, usuario, res, wpp_id, wpnumber)
    })


    this.expressAppWrapper.post("/sendtemplate", async (req, res) => {

      let to = req.body.to
      let name = req.body.name
      let usuario = req.body.usuario
      let text = req.body.text

      sendTemplate(to, name, usuario, text, res)

    })

    this.expressAppWrapper.post("/sendtemplate2", async (req, res) => {

      let to = req.body.to
      let name = req.body.name
      let usuario = req.body.usuario
      let text = req.body.text
      let id_empresa = req.body.idEmpresa

      console.log('entrou no send template 2', id_empresa, to, name, usuario, text);

      let qry = `select wpp_id, telefone from meso_empresas where id_empresa = '${id_empresa}'`
      let wpp = await executaQry(qry)
      let wpp_id = wpp.dados[0].wpp_id
      let wpnumber = wpp.dados[0].telefone

      sendTemplate(to, name, usuario, text, res, wpp_id, wpnumber)

    })
    this.expressAppWrapper.post("/senddocument", async (req, res) => {

      let to = req.body.to
      let id = req.body.id.replace(/\D/g, "")
      let newID = req.body.id
      let usuario = req.body.usuario
      let filename = req.body.nomeArquivo
      let extensao = req.body.extensao
      let id_empresa = req.body.idEmpresa
      let qry = `select wpp_id, telefone from meso_empresas where id_empresa = '${id_empresa}'`
      let wpp = await executaQry(qry)
      let wpp_id = wpp.dados[0].wpp_id
      let wpnumber = wpp.dados[0].telefone

      console.log(`teste do send document, \nto${to},\n id:${id}, \n newID:${newID},\n nomeArquivo ${filename},\nusuario ${usuario}\n extensao ${extensao}`)


      sendDocument(to, newID, filename, usuario, extensao, res, wpp_id, wpnumber)
    })


    this.expressAppWrapper.get('/contaMsg/:num', async (req, res, next) => {
      let num = req.params.num
      try {
        let qry5 = `select count(*) as mensagens from meso_mensagens_solicitante where telefone = '${num}' and DATE(datetime) = CURDATE();`
        let res1 = await executaQry(qry5)

        res.json(res1)
      } catch (error) {
        ////////console.log(e)
      }
    });



    this.expressAppWrapper.post("/atualizacontato", async (req, res) => {
      let mensagem = req.body.msg
      let tel = req.body.tel
      let idEmpresa = req.body.idEmpresa
      let qry = `UPDATE meso_contatos SET ultimamsg = '${mensagem}', atendimento_ai = 0, datahora = NOW() WHERE telefone = '${tel}' and id_empresa = '${idEmpresa}'`
      console.log('Something in the way', qry)
      executaQry(qry)
      res.send('Atualizado')
    })

    this.expressAppWrapper.get("/paraBot/:tel/:idEmpresa", async (req, res) => {
      let tel = req.params.tel
      let idEmpresa = req.params.idEmpresa
      let qry = `UPDATE meso_contatos SET atendimento_ai = 0 WHERE telefone = '${tel}' and id_empresa = '${idEmpresa}'`
      console.log('Something in the way', qry)
      executaQry(qry)
      res.send('Atualizado')
    })

    /*

    this.expressAppWrapper.post("/gera-codigo", async (req, res) => {
      let usuario = req.body.usuario
      let telefone = req.body.telefone;
      const codigo = crypto.randomInt(100000, 999999).toString();

      let codigoValidoArray = await executaQry(`SELECT usado, expira_em < NOW() AS expirado FROM meso_dois_fatores WHERE telefone = '${telefone}' ORDER BY id_dois_fatores DESC LIMIT 1;`)

      let usado = codigoValidoArray.dados[0].usado
      let expirado = codigoValidoArray.dados[0].expirado

      if (usado == 1 || expirado == 1) {
        let qry = `update meso_dois_fatores set codigo = '${codigo}',criado_em = now(), expira_em = DATE_ADD(NOW(), INTERVAL 5 MINUTE), usado = 0 where telefone = '${telefone}'`
        await executaQry(qry)
        console.log('Te melo o rego', qry)
        sendAutenticacao(telefone, codigo, res)
        console.log("Saiu do gravar codigo")
        res.json("Foi")
      } else {
        res.status(200).json("Código já utilizado ou já expirado");
      }
    })
      */

    this.expressAppWrapper.post("/gera-codigo", async (req, res) => {
      let usuario = req.body.usuario
      let telefone = req.body.telefone;
      const codigo = crypto.randomInt(100000, 999999).toString();

      console.log("Ai meu usuario", usuario)

      const pegaId = `
      SELECT id_empresa 
      FROM meso_usuariologin 
      WHERE usuario = '${usuario}-PlugPhone'
    `;

      let idEmpresa = await executaQry(pegaId)
      console.log('essa é a parada importante', idEmpresa)
      let id_empresa = await idEmpresa.dados[0].id_empresa

      let qry = `select wpp_id, telefone from meso_empresas where id_empresa = '${id_empresa}'`
      let wpp = await executaQry(qry)
      let wpp_id = wpp.dados[0].wpp_id
      let wpnumber = wpp.dados[0].telefone

      console.log('muito foda, venenoso', wpp_id)



      let codigoValidoArray = await executaQry(`SELECT usado, expira_em < NOW() AS expirado FROM meso_dois_fatores WHERE telefone = '${telefone}' ORDER BY id_dois_fatores DESC LIMIT 1;`)

      let usado = codigoValidoArray.dados[0].usado
      let expirado = codigoValidoArray.dados[0].expirado

      if (usado == 1 || expirado == 1) {
        let qry = `update meso_dois_fatores set codigo = '${codigo}',criado_em = now(), expira_em = DATE_ADD(NOW(), INTERVAL 5 MINUTE), usado = 0 where telefone = '${telefone}'`
        await executaQry(qry)
        console.log('Te melo o rego', qry)
        await sendAutenticacao(telefone, codigo, res, wpp_id)
        console.log("Saiu do gravar codigo")
        res.json("Foi")
      } else {
        res.status(200).json("Código já utilizado ou já expirado");
      }
    })


    this.expressAppWrapper.get('/buscarmealing/:telefone/:idEmpresa', async (req, res, next) => {
      let telefone = req.params.telefone
      let idEmpresa = req.params.idEmpresa

      let qry = `select * from meso_contatos where telefone = '${telefone}' and id_empresa = '${idEmpresa}'`
      console.log('sou qry mealing', qry)
      let res1 = await executaQry(qry)
      res.json(res1)
    })


    this.expressAppWrapper.get('/pegaTelefone/:usuario', async (req, res) => {
      try {
        const usuario = req.params.usuario;

        // 🔍 Busca o ID do usuário
        const pegaId = `
      SELECT id 
      FROM meso_usuariologin 
      WHERE usuario = '${usuario}'
    `;
        console.log('🔎 Query pegaId:', pegaId);

        const pegaIDArray = await executaQry(pegaId);

        if (!pegaIDArray?.dados?.length) {
          return res.status(404).json({
            success: false,
            msg: `Usuário '${usuario}' não encontrado.`,
            dados: [],
          });
        }

        const id = pegaIDArray.dados[0].id;

        // 🔍 Busca o telefone pelo id do usuário
        const pegaTelefone = `
      SELECT telefone 
      FROM meso_dois_fatores 
      WHERE id_usuario = ${id}
    `;
        console.log('📞 Query pegaTelefone:', pegaTelefone);

        const pegaTelefoneArray = await executaQry(pegaTelefone);

        if (!pegaTelefoneArray?.dados?.length) {
          return res.status(404).json({
            success: false,
            msg: `Nenhum telefone encontrado para o usuário '${usuario}'.`,
            dados: [],
          });
        }

        console.log(`✅ Telefone encontrado para ${usuario}:`, pegaTelefoneArray.dados);

        return res.status(200).json({
          success: true,
          msg: "Telefone encontrado com sucesso.",
          dados: pegaTelefoneArray.dados,
        });

      } catch (error) {
        console.error('❌ Erro na rota /pegaTelefone:', error);
        return res.status(500).json({
          success: false,
          msg: "Erro interno ao buscar telefone.",
          erro: error.message,
        });
      }
    });


    this.expressAppWrapper.get("/estadoMealing/:processo/:atendeu/:reagendar/:interesse/:negociar/:observacao", async (req, res, next) => {
      ////console.log('entrei aqui')
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

      ////console.log(processo, atendeu, reagendar, interesse, negociar)
      if (atendeu == 'sim') {

        if (interesse == 'sim' || negociar == 'sim') {
          let qry = `update meso_oportunidade set estado = 'aprovado', atendeu ='${intatendeu}', reagenda='${intreagendar}', interesse='${intinteresse}', negociar = '${intnegociar}', observacao = '${observacao}',dataFim = now() where idMealing= (select idMealing from meso_mealing where processo ="${processo}" order by idMealing limit 1 )`
          ////console.log('query', qry)
          let res1 = await executaQry(qry)
          res.json(res1)
        } else {
          let qry = `update meso_oportunidade set estado = 'reprovado',dataFim = now(), observacao = '${observacao}' where idMealing= (select idMealing from meso_mealing where processo ="${processo}") `
          ////console.log('query', qry)
          let res1 = await executaQry(qry)
          res.json(res1)
        }
      } else if (reagendar == 'sim') {
        let qry = `update meso_oportunidade set estado = 'reagendar', atendeu ='${intatendeu}', reagenda='${intreagendar}', interesse='${intinteresse}', negociar = '${intnegociar}', observacao = '${observacao}',dataFim = now() where idMealing= (select idMealing from meso_mealing where processo ="${processo}" order by idMealing limit 1 )`
        ////console.log('query', qry)

        let res1 = await executaQry(qry)
        res.json(res1)
      } else {
        let qry = `update meso_oportunidade set estado = 'reprovado',dataFim = now(), observacao = '${observacao}' where idMealing = (select idMealing from meso_mealing where processo = '${processo}')`
        let res1 = await executaQry(qry)
        res.json(res1)
      }

    });

    this.expressAppWrapper.listen(this.porta, () => console.log('serv on ' + this.porta))
  }
}


module.exports = ExpressController;
