import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { HomeComponent } from './pages/home/home.component';
import { AuthGuard } from '../app/auth.guard';
import { AtendimentoComponent } from './pages/atendimento/atendimento.component';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { VisualizarPacienteComponent } from './pages/pacientes/visualizar-paciente/visualizar-paciente.component';
import { EstagiariosComponent } from './pages/estagiarios/estagiarios.component';
import { AvaliacaoAtendimentoComponent } from './pages/avaliacao-atendimento/avaliacao-atendimento.component';
import { HistoricoAtendimentosComponent } from './pages/historico-atendimentos/historico-atendimentos.component'; 

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'atendimento', component: AtendimentoComponent, canActivate: [AuthGuard] },
  { path: 'pacientes', component: PacientesComponent, canActivate: [AuthGuard] },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [AuthGuard] },
  { path: 'estagiarios', component: EstagiariosComponent },
  { path: 'visualizar-paciente', component: VisualizarPacienteComponent, canActivate: [AuthGuard] },
  { path: 'avaliacao/:id', component: AvaliacaoAtendimentoComponent },
  { path: 'historico-atendimentos', component: HistoricoAtendimentosComponent, canActivate: [AuthGuard]},
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }