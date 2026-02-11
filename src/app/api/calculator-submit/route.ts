import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        const {
            nome,
            whatsapp,
            ticketMedio,
            consultasDia,
            cancelamentosMes,
            perdaMensal,
            timestamp
        } = body;

        // Validação de campos obrigatórios
        if (!nome || !whatsapp || !ticketMedio || !cancelamentosMes) {
            return NextResponse.json(
                { error: 'Campos obrigatórios faltando' },
                { status: 400 }
            );
        }

        // TODO: Integração com Notion MCP será implementada após validação dos campos da database
        // Por enquanto, apenas logamos os dados para debug
        console.log('Lead capturado:', {
            nome,
            whatsapp,
            ticketMedio,
            consultasDia,
            cancelamentosMes,
            perdaMensal,
            timestamp: timestamp || new Date().toISOString()
        });

        // Simulação de sucesso
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('Erro ao processar lead:', error);
        return NextResponse.json(
            { error: 'Erro interno do servidor' },
            { status: 500 }
        );
    }
}
