import { Component, OnInit } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-users',
  templateUrl: './users.page.html',
  styleUrls: ['./users.page.scss'],
})
export class UsersPage implements OnInit {

  public users: any = [];
  public filter: string = '';
  public conversations: any = [];
  public filtered_users: any = [];

  constructor(
    private http: HttpClient
  ) {
  }

  async ngOnInit() {
    this.setConversations();
    this.setUsers();
  }

  /**
   * Obtener el historial de conversaciones
   * @return array Contiene las conversaciones
   * @author Jhon García
   */
  getConversations() {
    return this.http
      .get('assets/files/conversations.json')
      .pipe(
        map((response: any) => {
          return response.data;
        })
      );
  }

  /**
   * Obtener los usuarios
   * @return array Contiene las usuarios
   * @author Jhon García
   */
  getUsers() {
    return this.http
      .get('assets/files/users.json')
      .pipe(
        map((response: any) => {
          return this.mapUsers(response.data)
        })
      );
  }

  /**
   * Establecer un valor para users
   * @author Jhon García
   */
  setUsers() {
    this.getUsers().subscribe(response => {
      this.users = response;
      this.filtered_users = response;
    });
  }

  /**
   * Establecer un valor para conversations
   * @author Jhon García
   */
  setConversations() {
    this.getConversations().subscribe(response => {
      this.conversations = response;
    });
  }

  /**
   * Mapear los usuarios para agregar datos adicionales
   * @param users Contiene los usuarios con los datos adicionales
   * @author Jhon García
   */
  mapUsers(users) {

    users.forEach(user => {

      // Establecer la información del usuario en la conversación
      const conversation = this.conversations.find(conversation => conversation.user_id === user.id);

      user.messages = conversation?.messages || []

      // Validar si la conversación tiene mensajes
      if (!!user.messages?.length) {
        // Obtener el id del ultimo mensaje
        const id_last_message = user.messages.length - 1;

        // Obtener los datos del ultimo mensaje
        const last_message = user.messages[id_last_message];

        let message = last_message.message;

        if (message.length > 80) {
          message = message.substring(0, 77) + '...';
        }

        user.new_messages = user.messages.filter(message => {
          return message.hasOwnProperty('read') && !message.sent && !message.read;
        }).length;

        // Establecer los datos del ultimo mensaje
        user.last_message = message;
        user.date_last_message = last_message.date;
      } else {
        // Establecer los datos por defecto del ultimo mensaje
        user.last_message = '';
        user.date_last_message = '';
      }
    });

    users = users.sort((a, b) => {
      if(a.name < b.name) { return -1; }
      if(a.name > b.name) { return 1; }
      return 0;
    })

    return users;
  }

  /**
   * Buscar conversaciones.
   * @param event
   * @author Jhon García
   */
  searchUsers() {
    this.filtered_users = this.users.sort((a, b) => {
      if(a.name < b.name) { return -1; }
      if(a.name > b.name) { return 1; }
      return 0;
    });

    if (this.filter && this.filter.trim() != '') {
      this.filtered_users = this.filtered_users.filter((user: any) => {
        return (JSON.stringify(user).toLowerCase().indexOf(this.filter.toLowerCase()) > 1);
      }).sort(function(a, b){
        if(a.name < b.name) { return -1; }
        if(a.name > b.name) { return 1; }
        return 0;
      });
    }
  }

}
