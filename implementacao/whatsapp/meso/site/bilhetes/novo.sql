
use asterisk;

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

create table logado(
id int not null auto_increment,
ramal int not null,
pin int not null,
fila int not null,
dia int not null,
mes int not null,
ano int,
hora time,
primary key(id)
)

create table pausado(
id int not null auto_increment,
ramal varchar(5) not null,
nome varchar(40) not null,
pin varchar(50) not null,
fila varchar(20) not null,
dia int,
mes int,
ano int,
hora time,
primary key(id)
);


create table logs(
id int not null auto_increment,
user varchar(50) not null,
ramal varchar(5) not null,
fila varchar(20) not null,
motivo varchar(20) not null,
datahora timestamp not null default current_timestamp ,
primary key(id)
);
select * from pausado;
select * from logado;
select * from ramais;
select operadores.usuario, ramais.ramal_virtual from operadores, ramais where operadores.fila = ramais.fila;

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
    InicioChamada       time          NULL,                                
    terminoChamada  time default 0, 
    PRIMARY KEY(id)
);


create table operadores(
id int not null auto_increment,
usuario varchar(40) not null,
nome varchar(40) not null,
pin varchar(40) not null,
fila varchar(40) not null,
stat int,
primary key(id)
);

create table logado(
	id int not null auto_increment,
    ramal varchar(20) not null,
    pin varchar(50) not null,
    fila varchar(50),
    ano varchar(20),
    dia int,
    mes int,
    hora time,
  primary key(id)
);