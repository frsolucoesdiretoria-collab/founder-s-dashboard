// Report PDF Generator Component
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import type { RelatorioMensal } from '@/types/domaCondoClient';

interface ReportPDFGeneratorProps {
  relatorio: RelatorioMensal;
}

export function ReportPDFGenerator({ relatorio }: ReportPDFGeneratorProps) {
  const formatMesReferencia = (mes: string) => {
    const [ano, mesNum] = mes.split('-');
    const meses = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${meses[parseInt(mesNum) - 1]}/${ano}`;
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatDateTable = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    // Cabeçalho
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO MENSAL DE SERVIÇOS', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente / Condomínio: ${relatorio.cliente.name}`, margin, yPos);
    yPos += 6;
    doc.text(`Período de Referência: ${formatMesReferencia(relatorio.mesReferencia)}`, margin, yPos);
    yPos += 6;
    doc.text(`Data de Emissão: ${formatDate(relatorio.dataEmissao)}`, margin, yPos);
    yPos += 6;
    doc.text('Equipe Responsável: Doma – Assessoria, Consultoria e BPO Financeiro', margin, yPos);
    yPos += 15;

    // Seção 1: Resumo Executivo
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Resumo Executivo', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const resumoLines = doc.splitTextToSize(relatorio.textos.resumoExecutivo || 'Não informado', maxWidth);
    doc.text(resumoLines, margin, yPos);
    yPos += resumoLines.length * 5 + 10;

    // Seção 2: Entregas e Prazos
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Entregas e Prazos', margin, yPos);
    yPos += 7;

    if (relatorio.entregas.length > 0) {
      // Cabeçalho da tabela
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Atividade', margin, yPos);
      doc.text('Data Prevista', margin + 50, yPos);
      doc.text('Data Finalização', margin + 90, yPos);
      doc.text('Status', margin + 140, yPos);
      yPos += 6;

      doc.setFont('helvetica', 'normal');
      relatorio.entregas.forEach((entrega) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(entrega.atividade, margin, yPos);
        doc.text(formatDateTable(entrega.dataPrevista), margin + 50, yPos);
        doc.text(formatDateTable(entrega.dataFinalizacao), margin + 90, yPos);
        doc.text(entrega.status, margin + 140, yPos);
        yPos += 6;
      });
    } else {
      doc.setFontSize(10);
      doc.text('Nenhuma entrega registrada para este período.', margin, yPos);
      yPos += 6;
    }
    yPos += 10;

    // Seção 3: Volume de Trabalho
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Volume de Trabalho Executado', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Quantidade de lançamentos realizados: ${relatorio.volumeTrabalho.lancamentosRealizados}`, margin, yPos);
    yPos += 6;
    doc.text(`Quantidade de documentos processados: ${relatorio.volumeTrabalho.documentosProcessados}`, margin, yPos);
    yPos += 6;
    doc.text(`Contas / centros de custo movimentados: ${relatorio.volumeTrabalho.contasMovimentadas}`, margin, yPos);
    yPos += 6;
    doc.text(`Fornecedores ativos no período: ${relatorio.volumeTrabalho.fornecedoresAtivos}`, margin, yPos);
    yPos += 10;

    // Seção 4: Qualidade
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Qualidade e Controle dos Lançamentos', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Quantidade de erros identificados: ${relatorio.qualidadeControle.errosIdentificados}`, margin, yPos);
    yPos += 6;
    doc.text(`Percentual de erros sobre o total de lançamentos: ${relatorio.qualidadeControle.percentualErros.toFixed(2)}%`, margin, yPos);
    yPos += 6;
    doc.text(`Correções realizadas no mesmo período: ${relatorio.qualidadeControle.correcoesRealizadas ? 'Sim' : 'Não'}`, margin, yPos);
    yPos += 10;

    // Seção 5: Melhorias
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('5. Melhorias Implementadas no Período', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const melhoriasLines = doc.splitTextToSize(relatorio.textos.melhoriasImplementadas || 'Nenhuma melhoria registrada.', maxWidth);
    doc.text(melhoriasLines, margin, yPos);
    yPos += melhoriasLines.length * 5 + 10;

    // Seção 6: Chamados
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('6. Chamados, Demandas e Pontos de Atenção', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Quantidade de chamados relevantes no período: ${relatorio.textos.chamadosRelevantes}`, margin, yPos);
    yPos += 10;
    doc.text('Demandas que exigiram atenção especial:', margin, yPos);
    yPos += 6;
    const demandasLines = doc.splitTextToSize(relatorio.textos.demandasAtencaoEspecial || 'Nenhuma demanda especial.', maxWidth);
    doc.text(demandasLines, margin, yPos);
    yPos += demandasLines.length * 5 + 6;
    doc.text('Pontos recorrentes identificados:', margin, yPos);
    yPos += 6;
    const pontosLines = doc.splitTextToSize(relatorio.textos.pontosRecorrentes || 'Nenhum ponto recorrente.', maxWidth);
    doc.text(pontosLines, margin, yPos);
    yPos += pontosLines.length * 5 + 6;
    doc.text('Pendências para o próximo período:', margin, yPos);
    yPos += 6;
    const pendenciasLines = doc.splitTextToSize(relatorio.textos.pendenciasProximoPeriodo || 'Nenhuma pendência.', maxWidth);
    doc.text(pendenciasLines, margin, yPos);
    yPos += pendenciasLines.length * 5 + 10;

    // Seção 7: Feedbacks
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('7. Feedbacks Importantes', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Feedbacks positivos recebidos:', margin, yPos);
    yPos += 6;
    const feedbacksLines = doc.splitTextToSize(relatorio.textos.feedbacksPositivos || 'Nenhum feedback.', maxWidth);
    doc.text(feedbacksLines, margin, yPos);
    yPos += feedbacksLines.length * 5 + 6;
    doc.text('Pontos de alinhamento ou ajustes identificados:', margin, yPos);
    yPos += 6;
    const alinhamentosLines = doc.splitTextToSize(relatorio.textos.pontosAlinhamento || 'Nenhum ponto de alinhamento.', maxWidth);
    doc.text(alinhamentosLines, margin, yPos);
    yPos += alinhamentosLines.length * 5 + 10;

    // Seção 8: Recomendações
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('8. Recomendações e Próximos Passos', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const recomendacoesLines = doc.splitTextToSize(relatorio.textos.recomendacoes || 'Nenhuma recomendação.', maxWidth);
    doc.text(recomendacoesLines, margin, yPos);
    yPos += recomendacoesLines.length * 5 + 10;

    // Seção 9: Encerramento
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('9. Encerramento', margin, yPos);
    yPos += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const encerramentoText = 'Permanecemos à disposição para esclarecimentos adicionais e reforçamos nosso compromisso com a transparência, organização e excelência na gestão financeira.';
    const encerramentoLines = doc.splitTextToSize(encerramentoText, maxWidth);
    doc.text(encerramentoLines, margin, yPos);
    yPos += encerramentoLines.length * 5 + 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Doma – Assessoria, Consultoria e BPO Financeiro', margin, yPos);

    // Salvar PDF
    const fileName = `Relatorio_Mensal_${relatorio.cliente.name.replace(/\s+/g, '_')}_${relatorio.mesReferencia}.pdf`;
    doc.save(fileName);
  };

  return (
    <Button onClick={generatePDF} className="gap-2">
      <Download className="h-4 w-4" />
      Exportar PDF
    </Button>
  );
}

