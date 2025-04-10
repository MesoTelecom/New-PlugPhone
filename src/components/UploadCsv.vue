<template>
    <div id="app">
      <h1>Upload e Exibição de CSV</h1>
      <input type="file" @change="handleFileUpload" />
      <table v-if="csvData.length">
        <thead>
          <tr>
            <th v-for="(header, index) in csvData[0]" :key="index">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rowIndex) in csvData.slice(1)" :key="rowIndex">
            <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import Papa from 'papaparse';
  
  export default {
    name: 'UploadCsv',
    data() {
      return {
        csvData: []
      };
    },
    methods: {
      handleFileUpload(event) {
        const file = event.target.files[0];
        if (file && file.type === 'text/csv') {
          this.parseCSV(file);
        } else {
          alert('Por favor, selecione um arquivo CSV.');
        }
      },
      parseCSV(file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const csv = event.target.result;
          Papa.parse(csv, {
            complete: (results) => {
              this.csvData = results.data;
            },
            header: false
          });
        };
        reader.readAsText(file);
      }
    }
  };
  </script>
  
  <style scoped>
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th, td {
    border: 1px solid black;
    padding: 8px;
    text-align: left;
  }
  </style>