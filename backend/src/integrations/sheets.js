/**
 * Integração Google Sheets
 * Cria e gerencia planilhas automaticamente
 */

const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

class SheetsManager {
  constructor() {
    this.auth = null;
    this.initAuth();
  }

  initAuth() {
    if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY) {
      this.auth = new JWT({
        email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        scopes: ['https://www.googleapis.com/auth/spreadsheets']
      });
    }
  }

  /**
   * Cria nova planilha com template
   */
  async createSpreadsheet(title, template) {
    if (!this.auth) {
      throw new Error('Google não configurado. Configure GOOGLE_SERVICE_ACCOUNT_EMAIL e GOOGLE_PRIVATE_KEY');
    }

    try {
      const doc = new GoogleSpreadsheet('', this.auth);
      await doc.createNewSpreadsheetDocument({ title });

      const sheet = doc.sheetsByIndex[0];
      await sheet.setHeaderRow(template.headers);

      return {
        id: doc.spreadsheetId,
        url: doc.spreadsheetUrl,
        name: title
      };
    } catch (err) {
      console.error('Erro ao criar planilha:', err);
      throw err;
    }
  }

  /**
   * Conecta em planilha existente
   */
  async getSpreadsheet(sheetId) {
    const doc = new GoogleSpreadsheet(sheetId, this.auth);
    await doc.loadInfo();
    return doc;
  }

  /**
   * Adiciona linha com dados
   */
  async addRow(sheetId, sheetName, data) {
    const doc = await this.getSpreadsheet(sheetId);
    const sheet = doc.sheetsByTitle[sheetName];

    if (!sheet) {
      throw new Error(`Aba ${sheetName} não encontrada`);
    }

    await sheet.addRow(data);
    return { success: true, rows: sheet.rowCount };
  }

  /**
   * Busca dados com filtros
   */
  async searchData(sheetId, sheetName, searchTerm, column) {
    const doc = await this.getSpreadsheet(sheetId);
    const sheet = doc.sheetsByTitle[sheetName];

    if (!sheet) {
      throw new Error(`Aba ${sheetName} não encontrada`);
    }

    const rows = await sheet.getRows();
    const filtered = rows.filter(row => 
      row[column] && row[column].toString().toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.map(r => r._rawData);
  }

  /**
   * Exporta dados da planilha
   */
  async exportData(sheetId, sheetName) {
    const doc = await this.getSpreadsheet(sheetId);
    const sheet = doc.sheetsByTitle[sheetName];

    if (!sheet) {
      throw new Error(`Aba ${sheetName} não encontrada`);
    }

    const rows = await sheet.getRows();
    return {
      headers: sheet.headerValues,
      data: rows.map(r => r._rawData),
      total: rows.length
    };
  }
}

module.exports = new SheetsManager();
