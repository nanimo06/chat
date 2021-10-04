import {Component, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {map} from "rxjs/operators";

@Component({
  selector: 'app-conversations',
  templateUrl: './conversations.page.html',
  styleUrls: ['./conversations.page.scss'],
})
export class ConversationsPage implements OnInit {

  public users: any = [];
  public filter: string = '';
  public conversations: any = [];
  public filtered_conversations: any = [];

  constructor(
    private http: HttpClient
  ) {
  }

  async ngOnInit() {
    this.setUsers();
    this.setConversations();
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
          return this.mapConversations(response.data)
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
          return response.data
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
    });
  }

  /**
   * Establecer un valor para conversations
   * @author Jhon García
   */
  setConversations() {
    this.getConversations().subscribe(response => {
      this.conversations = response;
      this.filtered_conversations = response;
    });
  }

  /**
   * Mapear las conversaciones para agregar datos adicionales
   * @param conversations Contiene las conversaciones con los datos adicionales
   * @author Jhon García
   */
  mapConversations(conversations) {

    conversations.forEach(conversation => {

      // Establecer la información del usuario en la conversación
      conversation.user = this.users.find(user => user.id === conversation.user_id);

      // Validar si la conversación tiene mensajes
      if (!!conversation.messages?.length) {
        // Obtener el id del ultimo mensaje
        const id_last_message = conversation.messages.length - 1;

        // Obtener los datos del ultimo mensaje
        const last_message = conversation.messages[id_last_message];

        let message = last_message.message;

        if (message.length > 80) {
          message = message.substring(0, 77) + '...';
        }

        conversation.new_messages = conversation.messages.filter(message => {
          return message.hasOwnProperty('read') && !message.sent && !message.read;
        }).length;

        // Establecer los datos del ultimo mensaje
        conversation.last_message = message;
        conversation.date_last_message = last_message.date;
      } else {
        // Establecer los datos por defecto del ultimo mensaje
        conversation.last_message = '';
        conversation.date_last_message = '';
      }
    });

    return conversations;
  }

  /**
   * Buscar conversaciones.
   * @param event
   * @author Jhon García
   */
  searchConversation() {
    this.filtered_conversations = this.conversations;

    if (this.filter && this.filter.trim() != '') {
      this.filtered_conversations = this.filtered_conversations.filter((conversation: any) => {
        return (JSON.stringify(conversation).toLowerCase().indexOf(this.filter.toLowerCase()) > 1);
      })
    }
  }

}
