import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, firstValueFrom } from 'rxjs'; // 'firstValueFrom' vem de 'rxjs'
import { switchMap, map } from 'rxjs/operators'; // 'map' vem de 'rxjs/operators'
import { Agendamento } from './agendamento.service';
import Swal from 'sweetalert2';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usuarioLogadoSubject = new BehaviorSubject<any | null>(null);
  public usuarioLogado$ = this.usuarioLogadoSubject.asObservable();

  constructor(
    private afAuth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router
  ) {
    this.afAuth.authState.pipe(
      switchMap(user => {
        if (user) {
          return this.firestore.collection('users').doc(user.uid).valueChanges();
        } else {
          return of(null);
        }
      })
    ).subscribe(userData => {
      this.usuarioLogadoSubject.next(userData);
    });
  }


async login(email: string, password: string) {
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (user) {
        const docRef = this.firestore.collection('users').doc(user.uid);
        const snapshot = await docRef.ref.get();

        if (!snapshot.exists) {
          // Se não encontrou o usuário no Firestore
          await this.afAuth.signOut();
          Swal.fire({
            icon: 'error',
            title: 'Erro ao realizar login',
            text: 'Usuário removido do sistema. Entre em contato com o administrador.',
            confirmButtonColor: '#d33'
          });

          return;
        }

        this.router.navigate(['/home']);
      }

    } catch (error: any) {
      this.handleAuthError(error); 
    }
  }

  async logout() {
    await this.afAuth.signOut();
    this.router.navigate(['/login']);
  }

  async registerInterno(email: string, password: string, departamento: string, nome: string, tipo: string): Promise<void> {
    const { initializeApp } = await import('firebase/app');
    const { getAuth, createUserWithEmailAndPassword } = await import('firebase/auth');
    const app = initializeApp(environment.firebaseConfig, 'segundoApp');
    const secondAuth = getAuth(app);

    try {
      const userCredential = await createUserWithEmailAndPassword(secondAuth, email, password);
      const newUser = userCredential.user;
      if (newUser) {
        await this.firestore.collection('users').doc(newUser.uid).set({ uid: newUser.uid, email, departamento, nome, tipo });
      }
    } catch (error) {
    }
  }

  async atualizarUsuario(uid: string, nome: string, tipo: string, departamento: string): Promise<void> {
    await this.firestore.collection('users').doc(uid).update({ nome, tipo, departamento });
  }

  async enviarEmailRedefinicaoSenha(email: string): Promise<void> {
    await this.afAuth.sendPasswordResetEmail(email);
  }


  getUsuarioLogado(): Promise<any | null> {
    return firstValueFrom(this.usuarioLogado$);
  }
  
  async getTipoUsuario(): Promise<string | null> {
    const user = await this.getUsuarioLogado();
    return user?.tipo || null;
  }

  getTipoUsuarioLocal(): string | null {
    return this.usuarioLogadoSubject.getValue()?.tipo || null;
  }
  
  getUser(): Observable<any> {
    return this.afAuth.authState;
  }


  podeGerenciarUsuarios(): Observable<boolean> {
    return this.usuarioLogado$.pipe(map(user => user?.tipo === 'Secretaria'));
  }

  podeGerenciarEstagiarios(): Observable<boolean> {
    return this.usuarioLogado$.pipe(map(user => user?.tipo === 'Professor' || user?.tipo === 'Secretaria'));
  }

  private handleAuthError(error: any) {
    console.error("Erro de autenticação:", error); 

    let errorMsg = "Erro ao processar a solicitação. Tente novamente.";

    if (error.code === 'auth/email-already-in-use') {
      errorMsg = "Este e-mail já está em uso!";
    } else if (error.code === 'auth/weak-password') {
      errorMsg = "A senha precisa ter pelo menos 6 caracteres.";
    } else if (error.code === 'auth/invalid-email') {
      errorMsg = "O e-mail fornecido não é válido.";
    } else if (
      error.code === 'auth/wrong-password', 
      error.code === 'auth/user-not-found' ,
      error.code === 'auth/invalid-credential'
  ) {
      errorMsg = "Email ou senha incorretos.";
    }

    Swal.fire({
      icon: 'error',
      title: 'Erro de autenticação',
      text: errorMsg,
      confirmButtonColor: '#0d47a1'
    });
  }
}
