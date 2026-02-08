#!/usr/bin/env python3
"""
Script de Otimização de Imagens para v5-3-5
Reduz tamanho das imagens WebP sem perda visual perceptível
Cria backups e versões responsivas
"""

import os
import sys
from pathlib import Path
from PIL import Image
import shutil
from datetime import datetime

# Configurações
SOURCE_DIR = Path("public/v5-3/images/imagens v5-3-4")
BACKUP_DIR = Path("public/v5-3/images/imagens v5-3-4-backup")
QUALITY = 85  # Reduzir de ~95 para 85 (imperceptível visualmente)

# Dimensões responsivas para srcset
RESPONSIVE_SIZES = {
    'hero.webp': [(400, 'small'), (800, 'medium'), (1200, 'large')],
    'cta.webp': [(400, 'small'), (800, 'medium'), (1200, 'large')],
    'the_fall.webp': [(400, 'small'), (800, 'medium'), (1200, 'large')],
    'radar.webp': [(300, 'small'), (600, 'medium'), (900, 'large')],
    'target.webp': [(300, 'small'), (600, 'medium'), (900, 'large')],
    'shot.webp': [(300, 'small'), (600, 'medium'), (900, 'large')],
}

def get_image_info(img_path):
    """Retorna informações da imagem"""
    img = Image.open(img_path)
    return {
        'width': img.width,
        'height': img.height,
        'format': img.format,
        'size_kb': os.path.getsize(img_path) / 1024
    }

def optimize_image(input_path, output_path, quality=85, max_width=None):
    """Otimiza uma imagem WebP"""
    img = Image.open(input_path)
    
    # Redimensionar se necessário
    if max_width and img.width > max_width:
        ratio = max_width / img.width
        new_height = int(img.height * ratio)
        img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
    
    # Salvar com qualidade otimizada
    img.save(output_path, 'WEBP', quality=quality, method=6)
    
    return get_image_info(output_path)

def create_responsive_versions(img_name, source_path):
    """Cria versões responsivas da imagem"""
    if img_name not in RESPONSIVE_SIZES:
        return []
    
    versions = []
    base_name = img_name.replace('.webp', '')
    
    for width, size_label in RESPONSIVE_SIZES[img_name]:
        output_name = f"{base_name}-{size_label}.webp"
        output_path = SOURCE_DIR / output_name
        
        info = optimize_image(source_path, output_path, QUALITY, max_width=width)
        versions.append({
            'name': output_name,
            'width': width,
            'size_kb': info['size_kb']
        })
    
    return versions

def main():
    print("🚀 Iniciando otimização de imagens v5-3-5\n")
    
    # Verificar se diretório existe
    if not SOURCE_DIR.exists():
        print(f"❌ Erro: Diretório {SOURCE_DIR} não encontrado")
        sys.exit(1)
    
    # Criar backup
    print("📦 Criando backup das imagens originais...")
    if BACKUP_DIR.exists():
        print(f"⚠️  Backup já existe em {BACKUP_DIR}")
        response = input("Sobrescrever? (s/N): ")
        if response.lower() != 's':
            print("❌ Operação cancelada")
            sys.exit(0)
        shutil.rmtree(BACKUP_DIR)
    
    shutil.copytree(SOURCE_DIR, BACKUP_DIR)
    print(f"✅ Backup criado em {BACKUP_DIR}\n")
    
    # Processar imagens
    total_original = 0
    total_optimized = 0
    results = []
    
    for img_file in SOURCE_DIR.glob("*.webp"):
        if '-small' in img_file.name or '-medium' in img_file.name or '-large' in img_file.name:
            continue  # Pular versões responsivas já existentes
        
        print(f"🖼️  Processando: {img_file.name}")
        
        # Info original
        original_info = get_image_info(img_file)
        total_original += original_info['size_kb']
        
        # Otimizar original
        temp_path = img_file.with_suffix('.tmp.webp')
        optimized_info = optimize_image(img_file, temp_path, QUALITY)
        
        # Substituir original
        shutil.move(temp_path, img_file)
        total_optimized += optimized_info['size_kb']
        
        # Criar versões responsivas
        responsive = create_responsive_versions(img_file.name, img_file)
        
        result = {
            'name': img_file.name,
            'original_kb': original_info['size_kb'],
            'optimized_kb': optimized_info['size_kb'],
            'reduction_pct': ((original_info['size_kb'] - optimized_info['size_kb']) / original_info['size_kb']) * 100,
            'dimensions': f"{optimized_info['width']}x{optimized_info['height']}",
            'responsive_versions': responsive
        }
        results.append(result)
        
        print(f"   Original: {original_info['size_kb']:.1f}KB → Otimizado: {optimized_info['size_kb']:.1f}KB ({result['reduction_pct']:.1f}% redução)")
        print(f"   Dimensões: {result['dimensions']}")
        
        if responsive:
            print(f"   📐 Criadas {len(responsive)} versões responsivas:")
            for v in responsive:
                print(f"      - {v['name']} ({v['width']}px, {v['size_kb']:.1f}KB)")
        print()
    
    # Resumo final
    print("=" * 60)
    print("📊 RESUMO DA OTIMIZAÇÃO")
    print("=" * 60)
    print(f"Total de imagens processadas: {len(results)}")
    print(f"Tamanho original total: {total_original:.1f}KB")
    print(f"Tamanho otimizado total: {total_optimized:.1f}KB")
    reduction = total_original - total_optimized
    reduction_pct = (reduction / total_original) * 100
    print(f"Economia: {reduction:.1f}KB ({reduction_pct:.1f}%)")
    print()
    
    # Contar versões responsivas
    total_responsive = sum(len(r['responsive_versions']) for r in results)
    print(f"Versões responsivas criadas: {total_responsive}")
    print()
    
    print("✅ Otimização concluída com sucesso!")
    print(f"📁 Backup das originais: {BACKUP_DIR}")
    
    # Salvar relatório
    report_path = Path("scripts/optimization-report.txt")
    with open(report_path, 'w') as f:
        f.write(f"Relatório de Otimização - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        f.write(f"Economia total: {reduction:.1f}KB ({reduction_pct:.1f}%)\n\n")
        f.write("Detalhes por imagem:\n")
        for r in results:
            f.write(f"\n{r['name']}: {r['original_kb']:.1f}KB → {r['optimized_kb']:.1f}KB ({r['reduction_pct']:.1f}%)\n")
            if r['responsive_versions']:
                for v in r['responsive_versions']:
                    f.write(f"  - {v['name']}: {v['size_kb']:.1f}KB\n")
    
    print(f"📄 Relatório salvo em: {report_path}")

if __name__ == "__main__":
    main()
