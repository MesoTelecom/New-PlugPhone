use asterisk;

use asteriskcdrdb;
show tables;
select * from cdr;
select * from LoginFila;
Select * from DeslogaFila;
select * from abandon;
select * from Desliga;
select * from Bridge;
select * from PausaFila;
select * from MusicOnHold;
select * from entrar;
select * from pausadoPlug;
select * from Ligacoes;
select * from operadores;
select * from ramais;
insert into operadores(usuario, pin, fila) values ('LucasTeste', '4848', '307');
describe MusicOnHold;
alter table MusicOnHold modify column dataTermino time default 0;
alter table Bridge add column DataChamada date after callerid2;

select membername as menbroNome,dataPausa, hora, despausado, TIMEDIFF(despausado, hora) as duracaoPausa FROM PausaFila;

select TIMEDIFF(Bridge.terminoChamada, Bridge.InicioChamada )  from Bridge, MusicOnHold where Bridge.uniqueid1 = MusicOnHold.uniqueid;

select timediff(MusicOnHold.hora, MusicOnHold.dataTermino) from MusicOnHold, Bridge where MusicOnHold.uniqueid = Bridge.uniqueid1;
select * from PausaFila;
select * from evtjoin;
select * from logado;
select * from LoginFila;
 select right (membername, 3)  from PausaFila;
-- PausaFila
select distinct operadores.usuario as usuario, logado.ramal as ramal, logado.pin as pin, dataPausa, PausaFila.hora, despausado, TIMEDIFF(despausado, PausaFila.hora) as duracaoPausa FROM PausaFila, operadores, logado where logado.pin = operadores.pin and logado.ramal =  right (membername, 3);

SELECT * from codigo_pin;
select * from Bridge;
select * from logado;
select * from operadores;
select * from codigo_pin;
select * from dial;
alter table dial add column calleridname varchar(40) after calleridnum;
select * from cdr where calldate > '2022-05-23 00:00:00';
select * from ramais;
select * from logado;
-- Detalhes de Ligações;
select distinct operadores.usuario as usuário, logado.ramal as ramal, logado.pin as pin, Bridge.DataChamada as dataInicio, Bridge.InicioChamada as IncioChamada, Bridge.terminoChamada as DataDeTermino,    TIMEDIFF(Bridge.terminoChamada, Bridge.InicioChamada) as duracao, timediff(MusicOnHold.dataTermino, MusicOnHold.hora) as tempoDeEspera, entrar.fila, Bridge.callerid1 as numero from LoginFila, Bridge, Desliga, entrar, MusicOnHold, logado, operadores where Bridge.uniqueid1 = MusicOnHold.uniqueid and logado.ramal = Bridge.callerid2 and logado.pin = operadores.pin;

drop table ligacaoHora;

create table operadores(
id int not null auto_increment,
usuario varchar(40) not null,
nome varchar(40) not null,
pin varchar(40) not null,
fila varchar(40) not null,
stat int,
primary key(id)
);

create table ramais(
	id int not null auto_increment,
    ramal_fisico varchar(5),
    ramal_virtual varchar(5),
    fila varchar(20),
    stat int,
    primary key(id)
);

create table logado(
	id int not null auto_increment,
    ramal varchar(20) not null,
    pin varchar(50) not null,
    fila varchar(50)
    
);

create table pausado(
id int auto_increment not null,
ramal varchar(5),
pin varchar(40),
fila varchar(40),
primary key(id)
);

create table ligacaoHora(
    id int not null AUTO_INCREMENT,
    hora VARCHAR(40),
    tudo int,
    PRIMARY KEY(id)
)
select * from ligacaoHora;
insert into ligacaoHora (hora) values ('23:00');
select * from AgentComplete;
select sec_to_TIME(sum(timediff(terminoChamada, InicioChamada)))from Bridge;
select sec_to_time(round(avg(timediff(terminoChamada, InicioChamada)))) from Bridge;
select MAX(TIMEDIFF(terminoChamada, InicioChamada)) from Bridge;
select AgentComplete.membername as NomeNumAgente,(select count(Ligacoes.channelstatedesc) from Ligacoes) as TotalLigacoes, AgentComplete.fila as fila, (select count(AgentComplete.evento) from AgentComplete) as LigacoesAtendidas, (select SEC_TO_TIME(sum(talktime)) from AgentComplete) as duracao, (select sec_to_time(AVG(talktime)) from AgentComplete) as tempoMedio, MAX(sec_to_time(talktime)) as tempoMAX from AgentComplete, Ligacoes;

-- select distinct operadores.usuario as usuário, logado.ramal as ramal, logado.pin as pin, Bridge.DataChamada as dataInicio, Bridge.InicioChamada as IncioChamada, Bridge.terminoChamada as DataDeTermino,    TIMEDIFF(Bridge.terminoChamada, Bridge.InicioChamada) as duracao, timediff(MusicOnHold.dataTermino, MusicOnHold.hora) as tempoDeEspera, entrar.fila, Bridge.callerid1 as numero from LoginFila, Bridge, Desliga, entrar, MusicOnHold, logado, operadores where Bridge.uniqueid1 = MusicOnHold.uniqueid and logado.ramal = Bridge.callerid2 and logado.pin = operadores.pin;
-- TMA;
select count(Ligacoes.channelstatedesc) from Ligacoes;
select * from Bridge;
select Bridge.bridgestate from Bridge;
select * from logado;
select * from Ligacoes;
select count(callerid2) from Bridge where callerid2 = 201;
select * from Bridge;
select * from logado;
select * from entrar;
select * from evtjoin;
select * from pausado;
select DISTINCT * from evtjoin;
select * from logado;
select * from LoginFila
select * from Bridge, evtjoin,dial, logado where logado.ramal = evtjoin.calleridnum
select count(Bridge.callerid1) from Bridge, logado, LoginFila where callerid2 = logado.ramal and logado.hora = right(LoginFila.dataHora ,8);
select  count(Bridge.bridgestate) from Bridge, evtjoin, logado, operadores  where logado.pin = operadores.pin and Bridge.callerid2 = logado.ramal and evtjoin.uniqueid =  Bridge.uniqueid2; 
select  distinct operadores.usuario as usuario, logado.pin as pin, (select count(Bridge.callerid1) from Bridge )as TotalLigacoes, entrar.fila as fila, (select distinct count(Bridge.callerid1) from Bridge, logado, LoginFila where callerid2 = logado.ramal and logado.hora = right(LoginFila.dataHora ,8)) as LigacoesAtendidas, (select  distinct sec_to_time(sum(timediff(terminoChamada, InicioChamada)))from Bridge, logado, LoginFila where callerid2 = logado.ramal and logado.hora = right(LoginFila.dataHora ,8)) as duracao, (select distinct sec_to_time(round(avg(timediff(terminoChamada, InicioChamada)))) from Bridge, logado, LoginFila where callerid2 = logado.ramal and logado.hora = right(LoginFila.dataHora ,8)) as tempoMedio, (select distinct (MAX(TIMEDIFF(terminoChamada, InicioChamada))) from Bridge, logado, LoginFila where callerid2 = logado.ramal and logado.hora = right(LoginFila.dataHora ,8)) as tempoMax from Bridge, Desliga, entrar, Ligacoes, logado, operadores where Bridge.uniqueid2 = Desliga.uniqueid and operadores.pin = logado.pin ;

select * from MusicOnHold;
select AgentComplete.fila as fila, sec_to_time(sum(agentConnect.holdtime)) as tempoEspera, sec_to_time(AVG(agentConnect.holdtime)) as MedTempoEspera, (select (sec_to_time(MAX(agentConnect.holdtime)))) as MaxTempo , count(Ligacoes.channelstatedesc) as TotalLigacoes from agentConnect, Ligacoes, AgentComplete where Ligacoes.uniqueid = AgentComplete.uniqueid and agentConnect.uniqueid = AgentComplete.uniqueid;
SELECT distinct entrar.fila as fila, sec_to_time(sum(Timediff(MusicOnHold.hora, MusicOnHold.dataTermino))) as tempoEspera, (select(avg(timediff(MusicOnHold.hora, MusicOnHold.dataTermino))) from MusicOnHold)as TME, (select(max(TIMEDIFF(MusicOnHold.dataTermino, MusicOnHold.hora )))FROM MusicOnHold ) AS MaxEspera from MusicOnHold, entrar, operadores, logado where entrar.uniqueid = MusicOnHold.uniqueid;
select  from Bridge;
select * from Bridge;
-- TME
select distinct operadores.usuario as usuário, logado.pin as pin, (select count(Ligacoes.channelstatedesc) from Ligacoes)as TotalLigacoes, entrar.fila as fila, (select count(Bridge.bridgestate) from Bridge, logado where  Bridge.callerid2 = logado.ramal) as LigacoesAtendidas, (select sec_to_time(sum(timediff(terminoChamada, InicioChamada)))from Bridge where Bridge.callerid1 | Bridge.callerid2 = logado.ramal) as duracao, (select sec_to_time(round(avg(timediff(terminoChamada, InicioChamada)))) from Bridge where Bridge.callerid1 | Bridge.callerid2 = logado.ramal) as tempoMedio, (select(MAX(TIMEDIFF(terminoChamada, InicioChamada))) from Bridge where Bridge.callerid1 | Bridge.callerid2 = logado.ramal) as tempoMax from Bridge, Desliga, entrar, Ligacoes, logado, operadores where Desliga.uniqueid = Bridge.uniqueid2 and operadores.pin = logado.pin;

select * from MusicOnHold;
select AgentComplete.fila as fila, sec_to_time(sum(agentConnect.holdtime)) as tempoEspera, sec_to_time(AVG(agentConnect.holdtime)) as MedTempoEspera, (select (sec_to_time(MAX(agentConnect.holdtime)))) as MaxTempo , count(Ligacoes.channelstatedesc) as TotalLigacoes from agentConnect, Ligacoes, AgentComplete where Ligacoes.uniqueid = AgentComplete.uniqueid and agentConnect.uniqueid = AgentComplete.uniqueid;
select time_to_sec(sum(timediff(MusicOnHold.dataTermino, MusicOnHold.hora))) from MusicOnHold;
select distinct operadores.usuario as usuário, logado.pin as pin, (select sum(Timediff(MusicOnHold.horaInicio, MusicOnHold.dataTermino)) from MusicOnHold)


SELECT * FROM dial;

alter table evtjoin add column connectedlinename varchar(40) after connectedlinenum;
select * from Bridge;

select distinct operadores.usuario as usuário, logado.ramal as ramal, logado.pin as pin, Bridge.DataChamada as dataInicio, Bridge.InicioChamada as IncioChamada, Bridge.terminoChamada as DataDeTermino, TIMEDIFF(Bridge.terminoChamada, Bridge.InicioChamada) as duracao, timediff(MusicOnHold.dataTermino, MusicOnHold.hora) as tempoDeEspera, entrar.fila, Bridge.callerid1 as numero from LoginFila, Bridge, Desliga, entrar, MusicOnHold, logado, operadores where Bridge.uniqueid1 = MusicOnHold.uniqueid and logado.ramal = Bridge.callerid2 and logado.pin = operadores.pin;
