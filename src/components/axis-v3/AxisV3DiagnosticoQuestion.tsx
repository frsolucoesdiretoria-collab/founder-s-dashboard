// AXIS V3 — Componente de Pergunta do Diagnóstico

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { DiagnosticoV3Question, DiagnosticoV3Response } from '@/types/axis-v3';

interface AxisV3DiagnosticoQuestionProps {
  question: DiagnosticoV3Question;
  response?: DiagnosticoV3Response;
  onChange: (response: DiagnosticoV3Response) => void;
}

export const AxisV3DiagnosticoQuestion: React.FC<AxisV3DiagnosticoQuestionProps> = ({
  question,
  response,
  onChange
}) => {
  const handleOptionToggle = (option: string) => {
    if (question.permitirMultiplo) {
      const current = response?.opcoesSelecionadas || [];
      const updated = current.includes(option)
        ? current.filter(o => o !== option)
        : [...current, option];
      
      onChange({
        questionId: question.id,
        opcoesSelecionadas: updated,
        respostaAberta: response?.respostaAberta || ''
      });
    } else {
      onChange({
        questionId: question.id,
        opcoesSelecionadas: [option],
        respostaAberta: response?.respostaAberta || ''
      });
    }
  };

  const handleTextChange = (text: string) => {
    onChange({
      questionId: question.id,
      opcoesSelecionadas: response?.opcoesSelecionadas || [],
      respostaAberta: text
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-lg font-bold text-primary">{question.ordem}</span>
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold leading-tight mb-2">
              {question.pergunta}
            </CardTitle>
            <CardDescription className="text-sm text-foreground/60">
              {question.textoApoio}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Opções */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-foreground/70">
            {question.permitirMultiplo ? 'Selecione todas as que se aplicam:' : 'Selecione uma opção:'}
          </p>
          
          {question.permitirMultiplo ? (
            // Checkbox para múltipla escolha
            <div className="space-y-3">
              {question.opcoes.map((opcao) => (
                <div key={opcao} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Checkbox
                    id={`${question.id}-${opcao}`}
                    checked={response?.opcoesSelecionadas.includes(opcao)}
                    onCheckedChange={() => handleOptionToggle(opcao)}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={`${question.id}-${opcao}`}
                    className="text-sm font-normal cursor-pointer leading-relaxed flex-1"
                  >
                    {opcao}
                  </Label>
                </div>
              ))}
            </div>
          ) : (
            // Radio para escolha única
            <RadioGroup
              value={response?.opcoesSelecionadas[0] || ''}
              onValueChange={handleOptionToggle}
              className="space-y-3"
            >
              {question.opcoes.map((opcao) => (
                <div key={opcao} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <RadioGroupItem
                    value={opcao}
                    id={`${question.id}-${opcao}`}
                    className="mt-0.5"
                  />
                  <Label
                    htmlFor={`${question.id}-${opcao}`}
                    className="text-sm font-normal cursor-pointer leading-relaxed flex-1"
                  >
                    {opcao}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}
        </div>

        {/* Campo de texto aberto */}
        <div className="space-y-2 pt-4 border-t">
          <Label htmlFor={`${question.id}-texto`} className="text-sm font-medium">
            {question.campoAberto.obrigatorio && <span className="text-red-500">* </span>}
            Conte mais sobre sua situação:
          </Label>
          <Textarea
            id={`${question.id}-texto`}
            placeholder={question.campoAberto.placeholder}
            value={response?.respostaAberta || ''}
            onChange={(e) => handleTextChange(e.target.value)}
            className="min-h-[120px] resize-none"
          />
        </div>
      </CardContent>
    </Card>
  );
};

