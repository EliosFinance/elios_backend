// src/api/emails/templates/default-templates.ts
import { EmailTemplateType } from '../entities/email-template.entity';

export const DEFAULT_EMAIL_TEMPLATES = [
    {
        name: 'welcome_email',
        type: EmailTemplateType.WELCOME,
        subject: 'Bienvenue chez Elios, {{username}}!',
        htmlContent: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue chez Elios</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: transform 0.2s; }
        .btn:hover { transform: translateY(-2px); }
        .feature { display: flex; align-items: center; margin: 20px 0; }
        .feature-icon { width: 40px; height: 40px; background: #e0e7ff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #1e293b; margin-bottom: 20px; }
        p { color: #475569; line-height: 1.6; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Bienvenue chez Elios!</h1>
            <p>Votre parcours vers la liberté financière commence ici</p>
        </div>
        <div class="content">
            <h2>Bonjour {{username}},</h2>
            <p>Félicitations! Vous venez de franchir le premier pas vers une gestion financière intelligente.</p>
            
            <div class="feature">
                <div class="feature-icon">📊</div>
                <div>
                    <strong>Analyses personnalisées</strong><br>
                    Obtenez des insights sur vos habitudes de dépenses
                </div>
            </div>
            
            <div class="feature">
                <div class="feature-icon">🎯</div>
                <div>
                    <strong>Défis financiers</strong><br>
                    Participez à des challenges pour améliorer vos finances
                </div>
            </div>
            
            <div class="feature">
                <div class="feature-icon">📚</div>
                <div>
                    <strong>Contenu éducatif</strong><br>
                    Apprenez grâce à nos articles et quiz
                </div>
            </div>
            
            <p style="text-align: center;">
                <a href="{{dashboardUrl}}" class="btn">Découvrir mon tableau de bord</a>
            </p>
            
            <p>Si vous avez des questions, n'hésitez pas à nous contacter à support@elios.com</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Elios. Tous droits réservés.</p>
            <p>Vous recevez cet email car vous vous êtes inscrit sur Elios.</p>
        </div>
    </div>
</body>
</html>`,
        textContent: `Bienvenue chez Elios, {{username}}!

Félicitations! Vous venez de franchir le premier pas vers une gestion financière intelligente.

Découvrez vos nouvelles fonctionnalités:
- Analyses personnalisées de vos dépenses
- Défis financiers interactifs
- Contenu éducatif premium

Accédez à votre tableau de bord: {{dashboardUrl}}

L'équipe Elios`,
        description: 'Email de bienvenue après inscription',
        variables: { username: 'string', dashboardUrl: 'string' },
        isActive: true,
    },

    {
        name: 'email_verification',
        type: EmailTemplateType.EMAIL_VERIFICATION,
        subject: 'Confirmez votre adresse email - Elios',
        htmlContent: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vérification Email</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; text-align: center; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; color: #92400e; margin: 20px 0; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #1e293b; margin-bottom: 20px; }
        p { color: #475569; line-height: 1.6; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✉️ Vérifiez votre email</h1>
        </div>
        <div class="content">
            <h2>Bonjour {{username}},</h2>
            <p>Pour finaliser votre inscription et sécuriser votre compte, veuillez confirmer votre adresse email en cliquant sur le bouton ci-dessous:</p>
            
            <a href="{{verificationUrl}}" class="btn">Vérifier mon email</a>
            
            <div class="warning">
                ⚠️ <strong>Important:</strong> Ce lien expire dans {{expiresIn}}
            </div>
            
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur:</p>
            <p style="word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace;">{{verificationUrl}}</p>
            
            <p style="font-size: 14px; color: #64748b;">Si vous n'avez pas créé de compte Elios, ignorez cet email.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Elios. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>`,
        textContent: `Vérification de votre email - Elios

Bonjour {{username}},

Pour finaliser votre inscription, veuillez confirmer votre adresse email en visitant ce lien:
{{verificationUrl}}

Ce lien expire dans {{expiresIn}}.

Si vous n'avez pas créé de compte Elios, ignorez cet email.

L'équipe Elios`,
        description: "Email de vérification d'adresse email",
        variables: { username: 'string', verificationUrl: 'string', expiresIn: 'string' },
        isActive: true,
    },

    {
        name: 'two_factor_auth',
        type: EmailTemplateType.TWO_FACTOR_AUTH,
        subject: 'Code de sécurité Elios - {{code}}',
        htmlContent: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de sécurité</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; text-align: center; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .code-box { background: #f1f5f9; border: 2px solid #e2e8f0; padding: 30px; border-radius: 12px; margin: 30px 0; }
        .code { font-size: 36px; font-weight: bold; color: #1e293b; letter-spacing: 8px; font-family: monospace; }
        .warning { background: #fee2e2; border: 1px solid #ef4444; padding: 15px; border-radius: 8px; color: #dc2626; margin: 20px 0; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #1e293b; margin-bottom: 20px; }
        p { color: #475569; line-height: 1.6; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 Code de sécurité</h1>
        </div>
        <div class="content">
            <h2>Bonjour {{username}},</h2>
            <p>Voici votre code de sécurité pour {{purpose}}:</p>
            
            <div class="code-box">
                <div class="code">{{code}}</div>
            </div>
            
            <div class="warning">
                ⚠️ <strong>Important:</strong> Ce code expire dans {{expiresIn}}
            </div>
            
            <p>Saisissez ce code dans l'application pour continuer.</p>
            <p style="font-size: 14px; color: #64748b;">Si vous n'avez pas demandé ce code, ignorez cet email ou contactez notre support.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Elios. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>`,
        textContent: `Code de sécurité Elios

Bonjour {{username}},

Votre code de sécurité pour {{purpose}}: {{code}}

Ce code expire dans {{expiresIn}}.

Si vous n'avez pas demandé ce code, ignorez cet email.

L'équipe Elios`,
        description: 'Code de double authentification',
        variables: { username: 'string', code: 'string', purpose: 'string', expiresIn: 'string' },
        isActive: true,
    },

    {
        name: 'premium_upgrade',
        type: EmailTemplateType.PREMIUM_UPGRADE,
        subject: 'Débloquez votre potentiel financier avec Elios Premium',
        htmlContent: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Elios Premium</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .feature { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #8b5cf6; }
        .premium-badge { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; display: inline-block; margin-bottom: 20px; }
        .offer { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #1e293b; margin-bottom: 20px; }
        p { color: #475569; line-height: 1.6; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✨ Passez à Elios Premium</h1>
            <p>Des fonctionnalités avancées pour maximiser vos finances</p>
        </div>
        <div class="content">
            <div class="premium-badge">🏆 PREMIUM</div>
            <h2>Bonjour {{username}},</h2>
            <p>{{reason}}</p>
            
            <div class="offer">
                🎉 <strong>Offre limitée: 30% de réduction sur votre premier mois!</strong>
            </div>
            
            <div class="feature">
                <strong>📊 Analyses avancées</strong><br>
                Obtenez des insights détaillés sur vos habitudes financières avec des graphiques interactifs
            </div>
            
            <div class="feature">
                <strong>🤖 IA personnalisée</strong><br>
                Recommandations sur mesure basées sur votre profil financier unique
            </div>
            
            <div class="feature">
                <strong>🎯 Défis exclusifs</strong><br>
                Accédez à des challenges premium avec des récompenses attractives
            </div>
            
            <div class="feature">
                <strong>⚡ Support prioritaire</strong><br>
                Une équipe dédiée pour répondre à toutes vos questions
            </div>
            
            <div class="feature">
                <strong>🔮 Prédictions intelligentes</strong><br>
                Anticipez vos dépenses futures et optimisez votre budget
            </div>
            
            <p style="text-align: center;">
                <a href="{{upgradeUrl}}" class="btn">Passer à Premium maintenant</a>
            </p>
            
            <p style="font-size: 14px; color: #64748b; text-align: center;">
                Sans engagement • Annulation possible à tout moment
            </p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Elios. Tous droits réservés.</p>
            <p><a href="{{unsubscribeUrl}}" style="color: #64748b;">Se désabonner</a> des emails promotionnels</p>
        </div>
    </div>
</body>
</html>`,
        textContent: `Elios Premium - {{username}}

{{reason}}

🎉 Offre limitée: 30% de réduction sur votre premier mois!

Fonctionnalités Premium:
📊 Analyses financières avancées
🤖 Recommandations IA personnalisées  
🎯 Défis exclusifs avec récompenses
⚡ Support client prioritaire
🔮 Prédictions intelligentes

Passer à Premium: {{upgradeUrl}}

Sans engagement • Annulation possible à tout moment

L'équipe Elios`,
        description: "Email d'incitation à l'upgrade Premium",
        variables: { username: 'string', reason: 'string', upgradeUrl: 'string', unsubscribeUrl: 'string' },
        isActive: true,
    },

    {
        name: 'premium_welcome',
        type: EmailTemplateType.PREMIUM_WELCOME,
        subject: 'Bienvenue dans Elios Premium! 🎉',
        htmlContent: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bienvenue Premium</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        .premium-features { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 30px; border-radius: 12px; margin: 20px 0; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { padding: 10px 0; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; }
        .feature-list li:last-child { border-bottom: none; }
        .feature-icon { margin-right: 10px; font-size: 20px; }
        .crown { font-size: 48px; margin-bottom: 20px; }
        .next-steps { background: #fef3c7; border: 1px solid #f59e0b; padding: 20px; border-radius: 8px; margin: 20px 0; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #1e293b; margin-bottom: 20px; }
        h3 { color: #374151; margin-bottom: 15px; }
        p { color: #475569; line-height: 1.6; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="crown">👑</div>
            <h1>Bienvenue dans Premium!</h1>
            <p>Vous avez débloqué toutes les fonctionnalités avancées</p>
        </div>
        <div class="content">
            <h2>Félicitations {{username}}!</h2>
            <p>Vous êtes maintenant membre Premium d'Elios. Voici tout ce qui s'ouvre à vous:</p>
            
            <div class="premium-features">
                <h3>🚀 Vos nouveaux avantages:</h3>
                <ul class="feature-list">
                    <li><span class="feature-icon">✨</span> <strong>Analyses IA personnalisées</strong> - Insights avancés sur vos finances</li>
                    <li><span class="feature-icon">📊</span> <strong>Rapports détaillés</strong> - Analyses mensuelles complètes</li>
                    <li><span class="feature-icon">🎯</span> <strong>Défis exclusifs</strong> - Challenges premium avec récompenses</li>
                    <li><span class="feature-icon">⚡</span> <strong>Support VIP</strong> - Assistance prioritaire 24/7</li>
                    <li><span class="feature-icon">🔮</span> <strong>Prédictions financières</strong> - Anticipez vos dépenses futures</li>
                    <li><span class="feature-icon">💎</span> <strong>Contenu exclusif</strong> - Articles et formations premium</li>
                    <li><span class="feature-icon">📱</span> <strong>Application mobile</strong> - Accès complet sur mobile</li>
                    <li><span class="feature-icon">🔒</span> <strong>Sécurité renforcée</strong> - Chiffrement avancé de vos données</li>
                </ul>
            </div>

            <div class="next-steps">
                <h3>📋 Prochaines étapes recommandées:</h3>
                <ol>
                    <li>Explorez votre nouveau tableau de bord Premium</li>
                    <li>Configurez vos objectifs financiers personnalisés</li>
                    <li>Participez à votre premier défi exclusif</li>
                    <li>Téléchargez l'application mobile</li>
                </ol>
            </div>
            
            <p style="text-align: center;">
                <a href="{{dashboardUrl}}" class="btn">Découvrir Premium</a>
                <a href="{{premiumFeaturesUrl}}" class="btn" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">Guide Premium</a>
            </p>
            
            <p>Profitez pleinement de votre expérience Premium et n'hésitez pas à nous contacter si vous avez des questions!</p>
            
            <p style="font-size: 14px; color: #64748b; text-align: center;">
                Besoin d'aide? Contactez notre support VIP: premium@elios.com
            </p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Elios Premium. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>`,
        textContent: `Bienvenue dans Elios Premium! 👑

Félicitations {{username}}!

Vos nouveaux avantages Premium:
✨ Analyses IA personnalisées
📊 Rapports détaillés mensuels  
🎯 Défis exclusifs avec récompenses
⚡ Support VIP 24/7
🔮 Prédictions financières
💎 Contenu exclusif
📱 Application mobile complète
🔒 Sécurité renforcée

Prochaines étapes:
1. Explorez votre nouveau tableau de bord
2. Configurez vos objectifs financiers
3. Participez à votre premier défi exclusif
4. Téléchargez l'application mobile

Découvrez Premium: {{dashboardUrl}}
Guide Premium: {{premiumFeaturesUrl}}

Support VIP: premium@elios.com

L'équipe Elios Premium`,
        description: 'Email de bienvenue Premium',
        variables: { username: 'string', dashboardUrl: 'string', premiumFeaturesUrl: 'string' },
        isActive: true,
    },

    {
        name: 'account_activated',
        type: EmailTemplateType.ACCOUNT_ACTIVATED,
        subject: 'Votre compte Elios est maintenant activé! ✅',
        htmlContent: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Compte Activé</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; text-align: center; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .success-icon { font-size: 64px; margin-bottom: 20px; }
        .next-steps { background: #f0fdf4; border: 1px solid #22c55e; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: left; }
        .tip { background: #e0f2fe; border: 1px solid #0284c7; padding: 15px; border-radius: 8px; margin: 20px 0; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #1e293b; margin-bottom: 20px; }
        h3 { color: #374151; margin-bottom: 15px; }
        p { color: #475569; line-height: 1.6; margin: 15px 0; }
        ol { text-align: left; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="success-icon">✅</div>
            <h1>Compte activé!</h1>
            <p>Votre email a été vérifié avec succès</p>
        </div>
        <div class="content">
            <h2>Parfait {{username}}!</h2>
            <p>Votre compte Elios est maintenant pleinement activé. Vous pouvez accéder à toutes les fonctionnalités de base.</p>
            
            <div class="next-steps">
                <h3>🎯 Prochaines étapes recommandées:</h3>
                <ol>
                    <li><strong>Connectez vos comptes bancaires</strong> pour des analyses automatiques</li>
                    <li><strong>Configurez votre PIN de sécurité</strong> pour protéger votre compte</li>
                    <li><strong>Explorez nos défis financiers</strong> et gagnez vos premières récompenses</li>
                    <li><strong>Lisez votre premier article éducatif</strong> pour apprendre</li>
                    <li><strong>Définissez vos objectifs financiers</strong> dans les paramètres</li>
                </ol>
            </div>

            <div class="tip">
                💡 <strong>Conseil:</strong> Commencez par connecter au moins un compte bancaire pour profiter pleinement des analyses personnalisées d'Elios.
            </div>
            
            <a href="{{dashboardUrl}}" class="btn">Commencer l'exploration</a>
            
            <p>Votre aventure financière commence maintenant. Bienvenue dans la communauté Elios!</p>
            
            <p style="font-size: 14px; color: #64748b;">
                Des questions? Notre équipe support est là pour vous aider: support@elios.com
            </p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Elios. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>`,
        textContent: `Compte Elios activé! ✅

Parfait {{username}}!

Votre compte est maintenant pleinement activé.

Prochaines étapes:
1. Connectez vos comptes bancaires
2. Configurez votre PIN de sécurité  
3. Explorez nos défis financiers
4. Lisez votre premier article
5. Définissez vos objectifs financiers

💡 Conseil: Commencez par connecter au moins un compte bancaire pour profiter pleinement des analyses personnalisées.

Commencer: {{dashboardUrl}}

Bienvenue dans la communauté Elios!

Support: support@elios.com

L'équipe Elios`,
        description: "Confirmation d'activation de compte",
        variables: { username: 'string', dashboardUrl: 'string' },
        isActive: true,
    },

    {
        name: 'password_reset',
        type: EmailTemplateType.PASSWORD_RESET,
        subject: 'Réinitialisation de votre mot de passe Elios',
        htmlContent: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Réinitialisation mot de passe</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; text-align: center; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .warning { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; color: #92400e; margin: 20px 0; }
        .security-tip { background: #e0f2fe; border: 1px solid #0284c7; padding: 15px; border-radius: 8px; margin: 20px 0; color: #0c4a6e; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #1e293b; margin-bottom: 20px; }
        p { color: #475569; line-height: 1.6; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔑 Réinitialisation du mot de passe</h1>
        </div>
        <div class="content">
            <h2>Bonjour {{username}},</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe Elios. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe:</p>
            
            <a href="{{resetUrl}}" class="btn">Réinitialiser mon mot de passe</a>
            
            <div class="warning">
                ⚠️ <strong>Important:</strong> Ce lien expire dans {{expiresIn}}
            </div>
            
            <div class="security-tip">
                🛡️ <strong>Conseil de sécurité:</strong> Choisissez un mot de passe fort avec au moins 8 caractères, incluant des majuscules, minuscules, chiffres et symboles.
            </div>
            
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur:</p>
            <p style="word-break: break-all; background: #f1f5f9; padding: 10px; border-radius: 4px; font-family: monospace;">{{resetUrl}}</p>
            
            <p style="font-size: 14px; color: #64748b;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email. Votre mot de passe actuel reste inchangé.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Elios. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>`,
        textContent: `Réinitialisation du mot de passe Elios

Bonjour {{username}},

Vous avez demandé la réinitialisation de votre mot de passe.

Lien de réinitialisation: {{resetUrl}}

Ce lien expire dans {{expiresIn}}.

🛡️ Conseil: Choisissez un mot de passe fort avec au moins 8 caractères.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

L'équipe Elios`,
        description: 'Email de réinitialisation de mot de passe',
        variables: { username: 'string', resetUrl: 'string', expiresIn: 'string' },
        isActive: true,
    },

    {
        name: 'weekly_digest',
        type: EmailTemplateType.WEEKLY_DIGEST,
        subject: 'Votre résumé financier hebdomadaire - Elios',
        htmlContent: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Résumé hebdomadaire</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        .stat-box { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #6366f1; }
        .stat-row { display: flex; justify-content: space-between; align-items: center; margin: 10px 0; }
        .stat-value { font-weight: bold; color: #1e293b; }
        .positive { color: #059669; }
        .negative { color: #dc2626; }
        .achievement { background: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 15px 0; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #1e293b; margin-bottom: 20px; }
        h3 { color: #374151; margin-bottom: 15px; }
        p { color: #475569; line-height: 1.6; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📊 Votre semaine financière</h1>
            <p>Du {{weekStart}} au {{weekEnd}}</p>
        </div>
        <div class="content">
            <h2>Bonjour {{username}},</h2>
            <p>Voici votre résumé financier de la semaine:</p>
            
            <div class="stat-box">
                <h3>💰 Résumé financier</h3>
                <div class="stat-row">
                    <span>Revenus de la semaine:</span>
                    <span class="stat-value positive">+{{weeklyIncome}}€</span>
                </div>
                <div class="stat-row">
                    <span>Dépenses de la semaine:</span>
                    <span class="stat-value negative">-{{weeklyExpenses}}€</span>
                </div>
                <div class="stat-row">
                    <span>Économies:</span>
                    <span class="stat-value {{savingsClass}}">{{weeklySavings}}€</span>
                </div>
                <div class="stat-row">
                    <span>Objectif mensuel:</span>
                    <span class="stat-value">{{monthlyGoalProgress}}%</span>
                </div>
            </div>

            <div class="stat-box">
                <h3>🎯 Défis et activités</h3>
                <div class="stat-row">
                    <span>Défis complétés:</span>
                    <span class="stat-value">{{challengesCompleted}}</span>
                </div>
                <div class="stat-row">
                    <span>Articles lus:</span>
                    <span class="stat-value">{{articlesRead}}</span>
                </div>
                <div class="stat-row">
                    <span>Quiz terminés:</span>
                    <span class="stat-value">{{quizzesCompleted}}</span>
                </div>
            </div>

            {{#if hasAchievements}}
            <div class="achievement">
                🏆 <strong>Nouvelle réalisation!</strong> {{achievement}}
            </div>
            {{/if}}

            <div class="stat-box">
                <h3>📈 Tendances</h3>
                <p>{{weeklyTrend}}</p>
                <p><strong>Conseil de la semaine:</strong> {{weeklyTip}}</p>
            </div>
            
            <p style="text-align: center;">
                <a href="{{dashboardUrl}}" class="btn">Voir le détail</a>
                <a href="{{challengesUrl}}" class="btn" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">Nouveaux défis</a>
            </p>
            
            <p>Continuez sur cette lancée! Votre discipline financière s'améliore chaque semaine.</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Elios. Tous droits réservés.</p>
            <p><a href="{{unsubscribeUrl}}" style="color: #64748b;">Se désabonner</a> des résumés hebdomadaires</p>
        </div>
    </div>
</body>
</html>`,
        textContent: `Votre semaine financière - {{username}}

Du {{weekStart}} au {{weekEnd}}

💰 Résumé financier:
- Revenus: +{{weeklyIncome}}€
- Dépenses: -{{weeklyExpenses}}€  
- Économies: {{weeklySavings}}€
- Objectif mensuel: {{monthlyGoalProgress}}%

🎯 Activités:
- Défis complétés: {{challengesCompleted}}
- Articles lus: {{articlesRead}}
- Quiz terminés: {{quizzesCompleted}}

📈 Tendance: {{weeklyTrend}}
💡 Conseil: {{weeklyTip}}

Voir le détail: {{dashboardUrl}}
Nouveaux défis: {{challengesUrl}}

Continuez sur cette lancée!

L'équipe Elios`,
        description: 'Résumé hebdomadaire des finances et activités',
        variables: {
            username: 'string',
            weekStart: 'string',
            weekEnd: 'string',
            weeklyIncome: 'number',
            weeklyExpenses: 'number',
            weeklySavings: 'number',
            monthlyGoalProgress: 'number',
            challengesCompleted: 'number',
            articlesRead: 'number',
            quizzesCompleted: 'number',
            weeklyTrend: 'string',
            weeklyTip: 'string',
            dashboardUrl: 'string',
            challengesUrl: 'string',
            unsubscribeUrl: 'string',
        },
        isActive: true,
    },

    {
        name: 'challenge_completed',
        type: EmailTemplateType.CHALLENGE_COMPLETED,
        subject: 'Félicitations! Défi "{{challengeName}}" terminé! 🎉',
        htmlContent: `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Défi Terminé</title>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; text-align: center; }
        .footer { background-color: #f1f5f9; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 10px; }
        .celebration { font-size: 64px; margin-bottom: 20px; }
        .reward-box { background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); color: white; padding: 30px; border-radius: 12px; margin: 20px 0; }
        .stats { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stat-item { display: flex; justify-content: space-between; margin: 10px 0; }
        .next-challenge { background: #e0f2fe; border: 1px solid #0284c7; padding: 20px; border-radius: 8px; margin: 20px 0; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #1e293b; margin-bottom: 20px; }
        h3 { color: #374151; margin-bottom: 15px; }
        p { color: #475569; line-height: 1.6; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="celebration">🎉</div>
            <h1>Défi terminé!</h1>
            <p>Vous avez brillamment réussi le défi "{{challengeName}}"</p>
        </div>
        <div class="content">
            <h2>Bravo {{username}}!</h2>
            <p>Vous venez de terminer avec succès le défi <strong>"{{challengeName}}"</strong>. Votre persévérance et votre discipline financière sont remarquables!</p>
            
            <div class="reward-box">
                <h3>🏆 Vos récompenses</h3>
                <p style="margin: 10px 0; color: white;">
                    💰 <strong>{{rewardAmount}} Elios Coins</strong><br>
                    ⭐ <strong>+{{xpGained}} XP</strong><br>
                    🏅 <strong>Badge: {{badgeName}}</strong>
                </p>
            </div>

            <div class="stats">
                <h3>📊 Statistiques du défi</h3>
                <div class="stat-item">
                    <span>Durée du défi:</span>
                    <strong>{{challengeDuration}}</span>
                </div>
                <div class="stat-item">
                    <span>Votre score:</span>
                    <strong>{{finalScore}}/100</strong>
                </div>
                <div class="stat-item">
                    <span>Progression:</span>
                    <strong>{{completionRate}}%</strong>
                </div>
                <div class="stat-item">
                    <span>Classement:</span>
                    <strong>{{ranking}}ème sur {{totalParticipants}}</strong>
                </div>
            </div>

            <div class="next-challenge">
                <h3>🚀 Prêt pour le prochain défi?</h3>
                <p>Continuez sur votre lancée avec <strong>"{{nextChallengeName}}"</strong> - un défi spécialement recommandé pour vous!</p>
            </div>
            
            <p style="text-align: center;">
                <a href="{{certificateUrl}}" class="btn">Télécharger le certificat</a>
                <a href="{{nextChallengeUrl}}" class="btn" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">Défi suivant</a>
            </p>
            
            <p>Partagez votre réussite avec la communauté Elios et inspirez d'autres utilisateurs!</p>
        </div>
        <div class="footer">
            <p>&copy; 2024 Elios. Tous droits réservés.</p>
        </div>
    </div>
</body>
</html>`,
        textContent: `Défi terminé! 🎉

Bravo {{username}}!

Vous avez brillamment réussi le défi "{{challengeName}}"!

🏆 Vos récompenses:
- {{rewardAmount}} Elios Coins
- +{{xpGained}} XP  
- Badge: {{badgeName}}

📊 Statistiques:
- Durée: {{challengeDuration}}
- Score: {{finalScore}}/100
- Progression: {{completionRate}}%
- Classement: {{ranking}}ème sur {{totalParticipants}}

🚀 Prochain défi recommandé: "{{nextChallengeName}}"

Télécharger certificat: {{certificateUrl}}
Défi suivant: {{nextChallengeUrl}}

Félicitations pour votre persévérance!

L'équipe Elios`,
        description: 'Félicitations pour un défi terminé',
        variables: {
            username: 'string',
            challengeName: 'string',
            rewardAmount: 'number',
            xpGained: 'number',
            badgeName: 'string',
            challengeDuration: 'string',
            finalScore: 'number',
            completionRate: 'number',
            ranking: 'number',
            totalParticipants: 'number',
            nextChallengeName: 'string',
            certificateUrl: 'string',
            nextChallengeUrl: 'string',
        },
        isActive: true,
    },
];

// Service pour insérer les templates par défaut
export class DefaultTemplatesSeeder {
    constructor(private emailService: any) {}

    async seedDefaultTemplates(): Promise<void> {
        console.log('🌱 Insertion des templates email par défaut...');

        for (const template of DEFAULT_EMAIL_TEMPLATES) {
            try {
                await this.emailService.createTemplate(template);
                console.log(`✅ Template "${template.name}" créé avec succès`);
            } catch (error) {
                if (error.message?.includes('duplicate') || error.code === '23505') {
                    console.log(`ℹ️ Template "${template.name}" existe déjà`);
                } else {
                    console.error(`❌ Erreur lors de la création du template "${template.name}":`, error.message);
                }
            }
        }

        console.log('✅ Tous les templates email ont été traités!');
    }
}
