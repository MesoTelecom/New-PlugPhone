/*
event: 'QueueMemberAdded',
privilege: 'agent,all',
queue: '307',
location: 'SIP/2001',
membername: 'SIP/2001',
stateinterface: '(null)',
membership: 'dynamic',
penalty: '0',
callstaken: '0',
lastcall: '0',
status: '2',
paused: '0'
}

LOGA NA FILA
*/
create table login_fila (
    id int not null auto_increment,
    evento varchar(40) null,
    privilege varchar(40),
    fila bigint,
    localizacao varchar (40),
    membername varchar(40),
    stateinterface varchar(40),
    membership varchar(40),
    penalty int,
    callstaken int,
    lastcall varchar(40),
    estado int,
    pausado int,
    uniqueid varchar(40),
    dataHora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);

/*
{
event: 'QueueMemberPaused',
privilege: 'agent,all',
queue: '307',
location: 'SIP/2001',
membername: 'SIP/2001',
paused: '1'
}

LOGA NA FILA
*/
create table pausa_fila (
    id int not null auto_increment,
    evento varchar(40),
    privilege varchar(40),
    fila bigint,
    localizacao varchar(40),
    membername varchar(40),
    pausado int,
    dataPausa date null, 
    hora time NULL,
    despausado  time default 0, 
    PRIMARY KEY(id)
);
/*
{
event: 'QueueMemberRemoved',
privilege: 'agent,all',
queue: '307',
location: 'SIP/2001',
membername: 'SIP/2001'
}

REMOVE DA FILA
*/

create table desloga_fila(
    id int not null auto_increment,
    evento varchar(40),
    fila bigint,
    localizacao varchar (40),
    membername varchar(40),
    dataHora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);
/*
{
  event: 'Join',
  privilege: 'call,all',
  channel: 'SIP/2001-000000b0',
  calleridnum: '2001',
  calleridname: 'Anna Oliveira',
  connectedlinenum: 'unknown',
  connectedlinename: 'unknown',
  queue: '307',
  position: '1',
  count: '1',
  uniqueid: '1652282336.195'
}

EVENTO JOIN, no caso entra na fila para ligar
*/
create table entrar(
    id int not null AUTO_INCREMENT,
    evento VARCHAR(40),
    privilege VARCHAR(40),
    channel VARCHAR(40),
    calleridnum VARCHAR(40),
    calleridname VARCHAR(40),
    connectedlinenum VARCHAR(40),
    connectedlinename VARCHAR(40),
    fila int,
    position INT,
    conta INT,
    uniqueid VARCHAR(40),
    DataHora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
)
/*
{
  event: 'MusicOnHold',
  privilege: 'call,all',
  state: 'Start',
  channel: 'SIP/205-000000af',
  uniqueid: '1652282320.194',
  class: 'none'
}

Musica de espera da fila
*/
create table music_on_hold(
    id int not null AUTO_INCREMENT,
    evento VARCHAR(40),
    privilege VARCHAR(40),
    estado VARCHAR(40),
    channel VARCHAR(40),
    uniqueid VARCHAR(40),
    class VARCHAR(40),
    dataInicio date null, 
    hora time NULL,
    dataTermino  datetime default 0, 
    PRIMARY KEY(id)
);
/*
{
  event: 'Leave',
  privilege: 'call,all',
  channel: 'SIP/210-00000254',
  queue: '307',
  count: '0',
  position: '1',
  uniqueid: '1651760919.1011'
}

evento leave, no caso sai da fila para um atendimento
*/



create table sai(
    id int not null AUTO_INCREMENT,
    evento VARCHAR(40),
    privilege VARCHAR(40),
    channel VARCHAR(40),
    fila VARCHAR(40),
    conta int,
    position int,
    uniqueid VARCHAR(40),
    dataHora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);

/*
{
  event: 'Bridge',
  privilege: 'call,all',
  bridgestate: 'Link',
  bridgetype: 'core',
  channel1: 'SIP/210-00000250',
  channel2: 'Agent/7000',
  uniqueid1: '1651756181.1005',
  uniqueid2: '1651756181.1006',
  callerid1: '210',
  callerid2: '30
  }

  evento Bridge
*/
CREATE TABLE bridge(
    id int not null AUTO_INCREMENT,
    evento VARCHAR(40) not null,
    privilege VARCHAR(40) null,
    bridgestate VARCHAR(40) not null,
    bridgetype VARCHAR(40) null,
    canal1 VARCHAR(40) not null,
    canal2 VARCHAR(40) not null,
    uniqueid1 VARCHAR(40) NOT NULL,
    uniqueid2 VARCHAR(40) not null,
    callerid1 VARCHAR(40) NOT NULL,
    callerid2 VARCHAR(40) NOT NULL,
    InicioChamada       time          NULL,                                
    terminoChamada  time default 0, 
    PRIMARY KEY(id)
);
/*
{
event: 'Hangup',
privilege: 'call,all',
channel: 'SIP/9803-0000098e',
uniqueid: '1652893500.3089',
calleridnum: '9803',
calleridname: 'Joubert RAMAL 9803',
connectedlinenum: '9804',
connectedlinename: 'Joubert RAMAL 9804',
accountcode: '',
cause: '16',
'cause-txt': 'Normal Clearing'
}

Desliga a chamada
*/
create table desliga(
    id int not null auto_increment,
    evento varchar(40),
    privilege varchar(40),
    channel varchar(40),
    uniqueid varchar(40),
    calleridnum varchar(40),
    calleridname varchar(40),
    connectedlinenum varchar(40),
    connectedlinename varchar(40),
    accountcode varchar(40),
    causa bigint,
    causatxt varchar(40),
    dataHora TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
);

/*
Ramais cadastrados no banco
*/
create table ramais(
	  id int not null auto_increment,
    ramal_fisico varchar(5),
    ramal_virtual varchar(5),
    fila varchar(20),
    stat int,
    primary key(id)
);

/*
{
  event: 'Dial',
  privilege: 'call,all',
  subevent: 'Begin',
  channel: 'SIP/205-00000126',
  destination: 'SIP/201-00000127',
  calleridnum: '205',
  calleridname: 'Lucas Agente',
  connectedlinenum: '201',
  connectedlinename: 'teste',
  uniqueid: '1653073007.311',
  destuniqueid: '1653073007.312',
  dialstring: '201'
}


evento de discagem
*/
creaTE TABLE dial(
    id int not null auto_increment,
    evento varchar(40) not null,
    privilege varchar(40) not null,
    subevent varchar(40) not null,
    channel varchar(40) not null,
    destination varchar(40) not null,
    calleridnum varchar(40) not null,
    calleridname varchar(40) not null,
    connectedlinenum varchar(40) not null,
    connectedlinename varchar(40) not null,
    uniqueid varchar(40) not null,
    datauniqueid varchar(40),
    dialstring varchar(40),
    PRIMARY KEY(id)
);

/*
tabela de operadores cadastrados
*/
create table operadores(
id int not null auto_increment,
usuario varchar(40) not null,
pin varchar(40) not null,
fila varchar(40) not null,
stat int,
primary key(id)
);

/*
tablea de logados
*/

create table logado(
	id int not null auto_increment,
    ramal varchar(20) not null,
    pin varchar(50) not null,
    fila varchar(50),
    dia int,
    mes int,
    ano varchar(20),
    hora time,
  primary key(id)
);

/*
tabela de logs
*/
create table logs( 
  id int not null AUTO_INCREMENT,
  user varchar(50) NOT NULL,
  ramal varchar(8) NOT NULL,
  fila varchar(20) NOT NULL,
  motivo varchar(20) NOT NULL,
  datahora timestamp default CURRENT_TIMESTAMP,
  primary key(id)
);


/*Tabelas referente a Codigo pin*/


create table operadores(
id int not null auto_increment,
usuario varchar(50) not null,
pin varchar(50) not null,
fila varchar(20) not null,
stat int default 0,
primary key(id)
);

create table ramais(
id int not null auto_increment,
ramal_fisico varchar(5) not null,
ramal_virtual varchar(5) not null,
fila varchar(20) not null,
stat int(11),
primary key(id)
);

create table pausado(
ramal varchar(5) not null,
pin varchar(50) not null,
fila varchar(20) not null
);


create table logs(
id int not null auto_increment,
user varchar(50) not null,
ramal varchar(5) not null,
fila varchar(20) not null,
motivo varchar(20) not null,
datahora timestamp not null default current_timestamp 
);
