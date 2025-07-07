const axios = require('axios');
const { executaQry } = require('./banco/bd');
const https = require('https');

let aniversariantes = async function () {
    const agent = new https.Agent({
        rejectUnauthorized: false,
    });

    const config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api-nxcoop.sicoobnossacoop.com.br/api/v1/associados/aniversariantes-hoje/?size=1000',
        headers: {
            'Authorization': '72dd78d0-f4b6-4beb-8db4-a971dad01999'
        },
        httpsAgent: agent
    };

    try {
        let response = await axios.request(config);
        let dados = response.data.content;

        for (let item of dados) {
            let {
                pessoa: {
                    nomeAssociado: nome = 'NÃO INFORMADO',
                    document: documento = 'NÃO INFORMADO',
                    email = 'NÃO INFORMADO',
                    dataNascimento = null,
                    sexo = 'NÃO INFORMADO',
                    estadoCivil = 'NÃO INFORMADO',
                    escolaridade = 'NÃO INFORMADO',
                    endereco = [],
                    telefone = []
                },
                tipoRenda = 'NÃO INFORMADO',
                vinculoEmpregaticio = 'NÃO INFORMADO',
                tugdescricaoProfissao: profissao = 'NÃO INFORMADO',
                atividadeEconomica = 'NÃO INFORMADO',
                pa: { numero: pa_id = 0, descricao: pa_descricao = 'NÃO INFORMADO' } = {},
                isFuncionario: is_funcionario = false,
                mei = 'NÃO INFORMADO'
            } = item;

            // Tratando arrays de telefone e endereço
            let telefoneCelular = telefone.length > 0 ? telefone[0].numero || 'NÃO INFORMADO' : 'NÃO INFORMADO';

            let logradouro = endereco[0]?.logradouro || 'NÃO INFORMADO';
            let numero = endereco[0]?.numero || 'NÃO INFORMADO';
            let complemento = endereco[0]?.complemento || 'NÃO INFORMADO';
            let bairro = endereco[0]?.bairro || 'NÃO INFORMADO';
            let municipio = endereco[0]?.municipio || 'NÃO INFORMADO';
            let uf = endereco[0]?.uf || 'NÃO INFORMADO';
            let cep = endereco[0]?.cep || 'NÃO INFORMADO';

            let gerente_nome = 'NÃO INFORMADO'; // não veio no JSON

            let qry = `
INSERT INTO meso_contatos (
nome, telefone, documento, email, data_nascimento, sexo, estado_civil, escolaridade,
logradouro, numero, complemento, bairro, municipio, uf, cep,
tipo_renda, vinculo_empregaticio, profissao, atividade_economica,
pa_id, pa_descricao, gerente_nome, is_funcionario, mei,
estado, id_agencia, datahora
) VALUES (
'${nome}', '${telefoneCelular}', '${documento}', '${email}', '${dataNascimento}', '${sexo}',
'${estadoCivil}', '${escolaridade}', '${logradouro}', '${numero}', '${complemento}',
'${bairro}', '${municipio}', '${uf}', '${cep}', '${tipoRenda}', '${vinculoEmpregaticio}',
'${profissao}', '${atividadeEconomica}', ${pa_id}, '${pa_descricao}', '${gerente_nome}',
${is_funcionario}, '${mei}', 'Novo', '${pa_id}', NOW()
)
`;

            console.log('📥 Inserindo:', qry);
            await executaQry(qry);
        }

        return response.data;
    } catch (error) {
        console.error('Erro ao buscar aniversariantes:', error);
        return null;
    }
};

module.exports = { aniversariantes };


