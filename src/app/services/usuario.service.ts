import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Usuario {
  uid: string;
  nome: string;
  email: string;
  tipo: string;
  departamento: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  constructor(private firestore: AngularFirestore) {}

  obterUsuarios(): Observable<Usuario[]> {
    return this.firestore.collection<Usuario>('users')
      .snapshotChanges()
      .pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Usuario;
          const uid = a.payload.doc.id;
          return { ...data, uid };
        }))
      );
  }

  async excluirUsuario(uid: string): Promise<void> {
    try {
      await this.firestore.collection('users').doc(uid).delete();
      console.log(`Usuário com UID ${uid} excluído do Firestore.`);
    } catch (error) {
      console.error("Erro ao excluir usuário do Firestore:", error);
      throw error;
    }
  }

  obterUsuariosPorTipo(tipo: string): Observable<Usuario[]> {
    return this.firestore.collection<Usuario>('users', ref => ref.where('tipo', '==', tipo))
      .snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data() as Usuario;
          const uid = a.payload.doc.id;
          return { ...data, uid };
        }))
      );
  }

  obterProfessores(): Observable<Usuario[]> {
    return this.firestore.collection<Usuario>('users', ref => ref.where('tipo', '==', 'Professor'))
      .snapshotChanges().pipe(
        map(actions => actions.map(a => {
          const data = a.payload.doc.data();
          const uid = a.payload.doc.id;
          return { ...data, uid };
        }))
      );
  }

  async criarUsuario(usuario: Usuario): Promise<void> {
    try {
      const ref = this.firestore.collection('users').doc();
      await ref.set(usuario);
      console.log('Usuário criado com sucesso:', usuario);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async atualizarUsuario(uid: string, dados: Partial<Usuario>): Promise<void> {
    try {
      await this.firestore.collection('users').doc(uid).update(dados);
      console.log(`Usuário ${uid} atualizado com sucesso.`);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }
}
