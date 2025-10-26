import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-exportar-pdf-modal',
  templateUrl: './exportar-pdf-modal.component.html',
  styleUrls: ['./exportar-pdf-modal.component.scss']
})
export class ExportarPdfModalComponent {
  campos = {
    anamnese: true,
    exameFisico: true,
    solicitacaoExames: true,
    orientacao: true,
    prescricao: true,
    conduta: true,
    cid10: true
  };

  constructor(private dialogRef: MatDialogRef<ExportarPdfModalComponent>) {}

  confirmar() {
    this.dialogRef.close(this.campos);
  }
}
