import {Injectable} from '@angular/core';
import {Plugins} from '@capacitor/core';
import '@capacitor-community/sqlite';
import {AlertController} from '@ionic/angular';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, from, of} from 'rxjs';
import {switchMap} from 'rxjs/operators';

import {JsonSQLite} from '@capacitor-community/sqlite';

const {CapacitorSQLite, Device, Storage} = Plugins;

const DB_SETUP_KEY = 'first_db_setup';
const DB_NAME_KEY = 'db_name';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  dbReady = new BehaviorSubject(false);
  dbName = '';

  constructor(private http: HttpClient, private alertCtrl: AlertController) {
  }

  async init(): Promise<void> {
    console.log('init')
    // const info = await Device.getInfo();
    // if (info.platform === 'android') {
      try {
        await CapacitorSQLite.createConnection({ database: DB_NAME_KEY })
        const sqlite = CapacitorSQLite as any;
        await sqlite.requestPermissions();
        await this.setupDatabase();
      } catch (e) {
        const alert = await this.alertCtrl.create({
          header: 'No DB access',
          message: 'This app can\'t work without Database access.',
          buttons: ['OK']
        });
        await alert.present();
      }
    /*} else {
      await this.setupDatabase();
    }*/
  }

  private async setupDatabase() {
    const dbSetupDone = await Storage.get({key: DB_SETUP_KEY});

    if (!dbSetupDone.value) {
      this.downloadDatabase();
    } else {
      this.dbName = (await Storage.get({key: DB_NAME_KEY})).value;
      await CapacitorSQLite.open({database: this.dbName});
      this.dbReady.next(true);
    }
  }

  // Potentially build this out to an update logic:
  // Sync your data on every app start and update the device DB
  private downloadDatabase(update = false) {
    console.log('downloadDatabase')
    this.http.get('assets/files/db.json').subscribe(async (jsonExport: JsonSQLite) => {
      const jsonstring = JSON.stringify(jsonExport);
      const isValid = await CapacitorSQLite.isJsonValid({jsonstring});

      if (isValid.result) {
        this.dbName = jsonExport.database;
        await Storage.set({key: DB_NAME_KEY, value: this.dbName});
        await CapacitorSQLite.importFromJson({jsonstring});
        await Storage.set({key: DB_SETUP_KEY, value: '1'});

        // Your potential logic to detect offline changes later
        if (!update) {
          await CapacitorSQLite.createSyncTable();
        } else {
          await CapacitorSQLite.setSyncDate({syncdate: '' + new Date().getTime()})
        }
        this.dbReady.next(true);
      }
    });
  }

  getUsersList() {
    return this.dbReady.pipe(
      switchMap(isReady => {
        if (!isReady) {
          return of({values: []});
        } else {
          const statement = 'SELECT * FROM users;';
          return from(CapacitorSQLite.query({statement, values: []}));
        }
      })
    )
  }
}
