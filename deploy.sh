#!/bin/bash

# Script de déploiement simple pour Elios
set -e

# Variables - MODIFIEZ CES VALEURS
EC2_IP="51.44.42.106"
DOMAIN="prod.api.elios.finance"
EMAIL="admin@elios.finance"
KEY_PATH="./elios-keypair.pem"
REPO_URL="git@github.com:EliosFinance/elios_backend.git"


# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour exécuter des commandes sur EC2
run_remote() {
    ssh -i "$KEY_PATH" -o StrictHostKeyChecking=no ec2-user@$EC2_IP "$1"
}

# Fonction pour copier des fichiers vers EC2
copy_to_ec2() {
    scp -i "$KEY_PATH" -o StrictHostKeyChecking=no "$1" ec2-user@$EC2_IP:"$2"
}

main() {
    echo "🚀 Déploiement Elios Simple"
    echo "=========================="
    echo "🌐 Domaine: $DOMAIN"
    echo "📡 IP EC2: $EC2_IP"
    echo ""

    # Vérifications
    if [ ! -f "$KEY_PATH" ]; then
        log_error "Clé SSH non trouvée: $KEY_PATH"
        exit 1
    fi

    chmod 600 "$KEY_PATH"

    # Test connexion SSH
    log_info "Test de connexion SSH..."
    if ! run_remote "echo 'Connexion OK'"; then
        log_error "Impossible de se connecter à l'EC2"
        exit 1
    fi

    # Cloner le projet
    log_info "Clonage du projet..."
    run_remote "sudo yum update -y"
    run_remote "sudo yum install -y git docker"
    run_remote "sudo systemctl start docker"
    run_remote "sudo systemctl enable docker"
    run_remote "sudo usermod -a -G docker ec2-user"

    # Installer Docker Compose
    log_info "Installation de Docker Compose..."
    run_remote "sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
    run_remote "sudo chmod +x /usr/local/bin/docker-compose"

    # Cloner le repository
    log_info "Clonage du repository Elios..."
    run_remote "rm -rf elios_backend && git clone $REPO_URL"
    run_remote "cd elios_backend && git checkout main"

    # Copier les fichiers de configuration
    log_info "Copie des fichiers de configuration..."
    copy_to_ec2 "docker-compose.production.yml" "elios_backend/"
    copy_to_ec2 "Dockerfile.production" "elios_backend/"
    copy_to_ec2 "Dockerfile.worker" "elios_backend/"
    copy_to_ec2 ".env.production" "elios_backend/.env"
    copy_to_ec2 "src/api/app.module.ts" "elios_backend/src/api/"
    copy_to_ec2 "elios.conf" "/tmp/"

    # Configuration Nginx
    log_info "Configuration de Nginx..."
    run_remote "sudo yum install -y nginx"
    run_remote "sudo mv /tmp/elios.conf /etc/nginx/conf.d/elios.conf"
    run_remote "sudo mkdir -p /var/www/html"
    run_remote "sudo systemctl start nginx"
    run_remote "sudo systemctl enable nginx"

    # Démarrage des containers
    log_info "Démarrage des containers Docker..."
    run_remote "cd elios_backend && sudo docker-compose -f docker-compose.production.yml up -d --build"

    # Configuration SSL
    log_info "Configuration SSL avec Let's Encrypt..."
    run_remote "sudo yum install -y python3-pip"
    run_remote "sudo pip3 install certbot certbot-nginx"
    run_remote "sudo certbot --nginx -d $DOMAIN --email $EMAIL --agree-tos --non-interactive"

    # Redémarrage Nginx
    run_remote "sudo systemctl restart nginx"

    # Tests
    log_info "Tests finaux..."
    sleep 30

    if curl -f "https://$DOMAIN/api" >/dev/null 2>&1; then
        log_success "API accessible"
    else
        log_error "API non accessible"
    fi

    if curl -f "https://$DOMAIN/api-docs" >/dev/null 2>&1; then
        log_success "Swagger accessible"
    else
        log_error "Swagger non accessible"
    fi

    echo ""
    log_success "🎉 Déploiement terminé!"
    echo ""
    echo "🌐 URLs:"
    echo "  - API: https://$DOMAIN/api"
    echo "  - Swagger: https://$DOMAIN/api-docs"
    echo "  - Health: https://$DOMAIN/health"
    echo ""
    echo "🔧 Commandes utiles:"
    echo "  - SSH: ssh -i $KEY_PATH ec2-user@$EC2_IP"
    echo "  - Logs: ssh -i $KEY_PATH ec2-user@$EC2_IP 'cd elios && sudo docker-compose logs'"
    echo "  - Restart: ssh -i $KEY_PATH ec2-user@$EC2_IP 'cd elios && sudo docker-compose restart'"
    echo ""
}

main "$@"
