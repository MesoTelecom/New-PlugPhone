use asteriskcdrdb;
show tables;

select * from meso_dial
create table meso_login_fila (
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
    datahora timestamp not null default current_timestamp,
    primary key(id)
);

/*
{
event: 'queuememberpaused',
privilege: 'agent,all',
queue: '307',
location: 'sip/2001',
membername: 'sip/2001',
paused: '1'
}

loga na fila
*/

create table meso_pausa_fila (
    id int not null auto_increment,
    evento varchar(40),
    privilege varchar(40),
    fila bigint,
    localizacao varchar(40),
    membername varchar(40),
    pausado int,
    datapausa date null, 
    hora time null,
    despausado  time default 0, 
    primary key(id)
);
/*
{
event: 'queuememberremoved',
privilege: 'agent,all',
queue: '307',
location: 'sip/2001',
membername: 'sip/2001'
}

remove da fila
*/

create table meso_desloga_fila(
    id int not null auto_increment,
    evento varchar(40),
    fila bigint,
    localizacao varchar (40),
    membername varchar(40),
    datahora timestamp not null default current_timestamp,
    primary key(id)
);
/*
{
  event: 'join',
  privilege: 'call,all',
  channel: 'sip/2001-000000b0',
  calleridnum: '2001',
  calleridname: 'anna oliveira',
  connectedlinenum: 'unknown',
  connectedlinename: 'unknown',
  queue: '307',
  position: '1',
  count: '1',
  uniqueid: '1652282336.195'
}

evento join, no caso entra na fila para ligar
*/

create table meso_entrar(
    id int not null auto_increment,
    evento varchar(40),
    privilege varchar(40),
    channel varchar(40),
    calleridnum varchar(40),
    calleridname varchar(40),
    connectedlinenum varchar(40),
    connectedlinename varchar(40),
    fila int,
    position int,
    conta int,
    uniqueid varchar(40),
    datahora timestamp not null default current_timestamp,
    primary key(id)
);

create table meso_join_rt(
    id int not null auto_increment,
    evento varchar(40),
    privilege varchar(40),
    channel varchar(40),
    calleridnum varchar(40),
    calleridname varchar(40),
    connectedlinenum varchar(40),
    connectedlinename varchar(40),
    fila int,
    position int,
    conta int,
    uniqueid varchar(40),
    datahora timestamp not null default current_timestamp,
    primary key(id)
);
/*
{
  event: 'musiconhold',
  privilege: 'call,all',
  state: 'start',
  channel: 'sip/205-000000af',
  uniqueid: '1652282320.194',
  class: 'none'
}

musica de espera da fila
*/
;
create table meso_music_on_hold(
    id int not null auto_increment,
    evento varchar(40),
    privilege varchar(40),
    estado varchar(40),
    channel varchar(40),
    uniqueid varchar(40),
    class varchar(40),
    datainicio date null, 
    hora time null,
    datatermino  datetime default 0, 
    primary key(id)
);

create table meso_music_on_hold_rt(
    id int not null auto_increment,
    evento varchar(40),
    privilege varchar(40),
    estado varchar(40),
    channel varchar(40),
    uniqueid varchar(40),
    class varchar(40),
    datainicio date null, 
    hora time null,
    datatermino  datetime default 0, 
    primary key(id)
);
/*
{
  event: 'leave',
  privilege: 'call,all',
  channel: 'sip/210-00000254',
  queue: '307',
  count: '0',
  position: '1',
  uniqueid: '1651760919.1011'
}

evento leave, no caso sai da fila para um atendimento
*/


create table meso_sair(
    id int not null auto_increment,
    evento varchar(40),
    privilege varchar(40),
    channel varchar(40),
    fila varchar(40),
    conta int,
    position int,
    uniqueid varchar(40),
    datahora timestamp not null default current_timestamp,
    primary key(id)
);

/*
{
  event: 'bridge',
  privilege: 'call,all',
  bridgestate: 'link',
  bridgetype: 'core',
  channel1: 'sip/210-00000250',
  channel2: 'agent/7000',
  uniqueid1: '1651756181.1005',
  uniqueid2: '1651756181.1006',
  callerid1: '210',
  callerid2: '30
  }
d
  evento bridge
*/

create table meso_bridge(
    id int not null auto_increment,
    evento varchar(40) not null,
    privilege varchar(40) null,
    bridgestate varchar(40) not null,
    bridgetype varchar(40) null,
    canal1 varchar(40) not null,
    canal2 varchar(40) not null,
    uniqueid1 varchar(40) not null,
    uniqueid2 varchar(40) not null,
    callerid1 varchar(40) not null,
    callerid2 varchar(40) not null,
    datachamada date null,
    iniciochamada       time          null,                                
    terminochamada  time default 0, 
    primary key(id)
);
/*
{ event: 'BridgeEnter',
  privilege: 'call,all',
  bridgeuniqueid: 'baa49aa4-9a40-4fc1-a1b2-9f48f700383a',
  bridgetype: 'basic',
  bridgetechnology: 'simple_bridge',
  bridgecreator: '<unknown>',
  bridgename: '<unknown>',
  bridgenumchannels: '1',
  bridgevideosourcemode: 'none',
  channel: 'SIP/5832-0000004b',
  channelstate: '6',
  channelstatedesc: 'Up',
  calleridnum: '5832',
  calleridname: 'Reginaldo',
  connectedlinenum: '5834',
  connectedlinename: 'Lucas',
  language: 'pt_BR',
  accountcode: '',
  context: 'from-internal',
  exten: '300',
  priority: '1',
  uniqueid: '1663332584.570',
  linkedid: '1663332584.567' }
*/
create table meso_bridge(
    id int not null auto_increment,
    evento varchar(40) not null,
    privilege varchar(40) null,
    bridgeuniqueid varchar(100) null,
    bridgetype varchar (40) null,
    bridgetechnology varchar(50) null,
    bridgecreator varchar(50) null,
    bridgename varchar(40) null,
    bridgenumchannels int,
    bridgevideosourcemode varchar(40),
    channel varchar(40),
    channelstate varchar(40),
    channelstatedesc varchar(40),
    calleridnum varchar(40),
    calleridname varchar(40),
    connectedlinenum varchar(40),
    connectedlinename varchar(40),
    linguagem varchar(40),
    accountcode varchar(40),
    context varchar(40),
    exten varchar(40),
    prioridade varchar(40),
    uniqueid varchar(40),
    linkedid varchar(40),
    datachamada date null,
    iniciochamada time null,                                
    terminochamada  time default 0, 
    primary key(id)
);

create table meso_operadores_em_ligacao(
  id int not null auto_increment,
  bridgestate varchar(40) not null,
  canal1 varchar(40) not null,
  canal2 varchar(40) not null,
  uniqueid1 varchar(40) not null,
  uniqueid2 varchar(40) not null,
  callerid1 varchar(40) not null,
  callerid2 varchar(40) not null,
  primary key(id)
);

/*
{
  event: 'agentcalled',
  privilege: 'agent,all',
  queue: '307',
  agentcalled: 'agent/7000',
  agentname: 'agent/7000',
  channelcalling: 'sip/210-00000254',
  destinationchannel: 'agent/7000',
  calleridnum: '210',
  calleridname: 'novo ramal',
  connectedlinenum: 'unknown',
  connectedlinename: 'unknown',
  context: 'from-internal',
  extension: '307',
  priority: '39',
  uniqueid: '1651760919.1011'
}
*/
create table meso_agent_called(
    id int not null auto_increment,
    evento varchar(40) not null,
    privilege varchar(40) null,
    fila int not null,
    agentcalled varchar(40) not null,
    agentname varchar(40) not null,
    channelcalling varchar(40) not null,
    destinationchannel varchar(40) not null,
    calleridnum varchar(40) not null,
    calleridname varchar(40) not null,
    connectedlinenum varchar(40) not null,
    connectedlinename varchar(40) not null,
    context varchar(40) null,
    extension varchar(40) null,
    prioridade varchar(40) not null,
    uniqueid varchar(40) not null,
    datahora timestamp not null default current_timestamp,
    primary key(id)
);
create table meso_ligacoes(
fila int not null,
uniqueid varchar(40) not null,
channelcalling varchar(40) not null,
calleridnum varchar(40) not null,
calleridname varchar(40) not null,
datahora timestamp not null default current_timestamp,
primary key(uniqueid)
);
/*
{
event: 'hangup',
privilege: 'call,all',
channel: 'sip/9803-0000098e',
uniqueid: '1652893500.3089',
calleridnum: '9803',
calleridname: 'joubert ramal 9803',
connectedlinenum: '9804',
connectedlinename: 'joubert ramal 9804',
accountcode: '',
cause: '16',
'cause-txt': 'normal clearing'
}

desliga a chamada
*/

create table meso_desliga(
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
    datahora timestamp not null default current_timestamp,
    primary key(id)
);
/*
{
  event: 'queuecallerabandon',
  privilege: 'agent,all',
  queue: '307',
  uniqueid: '1652282355.198',
  position: '2',
  originalposition: '2',
  holdtime: '20'
}
*/

create table meso_abandon(
    id int not null auto_increment,
    evento varchar(40),
    privilege varchar(40),
    fila varchar(40),
    uniqueid varchar(40),
    position int,
    originalposition int,
    holdtime varchar(40),
    datahora timestamp not null default current_timestamp,
    primary key(id)
);
/*
ramais cadastrados no banco
*/

create table meso_ramais(
	  id int not null auto_increment,
    ramal_fisico varchar(5),
    ramal_virtual varchar(5),
    fila varchar(20),
    stat int,
    primary key(id)
);

/*
{
  event: 'dial',
  privilege: 'call,all',
  subevent: 'begin',
  channel: 'sip/205-00000126',
  destination: 'sip/201-00000127',
  calleridnum: '205',
  calleridname: 'lucas agente',
  connectedlinenum: '201',
  connectedlinename: 'teste',
  uniqueid: '1653073007.311',
  destuniqueid: '1653073007.312',
  dialstring: '201'
}


evento de discagem
*/

create table meso_dial(
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
    dialstatus varchar(40),
    iniciochamada datetime null,
    terminochamada timestamp default 0,
    primary key(id)
);

/*
{ event: 'DialBegin',
  privilege: 'call,all',
  channel: 'SIP/5834-0000004a',
  channelstate: '6',
  channelstatedesc: 'Up',
  calleridnum: '5834',
  calleridname: 'Lucas',
  connectedlinenum: '<unknown>',
  connectedlinename: '<unknown>',
  language: 'pt_BR',
  accountcode: '',
  context: 'from-internal',
  exten: '300',
  priority: '40',
  uniqueid: '1663332584.567',
  linkedid: '1663332584.567',
  destchannel: 'SIP/5832-0000004b',
  destchannelstate: '0',
  destchannelstatedesc: 'Down',
  destcalleridnum: '5832',
  destcalleridname: 'Reginaldo',
  destconnectedlinenum: '<unknown>',
  destconnectedlinename: '<unknown>',
  destlanguage: 'pt_BR',
  destaccountcode: '',
  destcontext: 'from-internal',
  destexten: '',
  destpriority: '1',
  destuniqueid: '1663332584.570',
  destlinkedid: '1663332584.567',
  dialstring: 'SIP/5832' }
*/

create table meso_dial(
    id int not null auto_increment,
    evento varchar(40) not null,
    privilege varchar(40) not null,
    channel varchar(40) not null,
    channelstate varchar(20),
    channelstatedesc varchar(20),
    calleridnum varchar(20),
    calleridname varchar(40),
    connectedlinenum varchar(40),
    connectedlinename varchar(30),
    linguagem varchar(30),
    accountcode varchar(40),
    context varchar(40),
    exten varchar(40),
    prioridade varchar(40),
    uniqueid varchar(40),
    linkedid varchar(40),
    destchannel varchar(40),
    destchannelstate varchar(40),
    destchannelstatedesc varchar(40),
    destcalleridnum varchar(40),
    destcalleridname varchar(40),
    destlanguage varchar(40),
    destaccountcode varchar(40),
    destcontext varchar(40),
    destexten varchar(40),
    destpriority varchar(40),
    destuniqueid varchar(40),
    destlinkedid varchar(40),
    dialstring varchar(40),
    dialstatus varchar(40),
    iniciochamada datetime null,
    terminochamada timestamp default 0,
    primary key(id)
);

/*
{
  event: 'agentconnect',
  privilege: 'agent,all',
  queue: '307',
  uniqueid: '1651760927.1013',
  channel: 'agent/7000',
  member: 'agent/7000',
  membername: 'agent/7000',
  holdtime: '21',
  bridgedchannel: '1651760947.1014',
  ringtime: '0'
}
*/

create table meso_agent_connect(
    id int not null auto_increment,
    evento varchar(40) not null,
    privilege varchar(40) null,
    fila varchar(40) not null,
    uniqueid varchar(40) not null,
    canal varchar(40) not null,
    member varchar(40) not null,
    menbronome varchar(40) not null,
    tempoespera varchar(40) not null,
    bridgedchannel varchar(40) not null,
    ringtime varchar(40) default 0 not null,
    datahora timestamp not null default current_timestamp ,
    primary key(id)
);

/*
{ event: 'AgentConnect',
  privilege: 'agent,all',
  channel: 'SIP/5831-00000020',
  channelstate: '6',
  channelstatedesc: 'Up',
  calleridnum: '5831',
  calleridname: 'Anna',
  connectedlinenum: '5832',
  connectedlinename: 'Reginaldo',
  language: 'pt_BR',
  accountcode: '',
  context: 'from-internal',
  exten: '300',
  priority: '40',
  uniqueid: '1663274702.234',
  linkedid: '1663274702.234',
  destchannel: 'SIP/5832-00000021',
  destchannelstate: '6',
  destchannelstatedesc: 'Up',
  destcalleridnum: '5832',
  destcalleridname: 'Reginaldo',
  destconnectedlinenum: '5831',
  destconnectedlinename: 'Anna',
  destlanguage: 'pt_BR',
  destaccountcode: '',
  destcontext: 'from-internal',
  destexten: '300',
  destpriority: '1',
  destuniqueid: '1663274702.237',
  destlinkedid: '1663274702.234',
  queue: '300',
  interface: 'SIP/5832',
  membername: 'SIP/5832',
  holdtime: '0',
  ringtime: '0' }
}
*/

create table meso_call_connected_rt(
    id int not null auto_increment,
    evento varchar(40) not null,
    privilege varchar(40) null,
    fila varchar(40) not null,
    uniqueid varchar(40) not null,
    canal varchar(40) not null,
    member varchar(40) not null,
    menbronome varchar(40) not null,
    tempoespera varchar(40) not null,
    bridgedchannel varchar(40) not null,
    ringtime varchar(40) default 0 not null,
    datahora timestamp not null default current_timestamp ,
    primary key(id)
);


/*
tabela de operadores cadastrados
*/

create table meso_operadores(
id int not null auto_increment,
usuario varchar(40) not null,
pin varchar(40) not null,
fila varchar(40) not null,
stat int null,
primary key(id)
);

/*
tablea de logados
*/

create table meso_logado(
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



/*tabelas referente a codigo pin*/


create table meso_operadores(
id int not null auto_increment,
usuario varchar(50) not null,
pin varchar(50) not null,
fila varchar(20) not null,
stat int default 0,
primary key(id)
);

create table meso_scripts(
    id int not null AUTO_INCREMENT,
    fila VARCHAR(50) not null,
    titulo VARCHAR (100) not null,
    texto VARCHAR(200) not null,
    PRIMARY KEY (id) 
);

create table meso_pausado(
ramal varchar(50) not null,
pin varchar(50) not null,
fila varchar(20) not null
);


create table logs(
id int not null auto_increment,
user varchar(50) not null,
ramal varchar(50) not null,
fila varchar(20) not null,
motivo varchar(20) not null,
datahora timestamp not null default current_timestamp ,
primary key (id)
);

create table meso_usuariologin(
    id int auto_increment not null,
    usuario varchar(100) not null,
    senha varchar(100) not null,
    tipo varchar(20) null,
    primary key (id) 
);

create table meso_fluxo_ligacao(
  id int auto_increment not null,
  hora varchar(40),
  total int default 0,
  data datetime null,
  datahora date default null
  primary key (id)
);

CREATE TABLE meso_pesquisa(
    id INT NOT NULL AUTO_INCREMENT,
    operador VARCHAR (45) NULL,
    cliente VARCHAR (45) NULL,
    gostaria VARCHAR (10) NULL,
    nota VARCHAR (10) NULL,
    datahora datetime NULL,
    PRIMARY KEY (id)
);

create table meso_agent_complete(
    id int not null auto_increment,
    evento varchar(40),
    privilege varchar(40),
    fila varchar(40),
    uniqueid varchar(40),
    channel varchar(40),
    member varchar(40),
    membername varchar(40),
    
    holdtime varchar(40),
    talktime varchar(40),
    reason varchar(40),
    datahora timestamp not null default current_timestamp,
    primary key(id)
);

create table  meso_form(
  atendente varchar(10) default null,
  pin int default null,
  chamador varchar(20) default null,
  uniqueid varchar(50),
  datahora timestamp not null default current_timestamp,
  primary key(uniqueid)
);


create table meso_form_insert(
  nome varchar(50) default null,
  rgcpf varchar(50) default null,
  contato varchar(50) default null,
  endereco varchar(50) default null,
  solicitacao varchar(200) default null,
  uniqueid varchar(50),
  datahora timestamp not null default current_timestamp,
  primary key(uniqueid)
);

create table meso_agent_called_rt(
 id int(11) NOT NULL AUTO_INCREMENT,
 evento varchar(40) NOT NULL,
 privilege varchar(40) NULL,
 fila int(11) NOT NULL,
 agentcalled varchar(40)  NOT NULL,
 agentname varchar(40)  NOT NULL,
 channelcalling varchar(40)  NOT NULL,
 destinationchannel varchar(40)  NOT NULL,
 calleridnum varchar(40)  NOT NULL,
 calleridname varchar(40)  NOT NULL,
 connectedlinenum varchar(40)  NOT NULL,
 connectedlinename varchar(40)  NOT NULL,
 context varchar(40) NULL,
 extension varchar(40) NULL,
 prioridade varchar(40) NOT NULL,
 uniqueid varchar(40) NOT NULL,
 datahora timestamp not null default current_timestamp,
  primary key(id)
);

/*
{ event: 'BlindTransfer',
  privilege: 'call,all',
  result: 'Success',
  transfererchannel: 'SIP/5832-0000001e',
  transfererchannelstate: '6',
  transfererchannelstatedesc: 'Up',
  transferercalleridnum: '5832',
  transferercalleridname: 'Reginaldo',
  transfererconnectedlinenum: '5831',
  transfererconnectedlinename: 'Anna',
  transfererlanguage: 'pt_BR',
  transfereraccountcode: '',
  transferercontext: 'from-internal',
  transfererexten: '300',
  transfererpriority: '1',
  transfereruniqueid: '1663274640.210',
  transfererlinkedid: '1663274640.207',
  transfereechannel: 'SIP/5831-0000001d',
  transfereechannelstate: '6',
  transfereechannelstatedesc: 'Up',
  transfereecalleridnum: '5831',
  transfereecalleridname: 'Anna',
  transfereeconnectedlinenum: '5832',
  transfereeconnectedlinename: 'Reginaldo',
  transfereelanguage: 'pt_BR',
  transfereeaccountcode: '',
  transfereecontext: 'from-internal',
  transfereeexten: '300',
  transfereepriority: '40',
  transfereeuniqueid: '1663274640.207',
  transfereelinkedid: '1663274640.207',
  bridgeuniqueid: 'fbfa3c2d-846d-49a8-820b-39101866a1dc',
  bridgetype: 'basic',
  bridgetechnology: 'simple_bridge',
  bridgecreator: '<unknown>',
  bridgename: '<unknown>',
  bridgenumchannels: '2',
  bridgevideosourcemode: 'none',
  isexternal: 'No',
  context: 'from-internal-xfer',
  extension: '5834' }
*/

create table meso_blindtransfer(
  id int auto_increment not null,
  evento varchar(40),
  privilege varchar(40),
  result varchar(40),
  transfererchannel varchar(40),
  transfererchannelstate varchar(40),
  transferercalleridnum varchar(40),
  transferercalleridname varchar(40),
  transfererconnectedlinenum varchar(40),
  transfererconnectedlinename varchar(40),
  transfererlanguage varchar(40),
  transfereraccountcode varchar(40),
  transferercontext varchar(40),
  transfererexten varchar(40),
  transfererpriority int,
  transfereruniqueid varchar(50),
  transfererlinkedid varchar(50),
  transfereechannel varchar(50),
  transfereechannelstate varchar(40),
  transfereechannelstatedesc varchar(40),
  transfereecalleridnum varchar(40),
  transfereecalleridname varchar(40),
  transfereeconnectedlinenum varchar(40),
  transfereeconnectedlinename varchar(40), 
  transfereelanguage varchar(40),
  transfereeaccountcode varchar(40),
  transfereecontext varchar(40),
  transfereeexten varchar(40),
  transfereepriority varchar(40),
  transfereeuniqueid varchar(40),
  transfereelinkedid varchar(40),
  bridgeuniqueid varchar(40),
  bridgetype varchar(40),
  bridgetechnology varchar(40),
  bridgecreator varchar(40),
  bridgename varchar(40),
  bridgenumchannels int,
  bridgevideosourcemode varchar(40),
  isexternal varchar(40),
  context varchar(40),
  extension varchar(40),
  datahora timestamp not null default current_timestamp,
  primary key(id)

);
/*
{ event: 'AttendedTransfer',
  privilege: 'call,all',
  result: 'Success',
  origtransfererchannel: 'SIP/5832-00000021',
  origtransfererchannelstate: '6',
  origtransfererchannelstatedesc: 'Up',
  origtransferercalleridnum: '5832',
  origtransferercalleridname: 'Reginaldo',
  origtransfererconnectedlinenum: '5834',
  origtransfererconnectedlinename: 'Lucas',
  origtransfererlanguage: 'pt_BR',
  origtransfereraccountcode: '',
  origtransferercontext: 'from-internal',
  origtransfererexten: '300',
  origtransfererpriority: '1',
  origtransfereruniqueid: '1663274702.237',
  origtransfererlinkedid: '1663274702.234',
  origbridgeuniqueid: 'b6daa9a3-6a4d-4520-a7d9-c487f9c7bb37',
  origbridgetype: 'basic',
  origbridgetechnology: 'simple_bridge',
  origbridgecreator: '<unknown>',
  origbridgename: '<unknown>',
  origbridgenumchannels: '2',
  origbridgevideosourcemode: 'none',
  secondtransfererchannel: 'SIP/5832-00000021',
  secondtransfererchannelstate: '6',
  secondtransfererchannelstatedesc: 'Up',
  secondtransferercalleridnum: '5832',
  secondtransferercalleridname: 'Reginaldo',
  secondtransfererconnectedlinenum: '5834',
  secondtransfererconnectedlinename: 'Lucas',
  secondtransfererlanguage: 'pt_BR',
  secondtransfereraccountcode: '',
  secondtransferercontext: 'from-internal',
  secondtransfererexten: '300',
  secondtransfererpriority: '1',
  secondtransfereruniqueid: '1663274702.237',
  secondtransfererlinkedid: '1663274702.234',
  secondbridgeuniqueid: '7615dcba-cbd6-45fc-acc8-0dc397ea1791',
  secondbridgetype: 'basic',
  secondbridgetechnology: 'simple_bridge',
  secondbridgecreator: '<unknown>',
  secondbridgename: '<unknown>',
  secondbridgenumchannels: '0',
  secondbridgevideosourcemode: 'none',
  transfereechannel: 'SIP/5831-00000020',
  transfereechannelstate: '6',
  transfereechannelstatedesc: 'Up',
  transfereecalleridnum: '5831',
  transfereecalleridname: 'Anna',
  transfereeconnectedlinenum: '5832',
  transfereeconnectedlinename: 'Reginaldo',
  transfereelanguage: 'pt_BR',
  transfereeaccountcode: '',
  transfereecontext: 'from-internal',
  transfereeexten: '300',
  transfereepriority: '40',
  transfereeuniqueid: '1663274702.234',
  transfereelinkedid: '1663274702.234',
  transfertargetchannel: 'Local/5834@from-internal-xfer-00000000;1',
  transfertargetchannelstate: '6',
  transfertargetchannelstatedesc: 'Up',
  transfertargetcalleridnum: '5834',
  transfertargetcalleridname: 'Lucas',
  transfertargetconnectedlinenum: '5832',
  transfertargetconnectedlinename: 'Reginaldo',
  transfertargetlanguage: 'pt_BR',
  transfertargetaccountcode: '',
  transfertargetcontext: 'from-internal-xfer',
  transfertargetexten: '5834',
  transfertargetpriority: '1',
  transfertargetuniqueid: '1663274790.242',
  transfertargetlinkedid: '1663274702.234',
  isexternal: 'No',
  desttype: 'Bridge',
  destbridgeuniqueid: 'b6daa9a3-6a4d-4520-a7d9-c487f9c7bb37' }
*/

create table meso_attended_transfer(
  id int not null auto_increment,
  evento varchar(40),
  privilege varchar(40),
  result varchar(40),
  origtransfererchannel varchar(40),  
  origtransfererchannelstate varchar(40),
  origtransfererchannelstatedesc varchar(40),
  origtransferercalleridnum varchar(40),
  origtransferercalleridname varchar(40),
  origtransfererconnectedlinenum varchar(40),
  origtransfererconnectedlinename varchar(40),
  origtransfererlanguage varchar(40),
  origtransfereraccountcode varchar(40),
  origtransferercontext varchar(40),
  origtransfererexten varchar(40),
  origtransfererpriority varchar(40),
  origtransfereruniqueid varchar(40),
  origtransfererlinkedid varchar(40),
  origbridgeuniqueid VARCHAR(40),
  origbridgetype varchar(40),
  origbridgetechnology varchar(40),
  origbridgecreator varchar(40),
  origbridgename varchar(40),
  origbridgenumchannels varchar(40),
  origbridgevideosourcemode varchar(40),
  secondtransfererchannel varchar(40),
  secondtransfererchannelstate varchar(40),
  secondtransfererchannelstatedesc varchar(40),
  secondtransferercalleridnum varchar(40),
  secondtransferercalleridname varchar(40),
  secondtransfererconnectedlinenum varchar(40),
  secondtransfererconnectedlinename varchar(40),
  secondtransfererlanguage varchar(40),
  secondtransfereraccountcode varchar(40),
  secondtransferercontext varchar(40),
  secondtransfererexten varchar(40),
  secondtransfererpriority varchar(40),
  secondtransfereruniqueid varchar(40),
  secondtransfererlinkedid varchar(40),
  secondbridgeuniqueid varchar(40),
  secondbridgetype varchar(40),
  secondbridgetechnology varchar(40),
  secondbridgecreator varchar(40),
  secondbridgename varchar(40),
  secondbridgenumchannels varchar(40),
  secondbridgevideosourcemode varchar(40),
  transfereechannel varchar(40),
  transfereechannelstate varchar(40),
  transfereechannelstatedesc varchar(40),
  transfereecalleridnum varchar(40),
  transfereecalleridname varchar(40),
  transfereeconnectedlinenum varchar(40),
  transfereeconnectedlinename varchar(40),                                        
  transfereelanguage varchar(40),
  transfereeaccountcode varchar(40),
  transfereecontext varchar(40),  
  transfereeexten varchar(40),
  transfereepriority varchar(40),
  transfereeuniqueid varchar(40),
  transfereelinkedid varchar(40),
  transfertargetchannel varchar(40),
  transfertargetchannelstate varchar(40),
  transfertargetchannelstatedesc varchar(40),
  transfertargetcalleridnum varchar(40),
  transfertargetcalleridname varchar(40),
  transfertargetconnectedlinenum varchar(40),
  transfertargetconnectedlinename varchar(40),
  transfertargetlanguage varchar(40),
  transfertargetaccountcode varchar(40),
  transfertargetcontext varchar(40),
  transfertargetexten varchar(40),
  transfertargetpriority varchar(40),
  transfertargetuniqueid varchar(40),
  transfertargetlinkedid varchar(40),
  isexternal varchar(40),
  desttype varchar(40),
  destbridgeuniqueid varchar(40),         
  datahora timestamp not null default current_timestamp,
  primary key(id)

)

create table meso_transf_consult(
  id int auto_increment not null,
  evento varchar(40),
  privilege varchar(40),
  result varchar(40),
  transfererchannel varchar(40),
  transfererchannelstate varchar(40),
  transferercalleridnum varchar(40),
  transferercalleridname varchar(40),
  transfererconnectedlinenum varchar(40),
  transfererconnectedlinename varchar(40),
  transfererlanguage varchar(40),
  transfereraccountcode varchar(40),
  transferercontext varchar(40),
  transfererexten varchar(40),
  transfererpriority int,
  transfereruniqueid varchar(50),
  transfererlinkedid varchar(50),
  transfereechannel varchar(50),
  transfereechannelstate varchar(40),
  transfereechannelstatedesc varchar(40),
  transfereecalleridnum varchar(40),
  transfereecalleridname varchar(40),
  transfereeconnectedlinenum varchar(40),
  transfereeconnectedlinename varchar(40), 
  transfereelanguage varchar(40),
  transfereeaccountcode varchar(40),
  transfereecontext varchar(40),
  transfereeexten varchar(40),
  transfereepriority varchar(40),
  transfereeuniqueid varchar(40),
  transfereelinkedid varchar(40),
  bridgeuniqueid varchar(40),
  bridgetype varchar(40),
  bridgetechnology varchar(40),
  bridgecreator varchar(40),
  bridgename varchar(40),
  bridgenumchannels int,
  bridgevideosourcemode varchar(40),
  isexternal varchar(40),
  context varchar(40),
  extension varchar(40),
  datahora timestamp not null default current_timestamp,
  primary key(id)

);