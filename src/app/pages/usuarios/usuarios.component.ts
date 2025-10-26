import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { UsuarioService, Usuario } from '../../services/usuario.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit {
  displayedColumns: string[] = ['nome', 'email', 'tipo', 'acoes'];
  dataSource = new MatTableDataSource<Usuario>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private router: Router, private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.usuarioService.obterUsuarios().subscribe(usuarios => {
      this.dataSource.data = usuarios;
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  irParaCadastro(): void {
    this.router.navigate(['/cadastro']);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  editarUsuario(usuario: Usuario) {
  sessionStorage.setItem('usuarioEdicao', JSON.stringify(usuario));
  this.router.navigate(['/cadastro']);
}

  
  excluirUsuario(usuario: Usuario): void {
    Swal.fire({
      title: 'Tem certeza?',
      text: 'Deseja excluir este usuário? Essa ação não poderá ser desfeita.',
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
          Swal.fire('Excluído!', 'O usuário foi excluído do sistema.', 'success');
        } catch (error) {
          Swal.fire('Erro!', 'Erro ao excluir o usuário.', 'error');
        }
      }
    });
  }
  
}
