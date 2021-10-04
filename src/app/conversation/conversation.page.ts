import {Component, OnInit, ViewChild} from '@angular/core';
import {ActivatedRoute} from "@angular/router";
import {map} from "rxjs/operators";
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.page.html',
  styleUrls: ['./conversation.page.scss'],
})
export class ConversationPage implements OnInit {

  @ViewChild('content', { static: false }) private content: any;
  public users: any = [];
  public user_id: any;
  public conversation: any = {};

  constructor(
    private http: HttpClient,
    private activatedRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.user_id = this.activatedRoute.snapshot.paramMap.get('user_id');
    this.setUsers();
    this.setConversation();

    setTimeout(() => {
      this.content.scrollToBottom(10);
    }, 100)
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
  setConversation() {
    this.getConversations().subscribe(response => {
      this.conversation = response.find(conversation => conversation.user_id == this.user_id);

      if (!this.conversation){
        this.conversation = {
          user_id: this.user_id,
          user: this.users.find(user => user.id == this.user_id),
          messages: []
        }
      }
    });
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

}
