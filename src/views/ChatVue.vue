<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div id="app" style="">
    <v-app style="">

      <v-navigation-drawer app color="#001644" class="sidebar" style="  border-right-style: double;
  border-color: #13224245;
">
        <v-row>
          <img src="../assets/plugphone.png" class="avatar">

          <div style="margin-top: 6%;
    position: relative;
    left: 16%;">

            <v-btn icon color="black" @click="deslogar" style="left: 120%; font-size: 24px; margin-bottom: -4%;">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
          </div>

          <!--<v-icon @click="OpenDialogGLPI = true" class="imageIcon"
            style="    left: 71%;font-size: 169%; margin-bottom: -1%;">
            mdi-help-circle
          </v-icon>
          -->
          <br>
          <br>
          <div style="position: relative;
    left: 40%;">
            <b> {{ usuario }} </b>
          </div>
        </v-row>
        <v-row class="cabecalhoNovo">

          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" class="botaoEstado"
                @click="buscarContato(filtroSelecionado, estadoContatoFiltro = 'Todos')">
                <v-icon style="color: #568cbe">mdi-account-multiple-outline</v-icon>
              </v-btn>
            </template>
            <span>Todos</span>
          </v-tooltip>

          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" class="botaoEstado"
                @click="buscarContato(filtroSelecionado, estadoContatoFiltro = 'Novo')">
                <v-icon style="color: #d09e0c">mdi-account-alert-outline</v-icon>
              </v-btn>
            </template>
            <span>Novos</span>
          </v-tooltip>

          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" class="botaoEstado"
                @click="buscarContato(filtroSelecionado, estadoContatoFiltro = 'Aguardando Atendimento')">
                <v-icon style="color: #d20d0d">mdi-account-clock-outline</v-icon>
              </v-btn>
            </template>
            <span>Pendentes</span>
          </v-tooltip>
          <!--
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" class="botaoEstado"
                @click="buscarContato(filtroSelecionado, estadoContatoFiltro = 'Pendente de Assunto')">
                <v-icon style="color: #f57c00">mdi-account-question-outline</v-icon>
              </v-btn>
            </template>
            <span>Pendência de Assunto</span>
          </v-tooltip>
-->
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" class="botaoEstado"
                @click="buscarContato(filtroSelecionado, estadoContatoFiltro = 'Concluído')">
                <v-icon style="color: #3aaa3e">mdi-account-check-outline</v-icon>
              </v-btn>
            </template>
            <span>Concluídos</span>
          </v-tooltip>
          <v-icon @click="openDialogContato = true" style="       margin-top: 1%;
    font-size: 169%;
    margin-bottom: 0%;
    left: 7%;
    color: black;
" id="clerico">
            mdi-plus
          </v-icon>
        </v-row>

        <br>

        <v-list dense>
          <v-row>
            <v-icon
              @click="buscarContato(filtroSelecionado, estadoContatoFiltro, offset -= 100), contador > 1 ? contador-- : contador = 1"
              class="imageIcon" style="left: 10%;
    margin-bottom: -1%; color: black;
">
              mdi-arrow-left</v-icon>
            <h1 style="    position: relative;
    left: 32%;
    bottom: 3%;
    margin-top: 3%;
    font-size: 15px;">Página {{ contador }}</h1>
            <v-icon @click="buscarContato(filtroSelecionado, estadoContatoFiltro, offset += 100), contador++"
              class="imageIcon" style="    left: 55%;
    margin-bottom: -1%;  color: black">
              mdi-arrow-right</v-icon>
          </v-row>
          <div style="    margin-left: -7%;
    margin-right: -15%; background-color: #f5f5f5;">
            <v-card-text style="    margin-bottom: -10%; margin-right: 3%; background-color: #f5f5f5 !important;">
              <!-- TextField no topo -->
              <v-text-field v-model="filtroValor" placeholder="Pesquisar contato" prepend-inner-icon="mdi-magnify" solo
                flat hide-details class="searchField"
                @input="buscarContato(filtroSelecionado, estadoContatoFiltro, 0)" />

            </v-card-text>
          </div>
          <br>
          <v-list-item-group v-model="selectedContact">


            <v-list-item v-for="(contact, index) in contacts" :key="index" class="Itemsidebar">
              <v-list-item-content>
                <v-list-item-title @click="selectContact(contact.telefone)">
                  <v-icon :style="{
                    color: getEstadoColor(contact.estado),
                    fontSize: '50px',
                    marginBottom: '-9%'
                  }">
                    mdi-account-circle
                  </v-icon>
                  <b style="text-align: start !important; color: black"> {{ contact.nome }}</b>
                  <br>

                  <a style="    margin-left: 21%;
                  font-size: 12px;
                  color: black;">{{ contact.ultimamsg }}</a>
                  <v-icon v-if="contact.estadomsg === 'novamsg'" color="#25D366"
                    style="font-size: 15px; left: 3%;">mdi-checkbox-blank-circle
                  </v-icon>

                  <v-icon v-if="contact.estado && contact.estado.startsWith('mdi-')" :style="{
                    color: contact.estado === 'mdi-checkbox-marked-circle-outline'
                      ? '#8bff9a'
                      : contact.estado === 'mdi-cancel'
                        ? 'red'
                        : 'black'
                  }">
                    {{ contact.estado }}
                  </v-icon>
                  <br>
                  <a style="margin-left: 21%; color: #8f8f8f !important;">{{ contact.datahora }}</a>
                  <hr>

                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>

        <!--<img src="../assets/Logo_Meso_vetorizada.png" class="logo" />-->


      </v-navigation-drawer>

      <img src="../assets/PlugPhoneCentro.png" class="plugPhone" />

      <v-main style="padding: 0px; background: #ffffff; height: 100vh; display: absolute; flex-direction: column;">
        <v-container fluid>
          <v-row class="header">
            <v-icon class="informacaoHeader">mdi-account-circle</v-icon>
            <h3 style="          margin-left: 6% !important;
    font-size: 15px;
    margin-top: 10px !important;
    color: black !important;"> {{ editaNome }}</h3>
          </v-row>


          <v-row style="margin-right: 25%;">
            <v-col cols="12" md="12" style="padding: 0%;">
              <!-- 🔎 BUSCA FIXA -->

              <div class="messages gradient-bg" ref="messages"
                style="margin-left: 4%;margin-right: 2%;max-height: 80vh;overflow-y: auto;">
                <v-tooltip top>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn v-bind="attrs" v-on="on" class="carregarMensagens" @click="receiveAllMessages()">
                      <v-icon>mdi-message-text-clock-outline</v-icon>
                    </v-btn>
                  </template>
                  <span>Carregar Todas as Mensagens do Contato</span>
                </v-tooltip>
                <div v-for="(message, index) in messages" :key="index" :ref="'msg-' + index">


                  <!-- ✅ bloco da data -->
                  <div v-if="shouldShowDate(index)" class="date-divider">
                    {{ formatDateLabel(message.datetime) }}
                  </div>

                  <!-- ✅ sua mensagem normal -->
                  <div :class="{
                    'message-requester': !isAgent(message.sender),
                    'message-agent': isAgent(message.sender),
                  }">

                    <div :class="{
                      buttonSender: !isAgent(message.sender),
                      button: isAgent(message.sender),
                    }" :style="{ 'text-align': isAgent(message.sender) ? 'end' : 'start' }">

                      <span :class="{
                        tituloSender: !isAgent(message.sender),
                        titulo: isAgent(message.sender),
                      }">
                        <div><b id="tituloMsg">{{ message.sender }}:</b></div>
                      </span>

                      <span class="message-text">

                        <!-- IMAGEM -->
                        <span v-if="message.isImage">
                          <div class="media-wrap">
                            <img :src="message.text" alt="Imagem" class="chat-media"
                              :class="{ 'media-selected': selectedMedia === message.text }"
                              @click="openMedia(message.text, 'image')" />

                            <v-icon class="media-zoom-icon" color="white">
                              mdi-magnify-plus-outline
                            </v-icon>
                          </div>
                          <br />
                        </span>

                        <!-- AUDIO -->
                        <span v-else-if="message.isAudio">
                          <audio controls>
                            <source :src="message.text" type="audio/mpeg" />
                            Seu navegador não suporta o elemento de áudio.
                          </audio>
                        </span>
                        <!-- VIDEO -->
                        <span v-else-if="message.isVideo">

                          <div class="video-card" @click="abrirVideo(message.text)">

                            <v-icon class="video-icon">mdi-play-circle</v-icon>

                            <div class="video-info">
                              <div class="video-title">Vídeo recebido</div>
                              <div class="video-sub">Clique para abrir</div>
                            </div>

                          </div>

                        </span>


                        <span v-else-if="message.isDocument">
                          <div class="doc-card" @click="downloadFile(message.text)">
                            <v-icon class="doc-icon">mdi-file-document-outline</v-icon>

                            <div class="doc-info">
                              <div class="doc-name">{{ message.fileName }}</div>
                              <div class="doc-sub">Clique para abrir</div>
                            </div>

                            <v-icon class="doc-download">mdi-open-in-new</v-icon>
                          </div>
                        </span>



                        <!-- TEXTO NORMAL -->
                        <span v-else>
                          <span v-html="highlightText(message.text)"></span><br />
                        </span>


                        <!-- 👇 AQUI É O LUGAR CERTO DO BOTÃO -->
                        <div v-if="isAgent(message.sender)
                          && index === messages.length - 1
                          && !message.isImage
                          && !message.isAudio
                          && !message.isDocument" style="text-align: end; margin-top: 4px;">

                          <v-btn x-small icon color="#ffffffcc"
                            @click="dialogEdit = true, messageId = message.messageId">
                            <v-icon size="16">mdi-pencil</v-icon>
                          </v-btn>


                        </div>

                        <!-- HORÁRIO -->
                        <div :style="{ 'text-align': isAgent(message.sender) ? 'end' : 'start' }">
                          <data style="font-size: 12px; color: #ffffff">
                            {{ formatTime(message.datetime) }}
                          </data>
                        </div>

                      </span>


                    </div>
                  </div>
                </div>
              </div>

            </v-col>
          </v-row>

          <!-- Botão de seta para descer -->
          <div style="    position: absolute;
    left: 4%;
    bottom: 16%;">
            <v-btn icon color="#6d6d6d;" @click="scrollToBottom" style="z-index: 999;">
              <v-icon style="font-size: 35px; color: #000000a1">mdi-arrow-down-circle</v-icon>
            </v-btn>
          </div>
        </v-container>
      </v-main>


      <div class="info" style="background-color: #f5f5f5 !important;
  border-color: #f5f5f5 !important;
  position: fixed;
  right: 0;
  width: 22%;
  height: 95%;
  bottom: 0;
  overflow-y: auto;
  padding: 1%;
  border-style: inset;
  border-width: thin;
  border-radius: 0;
">
        <div class="chat-search-fixed">
          <v-text-field v-model="searchText" placeholder="Buscar na conversa..." dense outlined hide-details
            @input="buscarMensagens"></v-text-field>

          <v-btn icon @click="prevMatch">
            <v-icon>mdi-chevron-up</v-icon>
          </v-btn>

          <v-btn icon @click="nextMatch">
            <v-icon>mdi-chevron-down</v-icon>
          </v-btn>
        </div>
        <div style="padding: 10px;">
          <v-data-table :items="dados" :items-per-page="1" hide-default-footer class="responsive-table"
            style="background: #f5f5f5;">
            <template v-slot:item="{ item }">
              <div class="table-row" style="display: inline-grid; margin-top: -5%;">
                <div v-for="(header, index) in informacao" :key="index">
                  <br><strong>{{ header.text }}:<br></strong> {{ item[header.value] }}
                </div>
              </div>
            </template>
          </v-data-table>
          <br>

          <!-- LISTAGEM DE ATENDIMENTOS -->
          <div class="atendimentos-list" style="margin-top: 20px;">
            <v-card v-for="(atendimento, index) in atendimentos" :key="index" elevation="2" class="pa-3 mb-3">
              <v-card-title>
                <v-icon color="green" class="mr-2">mdi-whatsapp</v-icon>
                <span class="font-weight-bold">{{ atendimento.telefone }}</span>
                <v-spacer></v-spacer>
                <v-chip :color="getStatusColor(atendimento.status)" text-color="white" small>
                  {{ atendimento.status }}
                </v-chip>
              </v-card-title>

              <v-card-text style="font-size: 13px;">
                <div><b>Setor origem:</b> {{ atendimento.setor_origem }}</div>

                <div><b>Setor atual:</b> {{ atendimento.setor_atual }}</div>
                <div v-if="atendimento.agente">
                  <b>Agente:</b> {{ atendimento.agente }}
                </div>
                <div v-if="atendimento.agenteTransferido">
                  <b>Agente Transferido:</b> {{ atendimento.agenteTransferido }}
                </div>

                <div><b>Início:</b> {{ atendimento.data_inicio }}</div>
                <div v-if="atendimento.data_fim">
                  <b>Fim:</b> {{ atendimento.data_fim }}
                </div>
                <div v-if="atendimento.id_agente">
                  <b>Atendido por:</b> {{ atendimento.id_agente }}
                </div>
                <div v-if="atendimento.pendencia">
                  <b>Pendência:</b> {{ atendimento.pendencia }}
                </div>
                <div style="margin-left: 25%;">
                  <v-btn @click="enviaAtendimentos()" style="font-size: 10px;
    background-color: white;
    right: 45%;
    color:#2196f3;
    box-shadow: none;"> <b>Mais detalhes</b></v-btn>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </div>




    </v-app>

    <v-btn class="infoBtn" @click="openDialogEdita = true" style="color: black !important">Informações<v-icon
        @click="openDialogForm = true" style="left: 3%;">
        mdi-account-edit
      </v-icon></v-btn>




    <div class="bottom-bar" style="    width: 100%;
    padding-top: 5%;
    position: absolute;
    bottom: 0px;">
      <img src="../assets/PlugPhoneCentro.png" @click="openDialog2 = true" class="imageIcon" style="
   margin-left: 5%;
    width: 35px;
    margin-bottom: -8px;" />

      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-icon class="soHover" v-bind="attrs" v-on="on" color="grey " style="      cursor: pointer;
    font-size: 34px;
    color: #414141 !important;
        left: 5px;
    margin-top: 2px;">
            mdi-plus
          </v-icon>
        </template>

        <div style="background-color: white; display: flex; flex-direction: column; gap: 10px; padding: 10px;">
          <div style="display: flex; align-items: center; cursor: pointer;" class="listaIcon"
            @click="openDialogAnexo = true">
            <v-icon style="font-size: 26px; color: purple; margin-right: 8px;">mdi-file-document</v-icon>
            <span style="color: black">Documentos</span>
          </div>

          <div style="display: flex; align-items: center; cursor: pointer;" class="listaIcon"
            @click="openDialog1 = true">
            <v-icon style="font-size: 26px; color: orangered; margin-right: 8px;">mdi-microphone</v-icon>
            <span style="color:black">Audio</span>
          </div>


          <div style="display: flex; align-items: center; cursor: pointer;" class="listaIcon"
            @click="openDialog = true">
            <v-icon style="font-size: 26px; color: #2b5b84; margin-right: 8px;">mdi-image</v-icon>
            <span style="color:black">Imagem</span>
          </div>

          <div style="display: flex; align-items: center; cursor: pointer;" class="listaIcon"
            @click="openDialogVideo = true">
            <v-icon style="font-size: 26px; color: red; margin-right: 8px;">mdi-video</v-icon>
            <span style="color:black">Vídeo</span>
          </div>



        </div>
      </v-menu>

      <v-icon ref="emojiButton" @click="toggleEmojiPicker" class="imageIcon"
        style="left: 13px; font-size: 195%; color: #b76600;">
        mdi-emoticon-outline
      </v-icon>

      <div v-if="showEmojiPicker" ref="emojiPicker"
        style="position: fixed; bottom: 5%; left: 25%; z-index: 9999; background: white; border-radius: 10px; box-shadow: rgba(0,0,0,0.2) 0px 0px 8px;">
        <emoji-picker @emoji-click="onEmojiClick"></emoji-picker>
      </div>

      <v-textarea v-model="newMessage" :maxlength="1000" counter @keydown.enter="handleEnter($event)"
        placeholder="Digite uma mensagem" class="input-message" auto-grow
        style="left: 53px; bottom: 63%; width: 67%; border-radius: 1px; border-style: unset;  resize: none; overflow-y: auto;"
        rows="1"></v-textarea>
      <v-icon @click="openDialogForm = true" class="imageIcon" style="    left: 25px;
    font-size: 169%;
    color: #2b5b84;">
        mdi-account-convert
      </v-icon>

      <v-icon class="imageIcon" style="    left: 35px;
    font-size: 169%;
    color: rgb(58, 170, 62);" @click="openDialogConcluirPendente = true">
        mdi-checkbox-marked-circle</v-icon>


      <!-- Ícone que abre o emoji picker -->


      <!-- Picker de Emojis -->
      <div v-if="showEmojiPicker"
        style="position: fixed;bottom: 5%;left: 25%;z-index: 9999;background: white;border-radius: 10px;box-shadow: rgba(0, 0, 0, 0.2) 0px 0px 8px;">
        <emoji-picker @emoji-click="onEmojiClick"></emoji-picker>
      </div>

      <!-- <v-icon @click="openDialog = true" class="imageIcon" style="left: 94%">mdi-image</v-icon>-->
      <v-dialog v-model="dialogEdit" max-width="500px" persistent>
        <v-card class="dialogo">
          <v-card-title>Editar Mensagem</v-card-title>
          <v-text-field v-model="novaMsgEditada" label="Digite a nova mensagem" style="width: 90%;
    margin-left: 5%;"></v-text-field>
          <v-row class=" linhaBtn">
            <v-card-actions>
              <v-btn color="primary" @click="editarMensagem(novaMsgEditada)">Enviar</v-btn>
            </v-card-actions>
            <v-card-actions>
              <v-btn color="primary" @click="dialogEdit = false">Fechar</v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-dialog>


      <v-dialog v-model="openDialog" max-width="500px" persistent>
        <v-card class="dialogo">
          <v-card-title>Enviar Imagem</v-card-title>
          <v-card-text>
            <v-file-input v-model="selectedFile" label="Escolha uma imagem"></v-file-input>
          </v-card-text>
          <v-row class="linhaBtn">
            <v-card-actions>
              <v-btn color="primary" @click="uploadImage">Enviar</v-btn>
            </v-card-actions>
            <v-card-actions>
              <v-btn color="primary" @click="openDialog = false">Fechar</v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-dialog>



      <v-dialog v-model="OpenDialogGLPI" max-width="500px" persistent>
        <v-card class="dialogo">
          <v-card-title>Abrir chamado</v-card-title>
          <v-card-text>
            <v-text-field style="color: black" v-model="nameGLPI" label="Digite o nome do seu chamado"></v-text-field>
          </v-card-text>
          <v-card-text>
            <v-text-field style="color: black" v-model="content" label="Digite a content do seu chamado"></v-text-field>
          </v-card-text>
          <v-row class="linhaBtn">
            <v-card-actions>
              <v-btn color="primary" @click="enviaChamado()">Enviar</v-btn>
            </v-card-actions>
            <v-card-actions>
              <v-btn color="primary" @click="OpenDialogGLPI = false">Fechar</v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-dialog>

      <v-dialog v-model="openDialogFiltrado" max-width="500px" persistent>
        <v-card class="dialogoZap">
          <v-card-title class="text-h6">Qual Filtro Você Deseja?</v-card-title>

          <v-card-text>
            <!-- TextField no topo -->
            <v-text-field v-model="filtroValor" label="Digite o valor do filtro" outlined class="mb-4"
              @input="buscarContato(filtroSelecionado, estadoContatoFiltro, 0)"></v-text-field>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn color="secondary" text
              @click="openDialogFiltrado = false;  /*filtroValor=''; buscarContato('', estadoContatoFiltro);*/">
              Fechar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>



      <v-dialog v-model="openDialogContato" max-width="500px" persistent>
        <v-card>
          <v-card-title>Adicionar Contatos</v-card-title>
          <v-card-text>
            <v-text-field v-model="novoNome" label="Digite o nome do seu contato"></v-text-field>
          </v-card-text>
          <v-card-text>
            <v-text-field v-model="novoNum" label="Número com DDD"
              hint="Ex: 553187654321 (sem o 9 após o DDD)"></v-text-field>
          </v-card-text>
          <v-card-text>

            <v-select :items="setor" label="Setor" v-model="setorSelect" @update:modelValue="listar(setorSelect)">
            </v-select>
          </v-card-text>
          <v-card-text>

            <v-text-field v-model="novoEmail" label="Digite o email do seu contato"></v-text-field>
          </v-card-text>

          <v-card-text>


            <v-text-field v-model="novoEmpresa" label="Digite a empresa do seu contato"></v-text-field>


          </v-card-text>
          <v-row class="linhaBtn">
            <v-card-actions>
              <v-btn color="primary" @click="addContato">Enviar</v-btn>
            </v-card-actions>
            <v-card-actions>
              <v-btn color="primary" @click="openDialogContato = false">Fechar</v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-dialog>

      <v-dialog v-model="openDialogEdita" max-width="500px" persistent>
        <v-card>
          <v-card-title>Editar Contatos</v-card-title>
          <v-card-text>
            <v-text-field v-model="editaNome" label="Digite o nome do seu contato"></v-text-field>
          </v-card-text>

          <v-card-text>

            <v-text-field v-model="editaNum" label="Número com DDD"
              hint="Ex: 553187654321 (sem o 9 após o DDD)"></v-text-field>
          </v-card-text>
          <v-card-text>

            <v-select :items="setor" label="Setor" v-model="setorSelect" @update:modelValue="listar(setorSelect)">
            </v-select>
          </v-card-text>
          <v-card-text>

            <v-text-field v-model="editaEmail" label="Digite o email do seu contato"></v-text-field>
          </v-card-text>

          <v-card-text>


            <v-text-field v-model="editaEmpresa" label="Digite a empresa do seu contato"></v-text-field>


          </v-card-text>
          <v-row class="linhaBtn">
            <v-card-actions>
              <v-btn color="primary" @click="editaContato()">Enviar</v-btn>
            </v-card-actions>
            <v-card-actions>
              <v-btn color="primary" @click="openDialogEdita = false">Fechar</v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-dialog>

      <!--<v-icon @click="openDialog = true" class="imageIcon" style="left: 95%">mdi-image</v-icon>  -->

      <v-dialog v-model="openDialog1" max-width="500px" persistent>
        <v-card class="dialogo1">
          <v-card-title>Grave seu áudio</v-card-title>
          <v-card-text>
            <v-btn @click="startRecording" :disabled="isRecording" class="btnAudio">
              Iniciar Gravação <v-icon>mdi-play</v-icon>
            </v-btn>
            <v-btn @click="stopRecording" :disabled="!isRecording" class="btnAudioStop">
              Parar Gravação <v-icon>mdi-stop</v-icon>
            </v-btn>
            <audio v-if="audioUrl" :src="audioUrl" controls></audio>
          </v-card-text>
          <v-row class="linhaBtn">
            <v-card-actions>
              <v-btn color="primary" @click="uploadAudio">Enviar</v-btn>
            </v-card-actions>
            <v-card-actions>
              <v-btn color="primary" @click="openDialog1 = false">Fechar</v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-dialog>

      <v-dialog v-model="openDialogAnexo" max-width="500px" persistent>
        <v-card class="dialogo">
          <v-card-title>Enviar Documento</v-card-title>
          <v-card-text>
            <v-file-input v-model="selectedFile" label="Escolha um documento"></v-file-input>
          </v-card-text>
          <v-row class="linhaBtn">
            <v-card-actions>
              <v-btn color="primary" @click="uploadDocumento">Enviar</v-btn>
            </v-card-actions>
            <v-card-actions>
              <v-btn color="primary" @click="openDialogAnexo = false">Fechar</v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-dialog>

      <v-dialog v-model="openDialogVideo" max-width="500px" persistent>
        <v-card class="dialogo">
          <v-card-title>Enviar Vídeo</v-card-title>
          <v-card-text>
            <v-file-input v-model="selectedFile" label="Escolha um vídeo"></v-file-input>
          </v-card-text>
          <v-row class="linhaBtn">
            <v-card-actions>
              <v-btn color="primary" @click="uploadVideo">Enviar</v-btn>
            </v-card-actions>
            <v-card-actions>
              <v-btn color="primary" @click="openDialogVideo = false">Fechar</v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-dialog>

      <v-dialog v-model="openDialog2" max-width="700px">
        <v-card class="dialogoZap">
          <v-card-title>Qual a forma que deseja entrar em contato</v-card-title>
          <v-card-text>
            <v-row class="linhaContato">

              <v-btn @click=" sendTemplate(), openDialog2 = false" class="btnAudio">
                Whatsapp <v-icon>mdi-whatsapp</v-icon>
              </v-btn>
              <v-btn @click="openDialogLigacao = true, openDialog2 = false" class="btnCall"
                style="color: white !important;">
                Ligação <v-icon>mdi-phone</v-icon>
              </v-btn>
              <audio v-if="audioUrl" :src="audioUrl" controls></audio>
            </v-row>
          </v-card-text>

        </v-card>
      </v-dialog>


      <!------------------------------------------------------------------------->

      <v-dialog v-model="openDialogLigacao" max-width="500px" persistent>
        <v-card class="dialogo1">
          <v-card-title>Por favor digite seu Ramal</v-card-title>

          <v-row class="linhaBtnCall">
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <br>
            <v-card-actions style="padding-left: 1%;">
              <v-btn @click="ligar()" class="btnCall">
                Ligar <v-icon>mdi-phone</v-icon>
              </v-btn>
            </v-card-actions>
            <v-card-actions style="padding-left: 10%; ">
              <v-btn color="primary" @click="openDialogLigacao = false"
                style="background-color: #e74343 !important; color: white !important;">Cancelar</v-btn>
            </v-card-actions>
          </v-row>
        </v-card>
      </v-dialog>

      <!------------------------------------------------------------------------->

      <v-dialog v-model="openDialogRamal" max-width="500px" persistent>
        <v-card>
          <v-card-title class="text-h6">
            Para tornar-se disponível, digite seu ramal
          </v-card-title>

          <v-card-text>
            <!-- Aqui vai seu campo de ramal -->
            <v-text-field label="Ramal" v-model="ramal" />
          </v-card-text>

          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" @click="ramalDigitado()">Confirmar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-------------------------------------------------------------------------->

      <v-dialog v-model="openDialogConcluir" max-width="500px" persistent>
        <v-card class="dialogoZap">
          <v-card-title>Deseja Concluir o atendimento?</v-card-title>
          <br>



          <v-card-text>
            <v-row class="linhaContatoConcluir">

              <v-btn @click="finalizar(finaliza = true), openDialogConcluir = false" class="btnAudio"
                v-model="finaliza">
                Concluir! <v-icon> mdi-checkbox-marked-circle-outline</v-icon>

              </v-btn>
              <v-btn @click="finalizar(finaliza = false), openDialogConcluir = false" class="btnAudioStop">
                Cancelar <v-icon> mdi-cancel</v-icon>
              </v-btn>


            </v-row>


            <br>

          </v-card-text>

        </v-card>

      </v-dialog>

      <v-dialog v-model="openDialogConcluirPendente" max-width="500px" persistent>
        <v-card class="dialogoZap">
          <v-card-title>Deseja Concluir o atendimento?</v-card-title>

          <v-card-text>
            <v-text-field v-model="pendencia" label="Digite sua Pendência" style="    width: 88%;
    padding-left: 12%;"></v-text-field>

            <v-row class="linhaContatoConcluir">
              <v-btn @click="finalizarPendente(finaliza = true), openDialogConcluirPendente = false" class="btnAudio"
                v-model="finaliza">
                Concluir! <v-icon> mdi-checkbox-marked-circle-outline</v-icon>

              </v-btn>
              <v-btn @click="finalizarPendente(finaliza = false), openDialogConcluirPendente = false"
                class="btnAudioStop">
                Cancelar <v-icon> mdi-cancel</v-icon>
              </v-btn>


            </v-row>


            <br>

          </v-card-text>

        </v-card>

      </v-dialog>
      <v-dialog v-model="openDialogForm" max-width="500px" persistent>
        <v-card>
          <v-card-title>Transferir Contato</v-card-title>
          <v-row class="linhaContatoConcluir">
            <v-select :items="setor" label="Setor" v-model="setorSelect" @update:modelValue="listar(setorSelect)"
              class="filtro">
              class="filtro"></v-select>
            <v-select :items="items" label="Operadores" v-model="usuarioSelect" class="filtro"></v-select>
          </v-row>
          <v-card-actions>
            <v-btn @click="transferir()" color="primary">Transferir</v-btn>
            <v-btn @click="openDialogForm = false" color="error">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>


      <v-dialog v-model="openDialogEnviando" max-width="500px" persistent>
        <v-card>
          <v-card-title>Enviando, por favor aguarde</v-card-title>
          <br>
          <v-row class="loading">
            <v-progress-circular indeterminate color="primary"></v-progress-circular>

          </v-row>
          <br>
          <br>
          <br>
        </v-card>
      </v-dialog>
    </div>
    <v-dialog v-model="mediaDialog" max-width="900px">
      <v-card style="background: #111;">
        <v-card-title style="color: white; display: flex; justify-content: space-between;">
          <span>Visualização</span>

          <v-btn icon @click="mediaDialog = false">
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <div v-if="mediaType === 'image'" style="text-align: center;">
            <img :src="mediaSrc" style="max-width: 100%; max-height: 70vh; border-radius: 14px;" />
          </div>

          <div v-else-if="mediaType === 'audio'">
            <audio controls autoplay style="width: 100%;">
              <source :src="mediaSrc" type="audio/mpeg" />
              Seu navegador não suporta o elemento de áudio.
            </audio>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>

</template>

<script>
import { api } from "@/conf/api";
import lamejs from 'lamejs';
import RecordRTC from 'recordrtc';
import io from 'socket.io-client';
import Navbar from "../components/Navbar.vue";
//import { Picker } from 'emoji-mart-vue'
import 'emoji-picker-element'
//import { apiWP } from "@/conf/apiWP";






// Certifique-se de incluir o script libmp3lame.js no seu projeto e carregá-lo corretamente.

export default {
  async mounted() {
    document.addEventListener("click", this.handleClickOutside)

  },
  async beforeMount() {

    this.buscaCidadao();
    let usuario = JSON.parse(localStorage.getItem('usu'));
    this.tipo = usuario.tipo;
    this.usuario = usuario.usuario
    this.ramal = usuario.ramal
    this.id_empresa = usuario.id_empresa
    //this.idsetinterval = setInterval(() => this.buscarContato(), 5000);
    this.buscarContato(this.filtroSelecionado, "Todos");
    this.logar();
    const token = sessionStorage.getItem("jwt");
    console.log("Token no beforeMount:", token);
    if (!usuario || !token) {
      this.$router.push("/");
      return;
    }
    let emp = await api.get(`/empresa/${this.id_empresa}`);
    this.empresa = emp.data.dados[0].empresa;
    console.log('empresa, eu sou empresa', this.empresa)
  },

  async enviaChamado() {
    let chamado = {
      "name": this.nameGLPI,
      "content": this.content
    }
    console.log(chamado)
    let postChamado = await api.post(`/geraChamado`, chamado)
    console.log(postChamado)


  },

  async beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside)

    console.log('sol apareça')

    console.log("eu sou idsetinterval", this.idsetinterval);
    clearInterval(this.idsetinterval);
    this.idsetinterval = 0;

    console.log("Desconectando socket...");
    this.socket.disconnect();
  },

  data() {
    return {
      headers: [
        {
          text: 'ano',
          align: 'start',
          sortable: false,
          value: 'ano',
          openDialogFiltrado: false,
        },
        { text: 'orgao', value: 'orgao' },
        { text: 'processo', value: 'processo' },
        { text: 'liquidação', value: 'liguidacao' },
        { text: 'valor da face', value: 'valor_da_face' },
        { text: 'credor', value: 'credor' },
        { text: 'documento', value: 'documento' },
        { text: 'idade', value: 'idade' },
        { text: 'renda', value: 'renda' },
        { text: 'tipo', value: 'tipo' },
        { text: 'telefone', value: 'telefone' },
      ],
      informacao: [
        {
          text: 'Nome',
          align: 'start',
          sortable: false,
          value: 'nome',
        },
        { text: 'Telefone', value: 'telefone' },
        { text: 'Setor', value: 'setor' },
        { text: 'Agente associado', value: 'usuario' },
        { text: 'Email', value: 'email' },
        { text: 'Empresa', value: 'empresa' },

      ],
      searchText: '',
      matchedIndexes: [],
      currentMatchIndex: -1,
      messages: [],
      openDialogVideo: false,
      dialogEdit: false,
      empresa: "",
      dialogDetalhes: false,
      id_empresa: "",
      offset: 0,
      pendencia: "",
      rama: "",
      setor: ['Técnico', 'Comercial', 'Financeiro', 'Admin'],
      setorSelect: "",
      novoNome: "",
      editaNome: "",
      editaNum: "",
      OpenDialogGLPI: false,
      content: "",
      nameGLPI: "",
      editaEmpresa: "",
      filtroValor: "",
      openDialogEnviando: false,
      editaEmail: "",
      novoNum: "",
      openDialogFiltrado: false,
      openDialogConcluirPendente: false,
      filtroSelecionado: "",
      agents: [],
      showEmojiPicker: false,
      observacao: "",
      messageId: "",
      openDialogLigacao: false,
      openDialogEdita: false,
      openDialogContato: false,
      openDialogConcluir: false,
      idsetinterval: null,
      apiWPurl: api.defaults.baseURL,
      name: "template_plugphone2",
      wppnum: "0",
      ramal: "",
      items: [
        { title: 'Click Me' },
        { title: 'Click Me' },
        { title: 'Click Me' },
        { title: 'Click Me 2' },
      ], openDialogRamal: false,
      plataforma: "",
      openDialog: false,
      contador: 1,

      openDialogAnexo: false,
      openDialog1: false,
      openDialog2: false,
      openDialogForm: false,
      tipo: null,
      selectedFile: null,
      colors: [
        "#243E57",
        "#61A5E8",
        "#C62828",
        "#D4A017",
        "#2E7D32",
        "#000000",
        "#3e3e3e",
        "purple",
        "#ff4700"
      ],
      whatsapp: "whatsapp",
      mediaDialog: false,
      mediaSrc: "",
      mediaType: "",
      novaMsgEditada: "",
      selectedMedia: null,

      usuarioSelect: "",
      novoEmpresa: "",
      novoEmail: "",
      telefone: "telefone",
      processo: [],
      socket: "",
      usuario: "",
      finaliza: "",
      estadoContatoFiltro: "Todos",
      atendimentos: [],
      estadoContatoAtual: "Todos",
      newMessage: "",
      audioBlob: "",
      contacts: [],
      dados: [],
      dados2: [],
      selectedContact: null,
      link: " ",
      id: " ",
      isRecording: false,
      audioUrl: null,
      recorder: null,
      atendeu: false,
      reagendar: false,
      interesse: false,
      negociar: false,
      modoEdicao: false,
      textoInput: "",
      mensagemParaEditar: null
    };
  },
  created() {
    this.socket = io('https://meso.plugphone.cloud:3333');

    // Evento para mensagens de texto
    /* this.socket.on('chat message', (nome, msg) => {
       this.messages.push({ text: msg, sender: nome });
     });*/

    // Evento para imagens

    this.socket.on("erro", (mensagem) => {
      // toca o som
      const audio = new Audio("/notify.wav"); // coloque o arquivo em /public
      audio.play().catch(err => console.warn("Erro ao tocar áudio:", err));

      // mostra a notificação
      if (Notification.permission === "granted") {
        new Notification("PlugPhone", {
          body: mensagem,
          icon: "/icone.png", // opcional
        });
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((perm) => {
          if (perm === "granted") {
            new Notification("PlugPhone", { body: mensagem, icon: "/icone.png" });
          }
        });
      }
    });



    this.socket.on('chat message', async (nome, msg, telefone) => {
      console.log('recebi no socket', nome, msg, telefone)
      this.contact = []
      this.verificaMensagem(telefone, this.tipo, this.usuario)

      console.log('sou o telefone e o wppnum', telefone, this.wppnum)
      if (telefone == this.wppnum) {

        this.messages.push({
          text: msg, sender: nome, datetime: new Date().toLocaleString("pt-BR")

        });
        console.log('recebi!', telefone, this.wppnum);
        // this.playSound();
        this.lido(telefone);
        let a = await api.get(`/lidamsg/${this.wppnum}`);
        console.log(a);
        this.scrollToBottom(); // 🔥 Rola para baixo ao receber mensagem
        this.buscarContato(this.filtroSelecionado, this.estadoContatoAtual, this.offset)

      } else {
        //  this.playSound();
        console.log('foi aqui não my badkkkkkkkkk');
        this.mudaEstado(telefone);
        this.buscarContato(this.filtroSelecionado, this.estadoContatoAtual, this.offset)

      }
      this.atendimentos = []
      let atendimentoArray = await api.get(`buscarAtendimentos/${this.wppnum}/${this.id_empresa}`)
      console.log('acho que dos 60 ate o 70', atendimentoArray)

      this.atendimentos = atendimentoArray.data.dados
      console.log('Tecnologia', this.atendimentos)
    });


    this.socket.on('chat image', async (nome, base64Image, telefone) => {
      this.buscarContato(this.filtroSelecionado, this.estadoContatoAtual, this.offset)
      console.log('eu sou o telefone', telefone)

      console.log("Imagem recebida em Base64:", base64Image);
      if (telefone == this.wppnum) {

        console.log('EU TO AQUIIIIIIIIIIIIIIIIIIIIIIIIII')
        // Verifique se base64Image está no formato correto
        if (base64Image.startsWith('data:image')) {
          const imageUrl = base64Image; // Usa a imagem diretamente como URL

          console.log("URL da imagem gerada:", imageUrl);

          // Teste abrindo em uma nova aba
          //window.open(imageUrl, '_blank');
          //this.playSound()
          this.lido(telefone)
          let a = await api.get(`/lidamsg/${this.wppnum}`,);
          console.log(a)

          this.messages.push({
            text: imageUrl,
            isImage: true,
            sender: nome,
            datetime: new Date().toLocaleString("pt-BR")

          });
        } else {
          console.error("Formato de imagem inválido ou Base64 ausente.");
        }


      } else {
        //this.playSound()
        console.log('foi aqui não my badkkkkkkkkk')
        this.mudaEstado(telefone)
      }
      this.atendimentos = []
      let atendimentoArray = await api.get(`buscarAtendimentos/${this.wppnum}/${this.id_empresa}`)
      console.log('acho que dos 60 ate o 70', atendimentoArray)

      this.atendimentos = atendimentoArray.data.dados
      console.log('Tecnologia', this.atendimentos)
    }
    );


    this.socket.on('chat video', async (nome, videoUrl, telefone) => {

      this.buscarContato(this.filtroSelecionado, this.estadoContatoAtual, this.offset)

      console.log("video recebido:", videoUrl);

      if (telefone == this.wppnum) {

        this.lido(telefone)
        let a = await api.get(`/lidamsg/${this.wppnum}`);
        console.log(a)
        this.messages.push({
          text: videoUrl,
          isVideo: true,
          sender: nome,
          datetime: new Date().toLocaleString("pt-BR")
        });

      } else {

        this.mudaEstado(telefone)

      }

      this.atendimentos = []
      let atendimentoArray = await api.get(`buscarAtendimentos/${this.wppnum}/${this.id_empresa}`)
      this.atendimentos = atendimentoArray.data.dados
    });

    this.socket.on('chat audio', async (nome, base64Audio, telefone) => {
      this.buscarContato(this.filtroSelecionado, this.estadoContatoAtual, this.offset)
      console.log("audio recebida em Base64:", base64Audio);
      if (telefone == this.wppnum) {
        console.log('EU TO AQUIIIIIIIIIIIIIIIIIIIIIIIIII')
        // Verifique se base64Image está no formato correto
        // Verifique se base64Audio está no formato correto
        if (base64Audio.startsWith('data:audio')) {
          const audioUrl = base64Audio; // Usa a audio diretamente como URL

          console.log("URL da audio gerada:", audioUrl);

          // Teste abrindo em uma nova aba
          //window.open(audioUrl, '_blank');
          // this.playSound()
          this.lido(telefone)
          let a = await api.get(`/lidamsg/${this.wppnum}`,);
          console.log(a)
          this.messages.push({
            text: audioUrl,
            isAudio: true,
            sender: nome,
            datetime: new Date().toLocaleString("pt-BR")
          });
        } else {
          console.error("Formato de imagem inválido ou Base64 ausente.");
        }

      } else {
        //this.playSound()
        console.log('foi aqui não my badkkkkkkkkk')
        this.mudaEstado(telefone)
      }
      this.atendimentos = []
      let atendimentoArray = await api.get(`buscarAtendimentos/${this.wppnum}/${this.id_empresa}`)
      console.log('acho que dos 60 ate o 70', atendimentoArray)

      this.atendimentos = atendimentoArray.data.dados
      console.log('Tecnologia', this.atendimentos)
    }

    )
  },


  comments: {
    Navbar
  },
  watch: {
    setorSelect(novoValor) {
      if (novoValor) {
        this.listar(novoValor);
      }
    }
  },
  methods: {
    getStatusColor(status) {
      switch (status) {
        case 'Concluído':
          return 'green'

        case 'Transferido':
          return 'blue'
        case 'Novo':
          return 'orange'
        case 'Em Andamento':
          return 'red'
        default:
          return 'grey'
      }
    },
    highlightText(text) {
      if (!this.searchText) return text

      const regex = new RegExp(`(${this.searchText})`, 'gi')
      return text.replace(regex, `<mark class="chat-highlight">$1</mark>`)
    },
    abrirVideo(url) {

      if (!url) return;

      // se já for URL completa
      if (url.startsWith("http")) {
        window.open(url, "_blank");
        return;
      }

      // se for só "id.mp4"
      const fullUrl = `https://meso.plugphone.cloud:4444/get-video/${url}`;
      window.open(fullUrl, "_blank");
    }
    ,
    buscarMensagens() {
      this.matchedIndexes = []
      this.currentMatchIndex = -1

      if (!this.searchText) return

      const termo = this.searchText.toLowerCase()

      this.messages.forEach((msg, index) => {
        if (
          !msg.isImage &&
          !msg.isAudio &&
          !msg.isDocument &&
          msg.text &&
          msg.text.toLowerCase().includes(termo)
        ) {
          this.matchedIndexes.push(index)
        }
      })

      if (this.matchedIndexes.length) {
        this.currentMatchIndex = 0
        this.scrollToMatch()
      }
    },

    nextMatch() {
      if (!this.matchedIndexes.length) return
      this.currentMatchIndex =
        (this.currentMatchIndex + 1) % this.matchedIndexes.length
      this.scrollToMatch()
    },

    prevMatch() {
      if (!this.matchedIndexes.length) return
      this.currentMatchIndex =
        (this.currentMatchIndex - 1 + this.matchedIndexes.length) %
        this.matchedIndexes.length
      this.scrollToMatch()
    },

    scrollToMatch() {
      this.$nextTick(() => {
        const index = this.matchedIndexes[this.currentMatchIndex]
        const el = this.$refs['msg-' + index]?.[0]
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
    },

    openMedia(src, type) {
      this.selectedMedia = src;
      this.mediaSrc = src;
      this.mediaType = type;
      this.mediaDialog = true;
    },
    downloadFile(url, filename) {
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || `documento_${Date.now()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },

    async editarMensagem(novaMsgEditada) {
      console.log("Editar mensagem:");
      console.log('pé na areia, capirinha', this.messageId, novaMsgEditada)

      let msg = {
        to: this.wppnum,
        body: `${this.usuario} \nCorreção: ${novaMsgEditada}`,
        nome: this.usuario,
        idEmpresa: this.id_empresa,
        messageId: this.messageId
      }

      console.log(msg)
      let a = await api.post(`/editarMensagem`, msg)
      console.log(a)
      await this.receiveMessage();
      this.dialogEdit = false;


      // Atualize a lista de mensagens ou faça outras ações necessárias
    }
    ,

    getEstadoColor(estado) {
      const cores = {
        "Aguardando Cliente": "#243E57",                // Azul PlugPhone
        "Novo": "#D4A017",                 // Amarelo
        "Aguardando Atendimento": "#C62828", // Vermelho alerta
        "Concluído": "#2E7D32"             // Verde
      };
      return cores[estado] || "#BFC4CA";   // Cinza default
    },



    randomColor() {
      const index = Math.floor(Math.random() * this.colors.length);
      return this.colors[index];
    },

    isAgent(sender) {
      if (!sender || !this.empresa) return false;
      return sender.endsWith(`-${this.empresa}`);
    },

    listar: async function (tipo) {
      this.items = []
      // console.log(this.fila)
      // console.log(filareal, pinreal);
      //Lista filas
      let listafila = await api.get(`/listausuariotipo/${tipo}/${this.id_empresa}`);
      // let entrajoin = join.data.dados;
      console.log(listafila);
      let listatotalfilas = listafila.data.dados;
      console.log('Lista as filas', listatotalfilas);
      let nome = [];
      //let nomefila = [];
      listatotalfilas.forEach((d) => {
        // nomefila = d.descr;
        nome = d.usuario;
        console.log('nome da fila:', nome);
        // this.listafila = [nomefila];
        //this.items = nomefila;
        this.items.push({
          text: `${d.usuario}`,
          token: `${d.token}`,
          tokenM: `${d.tokenMobile}`,       // o que aparece no select
          value: d.nome // o valor que será capturado no v-model

          //value: d.id_agencia // o valor que será capturado no v-model
        });
      });

      //Listando os agentes para o filtro


    },

    async addContato() {
      // limpa tudo que não for número
      this.novoNum = this.novoNum.replace(/\D/g, '')

      const tamanho = this.novoNum.length

      if (tamanho < 12 || tamanho > 13) {
        alert(
          "Número inválido.\nUse:\n• 12 dígitos (55 + DDD + número)\n• 13 dígitos (55 + DDD + 9 + número)"
        )
        this.openDialogContato = true
        return
      }

      let add = {
        nome: this.novoNome,
        telefone: this.novoNum,
        setor: this.setorSelect,
        email: this.novoEmail,
        empresa: this.novoEmpresa,
        idEmpresa: this.id_empresa
      }

      await api.post(`/cadastrarcontato`, add)

      this.buscarContato(this.filtroSelecionado, this.estadoContatoAtual, this.offset)
      this.openDialogContato = false
    },

    async editaContato() {
      this.editaNum = this.editaNum.replace(/\D/g, '')
      const tamanho = this.editaNum.length

      if (tamanho < 12 || tamanho > 13) {
        alert(
          "Número inválido.\nUse:\n• 12 dígitos (55 + DDD + número)\n• 13 dígitos (55 + DDD + 9 + número)"
        )
        this.openDialogEdita = true
        return
      }

      let edit = {
        nome: this.editaNome,
        telefone: this.editaNum,
        setor: this.setorSelect,
        email: this.editaEmail,
        empresa: this.editaEmpresa,
        idEmpresa: this.id_empresa
      }

      await api.post(`/editarcontato`, edit)

      this.buscarContato(this.filtroSelecionado, this.estadoContatoAtual, this.offset)
      this.openDialogEdita = false
    },


    async logar() {
      console.log('this.ramal', this.ramal, this.tipo)

      let login = await api.get(`logar/${this.ramal}/${this.tipo}/${this.usuario}`)

      console.log(login)

    },

    handleEnter(event) {
      // se apertar Shift+Enter, deixa o comportamento normal (quebra de linha)
      if (event.shiftKey) return;

      // evita a quebra de linha padrão quando for só Enter
      event.preventDefault();

      // chama a função de envio
      this.sendMessage();
    },

    async deslogar() {
      console.log('this.ramal', this.ramal, this.tipo)

      let login = await api.get(`deslogar/${this.ramal}/${this.tipo}/${this.usuario}`)
      console.log(login)
      this.$router.push("dashboard");

    },
    async enviaAtendimentos() {
      this.$router.push("atendimentos");

    },
    async ramalDigitado() {
      if (this.ramal == "" || this.ramal == undefined) {
        alert('Seu ramal não pode ser Nulo')
      } else {
        let verRamal = await api.get(`/verificaramal/${this.ramal}`)
        console.log('existe ramal?', verRamal.data.dados[0].ramal)
        console.log('EEEEU SOU SIMPLEEEES :D', this.ramal)
        let pegaRamal = verRamal.data.dados[0].ramal
        console.log('peguei o ramal', pegaRamal)
        if (pegaRamal >= 1) {
          this.openDialogRamal = false
        } else {
          alert('O Ramal não existe')
        }
      }

    },

    verificaEstado() {

      this.openDialogRamal = true
    },

    toggleEmojiPicker() {
      this.showEmojiPicker = !this.showEmojiPicker
    },

    handleClickOutside(event) {
      const picker = this.$refs.emojiPicker
      const button = this.$refs.emojiButton

      if (!picker) return

      const clicouNoPicker = picker.contains(event.target)
      const clicouNoBotao = button && button.$el
        ? button.$el.contains(event.target)
        : button.contains(event.target)

      if (!clicouNoPicker && !clicouNoBotao) {
        this.showEmojiPicker = false
      }
    },



    onEmojiClick(event) {
      this.newMessage += event.detail.unicode
      this.showEmojiPicker = false
    },

    scrollToBottom() {
      console.log('JESUS CRISTO AMEEEEEEEEEEM')
      const el = this.$refs.messages;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    },


    async transferir() {
      let usuario = this.usuarioSelect ? this.usuarioSelect : "undefined";
      let area = this.setorSelect
      console.log('teste de select', area, usuario, this.wppnum)

      let a = await api.get(`/transferirchamado/${area}/${this.wppnum}/${usuario}`);
      console.log(a)
      this.openDialogForm = false
      this.buscarContato(this.filtroSelecionado, this.estadoContatoAtual, this.offset)
      location.reload()

    },
    async finalizar(finaliza) {
      console.log('finaliza', finaliza)

      if (finaliza == true) {
        //   let response = await api.get(`/finaliza/${processo}/aprovado`);
        //  console.log(response)
        let a = await api.get(`/concluido/${this.wppnum}`)
        console.log(a)
        this.buscarContato(this.filtroSelecionado, this.estadoContatoAtual, this.offset)

      } else {
        //let response = await api.get(`/finaliza/${processo}/reprovado`);
        //console.log(response)
        //location.reload()

      }
    },
    async finalizarPendente(finaliza) {
      console.log('finaliza', finaliza)
      let fim = {
        telefone: this.wppnum,
        pendencia: this.pendencia,
        idEmpresa: this.id_empresa
      }


      if (finaliza == true) {
        //   let response = await api.get(`/finaliza/${processo}/aprovado`);
        //  console.log(response)



        let a = await api.post(`/concluidoPendente`, fim)
        console.log(a)
        this.buscarContato(this.filtroSelecionado, this.estadoContatoAtual, this.offset)

        this.atendimentos = []
        let atendimentoArray = await api.get(`buscarAtendimentos/${this.wppnum}/${this.id_empresa}`)
        console.log('acho que dos 60 ate o 70', atendimentoArray)

        this.atendimentos = atendimentoArray.data.dados
        console.log('Tecnologia', this.atendimentos)

      } else {
        //let response = await api.get(`/finaliza/${processo}/reprovado`);
        //console.log(response)
        //location.reload()

      }
    },
    async mudaEstado(telefone) {
      let a = await api.get(
        `/mudamsg/${telefone}`
      );

      console.log('eu sou o A', a)
    },

    async lido(telefone) {
      let a = await api.get(
        `/lidamsg/${telefone}`
      );

      console.log('eu sou o A', a)
    },

    async populaOportunidade(plataforma) {
      console.log("eu sou", this.usuario)
      console.log('eu sou oportunidade', this.processo[this.selectedContact])
      let processo = this.processo[this.selectedContact].processo
      this.plataforma = plataforma
      console.log('eu sou plataforma', plataforma, processo)
      console.log('eu sou o homem de ferro', this.dados[0])

      if (this.tipo == 'Analista') {
        console.log('OLA O PROCESSO AQUIIIII', processo)
        var response = await api.get(`/oportunidade/${processo}/${this.plataforma}`);


        let msg = {
          to: this.wppnum,
          name: this.name,

          usuario: this.usuario
        };
        let template = await api.post("/sendtemplate", msg);

        this.atendimentos = []
        let atendimentoArray = await api.get(`buscarAtendimentos/${this.wppnum}/${this.id_empresa}`)
        console.log('acho que dos 60 ate o 70', atendimentoArray)

        this.atendimentos = atendimentoArray.data.dados
        console.log('Tecnologia', this.atendimentos)
        console.log(template)

      } else {
        //response = await api.get(`/oportunidadeespecialista/${processo}/${this.plataforma}/${this.usuario}`);
        let msg = {
          name: this.name,
          to: this.wppnum,
          usuario: this.usuario

        };
        let template = await api.post("/sendtemplate", msg);

        this.atendimentos = []
        let atendimentoArray = await api.get(`buscarAtendimentos/${this.wppnum}/${this.id_empresa}`)
        console.log('acho que dos 60 ate o 70', atendimentoArray)

        this.atendimentos = atendimentoArray.data.dados
        console.log('Tecnologia', this.atendimentos)
        console.log(template)

      }




      console.log(response)

    },

    async receiveMessage() {
      console.log("MAIS FACIL DE ACHAR", this.usuario);

      if (this.tipo == "admin") {
        console.log("admin não atualiza usuario");
        await api.get(`/paraBot/${this.wppnum}/${this.id_empresa}`);
      } else {
        await api.get(`/atualizausuario/${this.usuario}/${this.wppnum}`);
        await api.get(`/paraBot/${this.wppnum}/${this.id_empresa}`);
      }

      let a = await api.get(`/lidamsg/${this.wppnum}`);
      console.log("eu sou o A Só que lido kkkkkkk", a);

      console.log(
        "eu sou o selected contact do receiveMessage",
        this.selectedContact,
        this.wppnum
      );

      let msg = { telefone: this.wppnum, idEmpresa: this.id_empresa };
      console.log("eu sou o wppnum", this.wppnum);

      this.buscarCliente();

      let response = await api.post("/reciveMsg1", msg);
      let receivedMessages = response.data.dados;

      console.log("Mensagens recebidas:", receivedMessages);

      let allMessages = [];

      for (let message of receivedMessages) {
        console.log("Mensagem:", message);

        const fixedDate = message.datetime
          ? new Date(message.datetime.replace(" ", "T"))
          : new Date();

        // ===== IMAGEM =====
        if (message.type === "image") {
          try {
            let imageResponse = await api.get(`/get-image/${message.mensagem}`, {
              responseType: "blob",
            });

            let imageUrl = URL.createObjectURL(imageResponse.data);
            console.log('mensagens antes do allMessages', message)
            allMessages.push({
              text: imageUrl,
              datetime: fixedDate.toISOString(),
              messageId: message.message_id, // 👈 ESSENCIAL

              sender: message.nome,
              isImage: true,
              isAudio: false,
              isDocument: false,
            });
          } catch (err) {
            console.error("Erro ao buscar imagem:", err);
            console.log('mensagens antes do allMessages', message)
            allMessages.push({
              text: message.mensagem,
              datetime: fixedDate.toISOString(),
              messageId: message.message_id, // 👈 ESSENCIAL

              sender: message.nome,
              isImage: false,
              isAudio: false,
              isDocument: false,
            });
          }
        }
        // ===== VIDEO =====
        else if (message.type === "video" || (message.mensagem || "").endsWith(".mp4")) {
          console.log("Processando vídeo...");

          try {
            let videoResponse = await api.get(`/get-video/${message.mensagem}`, {
              responseType: "blob",
            });

            let videoUrl = URL.createObjectURL(videoResponse.data);

            allMessages.push({
              text: videoUrl,
              datetime: fixedDate.toISOString(),
              messageId: message.message_id,
              sender: message.nome,
              isImage: false,
              isAudio: false,
              isDocument: false,
              isVideo: true
            });

          } catch (err) {
            console.error("Erro ao buscar vídeo:", err);

            allMessages.push({
              text: message.mensagem,
              datetime: fixedDate.toISOString(),
              messageId: message.message_id,
              sender: message.nome,
              isImage: false,
              isAudio: false,
              isDocument: false,
              isVideo: true
            });
          }
        }

        // ===== AUDIO =====
        else if (message.type === "audio" || (message.mensagem || "").endsWith(".mp3")) {
          console.log("Processando áudio...");
          try {
            let audioResponse = await api.get(`/get-audio/${message.mensagem}`, {
              responseType: "blob",
            });

            let audioUrl = URL.createObjectURL(audioResponse.data);
            console.log('mensagens antes do allMessages', message)
            allMessages.push({
              text: audioUrl,
              datetime: fixedDate.toISOString(),
              messageId: message.message_id, // 👈 ESSENCIAL
              sender: message.nome,
              isImage: false,
              isAudio: true,
              isDocument: false,
            });
          } catch (err) {
            console.error("Erro ao buscar áudio:", err);
            console.log('mensagens antes do allMessages', message)
            allMessages.push({
              text: message.mensagem,
              datetime: fixedDate.toISOString(),
              messageId: message.message_id, // 👈 ESSENCIAL

              sender: message.nome,
              isImage: false,
              isAudio: false,
              isDocument: false,
            });
          }
        }

        // ===== DOCUMENTO =====
        else if (message.type === "document") {
          const url = message.mensagem;
          const fileName = url.split("/").pop(); // pega só o nome do arquivo

          allMessages.push({
            text: url,               // URL direta
            fileName: fileName,      // nome correto
            datetime: fixedDate.toISOString(),
            sender: message.nome,
            isImage: false,
            isAudio: false,
            isDocument: true,
          });
        }


        // ===== TEXTO NORMAL =====
        else {
          allMessages.push({
            text: message.mensagem,
            datetime: fixedDate.toISOString(),
            messageId: message.message_id, // 👈 ESSENCIAL
            sender: message.nome,
            isImage: false,
            isAudio: false,
            isDocument: false,
          });
        }
      }

      console.log("allMessages final:", allMessages);

      this.messages.push(...allMessages);
      this.scrollToBottom();
      this.$nextTick(() => {
        const el = this.$refs.messages
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    },

    async receiveAllMessages() {
      console.log("MAIS FACIL DE ACHAR", this.usuario);

      if (this.tipo == "admin") {
        console.log("admin não atualiza usuario");
        await api.get(`/paraBot/${this.wppnum}/${this.id_empresa}`);
      } else {
        await api.get(`/atualizausuario/${this.usuario}/${this.wppnum}`);
        await api.get(`/paraBot/${this.wppnum}/${this.id_empresa}`);
      }

      let a = await api.get(`/lidamsg/${this.wppnum}`);
      console.log("eu sou o A Só que lido kkkkkkk", a);
      this.messages = []
      console.log(
        "eu sou o selected contact do receiveMessage",
        this.selectedContact,
        this.wppnum
      );

      let msg = { telefone: this.wppnum, idEmpresa: this.id_empresa };
      console.log("eu sou o wppnum", this.wppnum);

      this.buscarCliente();
      let response = await api.post("/reciveMsg", msg);
      let receivedMessages = response.data.dados;

      console.log("Mensagens recebidas:", receivedMessages);

      let allMessages = [];

      for (let message of receivedMessages) {
        console.log("Mensagem:", message);

        const fixedDate = message.datetime
          ? new Date(message.datetime.replace(" ", "T"))
          : new Date();

        // ===== IMAGEM =====
        if (message.type === "image") {
          try {
            let imageResponse = await api.get(`/get-image/${message.mensagem}`, {
              responseType: "blob",
            });

            let imageUrl = URL.createObjectURL(imageResponse.data);
            console.log('mensagens antes do allMessages', message)
            allMessages.push({
              text: imageUrl,
              datetime: fixedDate.toISOString(),
              messageId: message.message_id, // 👈 ESSENCIAL

              sender: message.nome,
              isImage: true,
              isAudio: false,
              isDocument: false,
            });
          } catch (err) {
            console.error("Erro ao buscar imagem:", err);
            console.log('mensagens antes do allMessages', message)
            allMessages.push({
              text: message.mensagem,
              datetime: fixedDate.toISOString(),
              messageId: message.message_id, // 👈 ESSENCIAL

              sender: message.nome,
              isImage: false,
              isAudio: false,
              isDocument: false,
            });
          }
        }
        // ===== VIDEO =====
        else if (message.type === "video" || (message.mensagem || "").endsWith(".mp4")) {
          console.log("Processando vídeo...");

          try {
            let videoResponse = await api.get(`/get-video/${message.mensagem}`, {
              responseType: "blob",
            });

            let videoUrl = URL.createObjectURL(videoResponse.data);

            allMessages.push({
              text: videoUrl,
              datetime: fixedDate.toISOString(),
              messageId: message.message_id,
              sender: message.nome,
              isImage: false,
              isAudio: false,
              isDocument: false,
              isVideo: true
            });

          } catch (err) {
            console.error("Erro ao buscar vídeo:", err);

            allMessages.push({
              text: message.mensagem,
              datetime: fixedDate.toISOString(),
              messageId: message.message_id,
              sender: message.nome,
              isImage: false,
              isAudio: false,
              isDocument: false,
              isVideo: true
            });
          }
        }

        // ===== AUDIO =====
        else if (message.type === "audio" || (message.mensagem || "").endsWith(".mp3")) {
          console.log("Processando áudio...");
          try {
            let audioResponse = await api.get(`/get-audio/${message.mensagem}`, {
              responseType: "blob",
            });

            let audioUrl = URL.createObjectURL(audioResponse.data);
            console.log('mensagens antes do allMessages', message)
            allMessages.push({
              text: audioUrl,
              datetime: fixedDate.toISOString(),
              messageId: message.message_id, // 👈 ESSENCIAL
              sender: message.nome,
              isImage: false,
              isAudio: true,
              isDocument: false,
            });
          } catch (err) {
            console.error("Erro ao buscar áudio:", err);
            console.log('mensagens antes do allMessages', message)
            allMessages.push({
              text: message.mensagem,
              datetime: fixedDate.toISOString(),
              messageId: message.message_id, // 👈 ESSENCIAL

              sender: message.nome,
              isImage: false,
              isAudio: false,
              isDocument: false,
            });
          }
        }

        // ===== DOCUMENTO =====
        else if (message.type === "document") {
          const url = message.mensagem;
          const fileName = url.split("/").pop(); // pega só o nome do arquivo

          allMessages.push({
            text: url,               // URL direta
            fileName: fileName,      // nome correto
            datetime: fixedDate.toISOString(),
            sender: message.nome,
            isImage: false,
            isAudio: false,
            isDocument: true,
          });
        }


        // ===== TEXTO NORMAL =====
        else {
          allMessages.push({
            text: message.mensagem,
            datetime: fixedDate.toISOString(),
            messageId: message.message_id, // 👈 ESSENCIAL
            sender: message.nome,
            isImage: false,
            isAudio: false,
            isDocument: false,
          });
        }
      }

      console.log("allMessages final:", allMessages);

      this.messages.push(...allMessages);
      this.scrollToBottom();
      this.$nextTick(() => {
        const el = this.$refs.messages
        if (el) {
          el.scrollTop = el.scrollHeight
        }
      })
    },
    formatTime(dateString) {
      if (!dateString) return "";

      const date = new Date(dateString);
      if (isNaN(date)) return "";

      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      });
    }
    ,

    playSound() {

      var audio = new Audio(require('../../src/audios/notify.wav'));
      setTimeout(function () {
        audio.play();
      }, 1000);

    },

    formatDateLabel(dateString) {
      const date = new Date(dateString);
      const today = new Date();

      const isToday = date.toDateString() === today.toDateString();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const isYesterday = date.toDateString() === yesterday.toDateString();

      if (isToday) return "HOJE";
      if (isYesterday) return "ONTEM";

      return date.toLocaleDateString("pt-BR");
    },
    shouldShowDate(index) {
      if (index === 0) return true;

      const currentRaw = this.messages[index].datetime;
      const previousRaw = this.messages[index - 1].datetime;

      if (!currentRaw || !previousRaw) return false;

      const current = new Date(currentRaw);
      const previous = new Date(previousRaw);

      if (isNaN(current) || isNaN(previous)) return false;

      return current.toLocaleDateString("pt-BR") !== previous.toLocaleDateString("pt-BR");
    },


    async sendTemplate() {

      console.log('eu sou o homem de ferro', this.dados[0].nome)

      console.log('levanta aguarda', this.id_empresa)
      let msg = {
        to: this.wppnum,
        name: this.name,
        usuario: this.usuario,
        text: this.dados[0].nome,
        idEmpresa: this.id_empresa

      };
      let template = await api.post("/sendtemplate2", msg);

      let atendimentoArray = await api.get(`buscarAtendimentos/${this.wppnum}/${this.id_empresa}`)
      console.log('acho que dos 60 ate o 70', atendimentoArray)

      this.atendimentos = atendimentoArray.data.dados
      console.log('Tecnologia', this.atendimentos)
      console.log(template)
      this.messages.push({ text: 'Template enviado: "boas_vindas_plugphone"', sender: this.usuario });
    },
    async enviarMealing() {
      this.openDialogLigacao = false
      let atendeu
      let reagendar
      let interesse
      let negociar

      if (this.atendeu == true) {
        atendeu = "sim"
        console.log(atendeu)
      } else {
        atendeu = "nao"
      }

      if (this.reagendar == true) {
        reagendar = "sim"
        console.log(reagendar)
      } else {
        reagendar = "nao"
      }


      if (this.interesse == true) {
        interesse = "sim"
        console.log(interesse)
      } else {
        interesse = "nao"
      }


      if (this.negociar == true) {
        negociar = "sim"
        console.log(negociar)
      } else {
        negociar = "nao"
      }

      let processo = this.processo[this.selectedContact].processo
      this.contact = []


      let a = await api.get(`/estadoMealing/${processo}/${atendeu}/${reagendar}/${interesse}/${negociar}/${this.observacao}`)
      console.log(a)

      this.openDialogForm = false

      location.reload()
    },
    selectContact(contact) {
      //this.openDialog2 = true
      console.log('oque é você rapazinho', contact)
      console.log('eu sou o contact XURASTAY OU XURAIGO', this.contact)
      this.messages = [];
      this.selectedContact = contact;
      //      let a =  api.get(`/insereusuario/${}`)

      console.log('eu sou o selected contact do selectContact', this.estadoContatoAtual);

      this.wppnum = this.selectedContact;
      api.get(`/lidamsg/${this.wppnum}`);
      this.buscarContato(this.filtroSelecionado, this.estadoContatoAtual, this.offset)
      this.receiveMessage();


    },
    async startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.recorder = new RecordRTC(stream, {
          type: 'audio',
          mimeType: 'audio/mp3',  // Definir o tipo MIME como áudio MP3
          recorderType: RecordRTC.StereoAudioRecorder,
          desiredSampRate: 16000,
          audioBitsPerSecond: 128000,
          numberOfAudioChannels: 1,
          bufferSize: 16384,
          sampleRate: 44100,
          frameRate: 20000,
        });
        this.recorder.startRecording();
        this.isRecording = true;
      } catch (error) {
        console.error('Error accessing microphone', error);
      }
    },

    stopRecording() {
      this.recorder.stopRecording(() => {
        this.audioBlob = this.recorder.getBlob();

        // Verifique o tipo de arquivo
        if (this.audioBlob.type !== 'audio/mpeg') {
          console.warn('O áudio não está no formato MP3, ele será enviado como WAV');
        }

        this.audioUrl = URL.createObjectURL(this.audioBlob);
        this.isRecording = false;
      });
    },
    async uploadAudio() {
      const MPEGMode = 'stereo'; // ou 'mono', dependendo do seu caso
      this.openDialogEnviando = true
      console.log(MPEGMode)
      if (!this.audioBlob) {
        console.error("Nenhum áudio selecionado");
        this.openDialogEnviando = false

        return;
      }

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioContext.decodeAudioData(await this.audioBlob.arrayBuffer());
      const sampleRate = audioBuffer.sampleRate;
      console.log('Taxa de amostragem do áudio:', sampleRate);

      const audioData = audioBuffer.getChannelData(0);  // Pega o primeiro canal
      const audioDataInt16 = new Int16Array(audioData.length);

      for (let i = 0; i < audioData.length; i++) {
        audioDataInt16[i] = Math.max(-1, Math.min(1, audioData[i])) < 0 ? audioData[i] * 0x8000 : audioData[i] * 0x7FFF;
      }

      const mp3Encoder = new lamejs.Mp3Encoder(1, sampleRate, 128); // 1 canal, 44.1kHz, 128 kbps
      const mp3Data = [];
      const samplesPerFrame = 1152;

      for (let i = 0; i < audioDataInt16.length; i += samplesPerFrame) {
        const chunk = audioDataInt16.subarray(i, i + samplesPerFrame);
        const mp3Chunk = mp3Encoder.encodeBuffer(chunk);
        if (mp3Chunk.length > 0) {
          mp3Data.push(new Uint8Array(mp3Chunk));
        }
      }

      const mp3End = mp3Encoder.flush();
      if (mp3End.length > 0) {
        mp3Data.push(new Uint8Array(mp3End));
      }

      const mp3Blob = new Blob(mp3Data, { type: 'audio/mpeg' });
      const formData = new FormData();
      formData.append('audio', mp3Blob, 'recording.mp3');

      try {
        let response = await api.post("upload-audio", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        console.log('Áudio enviado com sucesso, ID:', response.data.id);
        let pegaId = response.data.id;

        let enviaAudio = {
          to: this.wppnum,
          id: pegaId,
          usuario: this.usuario,
          idEmpresa: this.id_empresa
        };
        await api.post("sendAudio", enviaAudio);

        const audioUrl = URL.createObjectURL(mp3Blob);

        this.messages.push({
          text: audioUrl,
          datetime: new Date().toISOString(),
          sender: this.usuario,
          isAudio: true
        });
        this.openDialogEnviando = false

        this.openDialog1 = false;
      } catch (error) {
        console.error('Erro ao enviar áudio:', error);
        this.openDialogEnviando = false
        this.openDialog1 = false;
      }
    },

    async sendMessage() {
      this.usuario = this.usuario.charAt(0).toUpperCase() + this.usuario.slice(1);
      console.log('teste usuario aqui', this.usuario)
      console.log('eu aqui né vei kkkk', this.newMessage)
      const tempId = `local-${Date.now()}`;

      if (this.newMessage.trim() !== "") {
        let msg = {
          to: this.wppnum,
          tempId,
          body: `${this.usuario} \n${this.newMessage}`,
          nome: this.usuario,
          idEmpresa: this.id_empresa
        };
        let contaMsg = await api.get(`/contaMsg/${this.wppnum}`)

        console.log('aaaaah', contaMsg)

        let numMsg = contaMsg.data.dados[0].mensagens
        console.log('BBBBBBBBBB', numMsg)

        if (numMsg === 0) {
          alert('Esta é sua primeira mensagem para o contato hoje.\nPor favor, envie um template antes de continuar.');
        } else {
          console.log('concedi pra vc', this.newMessage.length)
          if (this.newMessage.length > 1000) {
            alert('Não foi possível enviar essa mensagem, pois ela ultrapassa 1000 caracteres.');
          } else {
            let usuario = this.usuario
            let umaMensagem = this.newMessage
            let numero = this.wppnum
            console.log('me de o CUBO', msg)
            this.newMessage = "";

            //this.messages.push({ text: this.newMessage, sender: this.usuario });
            console.log('eu sou oque vai ser enviado pelo socket', usuario, umaMensagem, numero)
            this.socket.emit('send Message', { usuario, umaMensagem, numero });
            console.log('passei do socket')
            let resposta = await api.post("/whatsapp/send", msg);

            console.log('passei do resposta')
            await this.receiveMessage()
            console.log("limpou?", this.newMessage);
            console.log('verifica resposta da API', resposta.data.dados)

            if (resposta.data.dados == "mensagem não tolerada") {
              console.log('palavrão não kkkkkkkkkkk')
              alert('Palavras de baixo calão não serão toleradas!')
            }
            // deve imprimir string vazia
            this.$nextTick(() => {
              this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
            });

            this.buscarContato(this.filtroSelecionado, this.estadoContatoAtual, this.offset)

          }
        }
      }
    },

    async buscaCidadao() {
      let usuario = JSON.parse(localStorage.getItem('usu'));
      console.log('eu sou o usuario', usuario);

      // Monta com PlugPhone
      let nomeFormatado = usuario.usuario.charAt(0).toUpperCase() + usuario.usuario.slice(1);
      this.usuario = nomeFormatado;

      console.log('eu sou o this.usuario SATORU GOJO', this.usuario);
    },

    async buscarCliente() {
      this.atendimentos = []
      let a = await api.get(`/buscarmealing/${this.wppnum}/${this.id_empresa}`);
      console.log('Vira lata Caramelo', a)
      this.dados = a.data.dados;
      console.log('eu sou os dados do cliente', this.dados)
      this.editaNome = this.dados[0].nome
      this.editaNum = this.dados[0].telefone
      this.setorSelect = this.dados[0].setor
      this.editaEmail = this.dados[0].email
      this.editaEmpresa = this.dados[0].empresa




      let atendimentoArray = await api.get(`buscarAtendimentos/${this.wppnum}/${this.id_empresa}`)
      console.log('acho que dos 60 ate o 70', atendimentoArray)
      this.$store.dispatch('insereWppnum', this.wppnum)

      console.log('oque aconteceu com o wppnum', this.$store.state.wppnum)

      this.atendimentos = atendimentoArray.data.dados
      console.log('Tecnologia', this.atendimentos)
    },

    async ligar() {
      console.log('eu sou a função ligar', this.wppnum)
      let liga = await api.get(`/ligar/${this.ramal}/${this.wppnum}`);
      console.log('eou sou', liga)

    },
    async uploadVideo() {

      this.openDialogEnviando = true;

      if (!this.selectedFile) {
        console.error("Nenhum vídeo selecionado.");
        this.openDialogEnviando = false;
        return;
      }

      const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm'];

      if (!allowedTypes.includes(this.selectedFile.type)) {
        console.error("O arquivo selecionado não é um vídeo.");
        alert('O arquivo selecionado não é um vídeo.');
        this.openDialogEnviando = false;
        return;
      }

      let formData = new FormData();
      formData.append("video", this.selectedFile, this.selectedFile.name);

      try {

        // 1️⃣ Upload do vídeo pro backend
        let response = await api.post("/upload-video", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        let pegaId = response.data.id;

        // mostra no chat imediatamente
        this.messages.push({
          text: this.selectedFile.name,
          sender: this.usuario,
          isVideo: true
        });

        // 2️⃣ Envia vídeo via WhatsApp
        let enviaVideo = {
          to: this.wppnum,
          id: pegaId,
          usuario: this.usuario,
          idEmpresa: this.id_empresa
        };

        await api.post("sendvideo", enviaVideo);

        // 3️⃣ pega URL da meta
        let getURL = await api.get(`/pegaURL/${pegaId}`);
        let videoURL = { "url": getURL.data.url, "id": pegaId };

        // 4️⃣ baixa e salva local
        await api.post(`/geraVideo/`, videoURL);
        await this.receiveMessage()

        this.openDialogVideo = false;
        this.openDialogEnviando = false;


      } catch (error) {
        console.error("Erro ao enviar vídeo:", error);

        this.messages.push({
          text: "Erro ao enviar vídeo.",
          sender: this.usuario
        });

        this.openDialogVideo = false;
        this.openDialogEnviando = false;
      }
    },

    async uploadImage() {
      this.openDialogEnviando = true

      if (!this.selectedFile) {
        console.error("Nenhuma imagem selecionada.");
        this.openDialogEnviando = false

        return;
      }

      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(this.selectedFile.type)) {
        console.error("O arquivo selecionado não é uma imagem.");
        this.openDialogEnviando = false
        alert('O arquivo selecionado não é uma imagem.');

        return;
      }

      let formData = new FormData();
      formData.append("image", this.selectedFile, this.selectedFile.name);

      try {
        // Envia a imagem via POST
        let response = await api.post("/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        let pegaId = response.data.id;
        this.messages.push({ text: URL.createObjectURL(this.selectedFile), sender: this.usuario, isImage: true });

        // Envio da imagem via POST para o WhatsApp
        let enviaImg = {
          to: this.wppnum, id: pegaId, usuario: this.usuario, idEmpresa: this.id_empresa
        };
        await api.post("sendimage", enviaImg);

        // Recupera a URL da imagem
        let getURL = await api.get(`/pegaURL/${pegaId}`);
        console.log('URL AQUI', getURL.data);
        let imageURL = { "url": getURL.data.url, "id": pegaId };

        console.log('EU SOU O IMAGE URL ', imageURL)
        // Agora usamos o axios diretamente para fazer o GET na URL externa com os headers

        // Fazendo a requisição GET para a URL externa
        console.log('eu cheguei até aqui')
        let image = await api.post(`/geraImage/`, imageURL);
        console.log('eu sou a imagem', image);

        this.openDialog = false;
        this.openDialogEnviando = false

      } catch (error) {
        console.error("Erro ao enviar imagem:", error);
        this.messages.push({ text: "Erro ao enviar imagem.", sender: this.usuario });
        this.openDialog = false;
        this.openDialogEnviando = false

      }
    },
    async uploadDocumento() {
      this.openDialogEnviando = true

      if (!this.selectedFile) {
        console.error("Nenhum documento selecionado.");
        this.openDialogEnviando = false

        return;
      }

      // Tipos de documentos permitidos
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
        'text/csv'
      ];

      if (!allowedTypes.includes(this.selectedFile.type)) {
        console.error("O arquivo selecionado não é um documento válido.");
        this.openDialogEnviando = false
        alert('O arquivo selecionado não é um documento válido.')

        return;
      }

      let formData = new FormData();
      formData.append("file", this.selectedFile, this.selectedFile.name);

      try {
        // Envia o documento para o backend
        let response = await api.post("/upload-document", formData, {
          headers: { "Content-Type": "multipart/form-data" }
        });

        let pegaId = response.data.id;
        let caminho = response.data.caminhoFinal

        let caminhoLimpo = caminho.replace(/^uploads\//, '');
        console.log('eu sou o caminho limpo, eu sou a luz', caminhoLimpo);
        //console.log('eu sou o caminho, eu sou a verdade', caminho)
        // Mensagem no chat indicando que o doc foi enviado (com nome e link temporário)
        this.messages.push({
          text: `${this.apiWPurl}/midia/${caminhoLimpo}`,
          file: URL.createObjectURL(this.selectedFile),
          sender: this.usuario,
          isDocument: true
        });

        // Envio para o WhatsApp
        let enviaDoc = {
          to: this.wppnum,
          id: `${caminhoLimpo}`,
          nomeArquivo: this.selectedFile.name,
          usuario: this.usuario,
          idEmpresa: this.id_empresa
        };

        console.log('eu sou o enviaDoc', enviaDoc)
        await api.post("/senddocument", enviaDoc);

        this.atendimentos = []
        let atendimentoArray = await api.get(`buscarAtendimentos/${this.wppnum}/${this.id_empresa}`)
        console.log('acho que dos 60 ate o 70', atendimentoArray)

        this.atendimentos = atendimentoArray.data.dados
        console.log('Tecnologia', this.atendimentos)
        // Recupera URL final do documento
        let getURL = await api.get(`/midia/${caminhoLimpo}`);
        let docURL = { url: getURL.data.url, id: pegaId };

        console.log('URL DO DOCUMENTO:', docURL);

        // Chamada final pro backend processar (se necessário)
        //await apiWP.post("/geraDocumento", docURL);

        this.selectedFile = null
        this.openDialogAnexo = false;
        this.openDialogEnviando = false

      } catch (error) {
        console.error("Erro ao enviar documento:", error);
        this.messages.push({ text: "Erro ao enviar documento.", sender: this.usuario });
        this.openDialogAnexo = false;
        this.openDialogEnviando = false

      }
    },



    async verificaMensagem(telefone, setor, usuario) {
      this.contacts = []
      let contatos = await api.get(`/verificamensagem/${telefone}/`);
      let contatosArray = contatos.data.dados;
      console.log(contatosArray)
      let tel = ""
      let setorV = ""
      let usuarioV = ""
      let id_empresav = ""
      contatosArray.forEach(e => {

        tel = e.telefone
        setorV = e.setor
        usuarioV = e.usuario
        id_empresav = e.id_empresa
      });

      console.log('passei', tel
        , setorV
        , usuarioV, '// \n', telefone, setor, usuario)
      //this.playSound()


      if ((setorV == setor || setor == 'admin') && id_empresav == this.id_empresa && (usuarioV == usuario || usuarioV == null || usuarioV == "" || usuarioV == "null" || typeof usuarioV === "undefined")) {
        this.playSound();
      } else {
        console.log('não passei pelo if');
      }
    },

    async buscarContato(filtro, estadoContato, offset) {
      console.log('pode n', offset)
      console.log("Me mostre ele", estadoContato)
      console.log('contador', this.contador)


      if (offset < 0) {
        console.log('já está ná pagina inicial')
        this.offset = 0
        offset = 0
        this.contador = 1

      }
      filtro = "";
      this.contacts = [];
      this.estadoContatoAtual = estadoContato
      filtro = this.filtroSelecionado
      let contatos = "";

      console.log("filtro", filtro)

      if (this.filtroValor == "") {
        contatos = await api.get(`/buscarcontatos7/${this.tipo}/${this.usuario}/${estadoContato}/null/${offset}`);
      } else {
        contatos = await api.get(`/buscarcontatos7/${this.tipo}/${this.usuario}/${estadoContato}/${this.filtroValor}/${offset}`);
      }

      let contatosArray = contatos.data.dados;
      console.log("Esse é o contato array", contatosArray);

      contatosArray.forEach(e => {
        // Converte a data para o formato brasileiro e remove a vírgula
        let dataFormatada = new Date(e.datahora).toLocaleString("pt-BR").replace(",", "");

        this.contacts.push({
          nome: e.nome,
          telefone: e.telefone,
          estado: e.estado,
          estadomsg: e.estadomsg,
          ultimamsg: e.ultimamsg,
          datahora: dataFormatada
        });

        //console.log("Eu sou os contatos :D", this.contacts);
      });
      if (this.contacts.length == 0) {
        console.log('ja passou do limite')
        console.log(this.offset)
        this.offset = 0
        this.contador = 1
        offset = 0
        console.log("filtro", filtro)

        if (this.filtroValor == "") {
          contatos = await api.get(`/buscarcontatos6/${this.tipo}/${this.usuario}/${estadoContato}/null/${offset}`);
        } else {
          contatos = await api.get(`/buscarcontatos6/${this.tipo}/${this.usuario}/${estadoContato}/${this.filtroValor}/${offset}`);
        }



        let contatosArray = contatos.data.dados;
        console.log("Esse é o contato array", contatosArray);

        contatosArray.forEach(e => {
          // Converte a data para o formato brasileiro e remove a vírgula
          let dataFormatada = new Date(e.datahora).toLocaleString("pt-BR").replace(",", "");

          this.contacts.push({
            nome: e.nome,
            telefone: e.telefone,
            estado: e.estado,
            estadomsg: e.estadomsg,
            ultimamsg: e.ultimamsg,
            datahora: dataFormatada
          });

          //console.log("Eu sou os contatos :D", this.contacts);
        });

      }
    }
    ,


    closeDialogConcluir() {
      this.openDialogConcluir = false
    },
    closeDialogAnexo() {
      this.openDialogAnexo = false
    }
  },
};
</script>


<style>
.message {
  margin-bottom: -65px !important;
  padding: 5px;
  border-radius: 5px;
  width: 100%;
  word-wrap: break-word;
}

.message-requester {
  text-align: left;

  border: none;
  color: black;
  padding: 15px 32px;

  text-decoration: none;
  font-size: 16px;
}

.theme--light.v-text-field--solo>.v-input__control>.v-input__slot {
  background: #F5F5F5 !important;
}

.message-agent {
  text-align: right;

  border: none;
  color: black;
  padding: 15px 32px;

  text-decoration: none;
  font-size: 16px;
}

.input-message {
  width: calc(88% - 20px);
  padding: 8px;
  border: 1px double #ffffff;
  border-radius: 25px;
  outline: none;
  position: absolute;
  bottom: 0;
  left: 51px;
  margin-bottom: -3% !important;

}

.v-textarea textarea {
  background-color: #ffffffc2 !important;
}

.sidebar {
  color: #000000;
  background-color: #f5f5f5 !important;
  width: 300px !important;
  margin-left: -4px;

}

.Itemsidebar:hover {
  background-color: #cacaca !important;


}


.cabecalhoNovo {
  text-align: center;
  width: 105%;
  margin-left: 3px;
  align-content: center;
  margin-top: 30px !important;
}


.header {
  width: 100%;
  font-size: 20px;
  border-bottom: double;
  border-color: #14276636;
  background-color: white;
}


.bottom-bar {
  position: relative;
  margin-top: 64px;
  width: 100%;
  padding: 10px;
  background-color: #ffffff00 !important;
  /*  box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
*/
}

.button {
  text-align: justify !important;
  /*background-color: #075e54d6;*/
  background: linear-gradient(223deg, #006177c4 0%, #3e3eadb4 35%, #02074faf 100%);
  border: none;
  color: #ffffff;
  padding: 15px 32px;
  border-radius: 15px;
  display: inline-block;
  font-size: 16px;
  text-align: justify;
  white-space: normal;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
  backdrop-filter: blur(3px);

}

.buttonSender {
  /*background-color: #25d36680;*/
  background: linear-gradient(113deg, #2cb1e6cb 0%, #35c06fd3 50%, #42d671d0 100%);
  border: none;
  color: #ffffff;
  padding: 15px 32px;
  text-align: start;
  border-radius: 15px;
  display: inline-block;
  font-size: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25) !important;
  backdrop-filter: blur(3px);

}

.message-text {
  word-break: break-word;
  white-space: pre-line;

}

.titulo {
  text-align: end;
}

.imageIcon {
  left: 91%;
  font-size: 25px;
  top: 3px;
}

.micIcon {
  left: 90%;
  font-size: 25px;
  top: 3px;
}

#tituloMsg {
  text-align: end !important;
}

.imageIcon:hover {
  background-color: #b0b0b0;
  border-radius: 25%;
}

.edit:hover {

  background-color: #b0b0b0;


}

.micIcon:hover {
  background-color: #b0b0b0;
  border-radius: 25%;
}

.linhaBtn {
  width: 50%;
  margin-left: 3%;
}

.dialogo {
  height: 302px
}

.dialogo1 {
  height: 302px
}



.btnAudio {
  background-color: #65cf65 !important;
  color: rgb(255, 255, 255) !important
}

.btnAudioStop {
  left: 12% !important;
  background-color: #e74343 !important;
  color: #ffffff !important;

}

.btnTransfer {
  left: 31% !important;
  background-color: #574de0 !important;
  color: #ffffff !important;

}

.btnCall {
  left: 12% !important;
  background-color: #6cbfff !important;
  color: #ffffff !important;

}

.btnCancel {
  left: 35% !important;
  margin-top: -10%;
  background-color: #6cbfff !important;
  color: #fffcfc !important;


}

.linhaContato {
  margin: 12%;
  margin-left: 25%;
}


.linhaContatoConcluir {
  margin: 12%;
  margin-left: 15%;
}

.plug {
  width: 59px;
  bottom: -56%;
  position: relative;
}

.date-divider {
  text-align: center;
  margin-top: 1%;
  margin-left: 47%;
  font-size: 13px;
  color: #000000;
  background: rgb(159 159 159 / 62%);
  padding: 4px 10px;
  border-radius: 10px;
  display: inline-block;
}

.tema {
  left: 94%;
  widows: 8%;
  text-decoration: bold;
  text-decoration: underline;
  position: fixed;
  background-color: #243e57 !important;
  color: black;
}

.info {

  width: 22%;
  position: fixed;
  right: 1%;

}

.v-application {}

@media (max-width: 768px) {
  .info {
    width: 100%;
    position: static;
    right: 0;
    background-color: #ffffff !important;
    border-color: #ffffff !important;
  }
}

.responsive-table .v-data-table__wrapper {
  display: block;
}

.table-row {
  display: flex;
  flex-direction: column;
  padding: 10px;
  border-bottom: 1px double #ccc;
}

@media (min-width: 769px) {
  .table-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  }
}

.infoBtn {
  width: 25%;
  text-transform: none !important;
  background-color: white !important;
  position: fixed;
  border-style: none !important;
  box-shadow: none;
  color: white !important;
  right: -2%;
  top: 3px;
}

.plug {
  width: 80px;
  left: 34%;
}

.avatar {
  width: 50% !important;
  left: 10% !important;
  margin-top: 5% !important;
  position: relative !important;
  background-size: 150px !important;
}

.plugPhone {
  position: absolute;
  top: 25%;
  left: 22%;
  opacity: 30%;
  width: 33%;
}

.logo {
  width: 30%;
  right: 40%;
  position: fixed;
  bottom: 3%;
}

.filtro {
  width: 20% !important;
  padding-right: 6%;
  padding-left: 0%;
}

#seta {
  /* cor de fundo opcional */
  border-radius: 50%;
  border-style: double;
  border-color: #6d6d6d;
  padding: 0px;
  font-size: 22px;
  cursor: pointer;
}

.linhaBtnCall {
  width: 75%;
  margin-left: 22%;
}

.botaoEstado {
  height: 25px !important;
  color: #000000 !important;
  background-color: #f5f5f5 !important;
  width: auto;
  /* 🔥 aqui */
  padding: 0 10px !important;
  /* controla o tamanho real */
  min-width: unset !important;
  /* garante que não herda */
  box-shadow: none !important;
  text-transform: none !important;
  font-size: 10px !important;
}

.botaoEstado:hover {
  background-color: #cecece !important;
}

.loading {
  width: 5%;
  margin-top: 11%;
  margin-left: 48%;
  margin-bottom: 11%;

}

.soHover:hover {
  background-color: #b0b0b0;
  border-radius: 25%;
}

/* Alvo o container do drawer - ajuste o seletor se o seu for outro */
.v-navigation-drawer__content,
.navbar,
/* opcional, se tiver outro seletor */
.sidebar {
  /* Firefox */
  scrollbar-width: thin;
  /* "auto" | "thin" | "none" */
  scrollbar-color: rgba(0, 0, 0, 0.25) transparent;
  /* thumb color + track color */
}

/* WebKit (Chrome, Edge, Safari) */
.v-navigation-drawer__content::-webkit-scrollbar {
  width: 8px;
  /* largura da barra */
}

.v-navigation-drawer__content::-webkit-scrollbar-track {
  background: transparent;
}

.v-navigation-drawer__content::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.20);
  /* cor do "polegar" */
  border-radius: 8px;
  border: 2px double transparent;
  /* dá espaço ao redor pra ficar mais clean */
  background-clip: padding-box;
}

.v-navigation-drawer__content::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.35);
}

.theme--light.v-input input,
.theme--light.v-input textarea {
  color: #000000 !important;
}

.messages::-webkit-scrollbar {
  width: 6px;
  /* Largura fina */
}

.messages::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.507);
  /* Cor clarinha */
  border-radius: 10px;
  /* Bordas arredondadas */
  transition: background-color 0.3s;
}

.listaIcon:hover {
  background-color: rgba(255, 255, 255, 0.507);


}

.v-input__slot {
  background-color: #f5f5f500 !important;
}

.messages::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
  /* Um pouco mais visível no hover */
}

.messages::-webkit-scrollbar-track {
  background-color: #243e576e;
  /* Fundo invisível */
}

.informacaoHeader {
  font-size: 39px !important;
  color: black !important;
  left: 5%;

}

.container container--fluid {
  background-color: #f5f5f5 !important;
}

#clerico:hover {
  background-color: #6d6d6d;
}

.searchField.v-text-field input {
  background-color: #f5f5f5 !important;
  /* fundo tipo WhatsApp dark */
  border-style: double;
  border-radius: 30px !important;
  padding-left: 35px !important;
  color: #000000 !important;
  margin-right: 10%;
}

.searchField .v-field__outline,
.searchField .v-field__underlines {
  display: none !important;
  /* remove bordas padrão */
}

.searchField .v-field__prepend-inner {
  margin-left: 12px;
  color: #A8A8A8 !important;
  /* cor suave do ícone */
}

.searchField .v-text-field .v-field__input::placeholder {
  color: #A8A8A8 !important;
}

/* ===== MIDIAS CLICAVEIS / DESTACAVEIS ===== */

.chat-media {
  max-width: 100%;
  height: auto;
  border-radius: 14px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
}

.chat-media:hover {
  transform: scale(1.01);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}

.chat-media:active {
  transform: scale(0.99);
}

/* container da imagem pra poder ter ícone de zoom */
.media-wrap {
  position: relative;
  display: inline-block;
  width: 100%;
}

/* ícone "ampliar" no canto */
.media-zoom-icon {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 999px;
  padding: 6px;
}

/* áudio destacável */
/* .chat-audio {
  cursor: pointer;
  padding: 10px;
  border-radius: 14px;
  border: 2px solid transparent;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}

.chat-audio:hover {
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
} */

/* quando estiver selecionado */
.media-selected {
  border-color: rgba(97, 165, 232, 0.9) !important;
  box-shadow: 0 0 0 3px rgba(97, 165, 232, 0.25) !important;
}

/* ===== MIDIAS CLICAVEIS / DESTACAVEIS ===== */

.chat-media {
  max-width: 100%;
  height: auto;
  border-radius: 14px;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 0.12s ease, border-color 0.12s ease, box-shadow 0.12s ease;
}

.chat-media:hover {
  transform: scale(1.01);
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.35);
}

.chat-media:active {
  transform: scale(0.99);
}

.media-wrap {
  position: relative;
  display: inline-block;
  width: 100%;
}

.media-zoom-icon {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 999px;
  padding: 6px;
}

.chat-audio {
  cursor: pointer;
  padding: 6px;
  border-radius: 14px;
  border: 2px solid transparent;
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}

.chat-audio:hover {
  border-color: rgba(255, 255, 255, 0.25);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.media-selected {
  border-color: rgba(97, 165, 232, 0.9) !important;
  box-shadow: 0 0 0 3px rgba(97, 165, 232, 0.25) !important;
}

.doc-card {
  display: flex;
  align-items: center;
  gap: 12px;

  max-width: 320px;
  /* 🔥 limite do balão */
  width: fit-content;
  box-sizing: border-box;

  padding: 10px 14px;
  border-radius: 14px;
  cursor: pointer;

  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.25);

  transition: background 0.15s ease, transform 0.12s ease;
}


.doc-card:hover {
  transform: scale(1.01);
  border-color: rgba(255, 255, 255, 0.25);
}

.doc-icon {
  color: white;
  font-size: 26px;
  flex-shrink: 0;
}

.doc-download {
  color: white;
  font-size: 20px;
  flex-shrink: 0;
}


.doc-info {
  flex: 1;
  min-width: 0;
}

.doc-name {
  color: white;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-sub {
  color: rgba(255, 255, 255, 0.75);
  font-size: 12px;
}

.chat-search-fixed {
  position: sticky;
  width: 97%;
  margin-left: 0%;
  top: 0;
  z-index: 10;
  padding: 8px;
  display: flex;
  gap: 8px;
}

.chat-highlight {
  background: #ffeb3b;
  color: #000;
  padding: 2px 4px;
  border-radius: 4px;
}

.chat-search {
  display: flex;
  gap: 6px;
  padding: 8px;
  background: #1f2c34;
}

.video-card {
  background: #1f2c34;
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  max-width: 260px;
}

.video-card:hover {
  background: #2a3942;
}

.video-icon {
  font-size: 32px;
  color: #61a5e8;
}

.video-title {
  font-weight: bold;
  color: white;
}

.video-sub {
  font-size: 12px;
  color: #cfd8dc;
}

.carregarMensagens {
  margin-left: 48%;
  width: 72px;
  margin-right: 2%;
  max-height: 80vh;
  overflow-y: auto;
}
</style>