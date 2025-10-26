import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AgendamentoService, Agendamento } from '../../services/agendamento.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { ExportarPdfModalComponent } from '../../components/exportar-pdf-modal/exportar-pdf-modal.component';
import jsPDF from 'jspdf';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-atendimento',
  templateUrl: './atendimento.component.html',
  styleUrls: ['./atendimento.component.scss']
})
export class AtendimentoComponent implements OnInit {
  atendimentoForm: FormGroup;
  agendamentoId: string | null = null;
  pacienteId: string | null = null;
  nome: string | null = null;
  idade: number | null = null;
  estagiarioNome: string | null = null;
  dataAtendimento: string | null = null;
  private estagiarioUid: string | null = null;
  private professorResponsavelUid: string | null = null;
  private professorResponsavelNome: string | null = null;

  anamnese: string = '';
  exameFisico: string = '';
  solicitacaoExames: string = '';
  orientacao: string = '';
  prescricao: string = '';
  conduta: string = '';
  cid10: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private agendamentoService: AgendamentoService,
    private dialog: MatDialog,
    private authService: AuthService
  ) {
    this.atendimentoForm = this.fb.group({
      anamnese: ['', Validators.required],
      exameFisico: ['', Validators.required],
      solicitacaoExames: [''],
      orientacao: [''],
      prescricao: [''],
      conduta: ['', Validators.required],
      cid10: ['']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(async params => {
      this.agendamentoId = params['id'];
      this.pacienteId = params['pacienteId'];
      this.nome = params['nome'];
      this.idade = params['idade'];
      this.dataAtendimento = params['data'];
      this.professorResponsavelNome = params['professorNome'];
      this.professorResponsavelUid = params['professorUid'];

      if (this.agendamentoId) {
        const atendimentoExistente = await this.agendamentoService.obterAtendimentoPorId(this.agendamentoId);
        if (atendimentoExistente) {
          this.atendimentoForm.patchValue({
            anamnese: atendimentoExistente.anamnese || '',
            exameFisico: atendimentoExistente.exameFisico || '',
            solicitacaoExames: atendimentoExistente.solicitacaoExames || '',
            orientacao: atendimentoExistente.orientacao || '',
            prescricao: atendimentoExistente.prescricao || '',
            conduta: atendimentoExistente.conduta || '',
            cid10: atendimentoExistente.cid10 || ''
          });
        }
      }
    });

    this.authService.getUsuarioLogado().then(user => {
      if (user) {
        this.estagiarioNome = user.nome;
        this.estagiarioUid = user.uid;
      }
    });
  }


  async salvarAtendimento(): Promise<void> {
    if (this.atendimentoForm.invalid) {
      this.atendimentoForm.markAllAsTouched();
      Swal.fire('Atenção', 'Por favor, preencha todos os campos obrigatórios.', 'warning');
      return;
    }

    if (!this.agendamentoId) {
      Swal.fire('Erro Crítico', 'Não foi possível identificar o atendimento.', 'error');
      return;
    }

    const dados = this.atendimentoForm.value;

    try {
      const atendimentoExistente = await this.agendamentoService.obterAtendimentoPorId(this.agendamentoId);

      if (atendimentoExistente) {
        await this.agendamentoService.atualizarAtendimento(this.agendamentoId, dados);
        Swal.fire('Sucesso!', 'Atendimento atualizado com sucesso.', 'success');
      } else {
        const atendimentoNovo: Agendamento = {
          ...dados,
          agendamentoId: this.agendamentoId,
          pacienteId: this.pacienteId!,
          nome: this.nome!,
          idade: this.idade!,
          data: this.dataAtendimento!,
          hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          status: 'pendente',
          estagiarioNome: this.estagiarioNome!,
          estagiarioUid: this.estagiarioUid!,
          professorResponsavelNome: this.professorResponsavelNome!,
          professorResponsavelUid: this.professorResponsavelUid!
        };

        await this.agendamentoService.criarAtendimento(atendimentoNovo);
        await this.agendamentoService.marcarAgendamentoComoFinalizado(this.agendamentoId);
        Swal.fire('Sucesso!', 'Atendimento criado e finalizado com sucesso.', 'success');
      }

      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Erro ao salvar atendimento:', error);
      Swal.fire('Erro!', 'Ocorreu um problema ao salvar o atendimento.', 'error');
    }
  }


  cancelar(): void {
    this.router.navigate(['/home']);
  }

  abrirModalExportarPDF() {
    const dialogRef = this.dialog.open(ExportarPdfModalComponent);

    dialogRef.afterClosed().subscribe(camposSelecionados => {
      if (camposSelecionados) {
        const img = new Image();
        img.src = 'assets/logo.png';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0);
          const imgData = canvas.toDataURL('image/png');

          const doc = new jsPDF();
          const pageHeight = doc.internal.pageSize.getHeight();
          const pageWidth = doc.internal.pageSize.getWidth();
          const margin = 10;
          const maxWidth = pageWidth - 2 * margin;
          const lineHeight = 8;

          let y = 10;


          const imgWidth = 50;
          const imgX = (pageWidth - imgWidth) / 2;
          doc.addImage(imgData, 'PNG', imgX, y, imgWidth, 20);
          y += 30;


          doc.setFontSize(12);
          const titulo = `Atendimento - ${this.nome} (${this.idade} anos)`;
          const tituloLines = doc.splitTextToSize(titulo, maxWidth);
          doc.text(tituloLines, margin, y);
          y += tituloLines.length * lineHeight;


          const adicionarCampo = (label: string, conteudo: string | null) => {
            const text = `${label}: ${conteudo || '-'}`;
            const lines = doc.splitTextToSize(text, maxWidth);
            if (y + lines.length * lineHeight > pageHeight - 20) {
              doc.addPage();
              y = 10;
            }
            doc.text(lines, margin, y);
            y += lines.length * lineHeight;
          };


          if (camposSelecionados.anamnese) adicionarCampo('Anamnese', this.anamnese);
          if (camposSelecionados.exameFisico) adicionarCampo('Exame Físico', this.exameFisico);
          if (camposSelecionados.solicitacaoExames) adicionarCampo('Solicitação de Exames', this.solicitacaoExames);
          if (camposSelecionados.orientacao) adicionarCampo('Orientação', this.orientacao);
          if (camposSelecionados.prescricao) adicionarCampo('Prescrição', this.prescricao);
          if (camposSelecionados.conduta) adicionarCampo('Conduta', this.conduta);
          if (camposSelecionados.cid10) adicionarCampo('CID-10', this.cid10);


          doc.setFontSize(10);
          const footerY1 = pageHeight - 15;
          const footerY2 = pageHeight - 8;
          doc.text('Clínica Médica UNICENTRO', margin, footerY1);
          doc.text(
            'Endereço: Alameda Élio Antonio Dalla Vecchia, 838 - CEP 85040-167 - Bairro - Vila Carli, Guarapuava - PR',
            margin,
            footerY2
          );

          doc.save(`atendimento_${this.nome}.pdf`);
        };
      }
    });
  }
}