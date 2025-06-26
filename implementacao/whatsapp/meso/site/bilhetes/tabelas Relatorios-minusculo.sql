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
tabela de operadores cadastrados
*/

create table meso_operadores(
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



create table meso_pausado(
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
  data hora date null,
  primary key (id)
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
