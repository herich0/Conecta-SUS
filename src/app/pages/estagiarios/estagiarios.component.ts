import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { first } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-estagiarios',
  templateUrl: './estagiarios.component.html',
  styleUrls: ['./estagiarios.component.scss']
})
export class EstagiariosComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'email', 'acoes'];
  dataSource = new MatTableDataSource<Usuario>();
  temPermissao = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private router: Router,
    private usuarioService: UsuarioService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.verificarPermissao();

    this.usuarioService.obterUsuariosPorTipo('Estagiário').subscribe((estagiarios: Usuario[]) => {
      this.dataSource.data = estagiarios;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  async verificarPermissao() {
    this.temPermissao = await firstValueFrom(this.authService.podeGerenciarEstagiarios());

    if (!this.temPermissao) {
      this.router.navigate(['/home']);
      Swal.fire('Acesso Negado', 'Você não tem permissão para acessar esta página.', 'error');
    }
  }


  irParaCadastro(): void {
    this.router.navigate(['/cadastro']);
  }

  editarUsuario(usuario: Usuario) {
    sessionStorage.setItem('usuarioEdicao', JSON.stringify(usuario));
    this.router.navigate(['/cadastro'], { queryParams: { contexto: 'estagiario' } });
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  excluirUsuario(usuario: Usuario): void {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Deseja excluir este estagiário?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, excluir',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then(async (result) => {
      if (result.isConfirmed && usuario.uid) {
        try {
          await this.usuarioService.excluirUsuario(usuario.uid);
          Swal.fire('Excluído!', 'O estagiário foi excluído do sistema.', 'success');
        } catch (error) {
          Swal.fire('Erro!', 'Erro ao excluir o estagiário.', 'error');
        }
      }
    });
  }

  irParaCadastroEstagiario(): void {
    this.router.navigate(['/cadastro'], { queryParams: { contexto: 'estagiario' } });
  }
}