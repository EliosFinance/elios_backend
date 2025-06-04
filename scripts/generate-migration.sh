#!/bin/bash

# Script pour créer les migrations TypeORM initiales
# À exécuter AVANT le déploiement en production

echo "🔄 Création des migrations TypeORM..."

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

# Créer le répertoire migrations
mkdir -p src/migrations

# Créer la migration initiale (vide)
echo "📝 Création de la migration initiale..."
npx typeorm migration:create src/migrations/InitialMigration

echo "✅ Migration créée dans src/migrations/"
echo ""
echo "📋 Prochaines étapes:"
echo "1. La migration vide a été créée"
echo "2. En production, TypeORM va créer automatiquement les tables avec synchronize"
echo "3. Pour les futurs changements, utilisez migration:generate"
echo ""
echo "💡 Cette approche permet une transition en douceur vers les migrations"
