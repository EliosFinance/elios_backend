#!/bin/bash

# Script pour générer et exécuter les migrations TypeORM
# À exécuter AVANT le déploiement en production

echo "🔄 Génération des migrations TypeORM..."

# Vérifier que npm est disponible
if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

# Build du projet
echo "🏗️ Build du projet..."
npm run build

# Générer la migration initiale
echo "📝 Génération de la migration initiale..."
npx typeorm migration:generate -d dist/src/data-source.js src/migrations/InitialMigration

echo "✅ Migration générée dans src/migrations/"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Vérifiez le fichier de migration généré"
echo "2. Modifiez src/api/app.module.ts pour utiliser les migrations"
echo "3. Déployez en production"
echo ""
echo "💡 En production, les migrations seront automatiquement exécutées"
