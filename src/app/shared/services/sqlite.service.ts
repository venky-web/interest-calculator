import { Injectable } from '@angular/core';

// import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';

@Injectable({
  providedIn: 'root'
})
export class SQLiteService {
  // private sqlite = new SQLiteConnection(CapacitorSQLite);
  // private db!: SQLiteDBConnection;

  async initDB(): Promise<void> {
    // this.db = await this.sqlite.createConnection('appdb', false, 'no-encryption', 1);
    // await this.db.open();
    // await this.db.execute(`
    //   SQL to create Table  
    // `);
  }

  async addRecord(record: { id: number; title: string; description: string }) {
    const sql = `INSERT INTO records (id, title, description) VALUES (?, ?, ?)`;
    const values = [record.id, record.title, record.description];
    // await this.db.run(sql, values);
  }

  async getAllRecords(): Promise<any[]> {
    // const result = await this.db.query('SELECT * FROM records');
    // return result.values || [];
    return [];
  }

  async updateRecord(record: any) {
    // const sql = `UPDATE records SET title = ?, description = ? WHERE id = ?`;
    // const values = [record.title, record.description, record.id];
    // await this.db.run(sql, values);
  }

  async deleteRecord(id: number) {
    // await this.db.run(`DELETE FROM records WHERE id = ?`, [id]);
  }
}
